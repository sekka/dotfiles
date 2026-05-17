# Research Queue

Deep research backlog. Two-stage pipeline:

1. **Inbox** → Quick Eval (`/user-research-queue quick`) to decide promote / discard / keep
2. **Deep Research 待ち** → Deep Research (`/user-research-queue deep`) to extract full takeaways

**Add to Inbox:** `/user-research-queue add <url> [focus note]`
**Skip Quick Eval:** `/user-research-queue add-deep <url> [focus note]`

## Inbox — Quick Eval 待ち

(まだ Quick Eval していない URL。`/user-research-queue quick` で順番に Quick Eval を回す)

- [ ] 2026-05-17 — [ログイン済みの Chrome をそのまま Claude Code から操作する — playwright-cli attach](https://zenn.dev/optimisuke/articles/40529cd970cbf0) — focus: TBD
- [ ] 2026-05-17 — [Windowsに最初から入ってる不要なソフト、重くなる原因かも。「簡単に一掃」する方法 | ライフハッカー・ジャパン](https://www.lifehacker.jp/article/2605-you-need-hack-faster-windows-11-tkh/) — focus: TBD
- [ ] 2026-05-17 — [鹿野さんに聞く！CSSの最新トレンド Ver.2026 - Speaker Deck](https://speakerdeck.com/tonkotsuboy_com/lu-ye-sanniwen-ku-cssnozui-xin-torendo-ver-dot-2026) — focus: TBD
- [ ] 2026-05-17 — [Claude Codeの1000 セッションを分析して、一週間目でリードタイムを10%縮めた話](https://zenn.dev/globis/articles/94762dc8ec7914) — focus: TBD
- [ ] 2026-05-17 — [Vibe Coding のトークン消費量の40-60%を占めることもある、Markdownファイルの読み込みトーク…](https://qiita.com/dahatake/items/ce9917268d8d18aa9b6c) — focus: TBD
- [ ] 2026-05-17 — [Claude Code を社内で使うための「AIエージェントセキュリティ」実践編 #Security - Qiita](https://qiita.com/sharu389no/items/ab5bf50d9f68e7c8de56) — focus: TBD
- [ ] 2026-05-17 — [Andrej Karpathy氏のLLM Wikiを1ヶ月運用してわかった、LLMの知識を『繋げる力』](https://zenn.dev/tsurubee/articles/llm-wiki-connecting-knowledge) — focus: TBD
- [ ] 2026-05-17 — [Anthropic公式プラグイン「hookify」でClaude Codeのフックを自然言語で作る](https://zenn.dev/shirochan/articles/198a0537a79469) — focus: TBD
- [ ] 2026-05-17 — [automerge-gate: GitHubのAuto Mergeをひとつの必須チェックに集約するGitHub Action | Web Scratch](https://efcl.info/2026/05/13/automerge-gate/) — focus: TBD
- [ ] 2026-05-17 — [AI企業が「受託」を始めた日。エンジニア、PM、デザイナーはどうこの先生きのこるか｜深津 貴之 (fladdict)](https://note.com/fladdict/n/nd42977e5443e) — focus: TBD
- [ ] 2026-05-17 — [Web制作者は要チェック！ コンテナクエリの進化、動画の遅延読み込みなど、Chrome 148で新しく追加され…](https://coliss.com/articles/build-websites/architectonics/chrome-148-adds-7-new-css-feature.html) — focus: TBD
- [ ] 2026-05-17 — [Codex を利用した iOS アプリ開発を試してみた](https://azukiazusa.dev/blog/ios-app-development-with-codex/) — focus: TBD
- [ ] 2026-05-17 — [Gen Interface JP](https://gen.typesetting.jp/) — focus: TBD
- [ ] 2026-05-17 — [Codex の Computer Use を試す｜npaka](https://note.com/npaka/n/nd62f3e1fe802) — focus: TBD
- [ ] 2026-05-17 — [（メモ）アクセシブルなEPUB制作のためのガイドブック - 水底の血](https://momdo.hatenablog.jp/entry/20260429/1777457386) — focus: TBD
- [ ] 2026-05-17 — [macOSのネイティブ仮想技術を利用しLinuxコンテナを作成/実行できるAppleのコマンドラインツールcon…](https://applech2.com/archives/20260427-orchard-macos-gui-for-apple-container.html) — focus: TBD

## Deep Research 待ち

(Quick Eval 済みで Deep Research する価値ありと判断した URL。`/user-research-queue deep` で順番に Deep Research を回す)

- [ ] 2026-05-13 — [@tomoaki_imai: ClaudeCode Agents team で Architect + Devil's advocate を入れる運用](https://x.com/tomoaki_imai/status/2030061902295093466) — focus: 導入検討 (#20) Devil's advocate サブエージェント化の可否
- [ ] 2026-05-13 — [@azu_re: cmuxでDiffレビューコメントをClaude Codeプロンプトに流す試作](https://x.com/azu_re/status/2029936988670021940) — focus: cmux成熟度確認 + difit-review/coderabbit代替としての評価
- [ ] 2026-05-13 — [Fresh — The Terminal IDE (multi-cursor, LSP, Magit-style Git, SSH remote, TS plugins)](https://getfresh.dev/) — focus: 導入検討 (#20) AI連携性 / 既存 nvim 設定資産との比較 / TS plugin で skill・hook 的拡張ができるか
- [ ] 2026-05-13 — [@ctatedev: agent-browser --native (Rust 単一バイナリ + 直接 CDP)](https://x.com/ctatedev/status/2028960626685386994) — focus: 導入検討 (#20) 効用/メリット/デメリット評価 — 既存 daemon 運用との互換性確認
- [ ] 2026-05-13 — [@amagitakayosi: Ratride v1.0 — Markdown slide tool (ratatui + tachyonfx, terminal & Web)](https://x.com/amagitakayosi/status/2028979494984499577) — focus: 導入検討 (#20) 効用/メリット/デメリット評価
- [ ] 2026-05-13 — [@oikon48: Codex + gpt-5.4 推奨設定 (service_tier=fast, 1M ctx, auto-compact 950k)](https://x.com/oikon48/status/2030171170885321056) — focus: 導入検討 (#20) Codex 設定値の検証と採否
- [ ] 2026-05-13 — [@kmizu: issueごとに「テスト→実装→PR」をエージェントに回す暗黙知](https://x.com/kmizu/status/2028446966997569933) — focus: 添付画像のプロンプト具体例を確認、現行 TDD + harness-dual-agent との差分検証
- [ ] 2026-05-14 — [@tonkotsuboy_com: Claude Code /autofix-pr 紹介](https://x.com/tonkotsuboy_com/status/2047306307674558761) — focus: 挙動詳細確認 + 既存 gh-fix-ci skill / coderabbit:autofix との差分・併用可否
- [ ] 2026-05-13 — [AIが書くならMarkdownじゃなくHTMLのほうがいいのでは、という話](https://nowokay.hatenablog.com/entry/2026/05/09/164006) — focus: TBD
- [ ] 2026-05-13 — [不要なレビューをAIにまかせてAIコーディングの環境改善を加速した](https://tech.findy.co.jp/entry/2026/05/08/100000) — focus: Tidy First 分類 + 大規模 diff サンプリング手法を reviewer-judgment / ultrareview に流用できるか
- [ ] 2026-05-13 — [Codex Reviewを自動化する：Claude Code × Codex レビューループ実装ガイド（SKILL.md・Plugin・パイプライン）](https://smartscope.blog/blog/claude-code-codex-review-loop-automation-2026/) — focus: Stop Hook 自動発火 + VERDICT/AUDIT 二段 + UUID 並列セーフティを reviewer-judgment + codex:rescue に組み込めるか
- [ ] 2026-05-13 — [Playwright CLI で AI エージェントに視覚的なフィードバックを与える](https://azukiazusa.dev/blog/playwright-cli-ai-agent-visual-feedback/) — focus: --annotate ワークフローを user-fe-vrt / user-figma-implement の人間レビュー手順に統合できるか評価
- [ ] 2026-05-13 — [【2026年4月更新】Claude Codeの役に立つフロントデザインのskills10選](https://qiita.com/kamome_susume/items/41300417840aa107472e) — focus: net-new な design-review / web-design-guidelines / composition-patterns / design-requirements-grill を既存 user-fe-* / user-figma-* と差分整理
- [ ] 2026-05-13 — [Claude Design が来た日 ─ Webデザイナーとフロントエンドの仕事はどこまで削られるのか](https://zenn.dev/akasara/articles/ab24affd00d788) — focus: 一人 Web 制作スタック (user-figma-build / user-figma-implement / user-doc-design-spec) の見直しトリガーとして取り込み、Claude Design 公開後に再評価
- [ ] 2026-05-13 — [2026年のソフトウェア開発を考える（2026/05版） / Software Engineering Scrum Fest Niigata 2026 Edition](https://speakerdeck.com/twada/software-engineering-scrum-fest-niigata-2026-edition) — focus: Harness Engineering / 認知負債フレームを harness (CLAUDE.md / skills / hooks) 棚卸し指針として採用
- [ ] 2026-05-13 — [フロントエンドの相手が変わった - AIが加わったWebの新しいインターフェース設計](https://speakerdeck.com/azukiazusa1/hurontoendonoxiang-shou-gabian-watuta-aigajia-watutawebnoxin-siiintahuesushe-ji) — focus: MCP Apps / A2UI / WebMCP / llms.txt / json-render の一次ソース横断調査 (web.dev agent-friendly websites と合わせて)
- [ ] 2026-05-13 — [エージェントフレンドリーなウェブサイトを構築する](https://web.dev/articles/ai-agent-site-ux?hl=ja) — focus: agent perception (a11y tree / 8px tap / stable layout) を user-fe-html チェックリストに1項目追加検討、納品物の差別化アピールに使えるか
- [ ] 2026-05-13 — [Claude Code × tmuxの個人的活用術](https://dev.classmethod.jp/articles/shuntaka-claude-code-tmux-personal-tips/) — focus: tmux popup ウィジェット 3 種 (file picker / rg / claude --resume) + direnv worktree 分離 + pane 参照テクの取り込み評価
- [ ] 2026-05-13 — [mattpocock/skills — Skills for Real Engineers](https://github.com/mattpocock/skills) — focus: to-issues / to-prd / triage / zoom-out / handoff の個別 SKILL.md を sampling、既存 user-pm-spec / session-summary との差分整理
- [ ] 2026-05-13 — [Claude Codeにレビューを任せてチームの負担を減らす](https://zenn.dev/wwwave/articles/4d21d34ad604ba) — focus: .coderabbit.yaml を SSOT 参照で基準統一 / 大規模 diff の /tmp 中間保存+fingerprint 再開 / 差分駆動の判断原則 を user-dev-review に反映評価
- [ ] 2026-05-13 — [pnpm 11.0リリース ——新規公開の依存パッケージをデフォルトで1日後に解決対象に](https://gihyo.jp/article/2026/04/pnpm-v11-release) — focus: minimumReleaseAge cooldown 思想を Bun 側で同等機能登場時の判断材料として user-fe-knowledge に保存
- [ ] 2026-05-13 — [Web 標準動向 2026年4月版](https://zenn.dev/cybozu_frontend/articles/web_standards_trends_202604) — focus: user-fe-knowledge の月次更新ソース化 + 今号トピック (ES2026 RC / Baseline 2026-04 / Soft Navigations / Container style queries) を個別 KB エントリ化
- [ ] 2026-05-13 — [AI時代に価値が出るのは「作る力」ではなく「評価して回す力」](https://note.com/suthio/n/n21809850230e) — focus: 並列専門レビューアー原則 を CLAUDE.md §4 review gate 表に追記 + disposable-output を user-dev-prototype に追加
- [ ] 2026-05-13 — [getagentseal/codeburn — Interactive TUI dashboard for Claude Code, Codex, and Cursor cost observability](https://github.com/getagentseal/codeburn) — focus: 導入検討 (#20) PMO 案件別コスト集計への組込み評価 (ccusage 比 Codex/Cursor 横断 + TUI 差別点)
- [ ] 2026-05-13 — [SIerのウォーターフォール開発をスキル化して、AI駆動開発しやすい形に再構成する](https://zenn.dev/is0383kk/articles/5615d445490d7a) — focus: 対話型 (探索) vs テンプレ駆動 (定型) の二分法 + YAML frontmatter 工程ステータス管理を user-pm-discover / user-pm-spec の改善ヒントとして反映検討
- [ ] 2026-05-13 — [Claude Code プラグインおすすめ 2026 — 公式マーケットプレイスから入れるべきプラグイン & MCP サーバー](https://zenn.dev/ino_h/articles/2026-04-23-claude-code-plugins-ranking) — focus: net-new 候補 (security-guidance hook / frontend-design) の採否評価、pr-review-toolkit は重複でスキップ
- [ ] 2026-05-13 — [ハーネスエンジニアリングを楽にする Microsoft 製の新ツール「APM」ハンズオン](https://zenn.dev/microsoft/articles/agent-package-manager-handson) — focus: 将来の自作 skill 外部公開 / クライアントワーク横断 (Copilot/Cursor) 配布シナリオでの採否、apm-policy.yml ガバナンス機能の評価
- [ ] 2026-05-13 — [AI時代のリッチテキスト形式（RTF）](https://blog.lai.so/ai-rich-text-format/) — focus: 「最終消費=HTML / 中間素材=Markdown」役割分担を visual-output.md "Why this matters" に追記 + inline editing UX が DOM 構造を要求する観点を user-fe-knowledge へ保存
- [ ] 2026-05-13 — [Secretlint v13.0.0リリース: .gitignore済みをデフォルトで無視、Tailscale/Stripe/Cloudflareの検出に対応](https://efcl.info/2026/05/05/secretlint-v13/) — focus: 既存運用 (protect-sensitive.sh + Secretlint) の v13 アップグレード手順 + --no-gitignore 要否判断 + recommend preset 採用
- [ ] 2026-05-13 — [AGENTS.mdをベストプラクティスに沿って自動更新する自作スキルとhook設定がいい感じ](https://zenn.dev/ryonakae/articles/338f63fb030267) — focus: Stop Hook で AGENTS.md/CLAUDE.md 乖離検出+提案ロジックを user-harness-rules / home/.claude/hooks へ取り込み検討 (提案のみ・フル自動化はしない)
- [ ] 2026-05-13 — [Obsidianのおすすめフォルダ構成](https://note.com/shotovim/n/n3f0f10aceee7) — focus: Obsidian 非ユーザーだが AI 参照性を意識したフォルダ命名・用途分離発想を ~/prj 構成見直し時の参考として保持
- [ ] 2026-05-13 — [AI時代におけるタスク管理を考える](https://zenn.dev/mkj/articles/geminitask_20260325) — focus: 同時 AI エージェント ~3 が認知限界の知見を subagent 並列数判断材料として確認 (それ以外の Gemini + Workspace 個人タスク管理は採用不可)
- [ ] 2026-05-13 — [15以上のアイコンライブラリから5万点以上のアイコンを用意したMCP対応アイコン検索システム・「Iconstack」](https://kachibito.net/useful-resource/iconstack) — focus: Iconstack MCP 試験導入 — settings.json に追加し user-fe-develop / user-figma-implement のアイコン選定短縮効果を評価
- [ ] 2026-05-14 — [「うちのAIは喋るぞ」音声MCPを作って公開してみた【Codex・Claude Code】](https://zenn.dev/forward/articles/38a9a5bf2e114b) — focus: speak-mcp 採用検討 — 並列ペイン/subagent 通知用途、queue-stop-guard hook との統合方針、Brewfile/settings.json への組込み評価
- [ ] 2026-05-14 — [AIにUIを作らせる前に、デザインの土台を自分で決めるツールを作った](https://zenn.dev/pepabo/articles/74653f4d78eb7b) — focus: pre-design-md を user-design-md Init モードのインプット源として組込み検討 (Google DESIGN.md 出力経路活用)
- [ ] 2026-05-14 — [Claude Code も Gemini CLI も、みんな仲良く働いてほしい](https://zenn.dev/sonicmoov/articles/577f3de925f3c4) — focus: cuekit 思想 (observe & intervene) を harness-dual-agent / claude-squad / codex-companion と比較、TUI 委譲・SQLite ワークスペース観測の採否
- [ ] 2026-05-14 — [個人的 AI情報の追い方](https://zenn.dev/knowledgework/articles/my-ai-catchup) — focus: NotebookLM 音声要約 + Claude/Grok scheduled web search で Pulse 相当を再現する観点の評価
- [ ] 2026-05-14 — [音楽の生成・編集が可能な高性能ローカル音楽生成AI【ACE-Step-1.5】はどれほどか？](https://zenn.dev/asap/articles/d03902a7852a61) — focus: macOS で動作可否 / 用途発生時の入口情報として一次ソース確認
- [ ] 2026-05-14 — [Claude CodeにCLIツールを渡して精度と効率を上げる](https://zenn.dev/chot/articles/d0cd0425edd869) — focus: knip / madge / dependency-cruiser / type-coverage / semgrep / textlint を user-fe-knowledge と reviewer subagent の標準探索コマンドとして組込み評価
- [ ] 2026-05-14 — [Marpでいい感じのスライドを生成するClaude Code Pluginを作った](https://zenn.dev/yamakh/articles/e720d66aeeca44) — focus: visual-explainer:generate-slides (HTML) との棲み分け、クライアント納品 .pptx/.pdf 用途での採否
- [ ] 2026-05-14 — [macOS Tahoe Studio Display 画面のちらつき：8つの完全修復ガイド (2025)](https://macos-tahoe.com/ja/blog/macos-tahoe-studio-display-flickering-complete-fix-guide-2025/) — focus: Stillcolor / カラープロファイル調整 / リフレッシュレート変更 / SMC リセット等 8 ワークアラウンドの一次ソース (Apple サポート + Stillcolor README) 突合と再現性検証、実機問題発生時の手順書化
- [ ] 2026-05-14 — [nextlevelbuilder/ui-ux-pro-max-skill — AI SKILL that provides design intelligence for building professional UI/UX](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) — focus: uipro-cli を Figma 上流 generator として user-design-md / user-figma-build に組み込み可否、161 industry rule を user-research-design-dna データ層に活用可否
- [ ] 2026-05-14 — [tak-dcxi/タイポグラフィCSS (Gist)](https://gist.github.com/tak-dcxi/0f8b924d6dd81aaeb58dc2e287f2ab3a) — focus: text-wrap/text-box-trim/hanging-punctuation/text-autospace/palt 等の最新 CSS を user-fe-knowledge エントリ化 + DESIGN.md テンプレ反映
- [ ] 2026-05-14 — [AIのハーネスを徹底的に整えたら、レビューもシステム運用も自動化され、非エンジニアも開発に参加できるようになった話 ── 連載総論](https://zenn.dev/aircloset/articles/d416342f46f16b) — focus: Product Graph 化 / 自動レビュー gate / 非エンジニア参加導線 の 3 点を自ハーネス (CLAUDE.md / skills / hooks) に取り込めるか精査
- [ ] 2026-05-14 — [Claude Code Routines で Issue の自動対応をチームで回している話](https://zenn.dev/notahotel/articles/claude-routine-auto-fix-issue) — focus: Routines + Skill + GitHub Actions 分担パターンを user-pmo-* 自動実行化に取り込めるか、4 アカウント時差運用 Tips の採否
- [ ] 2026-05-14 — [WBSは単なる「予定表」じゃない。エンジニアの魂を社会の実装へ繋ぐ「対話の地図」だ。](https://zenn.dev/headwaters/articles/82cd9d0181acb3) — focus: WBS=合意形成の地図 観点を user-pmo-wbs / user-pm-spec の SKILL.md にどう反映するか (完了基準・手法選定・納品後価値継続の取り込み箇所)
- [ ] 2026-05-14 — [AI駆動PMの5原則と12の具体例 — Claude Code × Obsidian](https://zenn.dev/assign/articles/4ba3d41bf59a61) — focus: 投機 (projects/) vs 確定 (products/) 分離 / frontmatter state / calendar-to-task drift 検出 の 3 点を user-pm-session / user-pmo-status に取り込み可否 (Obsidian 部分は捨てる)
- [ ] 2026-05-14 — [Claude Code 実践検証 Day 27｜長期プロジェクトでAIと分業する―WBS + /auto-execの基本設計](https://zenn.dev/akira_cloudjob/articles/ecbe77f3150cec) — focus: [→] アクティブマーカー方式 + /auto-exec カスタムコマンドを user-pmo-wbs / superpowers:executing-plans と統合評価
- [ ] 2026-05-13 — [googleworkspace/cli — Google Workspace CLI (Drive/Gmail/Calendar/Sheets etc., AI agent skills 同梱)](https://github.com/googleworkspace/cli) — focus: 導入検討 (#20) 効用/メリット/デメリット評価

## Done

(処理済み・破棄含む)

<!-- Format: `- [x] <added-date> → <today> — [title](url) — outcome: <quick|deep|discarded> — takeaway: ...` -->

- [x] 2026-05-13 → 2026-05-13 — [Opus 4.7 で Claude Code の使い方が変わる 6 つのこと](https://qiita.com/ot12/items/06420caf41a34a910c53) — outcome: deep — takeaway: §4 は例外条項で併存、Effort xhigh と /focus は即採用
- [x] 2026-05-13 → 2026-05-13 — [Dave Jeffery: アプリのフロー文書化 (HTML + JSON for LLM)](https://x.com/DaveJ/status/2053867258653339746?s=20) — outcome: deep — takeaway: user-dev-flowmap として採用候補だが visual-explainer:generate-web-diagram と機能が被る。先に user-harness-interview で JSON schema と差別化軸 (永続化+LLM再投入) を確定してから実装
- [x] 2026-05-13 → 2026-05-14 — [@pouhiroshi on X](https://x.com/pouhiroshi/status/2030071072968871977) — outcome: discarded — takeaway: Unity MCP の驚嘆ツイートのみで技術内容なし、スコープ外
- [x] 2026-05-13 → 2026-05-14 — [@tom_doerr on X](https://x.com/tom_doerr/status/2030040275079368847) — outcome: discarded — takeaway: branchlet 紹介ツイート。スコープ外 — 既存 worktree 運用 (using-git-worktrees skill + EnterWorktree harness + tmux 並列) で十分カバー
- [x] 2026-05-13 → 2026-05-14 — [nabeelhyatt/coworkpowers — Superpowers for knowledge work in Claude Code](https://github.com/nabeelhyatt/coworkpowers) — outcome: discarded — takeaway: 既存 superpowers/memory と重複。Compound loop と granular insight storage は superpowers skill 群 + ~/.claude/projects/*/memory/ で実装済み
- [x] 2026-05-13 → 2026-05-14 — [playcanvas/editor — Browser-based visual editor for WebGL/WebGPU/WebXR apps](https://github.com/playcanvas/editor) — outcome: discarded — takeaway: ターゲット不一致（3D/ゲーム領域）。dotfiles/Claude Code/Web 制作 PMO と接点なし
- [x] 2026-05-13 → 2026-05-14 — [Gopeed — open-source download engine that works on every platform](https://www.opensourceprojects.dev/post/993c493f-28ec-4a77-9b21-0bed3b45ed5c) — outcome: discarded — takeaway: 既存資産と重複 — aria2/curl/yt-dlp で日常需要は満たせている
- [x] 2026-05-13 → 2026-05-14 — [@yoshiko_pg on X — Codex激推しの理由](https://x.com/yoshiko_pg/status/2029938566516855172) — outcome: discarded — takeaway: 既存資産と重複 — Codex は codex プラグイン/harness-dual-agent skill で導入済み、xHigh effort も運用中
- [x] 2026-05-13 → 2026-05-14 — [EdamAme-x/claudex — use codex model on Claude Code](https://github.com/EdamAme-x/claudex) — outcome: discarded — takeaway: 既存資産と重複 — codex plugin + harness-dual-agent skill で Claude↔Codex 連携済み、Claude UX で Codex モデルを動かす動機が薄い
- [x] 2026-05-13 → 2026-05-14 — [@suin: .envをAIに安心して触らせたくて、こんなの作った](https://x.com/suin/status/2025525553823191550) — outcome: quick — takeaway: 既存資産と重複 — Secretlint v13 + protect-sensitive.sh deny list + security.md policy で .env 保護は十分カバー済み
- [x] 2026-05-13 → 2026-05-14 — [@ryoppippi: doppler.com 使おうぜ](https://x.com/ryoppippi/status/2028670064254447621) — outcome: discarded — takeaway: 既存資産と重複 — .env + Secretlint v13 + protect-sensitive.sh + chmod 600 で個人 dotfiles の secret 管理は充足。SaaS 依存を増やす動機なし
- [x] 2026-05-13 → 2026-05-14 — [ノンデザイナーズ・Wantedly デザインシステム完全理解ペーパー](https://www.wantedly.com/companies/wantedly/post_articles/395772) — outcome: quick — takeaway: 既存資産と重複 — DESIGN.md / design-tokens / user-doc-design-spec / user-design-md で同等概念カバー済み
- [x] 2026-05-13 → 2026-05-14 — [教材だけでは分からない、案件でよく要求される細かいコーディングのテクニック12選](https://itokoba.com/archives/3877) — outcome: discarded — takeaway: 既存資産と重複 — MDN/web.dev + user-fe-knowledge で同等以上カバー、2022年の初心者向けで現役フロント+AIコーディング前提のスコープ外
- [x] 2026-05-13 → 2026-05-14 — [@so_ainsight on X — CLAUDE.md GitHubトレンド1位](https://x.com/so_ainsight/status/2048341367806726425) — outcome: discarded — takeaway: 既存資産と重複 — Karpathy 4原則は CLAUDE.md Core Principles (Read before modify / Simplicity first / Surgical edits / Think before coding) で全て採用済み
- [x] 2026-05-13 → 2026-05-14 — [@Cloudflare on X — Agents can be Cloudflare customers](https://x.com/Cloudflare/status/2049545195914498139) — outcome: discarded — takeaway: 既存資産と重複 — Inbox に同トピックの Cloudflare 公式ブログ (agents-stripe-projects) があり一次ソースはそちら
- [x] 2026-05-13 → 2026-05-14 — [エージェントを強化する: Google 公式 Skills リポジトリを発表](https://cloud.google.com/blog/ja/topics/developers-practitioners/level-up-your-agents-announcing-googles-official-skills-repository) — outcome: discarded — takeaway: ターゲット不一致 — Claude Code 中心の現環境では GCP プロダクト前提の Skills (AlloyDB/BigQuery/GKE等) を活用する機会が薄い
- [x] 2026-05-13 → 2026-05-14 — [日常の仕事をほぼAI経由でどう回しているか、またはやりたいことを全部持って行かれる為の備忘録](https://note.com/cuon/n/nc1bc97c22892) — outcome: discarded — takeaway: ターゲット不一致 — 個人 dotfiles / Claude Code harness のスコープと接点が薄い
- [x] 2026-05-13 → 2026-05-14 — [話題のGoogle Workspace MCPサーバーをさっそく使ってみた](https://www.yoshidumi.co.jp/collaboration-lab/gws-mcp-server) — outcome: discarded — takeaway: 既存資産と重複 — Deep Research 待ちに googleworkspace/cli (一次ソース) があり、そちらで評価
- [x] 2026-05-13 → 2026-05-14 — [OpenCode Go + pi-coding-agent のすゝめ](https://zenn.dev/kimuson/articles/pi-coding-agent-with-opencode-go) — outcome: discarded — takeaway: 既存資産と重複 — Claude Code + codex plugin + harness-dual-agent で同領域カバー済み
- [x] 2026-05-13 → 2026-05-14 — [Claude Codeを"使いこなす"ための個人ルール設定 - 実際にやって効果が高かった設定](https://zenn.dev/dotdtech_blog/articles/92348ee48cc692) — outcome: discarded — takeaway: 既存資産と重複 — CLAUDE.md / rules/ / skills/ 既に成熟版、新規取り込み余地小
- [x] 2026-05-13 → 2026-05-14 — [要求を仕様に落とすテンプレートを作ってみた](https://zenn.dev/channnnsm/articles/c3a6de22e71f86) — outcome: discarded — takeaway: 既存資産と重複 — user-doc-design-spec / user-harness-interview / writing-plans skill で同等カバー済み
- [x] 2026-05-13 → 2026-05-14 — [Claude Codeを120%使いこなす設定3選【ECC・Memory.md・Obsidian連携】](https://qiita.com/manchan/items/63745b9198f1989c2a15) — outcome: discarded — takeaway: 既存資産と重複 — Memory.md / CLAUDE.md / memory system 既に成熟、ECC bulk 導入は user-* 厳選哲学に逆行
- [x] 2026-05-13 → 2026-05-14 — [Codexのサブエージェントで実装とレビューを分業してみた](https://acro-engineer.hatenablog.com/entry/2026/05/12/120000) — outcome: discarded — takeaway: 既存資産と重複 — implementer / reviewer-judgment split + Agent tool で実質カバー済み
- [x] 2026-05-13 → 2026-05-14 — [コーディングエージェント向けのリモートサンドボックス](https://blog.lai.so/agents-sandbox/) — outcome: quick — takeaway: 既存資産と重複 — worktree + tmux + Sandbox MCP で同領域カバー済み、並列本数拡張 or root 必要時に exe.dev / Fly.io Sprites を再評価
- [x] 2026-05-13 → 2026-05-14 — [自動テストだけでリリース判断できるチームへ - 鍵はテストの量ではなくリリース判断基準の再設計にあった / Redesigning Release Criteria for Lightweight Releases](https://speakerdeck.com/ewa/redesigning-release-criteria-for-lightweight-releases) — outcome: quick — takeaway: ターゲット不一致 — 個人 dotfiles は Test Policy で CI/CD 不採用、「リリース基準」概念が存在しない
- [x] 2026-05-13 → 2026-05-14 — [メルカリのClaude Codeセキュリティ設定の組織配布戦略 - Claude Code Meetup Japan #4](https://speakerdeck.com/hi120ki/claude-code-organization-settings) — outcome: quick — takeaway: ターゲット不一致 — 組織 MDM 配布スコープは個人 dotfiles に不適、protect-sensitive.sh + deny list + Secretlint + security.md で同等以上カバー済み
- [x] 2026-05-13 → 2026-05-14 — [【徹底解説】セキュリティスペシャリストが教える、セキュアプログラミングの教科書](https://qiita.com/miruky/items/6fbb0c0e55835ea79e4d) — outcome: quick — takeaway: 一次情報なし — OWASP Top 10 / IPA 安全なウェブサイトの作り方 を一次ソースにする方が良い、Qiita まとめは不要
- [x] 2026-05-13 → 2026-05-14 — [『生成AI時代のクレデンシャルとパーミッション設計 — Claude Code を起点に』を書きます。個人開発者向けにコメント募集](https://blog.takuros.net/entry/2026/05/06/135413) — outcome: quick — takeaway: 一次情報なし — 執筆告知のみで本体未公開。書籍/記事本体が出てから再評価
- [x] 2026-05-13 → 2026-05-15 — [【Claude Code】CLAUDE.md・skills・agents を整備して開発体験が劇的に変わった話](https://zenn.dev/linkedge/articles/27c38cdd9bedc6) — outcome: quick — takeaway: 既存資産と重複 — claude-md-management:revise-claude-md / user-harness-rules で同等カバー済み、Rails 者向け入門記事で net-new なし
- [x] 2026-05-13 → 2026-05-15 — [Agents can now create Cloudflare accounts, buy domains, and deploy](https://blog.cloudflare.com/agents-stripe-projects/) — outcome: quick — takeaway: ターゲット不一致 — 個人 dotfiles + Web 制作 PMO の現規模では agent 代行で CF アカウント/ドメイン/デプロイを丸投げする動機なし、wrangler+手動で充足
- [x] 2026-05-13 → 2026-05-15 — [【完全版】Claude Code運用40選](https://note.com/kawaidesign/n/nce2f82c62f1f) — outcome: quick — takeaway: 既存資産と重複 — 50+ user-* skills / hooks / rules / subagents / FAILURES.md で 6 軸 (探索分離・自己検証・コンテキスト外部化・ガードレール・並列化・情報蓄積) 全項目カバー済み
- [x] 2026-05-13 → 2026-05-15 — [Claude の Adobe for creativity の使い方](https://note.com/npaka/n/n6841ac39cc4c) — outcome: quick — takeaway: ターゲット不一致 — 主軸は dotfiles + Web 制作 PMO + Figma + Claude Code (CLI)、Adobe CC ベースの実作業は中心ではない
- [x] 2026-05-13 → 2026-05-15 — [理想のアプリに近づけるため「Claude Design」を試す ゼロから始めるAIコーディング(2)](https://www.watch.impress.co.jp/docs/topic/2105497.html) — outcome: quick — takeaway: 既存 Deep Research と重複 — Deep Research 待ちの zenn.dev/akasara Claude Design 記事に内容包含、追加採用不要
- [x] 2026-05-13 → 2026-05-15 — [Vibe Designは何を失っているか](https://domaindesign.co/column/the-loss-of-vibe-design/) — outcome: quick — takeaway: 哲学論考で実装取り込み不要 — 現ワークフロー (upstream は user-pm-spec / user-doc-ia / user-research-design-dna で人間が固めてから AI に渡す) で既に同方針、追加ルール化不要
- [x] 2026-05-13 → 2026-05-15 — [@tonkotsuboy_com on X (Claude Design 体験談)](https://x.com/tonkotsuboy_com/status/2046044523957207549) — outcome: quick — takeaway: 既存 Deep Research と重複 — Claude Design は zenn.dev/akasara 経由で評価キュー済み、X 感想ベース投稿の追加価値なし
- [x] 2026-05-13 → 2026-05-15 — [Claude Codeのルーチン機能で定期的にパフォーマンスチューニングをさせている](https://zenn.dev/yamadashy/articles/claude-code-routines-perf-tuning) — outcome: quick — takeaway: ターゲット不一致 — 個人 dotfiles に perf-tuning 対象薄、/schedule で機能カバー済み、OSS 保有時に再評価
- [x] 2026-05-13 → 2026-05-15 — [非エンジニアの「作りたい」と「安全に公開したい」を両立する Sandbox MCP を作った](https://zenn.dev/aircloset/articles/65efe9614f8e73) — outcome: quick — takeaway: ターゲット不一致 — 組織向け非エンジニア多人数デプロイ基盤の事例で個人 dotfiles + Web制作 PMO とスコープ不一致、将来のクライアント共有基盤構想時の設計参考としてのみ
- [x] 2026-05-13 → 2026-05-15 — [ターミナルで動く開発モニタをRustで作った — Ratatuiで実用TUIを作って見えた5つの設計課題とその解き方](https://zenn.dev/okamyuji/articles/ratatui-real-world-tui-design-patterns) — outcome: quick — takeaway: ターゲット不一致 — Rust TUI を自作する予定なし、dotfiles/PMO スコープ外。sync/async 境界・graceful degrade・ring buffer は言語非依存原則として頭出しのみ
- [x] 2026-05-13 → 2026-05-15 — [同じ Issue を Claude・Codex・Gemini に同時に解かせるとどうなるか — git worktree × tmux で衝突しない並列 AI 開発](https://qiita.com/nogataka/items/1156e2d3a40c4dab3398) — outcome: quick — takeaway: 既存資産と重複 — using-git-worktrees + EnterWorktree + tmux 並列 + harness-dual-agent で同領域カバー済み、workmux 自体は不要
- [x] 2026-05-13 → 2026-05-15 — [Obsidian がもう散らからない。わたしが Claude Code に任せている Skills 5 選](https://note.com/shotovim/n/n7e8a69ba655c) — outcome: quick — takeaway: ターゲット不一致 — Obsidian 非ユーザーで skill が Obsidian CLI に密結合、Obsidian 導入時のみ再評価
- [x] 2026-05-13 → 2026-05-15 — [事前に定義した UI を AI に生成させる json-render を試してみた](https://azukiazusa.dev/blog/json-render) — outcome: quick — takeaway: 今は採用しない — Generative UI 案件発生時のみ user-fe-knowledge で再評価候補。dotfiles/harness/PMO への直接用途なし
- [x] 2026-05-13 → 2026-05-15 — [ObsidianTips：ローカルの画像ファイルをクラウド管理してみよう](https://note.com/shotovim/n/n24119bee32ce) — outcome: quick — takeaway: 既存資産と重複 — Obsidian 非ユーザーで vault 系 Tips 採用不可、paywall 配下で詳細評価も不能
- [x] 2026-05-13 → 2026-05-15 — [Canvas 内に直接 HTML を描画できる HTML in Canvas API について](https://azukiazusa.dev/blog/html-in-canvas-api) — outcome: quick — takeaway: 実験段階で production 不適 — WICG 提案中、Chrome Canary 限定で stable 未到達、Canvas/WebGL UI 案件予定なし
- [x] 2026-05-13 → 2026-05-15 — [忘れがちな robots.txt の確認を GitHub Actions の PR コメントで促す](https://zenn.dev/chot/articles/74227f0db1b11e) — outcome: quick — takeaway: 今は採用しない — Next.js + Actions 個別 CI Tips、Next.js 案件で robots.txt 運用が実際に発生した時のみ user-fe-knowledge メモ
- [x] 2026-05-13 → 2026-05-15 — [Xの投稿をObsidianに蓄積したいんだ！](https://note.com/shotovim/n/nc446b6a455c0) — outcome: quick — takeaway: 既存資産と重複 — user-research-x-posts + agent-browser で X 取得カバー済み、Obsidian 非ユーザー
- [x] 2026-05-13 → 2026-05-15 — [Google Workspaceをコマンドラインで操作する「gws」、Googleがオープンソースで公開。Agent Skillsファイルも提供し、AIエージェントによる適切な操作実現](https://www.publickey1.jp/blog/26/google_workspacegwsgoogleagent_skillsai.html) — outcome: quick — takeaway: 既存資産と重複 — Deep Research 待ちに一次ソース googleworkspace/cli エントリあり、Publickey は二次ソース
- [x] 2026-05-13 → 2026-05-15 — [blog.tsubotax.com/n/n2dadfe4bd019](https://blog.tsubotax.com/n/n2dadfe4bd019) — outcome: discarded — takeaway: 一般論で新規性なし — AI時代PdM論として既知の範囲、実装系の取り込みなし
- [x] 2026-05-14 → 2026-05-15 — [Claude CodeユーザーのためのCodex入門](https://zenn.dev/k9i/articles/20260504_cc_to_codex) — outcome: discarded — takeaway: 既存資産と重複 — codex プラグイン + harness-dual-agent skill で Codex 連携済み、設定差分整理も不要
- [x] 2026-05-14 → 2026-05-15 — [あなたの Claude Code、実は前回のセッションを完全に忘れている (5 分で永続記憶を入れる)](https://zenn.dev/kanseilink/articles/linksee-memory-claude-code-recall-20260508) — outcome: discarded — takeaway: 既存資産と重複 — ~/.claude/projects/*/memory/ + FAILURES.md + session-summary.md で同等カバー済み、MCP+SQLite 追加のメリット薄
- [x] 2026-05-14 → 2026-05-15 — [hesreallyhim/awesome-claude-code — A curated list of awesome skills, hooks, slash-commands, agent orchestrators, applications, and plugins for Claude Code](https://github.com/hesreallyhim/awesome-claude-code) — outcome: quick — takeaway: queue 管理対象外 (巡回ソース) — awesome 系リスト本体は個別 URL を Inbox に流すための定期巡回元。user-harness-config / user-harness-gen-skills 実行時の参照先として記憶
