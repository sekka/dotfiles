# 統合アルゴリズム詳細仕様

複数のAIレビュアーの出力を統合処理するための詳細なアルゴリズム仕様です。

## 実装方針

このアルゴリズムは以下の外部Pythonスクリプトとして実装します：

**スクリプトパス**: `~/.claude/bin/parallel-review-merge.py`

SKILL.md Phase 4からの呼び出し：

```bash
python ~/.claude/bin/parallel-review-merge.py \
  --codex codex-output.md \
  --coderabbit coderabbit-output.md \
  --copilot copilot-output.md \
  --gemini gemini-output.md \
  --output integrated-report.md
```

## 1. パース処理

各レビュアーの出力からFindingを抽出します。

### 1.1 正規表現パターン（ReDoS対策済み）

ReDoS（Regular Expression Denial of Service）に対応した安全なパターンを使用：

```python
# ファイル:行番号パターンの抽出（安全なパターン）
FILE_LINE_PATTERN = r'\*\*\[([^\]]+?):(\d+)\]\*\*\s+([^\n]+)'

# 制限
MAX_FILE_PATH_LENGTH = 500  # ファイルパス最大500文字
MAX_LINE_LENGTH = 500       # 行の内容最大500文字

# カテゴリの抽出（複数キーワード対応）
CATEGORY_PATTERNS = {
    'security': [
        'injection', 'xss', 'csrf', 'authentication',
        'authorization', 'crypto', 'ssl', 'tls', 'password',
        'secret', 'token', 'auth', 'vulnerable', 'exploit',
        'vulnerability', 'owasp', 'cwe', 'sql', 'command'
    ],
    'performance': [
        'n+1', 'slow', 'inefficient', 'memory', 'leak',
        'optimization', 'cache', 'bottleneck', 'timeout',
        'deadlock', 'latency', 'throughput'
    ],
    'code_quality': [
        'readability', 'maintainability', 'dry', 'duplication',
        'naming', 'complexity', 'refactor', 'style',
        'convention', 'format', 'lint'
    ],
    'architecture': [
        'pattern', 'coupling', 'cohesion', 'solid',
        'design', 'principle', 'abstraction', 'layer',
        'module', 'component', 'dependency', 'circular'
    ],
    'test': [
        'coverage', 'edge case', 'test', 'mock',
        'unit', 'integration', 'e2e', 'pytest'
    ],
    'github': [
        'ci/cd', 'github', 'action', 'workflow',
        'deploy', 'release', 'branch', 'merge'
    ]
}
```

### 1.2 パース処理の流れ

```python
def parse_reviewer_output(reviewer_name, output_text):
    """
    レビュアーの出力をパースしてFindingのリストを返す

    Returns:
        List[Finding]: {
            'file': str,
            'line': int,
            'category': str,
            'priority': str,  # Critical/Important/Suggestion
            'description': str,
            'reviewer': str,
            'detailed_comment': str
        }
    """
    findings = []

    # ファイル:行番号パターンでマッチ
    matches = re.finditer(FILE_LINE_PATTERN, output_text)

    for match in matches:
        file_path = match.group(1)[:MAX_FILE_PATH_LENGTH]
        line_num = int(match.group(2))
        description = match.group(3)[:MAX_LINE_LENGTH]

        # カテゴリを自動分類
        category = classify_category(description)

        # 優先度を抽出
        priority = extract_priority(description)

        finding = {
            'file': file_path,
            'line': line_num,
            'category': category,
            'priority': priority,
            'description': description,
            'reviewer': reviewer_name,
            'detailed_comment': extract_full_comment(output_text, match.start())
        }

        findings.append(finding)

    return findings
```

## 2. 重複排除アルゴリズム

同一の問題を統合します。

### 2.1 完全一致による統合

**キー定義**: `{file}:{line}:{category}`

```python
def deduplicate_exact_match(all_findings):
    """
    完全一致（同じファイル、行番号、カテゴリ）の指摘を統合
    """
    dedup_map = {}

    for finding in all_findings:
        key = (finding['file'], finding['line'], finding['category'])

        if key not in dedup_map:
            dedup_map[key] = {
                **finding,
                'reviewers': [finding['reviewer']],
                'reviewer_comments': {finding['reviewer']: finding['detailed_comment']}
            }
        else:
            # 既に存在する場合は、レビュアーを追加
            dedup_map[key]['reviewers'].append(finding['reviewer'])
            dedup_map[key]['reviewer_comments'][finding['reviewer']] = finding['detailed_comment']

    return list(dedup_map.values())
```

### 2.2 Fuzzy Matchingによる統合

**ルール**: ±2行以内 && 同一ファイル && 同一カテゴリ → 同一問題として統合

```python
def deduplicate_fuzzy_match(exact_deduplicated):
    """
    Fuzzy Matchingで近い行番号の指摘を統合
    O(n) の空間索引を使って効率的に実装
    """
    from collections import defaultdict

    # 空間索引: (file, category) -> {line: [findings]}
    spatial_index = defaultdict(lambda: defaultdict(list))

    # インデックスを構築
    for finding in exact_deduplicated:
        key = (finding['file'], finding['category'])
        spatial_index[key][finding['line']].append(finding)

    # Fuzzy Matchingで統合
    merged = []
    processed = set()

    for finding in exact_deduplicated:
        if id(finding) in processed:
            continue

        file_path = finding['file']
        line = finding['line']
        category = finding['category']
        key = (file_path, category)

        # ±2行以内のfindingを検索（O(1)で該当行を取得、±2行を確認）
        related = []
        for offset in range(-2, 3):
            check_line = line + offset
            if check_line in spatial_index[key]:
                related.extend(spatial_index[key][check_line])

        # Fuzzy Match結果を統合
        if len(related) > 1:
            merged_finding = merge_findings(related)
            merged.append(merged_finding)

            for r in related:
                processed.add(id(r))
        else:
            merged.append(finding)
            processed.add(id(finding))

    return merged
```

**時間計算量の改善**:
- **Before**: O(n²) の線形探索（1,000件で1,000,000回の比較）
- **After**: O(n) の空間索引（1,000件で5,000回の比較）
- **改善効果**: 200倍以上の高速化

## 3. 優先度付けアルゴリズム

重複排除後のfindingに対して優先度を計算します。

### 3.1 基本ルール（レビュアー数ベース）

```python
def calculate_priority_from_count(reviewer_count):
    """
    レビュアーの指摘数から優先度を算出
    """
    if reviewer_count >= 4:
        return 'Critical'
    elif reviewer_count >= 3:
        return 'High'
    elif reviewer_count >= 2:
        return 'Medium'
    else:
        return 'Low'
```

### 3.2 カテゴリベース優先度上書き（OWASP Top 10対応）

セキュリティ脆弱性は1つの指摘でもCriticalに昇格：

```python
CRITICAL_SECURITY_PATTERNS = [
    # A01: Broken Access Control
    'broken_access_control', 'idor', 'insecure_direct_object_reference',
    'authorization_bypass', 'authentication_bypass',

    # A02: Cryptographic Failures
    'sensitive_data_exposure', 'cryptographic_failure', 'encryption',
    'unencrypted', 'plaintext', 'hardcoded_secret', 'hardcoded_password',

    # A03: Injection
    'sql_injection', 'nosql_injection', 'command_injection',
    'code_injection', 'ldap_injection', 'xpath_injection',
    'os_command_injection', 'template_injection',

    # A04: Insecure Design
    'insecure_design', 'insecure_deserialization', 'deserialization',

    # A05: Security Misconfiguration
    'security_misconfiguration', 'misconfiguration',

    # A06: Vulnerable Components
    'vulnerable_dependency', 'outdated_dependency',

    # A07: Identification and Authentication Failures
    'weak_authentication', 'session_fixation', 'credential_exposure',

    # A08: Software and Data Integrity Failures
    'integrity_failure', 'update_vulnerability',

    # A09: Logging and Monitoring Failures
    'insufficient_logging', 'no_monitoring',

    # A10: Server-Side Request Forgery (SSRF)
    'ssrf', 'server_side_request_forgery',

    # その他重大セキュリティ脆弱性
    'xss', 'cross_site_scripting', 'reflected_xss', 'stored_xss', 'dom_xss',
    'csrf', 'cross_site_request_forgery',
    'xxe', 'xml_external_entity', 'xml_bomb',
    'path_traversal', 'directory_traversal', 'local_file_inclusion',
    'race_condition',
]

def escalate_security_priority(finding):
    """
    セキュリティ脆弱性の優先度を自動昇格
    """
    if finding['category'] != 'security':
        return finding

    # 説明テキストをチェック
    description_lower = finding['description'].lower()

    for pattern in CRITICAL_SECURITY_PATTERNS:
        if pattern in description_lower:
            finding['priority'] = 'Critical'
            finding['priority_reason'] = f"OWASP: {pattern}"
            return finding

    # デフォルトでセキュリティ問題はHighに
    if finding['priority'] in ['Low', 'Medium']:
        finding['priority'] = 'High'
        finding['priority_reason'] = 'Security category elevated'

    return finding
```

## 4. カテゴリ分類

自動分類ロジック：

```python
def classify_category(finding_text):
    """
    Findingのテキストからカテゴリを自動分類
    """
    text_lower = finding_text.lower()

    # カテゴリマッピング（優先度順）
    for category, keywords in CATEGORY_PATTERNS.items():
        for keyword in keywords:
            if keyword in text_lower:
                return category

    # デフォルトはCode Quality
    return 'code_quality'
```

### 4.1 カテゴリ階層構造

```yaml
Security:
  - sql_injection
  - xss
  - csrf
  - authentication_bypass
  - authorization_bypass
  - cryptographic_failure
  - insecure_deserialization
  - ssrf
  - idor
  - path_traversal
  - command_injection
  - xxe
  - security_misconfiguration

Performance:
  - n_plus_one
  - algorithm_inefficiency
  - memory_leak
  - cache_miss
  - slow_query

Code Quality:
  - readability
  - dry_violation
  - naming
  - complexity
  - refactoring_needed

Architecture:
  - design_pattern
  - tight_coupling
  - low_cohesion
  - solid_violation
  - circular_dependency

Test:
  - coverage_gap
  - edge_case_missing
  - integration_test_missing

GitHub:
  - ci_cd_improvement
  - github_actions
  - workflow_optimization
```

## 5. エッジケース対応

### 5.1 Conflictする指摘

複数レビュアーが矛盾する指摘をした場合：

```python
def detect_conflicts(finding):
    """
    レビュアー間での矛盾を検出
    例: 一方が"効率的"、他方が"N+1問題"
    """
    if len(finding['reviewers']) < 2:
        return None

    # パターンマッチで矛盾を検出
    comments = list(finding['reviewer_comments'].values())

    # テキスト分析で相反する主張を検出（簡易実装）
    efficiency_keywords = ['efficient', 'optimal', '効率', '最適']
    inefficiency_keywords = ['inefficient', 'slow', 'n+1', '非効率']

    has_efficiency = any(any(kw in c.lower() for kw in efficiency_keywords) for c in comments)
    has_inefficiency = any(any(kw in c.lower() for kw in inefficiency_keywords) for c in comments)

    if has_efficiency and has_inefficiency:
        return True

    return False
```

### 5.2 空の結果

レビュアーが何も指摘しなかった場合：

```markdown
✅ {reviewer_name}: 問題は検出されませんでした。
```

### 5.3 レビュアー失敗時の処理

レビュアーが失敗した場合、警告を生成：

```markdown
⚠️ {reviewer_name}が失敗しました。
{category}観点が不足している可能性があります。
手動レビューを推奨します。
```

## 6. 統合レポート生成テンプレート

```markdown
# 並列AIレビュー統合レポート

## 📊 サマリー

- **レビュー対象**: [target description]
- **起動したレビュアー**: Codex ✅ | CodeRabbit ✅ | Copilot ✅ | Gemini ✅
- **検出問題総数**: {total_count}件
  - 🔴 Critical: {critical_count}
  - 🟡 High: {high_count}
  - 🟢 Medium: {medium_count}
  - ℹ️ Low: {low_count}

---

## 🔴 Critical（即座に対応すべき）

{Critical findings}

---

## 🟡 High（優先的に対応）

{High findings}

---

## 🟢 Medium（重要）

{Medium findings}

---

## ℹ️ Low / Informational

{Low findings}

---

## 📂 カテゴリ別分析

### 🔒 セキュリティ ({count}件)
{security findings summary}

### ⚡ パフォーマンス ({count}件)
{performance findings summary}

### 📝 コード品質 ({count}件)
{code_quality findings summary}

### 🏗️ アーキテクチャ ({count}件)
{architecture findings summary}

### 🧪 テスト ({count}件)
{test findings summary}

### 🔧 GitHub統合 ({count}件)
{github findings summary}

---

## 🤖 レビュアー別の独自指摘

### Codexの独自見解
{codex only findings}

### CodeRabbitの独自見解
{coderabbit only findings}

### Copilotの独自見解
{copilot only findings}

### Geminiの独自見解
{gemini only findings}

---

## 💡 推奨アクションプラン

1. **即座**: 🔴 Criticalの全問題を修正
2. **本スプリント**: 🟡 Highの問題を優先対応
3. **次スプリント**: 🟢 Mediumの問題を組み込み
4. **継続改善**: ℹ️ Lowの提案を検討

---

## 統計情報

| メトリクス | 値 |
|-----------|-----|
| 総指摘数 | {total} |
| レビュアー平均 | {avg} |
| 複数指摘率 | {multi_percentage}% |
| セキュリティ脆弱性 | {security_count} |
| パフォーマンス問題 | {perf_count} |

Generated: {timestamp}
```

## パフォーマンス考慮事項

- **Fuzzy Matching**: 空間索引による O(n) 実装
- **大量指摘処理**: 100件以上の場合、Critical以外は短縮表示
- **メモリ効率**: ストリーミング処理で大規模出力にも対応
- **実行時間目標**: 1,000件のFinding統合を<1秒で完了

## セキュリティ上の考慮

- **ReDoS対策**: 正規表現の安全性を確保
- **インジェクション対策**: ユーザー入力をエスケープ
- **ファイルI/O**: 容量制限（500文字）で悪意のある入力から保護
