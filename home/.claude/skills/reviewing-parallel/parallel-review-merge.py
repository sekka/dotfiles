#!/usr/bin/env python3
"""
並列AIレビューの統合処理スクリプト

複数のAIレビュアーの出力を統合し、重複排除・優先度付けを実行します。
"""

import argparse
import json
import os
import re
from collections import defaultdict
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple


# ========================================
# 定数定義
# ========================================

FILE_LINE_PATTERN = r'\*\*\[([^\]]+?):(\d+)\]\*\*\s+([^\n]+)'
MAX_FILE_PATH_LENGTH = 500
MAX_LINE_LENGTH = 500

CATEGORY_PATTERNS = {
    'security': [
        'injection', 'xss', 'csrf', 'authentication',
        'authorization', 'crypto', 'ssl', 'tls', 'password',
        'secret', 'token', 'auth', 'vulnerable', 'exploit',
        'vulnerability', 'owasp', 'cwe', 'sql', 'command',
        'broken_access', 'idor', 'cryptographic', 'deserialization',
        'misconfiguration', 'ssrf', 'xxe'
    ],
    'performance': [
        'n+1', 'slow', 'inefficient', 'memory', 'leak',
        'optimization', 'cache', 'bottleneck', 'timeout',
        'deadlock', 'latency', 'throughput', 'query'
    ],
    'code_quality': [
        'readability', 'maintainability', 'dry', 'duplication',
        'naming', 'complexity', 'refactor', 'style',
        'convention', 'format', 'lint', 'clean'
    ],
    'architecture': [
        'pattern', 'coupling', 'cohesion', 'solid',
        'design', 'principle', 'abstraction', 'layer',
        'module', 'component', 'dependency', 'circular'
    ],
    'test': [
        'coverage', 'edge case', 'test', 'mock',
        'unit', 'integration', 'e2e', 'pytest', 'assert'
    ],
    'github': [
        'ci/cd', 'github', 'action', 'workflow',
        'deploy', 'release', 'branch', 'merge', 'pr'
    ]
}

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
    # A07: Auth Failures
    'weak_authentication', 'session_fixation', 'credential_exposure',
    # A10: SSRF
    'ssrf', 'server_side_request_forgery',
    # その他
    'xss', 'cross_site_scripting', 'reflected_xss', 'stored_xss', 'dom_xss',
    'csrf', 'cross_site_request_forgery',
    'xxe', 'xml_external_entity', 'xml_bomb',
    'path_traversal', 'directory_traversal', 'local_file_inclusion',
    'race_condition',
]

PLAN_CATEGORY_PATTERNS = {
    "feasibility": [
        r"実現可能", r"feasib", r"技術的に", r"実装できない", r"不可能",
        r"現実的", r"実用的", r"viable", r"achievable",
    ],
    "completeness": [
        r"抜け", r"漏れ", r"不完全", r"エッジケース", r"edge case",
        r"考慮不足", r"未定義", r"未検討", r"incomplete", r"missing",
    ],
    "risk": [
        r"リスク", r"危険", r"問題", r"障害", r"失敗", r"破損",
        r"データ損失", r"data.?loss", r"risk", r"danger", r"critical",
    ],
    "architecture": [
        r"設計", r"アーキテクチャ", r"構造", r"パターン", r"結合",
        r"cohes", r"coupling", r"design", r"architect", r"structure",
    ],
    "scope": [
        r"YAGNI", r"過剰", r"不要", r"スコープ", r"範囲外",
        r"over.?engineer", r"unnecessary", r"scope", r"bloat",
    ],
    "dependencies": [
        r"依存", r"外部", r"ライブラリ", r"サービス", r"API",
        r"depend", r"external", r"library", r"integration",
    ],
}

CRITICAL_PLAN_PATTERNS = [
    r"data.?loss", r"データ損失", r"セキュリティ", r"security.?breach",
    r"破損", r"不可逆", r"irreversible", r"致命的", r"critical",
]


# ========================================
# Finding データ構造
# ========================================

class Finding:
    """レビューの指摘を表すクラス"""

    def __init__(self, file: str, line: int, category: str,
                 priority: str, description: str, reviewer: str,
                 detailed_comment: str = ""):
        self.file = file[:MAX_FILE_PATH_LENGTH]
        self.line = line
        self.category = category
        self.priority = priority
        self.description = description[:MAX_LINE_LENGTH]
        self.reviewer = reviewer
        self.detailed_comment = detailed_comment
        self.reviewers = [reviewer]
        self.reviewer_comments = {reviewer: detailed_comment}

    def to_dict(self) -> Dict:
        return {
            'file': self.file,
            'line': self.line,
            'category': self.category,
            'priority': self.priority,
            'description': self.description,
            'reviewers': self.reviewers,
            'reviewer_count': len(self.reviewers),
        }

    def key(self) -> Tuple:
        """重複排除用のキー"""
        return (self.file, self.line, self.category)


@dataclass
class PlanFinding:
    """プランレビュー用Finding（セクションベース）"""
    section: str
    description: str
    category: str
    priority: str
    ai_source: str
    suggestion: str = ""
    detail: str = ""
    # 既存コードとの互換性のために
    file: str = ""
    line: int = 0


# ========================================
# パース処理
# ========================================

def classify_category(text: str) -> str:
    """テキストからカテゴリを自動分類"""
    text_lower = text.lower()

    for category, keywords in CATEGORY_PATTERNS.items():
        for keyword in keywords:
            if keyword in text_lower:
                return category

    return 'code_quality'


def extract_priority(text: str) -> str:
    """テキストから優先度を抽出"""
    text_lower = text.lower()

    if any(marker in text_lower for marker in ['🔴', 'critical', '緊急']):
        return 'Critical'
    elif any(marker in text_lower for marker in ['🟡', '🟠', 'important', 'high', '重要']):
        return 'High'
    elif any(marker in text_lower for marker in ['🟢', 'medium', '中', 'suggestion']):
        return 'Medium'
    else:
        return 'Low'


def parse_reviewer_output(reviewer_name: str, output_text: str) -> List[Finding]:
    """レビュアーの出力をパース"""
    findings = []

    if not output_text or 'error' in output_text.lower():
        return findings

    matches = re.finditer(FILE_LINE_PATTERN, output_text)

    for match in matches:
        file_path = match.group(1)
        line_num = int(match.group(2))
        description = match.group(3)

        category = classify_category(description)
        priority = extract_priority(description)

        finding = Finding(
            file=file_path,
            line=line_num,
            category=category,
            priority=priority,
            description=description,
            reviewer=reviewer_name,
            detailed_comment=description
        )

        findings.append(finding)

    return findings


def classify_plan_category(description: str) -> str:
    """プランFindingのカテゴリを分類する"""
    desc_lower = description.lower()
    for category, patterns in PLAN_CATEGORY_PATTERNS.items():
        for pattern in patterns:
            if re.search(pattern, desc_lower, re.IGNORECASE):
                return category
    return "architecture"  # デフォルト


def escalate_plan_risk_priority(finding: PlanFinding) -> PlanFinding:
    """重大なリスクパターンを検出してpriorityをcriticalに昇格させる"""
    desc = f"{finding.description} {finding.detail}".lower()
    for pattern in CRITICAL_PLAN_PATTERNS:
        if re.search(pattern, desc, re.IGNORECASE):
            finding.priority = "critical"
            break
    return finding


def parse_plan_reviewer_output(output: str, ai_source: str) -> List[PlanFinding]:
    """
    プランレビュアーの出力をパースしてPlanFindingリストを返す。

    期待する出力フォーマット:
    #### [priority] [section] 説明
    - **Category**: ...
    - **Detail**: ...
    - **Suggestion**: ...
    """
    findings = []
    # セクション見出しパターン: #### [priority] [section] 説明
    heading_pattern = re.compile(
        r"####\s+\[?(critical|high|medium|low)\]?\s+\[?([^\]]+)\]?\s+(.+)",
        re.IGNORECASE,
    )

    lines = output.split("\n")
    i = 0
    while i < len(lines):
        m = heading_pattern.match(lines[i].strip())
        if m:
            priority = m.group(1).lower()
            section = m.group(2).strip()
            description = m.group(3).strip()

            category = ""
            detail = ""
            suggestion = ""

            # 次の行からメタデータを読む
            i += 1
            while i < len(lines) and not heading_pattern.match(lines[i].strip()):
                line = lines[i].strip()
                if line.startswith("- **Category**:"):
                    category = line.split(":", 1)[1].strip()
                elif line.startswith("- **Detail**:"):
                    detail = line.split(":", 1)[1].strip()
                elif line.startswith("- **Suggestion**:"):
                    suggestion = line.split(":", 1)[1].strip()
                i += 1

            if not category:
                category = classify_plan_category(description)

            finding = PlanFinding(
                section=section,
                description=description,
                category=category,
                priority=priority,
                ai_source=ai_source,
                suggestion=suggestion,
                detail=detail,
            )
            finding = escalate_plan_risk_priority(finding)
            findings.append(finding)
        else:
            i += 1

    return findings


def generate_plan_report(
    findings: List[PlanFinding],
    output_path: str,
    plan_file: str = "",
) -> None:
    """プランレビュー結果をMarkdownレポートとして出力する"""
    # 重複排除: {section}:{category} をキーとする
    seen: Dict[str, PlanFinding] = {}
    deduped: List[PlanFinding] = []
    for f in findings:
        key = f"{f.section}:{f.category}"
        if key not in seen:
            seen[key] = f
            deduped.append(f)
        else:
            # 優先度が高い方を残す
            priority_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
            if priority_order.get(f.priority, 3) < priority_order.get(seen[key].priority, 3):
                # 既存を入れ替え
                idx = deduped.index(seen[key])
                deduped[idx] = f
                seen[key] = f

    # 優先度でソート
    priority_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
    deduped.sort(key=lambda x: priority_order.get(x.priority, 3))

    counts: Dict[str, int] = defaultdict(int)
    for f in deduped:
        counts[f.priority] += 1

    lines = [
        "# プランレビュー統合レポート",
        "",
        f"**対象プラン**: {plan_file or '(不明)'}",
        f"**Total**: {len(deduped)}, "
        f"**Critical**: {counts['critical']}, "
        f"**High**: {counts['high']}, "
        f"**Medium**: {counts['medium']}, "
        f"**Low**: {counts['low']}",
        "",
        "---",
        "",
    ]

    category_sections = [
        ("feasibility", "実現可能性"),
        ("completeness", "完全性"),
        ("risk", "リスク"),
        ("architecture", "アーキテクチャ"),
        ("scope", "スコープ"),
        ("dependencies", "依存関係"),
    ]

    for cat_key, cat_label in category_sections:
        cat_findings = [f for f in deduped if f.category == cat_key]
        if not cat_findings:
            continue
        lines.append(f"## {cat_label}")
        lines.append("")
        for f in cat_findings:
            lines.append(f"#### [{f.priority.upper()}] [{f.section}] {f.description}")
            lines.append(f"- **Category**: {f.category}")
            if f.detail:
                lines.append(f"- **Detail**: {f.detail}")
            if f.suggestion:
                lines.append(f"- **Suggestion**: {f.suggestion}")
            lines.append(f"- **Source**: {f.ai_source}")
            lines.append("")

    with open(output_path, "w", encoding="utf-8") as fp:
        fp.write("\n".join(lines))


# ========================================
# 重複排除処理
# ========================================

def deduplicate_exact_match(all_findings: List[Finding]) -> List[Finding]:
    """完全一致による重複排除"""
    dedup_map = {}

    for finding in all_findings:
        key = finding.key()

        if key not in dedup_map:
            dedup_map[key] = finding
        else:
            # 既存のfindingにレビュアー情報を追加
            existing = dedup_map[key]
            if finding.reviewer not in existing.reviewers:
                existing.reviewers.append(finding.reviewer)
                existing.reviewer_comments[finding.reviewer] = finding.detailed_comment

    return list(dedup_map.values())


def deduplicate_fuzzy_match(exact_deduplicated: List[Finding]) -> List[Finding]:
    """Fuzzy Matchingによる重複排除（O(n)実装）"""
    # 空間索引の構築
    spatial_index = defaultdict(lambda: defaultdict(list))

    for finding in exact_deduplicated:
        key = (finding.file, finding.category)
        spatial_index[key][finding.line].append(finding)

    # 処理済みのfindingを追跡
    processed = set()
    merged = []

    for i, finding in enumerate(exact_deduplicated):
        if i in processed:
            continue

        file_path = finding.file
        line = finding.line
        category = finding.category
        key = (file_path, category)

        # ±2行以内のfindingを検索
        related = []
        related_indices = set()

        for offset in range(-2, 3):
            check_line = line + offset
            if check_line in spatial_index[key]:
                for idx, related_finding in enumerate(spatial_index[key][check_line]):
                    idx_in_main = exact_deduplicated.index(related_finding)
                    related.append(related_finding)
                    related_indices.add(idx_in_main)

        # Fuzzy Match結果を統合
        if len(related) > 1:
            merged_finding = related[0]
            for r in related[1:]:
                for reviewer in r.reviewers:
                    if reviewer not in merged_finding.reviewers:
                        merged_finding.reviewers.append(reviewer)
                        merged_finding.reviewer_comments[reviewer] = r.reviewer_comments[reviewer]

            merged.append(merged_finding)
            processed.update(related_indices)
        else:
            merged.append(finding)
            processed.add(i)

    return merged


# ========================================
# 優先度付け処理
# ========================================

def calculate_priority_from_count(reviewer_count: int) -> str:
    """レビュアー数から優先度を計算"""
    if reviewer_count >= 4:
        return 'Critical'
    elif reviewer_count >= 3:
        return 'High'
    elif reviewer_count >= 2:
        return 'Medium'
    else:
        return 'Low'


def escalate_security_priority(finding: Finding) -> Finding:
    """セキュリティ脆弱性の優先度を自動昇格"""
    if finding.category != 'security':
        return finding

    description_lower = finding.description.lower()

    for pattern in CRITICAL_SECURITY_PATTERNS:
        if pattern in description_lower:
            finding.priority = 'Critical'
            return finding

    # セキュリティ問題は最低でもHighに
    if finding.priority in ['Low', 'Medium']:
        finding.priority = 'High'

    return finding


def apply_priority_calculation(findings: List[Finding]) -> List[Finding]:
    """優先度を再計算"""
    for finding in findings:
        # レビュアー数から基本優先度を計算
        count_based_priority = calculate_priority_from_count(len(finding.reviewers))

        # セキュリティ脆弱性は昇格の対象
        finding.priority = count_based_priority
        finding = escalate_security_priority(finding)

    return findings


# ========================================
# レポート生成
# ========================================

def generate_report(findings: List[Finding], failed_reviewers: List[str] = None) -> str:
    """統合レポートを生成"""
    if failed_reviewers is None:
        failed_reviewers = []

    # カテゴリ別に分類
    by_priority = defaultdict(list)
    by_category = defaultdict(list)

    for finding in findings:
        by_priority[finding.priority].append(finding)
        by_category[finding.category].append(finding)

    # レポート生成
    report = []
    report.append("# 並列AIレビュー統合レポート\n")

    # サマリー
    report.append("## 📊 サマリー\n")
    total = len(findings)
    critical = len(by_priority.get('Critical', []))
    high = len(by_priority.get('High', []))
    medium = len(by_priority.get('Medium', []))
    low = len(by_priority.get('Low', []))

    report.append(f"- **検出問題総数**: {total}件\n")
    report.append(f"  - 🔴 Critical: {critical}件\n")
    report.append(f"  - 🟡 High: {high}件\n")
    report.append(f"  - 🟢 Medium: {medium}件\n")
    report.append(f"  - ℹ️ Low: {low}件\n")

    if failed_reviewers:
        report.append(f"\n⚠️ **失敗したレビュアー**: {', '.join(failed_reviewers)}\n")

    # 優先度別セクション
    for priority_level in ['Critical', 'High', 'Medium', 'Low']:
        if priority_level not in by_priority:
            continue

        priority_map = {'Critical': '🔴', 'High': '🟡', 'Medium': '🟢', 'Low': 'ℹ️'}
        report.append(f"\n## {priority_map[priority_level]} {priority_level}\n")

        for finding in by_priority[priority_level]:
            report.append(f"### [{finding.file}:{finding.line}] {finding.description}\n")
            report.append(f"**カテゴリ**: {finding.category}\n")
            report.append(f"**指摘したレビュアー**: {', '.join(finding.reviewers)} ({len(finding.reviewers)}/4)\n")
            report.append("")

    # カテゴリ別分析
    if by_category:
        report.append("\n## 📂 カテゴリ別分析\n")

        for category in sorted(by_category.keys()):
            count = len(by_category[category])
            report.append(f"### {category.replace('_', ' ').title()} ({count}件)\n")
            report.append("")

    # 統計情報
    report.append("\n## 統計情報\n\n")
    report.append(f"生成日時: {datetime.now().isoformat()}\n")

    return "".join(report)


# ========================================
# メイン処理
# ========================================

def main():
    parser = argparse.ArgumentParser(description='並列AIレビューの統合処理')
    parser.add_argument('--codex', help='Codexの出力ファイル')
    parser.add_argument('--coderabbit', help='CodeRabbitの出力ファイル')
    parser.add_argument('--copilot', help='Copilotの出力ファイル')
    parser.add_argument('--gemini', help='Geminiの出力ファイル')
    parser.add_argument('--output', help='出力ファイルパス', default='integrated-report.md')
    parser.add_argument(
        '--type',
        choices=['code', 'plan'],
        default='code',
        help='レビュータイプ: code (デフォルト) または plan',
    )
    parser.add_argument(
        '--plan-file',
        default='',
        help='レビュー対象プランファイルのパス（plan タイプ時のみ）',
    )

    args = parser.parse_args()

    ai_results = {
        'codex': args.codex,
        'coderabbit': args.coderabbit,
        'copilot': args.copilot,
        'gemini': args.gemini,
    }

    # 出力先ディレクトリを事前に作成
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    if args.type == 'plan':
        # プランレビューモード
        all_plan_findings: List[PlanFinding] = []
        for ai_name, result_file in ai_results.items():
            if result_file and os.path.exists(result_file):
                content = open(result_file, encoding='utf-8').read()
                findings = parse_plan_reviewer_output(content, ai_name)
                all_plan_findings.extend(findings)
        generate_plan_report(all_plan_findings, args.output, args.plan_file)
        print(f"統合プランレビューレポートを生成しました: {output_path}")
        print(f"検出された問題: {len(all_plan_findings)}件")
    else:
        # 既存のコードレビューモード
        all_findings = []
        failed_reviewers = []

        for reviewer_name, file_path in ai_results.items():
            if file_path and Path(file_path).exists():
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    findings = parse_reviewer_output(reviewer_name, content)
                    all_findings.extend(findings)
                except Exception as e:
                    print(f"Error reading {reviewer_name}: {e}")
                    failed_reviewers.append(reviewer_name)
            else:
                failed_reviewers.append(reviewer_name)

        # 重複排除処理
        exact_deduplicated = deduplicate_exact_match(all_findings)
        deduplicated = deduplicate_fuzzy_match(exact_deduplicated)

        # 優先度付け処理
        findings_with_priority = apply_priority_calculation(deduplicated)

        # レポート生成
        report = generate_report(findings_with_priority, failed_reviewers)

        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(report)

        print(f"統合レポートを生成しました: {output_path}")
        print(f"検出された問題: {len(findings_with_priority)}件")


if __name__ == '__main__':
    main()
