#!/usr/bin/env bash
# VRT - Visual Regression Test (全自動)
# Usage: bash ~/.claude/skills/visual-regression-test/vrt.sh [urls-file]
#
# Modes:
#   通常:              bash vrt.sh [urls-file]
#   ベースラインのみ:   VRT_BASELINE_ONLY=1 bash vrt.sh [urls-file]
#   ベースライン昇格:   VRT_PROMOTE=1 bash vrt.sh [urls-file]
#
# スキルから呼び出される。プロジェクト固有の vrt-urls.txt パスを引数で渡す。
# ビューポート逐次実行 + fail-fast:
#   for each viewport (1440 → 768 → 375):
#     1. baseline撮影（そのVPだけ）
#     2. after撮影（そのVPだけ）
#     3. diff算出（そのVPだけ）
#     4. FAILがあれば → レポート生成して即 exit 1
# git stash/pop はビューポートループの外（最初にstash、ループ前にpop）

set -euo pipefail

URLS_FILE="${1:-scripts/vrt-urls.txt}"
WORK_DIR="/tmp/vrt-work"
BASELINE_DIR="/tmp/vrt-baseline"
AFTER_DIR="/tmp/vrt-after"
DIFF_DIR="/tmp/vrt-diff"
REPORT_DIR="/tmp/vrt-report"
VIEWPORTS=(1440 768 375)
FUZZ="2%"
VRT_FORCE_BASELINE="${VRT_FORCE_BASELINE:-0}"
VRT_BASELINE_ONLY="${VRT_BASELINE_ONLY:-0}"
VRT_PROMOTE="${VRT_PROMOTE:-0}"

# ── Promoteモード: after → baseline に昇格 ──
if [[ "$VRT_PROMOTE" == "1" ]]; then
  if [[ ! -d "$AFTER_DIR" ]] || [[ -z "$(ls -A "$AFTER_DIR" 2>/dev/null)" ]]; then
    echo "ERROR: $AFTER_DIR が存在しないか空です。先に vrt:compare を実行してください。" >&2
    exit 1
  fi
  count=$(find "$AFTER_DIR" -name '*.png' 2>/dev/null | wc -l | tr -d ' ')
  rm -rf "$BASELINE_DIR"
  mkdir -p "$BASELINE_DIR"
  cp "$AFTER_DIR"/*.png "$BASELINE_DIR/"
  rm -rf "$DIFF_DIR" "$REPORT_DIR"
  FP_FILE="/tmp/vrt-fingerprint"
  git diff HEAD -- 'wp-content/themes/**/*.php' 'wp-content/themes/**/*.css' 'wp-content/themes/**/*.js' \
    | shasum -a 256 | cut -d' ' -f1 > "$FP_FILE"
  echo "✓ ${count}枚をベースラインに昇格: $AFTER_DIR/ → $BASELINE_DIR/"
  echo "  次回の vrt:compare はこのベースラインを基準に比較します。"
  echo "[VRT] フィンガープリント更新: $(cat "$FP_FILE")"
  exit 0
fi

# ── stash安全trap ──
_stashed=0
cleanup() {
  if [[ $_stashed -eq 1 ]]; then
    echo "[VRT] ERROR: git stash popが未実行。復元を試みます..."
    git stash pop -q || echo "[VRT] CRITICAL: stash popに失敗。手動で 'git stash pop' を実行してください"
  fi
}
trap cleanup EXIT

# ── stash残留チェック ──
if [[ "$VRT_BASELINE_ONLY" != "1" ]]; then
  if git stash list | grep -q "vrt-auto"; then
    echo "WARNING: 前回のVRT stash (vrt-auto) が残留しています"
    echo "  → 'git stash drop' で削除するか 'git stash pop' で復元してください"
    exit 1
  fi
fi

# ── 前提チェック ──
if [[ "$VRT_BASELINE_ONLY" != "1" ]]; then
  command -v magick >/dev/null 2>&1 || { echo "ERROR: ImageMagick not found. brew install imagemagick" >&2; exit 1; }
fi
command -v node >/dev/null 2>&1 || { echo "ERROR: Node.js not found" >&2; exit 1; }
[[ -f $URLS_FILE ]] || { echo "ERROR: $URLS_FILE not found" >&2; exit 1; }

URLS_ABS="$(cd "$(dirname "$URLS_FILE")" && pwd)/$(basename "$URLS_FILE")"

# ── ベースラインが既存かどうか確認 ──
_has_baseline=0
if [[ "$VRT_BASELINE_ONLY" == "1" ]]; then
  : # 常に再撮影
elif [[ -d "$BASELINE_DIR" ]] && [[ -n "$(ls -A "$BASELINE_DIR" 2>/dev/null)" ]] && [[ "$VRT_FORCE_BASELINE" != "1" ]]; then
  _has_baseline=1
  echo "[VRT] 既存ベースラインを再利用します（スキップ）。強制再撮影は VRT_FORCE_BASELINE=1 で。"
fi

# ── ディレクトリ初期化 ──
if [[ $_has_baseline -eq 0 ]]; then
  rm -rf "$BASELINE_DIR"
  mkdir -p "$BASELINE_DIR"
fi
if [[ "$VRT_BASELINE_ONLY" != "1" ]]; then
  for d in "$WORK_DIR" "$AFTER_DIR" "$DIFF_DIR" "$REPORT_DIR"; do
    rm -rf "$d"
    mkdir -p "$d"
  done
else
  rm -rf "$WORK_DIR"
  mkdir -p "$WORK_DIR"
fi

# ── ベースライン撮影（全VP） ──
capture_baseline() {
  for vp in "${VIEWPORTS[@]}"; do
    echo "  [baseline] @${vp}px..."
    node "$WORK_DIR/capture.mjs" baseline "$WORK_DIR/vrt-urls.txt" "$vp"
  done
}

# ── Playwright セットアップ ──
echo "[VRT 1/5] Playwright セットアップ..."
cd "$WORK_DIR"
cat > package.json << 'PKGJSON'
{"private":true,"type":"module","dependencies":{"playwright":"^1.50.0"}}
PKGJSON
npm install --silent 2>/dev/null
cd - >/dev/null

# ── キャプチャスクリプト生成（単一VP対応） ──
cat > "$WORK_DIR/capture.mjs" << 'CAPTURE_SCRIPT'
import { chromium } from 'playwright';
import { readFileSync } from 'fs';

const phase = process.argv[2];
const urlsFile = process.argv[3];
const viewport = Number(process.argv[4]);   // 単一ビューポート
const baseDir = `/tmp/vrt-${phase}`;

const urls = readFileSync(urlsFile, 'utf8')
  .split('\n')
  .filter(l => l.trim() && !l.startsWith('#'))
  .map(url => {
    let name = url.replace(/https?:\/\/[^/]*\//, '').replace(/\/$/, '').replace(/\//g, '-');
    name = name.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
    if (!name) name = 'top';
    return { name, url };
  });

async function scrollPage(page) {
  await page.evaluate(async () => {
    const delay = ms => new Promise(r => setTimeout(r, ms));
    let pos = 0;
    const step = 200;
    const max = document.body.scrollHeight;
    // ゆっくりスクロールしてIntersectionObserver等を確実に発火
    while (pos < max) {
      window.scrollBy(0, step);
      pos += step;
      await delay(150);
    }
    // 末尾で少し待ち、遅延表示要素の完了を待つ
    await delay(1000);
    window.scrollTo(0, 0);
    await delay(500);
  });
}

const browser = await chromium.launch({ headless: true });
const total = urls.length;
let done = 0;

// 単一ビューポートで全URL逐次撮影
const ctx = await browser.newContext({ viewport: { width: viewport, height: 900 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();

for (const { name, url } of urls) {
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1500);
    await scrollPage(page);
    await page.waitForTimeout(800);
    await page.addStyleTag({ content: '*, *::before, *::after { animation: none !important; transition: none !important; }' });
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${baseDir}/${name}-${viewport}.png`, fullPage: true });
    done++;
    process.stdout.write(`\r  [${phase}] page ${done}/${total} @${viewport}px`);
  } catch (e) {
    done++;
    console.error(`\n  FAIL: ${name}@${viewport}px - ${e.message}`);
  }
}

await ctx.close();
await browser.close();
console.log(' done');
CAPTURE_SCRIPT

# ── URLsファイルを退避（stashで消えないように） ──
cp "$URLS_ABS" "$WORK_DIR/vrt-urls.txt"

# ── ベースラインのみモード ──
if [[ "$VRT_BASELINE_ONLY" == "1" ]]; then
  echo "[VRT 2/5] ベースラインのみモード: 現在の状態を撮影..."
  capture_baseline
  count=$(find "$BASELINE_DIR" -name '*.png' 2>/dev/null | wc -l | tr -d ' ')
  echo ""
  echo "✓ ベースライン作成完了: ${count}枚 → $BASELINE_DIR/"
  exit 0
fi

# ── ベースライン撮影（stashはここでのみ実行） ──
if [[ $_has_baseline -eq 1 ]]; then
  echo "[VRT 2/5] ベースライン撮影スキップ（既存利用）"
else
  echo "[VRT 2/5] git stash → ベースライン撮影（全VP）..."
  git add -A && git stash push -q -m "vrt-auto"
  _stashed=1
  capture_baseline
fi

# ── 変更復元（After撮影前に1回だけpop） ──
if [[ $_has_baseline -eq 1 ]]; then
  echo "[VRT 3/5] After撮影..."
else
  echo "[VRT 3/5] git stash pop → After撮影..."
fi
if [[ $_has_baseline -eq 0 ]]; then
  git stash pop -q
  _stashed=0
fi

# ── diff結果を累積する変数 ──
RESULTS_JSON_ITEMS=""
pass=0; warn=0; fail=0; total=0

# ── diff算出関数 ──
# 引数: $1 = viewport (数値)
# return 0: 全PASS/WARN, return 1: FAILあり
run_diff_for_viewport() {
  local vp="$1"
  local vp_fail=0

  for bf in "$BASELINE_DIR"/*-${vp}.png; do
    [[ -f "$bf" ]] || continue
    local name
    name=$(basename "$bf")
    local af="$AFTER_DIR/$name"
    local df="$DIFF_DIR/$name"
    [[ -f "$af" ]] || continue

    total=$((total + 1))

    local stem="${name%.png}"
    local vp_part="${stem##*-}"
    local page_part="${stem%-*}"

    local dim_b dim_a
    dim_b=$(magick identify -format "%wx%h" "$bf")
    dim_a=$(magick identify -format "%wx%h" "$af")

    if [[ "$dim_b" != "$dim_a" ]]; then
      echo "  FAIL: $name (size mismatch $dim_b vs $dim_a)"
      fail=$((fail + 1))
      vp_fail=1
      [[ -n "$RESULTS_JSON_ITEMS" ]] && RESULTS_JSON_ITEMS+=","
      RESULTS_JSON_ITEMS+="{\"page\":\"$page_part\",\"viewport\":$vp_part,\"status\":\"FAIL\",\"diffPct\":\"size mismatch\",\"file\":\"$name\"}"
      continue
    fi

    local tp px pxi pct
    tp=$(echo "$dim_b" | awk -Fx '{printf "%.0f", $1*$2}')
    px=$(magick compare -metric AE -fuzz "$FUZZ" "$bf" "$af" "$df" 2>&1 || true)
    pxi=$(printf "%.0f" "$px" 2>/dev/null || echo "0")
    pct=$(echo "scale=4; $pxi * 100 / $tp" | bc 2>/dev/null || echo "0")

    local s cls
    if (( $(echo "$pct < 0.5" | bc -l) )); then
      s="PASS"; cls="pass"; pass=$((pass + 1))
    elif (( $(echo "$pct < 2.0" | bc -l) )); then
      s="WARN"; cls="warn"; warn=$((warn + 1))
    else
      s="FAIL"; cls="fail"; fail=$((fail + 1))
      vp_fail=1
    fi

    echo "  $s: $name — ${pxi}px (${pct}%)"
    [[ -n "$RESULTS_JSON_ITEMS" ]] && RESULTS_JSON_ITEMS+=","
    RESULTS_JSON_ITEMS+="{\"page\":\"$page_part\",\"viewport\":$vp_part,\"status\":\"$s\",\"diffPct\":\"$pct\",\"file\":\"$name\"}"
  done

  return $vp_fail
}

# ── HTMLレポート生成関数 ──
generate_report() {
  local RESULTS_JSON="[$RESULTS_JSON_ITEMS]"
  echo "[VRT] レポート生成..."
  cat > "$REPORT_DIR/index.html" << 'HTMLEOF'
<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><title>VRT Report</title>
<style>
:root{--bg:#0a0a0f;--card:#14141f;--border:#1e1e2e;--text:#e2e2e8;--muted:#6b6b80;--pass:#22c55e;--warn:#f59e0b;--fail:#ef4444;--accent:#6366f1}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:var(--bg);color:var(--text);min-height:100vh}
.header{padding:24px 32px 16px;border-bottom:1px solid var(--border)}
.header h1{font-size:1.1rem;font-weight:600;letter-spacing:-.02em}
.header .meta{color:var(--muted);font-size:.75rem;margin-top:4px}
.stats{display:flex;gap:16px;padding:16px 32px;border-bottom:1px solid var(--border)}
.stat{font-size:.8rem;display:flex;align-items:center;gap:6px}
.stat .dot{width:8px;height:8px;border-radius:50%}
.stat .dot.p{background:var(--pass)}.stat .dot.w{background:var(--warn)}.stat .dot.f{background:var(--fail)}
.filters{display:flex;gap:8px;padding:12px 32px;border-bottom:1px solid var(--border);flex-wrap:wrap;align-items:center}
.filter-group{display:flex;gap:4px;align-items:center}
.filter-group .label{font-size:.7rem;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;margin-right:4px}
.chip{font-size:.7rem;padding:3px 10px;border-radius:99px;border:1px solid var(--border);background:transparent;color:var(--muted);cursor:pointer;transition:all .15s}
.chip:hover{border-color:#444;color:var(--text)}
.chip.active{background:var(--accent);border-color:var(--accent);color:#fff}
.grid{padding:16px 32px;display:flex;flex-direction:column;gap:12px}
.card{border:1px solid var(--border);border-radius:8px;overflow:hidden;background:var(--card)}
.card.hidden{display:none}
.card-header{display:flex;justify-content:space-between;align-items:center;padding:8px 12px;font-size:.8rem;border-bottom:1px solid var(--border)}
.card-header .page-name{font-weight:600}
.card-header .vp{color:var(--muted);font-size:.7rem}
.badge{font-size:.65rem;padding:2px 8px;border-radius:99px;font-weight:600}
.badge.pass{background:#052e16;color:var(--pass)}.badge.warn{background:#422006;color:var(--warn)}.badge.fail{background:#450a0a;color:var(--fail)}
.card-images{display:grid;grid-template-columns:1fr 1fr 1fr;gap:1px;background:var(--border)}
.card-images .col{background:var(--bg);position:relative}
.card-images .col-label{position:absolute;top:4px;left:6px;font-size:.6rem;color:var(--muted);background:rgba(0,0,0,.7);padding:1px 6px;border-radius:3px;z-index:1}
.card-images img{width:100%;display:block}
</style></head><body>
<div class="header">
<h1>Visual Regression Test</h1>
<div class="meta" id="meta"></div>
</div>
<div class="stats" id="stats"></div>
<div class="filters" id="filters"></div>
<div class="grid" id="grid"></div>
<script>
HTMLEOF

  echo "const data = $RESULTS_JSON;" >> "$REPORT_DIR/index.html"

  cat >> "$REPORT_DIR/index.html" << 'HTMLEOF2'
const pages = [...new Set(data.map(d=>d.page))];
const vps = [...new Set(data.map(d=>d.viewport))].sort((a,b)=>b-a);
const statuses = ['PASS','WARN','FAIL'];
let activeFilters = {page:'all',vp:'all',status:'all'};

document.getElementById('meta').textContent = `${data.length} comparisons · ${pages.length} pages · ${vps.length} viewports`;

const counts = {PASS:data.filter(d=>d.status==='PASS').length,WARN:data.filter(d=>d.status==='WARN').length,FAIL:data.filter(d=>d.status==='FAIL').length};
document.getElementById('stats').innerHTML = `
<div class="stat"><span class="dot p"></span>${counts.PASS} pass</div>
<div class="stat"><span class="dot w"></span>${counts.WARN} warn</div>
<div class="stat"><span class="dot f"></span>${counts.FAIL} fail</div>`;

function buildFilters(){
  const el = document.getElementById('filters');
  let html = '<div class="filter-group"><span class="label">Status</span>';
  html += `<button class="chip active" data-type="status" data-val="all">All</button>`;
  statuses.forEach(s=>html+=`<button class="chip" data-type="status" data-val="${s}">${s}</button>`);
  html += '</div><div class="filter-group"><span class="label">Page</span>';
  html += `<button class="chip active" data-type="page" data-val="all">All</button>`;
  pages.forEach(p=>html+=`<button class="chip" data-type="page" data-val="${p}">${p}</button>`);
  html += '</div><div class="filter-group"><span class="label">Viewport</span>';
  html += `<button class="chip active" data-type="vp" data-val="all">All</button>`;
  vps.forEach(v=>html+=`<button class="chip" data-type="vp" data-val="${v}">${v}px</button>`);
  html += '</div>';
  el.innerHTML = html;
  el.addEventListener('click',e=>{
    const btn=e.target.closest('.chip');if(!btn)return;
    const type=btn.dataset.type,val=btn.dataset.val;
    activeFilters[type]=val;
    btn.parentElement.querySelectorAll('.chip').forEach(c=>c.classList.remove('active'));
    btn.classList.add('active');
    applyFilters();
  });
}

function render(){
  const el=document.getElementById('grid');
  el.innerHTML=data.map((d,i)=>`
<div class="card" data-page="${d.page}" data-vp="${d.viewport}" data-status="${d.status}" id="c${i}">
  <div class="card-header">
    <span><span class="page-name">${d.page}</span> <span class="vp">${d.viewport}px</span></span>
    <span><span class="badge ${d.status.toLowerCase()}">${d.status} ${d.diffPct}%</span></span>
  </div>
  <div class="card-images">
    <div class="col"><span class="col-label">Before</span><img src="/tmp/vrt-baseline/${d.file}" loading="lazy"></div>
    <div class="col"><span class="col-label">After</span><img src="/tmp/vrt-after/${d.file}" loading="lazy"></div>
    <div class="col"><span class="col-label">Diff</span><img src="/tmp/vrt-diff/${d.file}" loading="lazy" onerror="this.alt='no diff'"></div>
  </div>
</div>`).join('');
}

function applyFilters(){
  document.querySelectorAll('.card').forEach(c=>{
    const show = (activeFilters.page==='all'||c.dataset.page===activeFilters.page)
      && (activeFilters.vp==='all'||c.dataset.vp===activeFilters.vp)
      && (activeFilters.status==='all'||c.dataset.status===activeFilters.status);
    c.classList.toggle('hidden',!show);
  });
}

buildFilters();render();
</script></body></html>
HTMLEOF2

  if [[ "$(uname)" == "Darwin" ]]; then open "$REPORT_DIR/index.html"; fi
}

# ── After撮影 + ビューポート逐次 diff ──
echo "[VRT 4/5] After撮影 + diff（ビューポート逐次）..."
for vp in "${VIEWPORTS[@]}"; do
  echo "  --- @${vp}px ---"

  # After撮影（そのVPだけ）
  node "$WORK_DIR/capture.mjs" after "$WORK_DIR/vrt-urls.txt" "$vp"

  # diff算出（そのVPだけ）
  echo "  [diff] @${vp}px..."
  run_diff_for_viewport "$vp" || true
done

echo ""
echo "  Total: $total | PASS: $pass | WARN: $warn | FAIL: $fail"

# ── HTMLレポート（全VP PASS/WARN） ──
echo "[VRT 5/5] レポート生成..."
generate_report

echo ""
if [[ $fail -gt 0 ]]; then
  echo "⚠️  FAILあり（${fail}件）。レポートを確認してください: $REPORT_DIR/index.html"
elif [[ $warn -gt 0 ]]; then
  echo "△ WARNあり（${warn}件）。レポートを確認してください: $REPORT_DIR/index.html"
else
  echo "✓ 全${total}組 PASS。レイアウト崩れなし。"
fi

# ── フィンガープリント生成 ──
# コミット対象テーマファイルの変更内容のハッシュを記録し、hookで照合する
FP_FILE="/tmp/vrt-fingerprint"
git diff HEAD -- 'wp-content/themes/**/*.php' 'wp-content/themes/**/*.css' 'wp-content/themes/**/*.js' \
  | shasum -a 256 | cut -d' ' -f1 > "$FP_FILE"
echo "[VRT] フィンガープリント記録: $(cat "$FP_FILE")"
