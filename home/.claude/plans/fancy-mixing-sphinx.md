# command-validator シンプル化計画

## 概要

既存の複雑な command-validator（17ファイル、4段階パイプライン）を、単一 TypeScript ファイル + テストファイルに再構築する。

## 現状 → 新設計

```
【既存】17ファイル                    【新規】2ファイル
command-validator/                    scripts/development/
├── src/                              ├── validate-command.ts      (~250行)
│   ├── cli.ts                        └── validate-command.test.ts (~150行)
│   ├── lib/
│   │   ├── types.ts
│   │   ├── security-rules.ts
│   │   ├── validator.ts
│   │   └── core/ (4ファイル)
│   └── __tests__/
├── package.json
├── vitest.config.ts
└── biome.json
```

## 実装内容

### 1. validate-command.ts の構造

```typescript
#!/usr/bin/env bun

// 型定義
interface HookInput { tool_name: string; tool_input: { command?: string }; }
interface ValidationResult { isValid: boolean; severity: string; violations: string[]; }
interface HookOutput { hookSpecificOutput: { ... }; }

// セキュリティルール（定数）
const CRITICAL_COMMANDS = ["del", "format", "mkfs", "shred", "dd", "fdisk", "parted"];
const PRIVILEGE_COMMANDS = ["sudo", "su", "passwd", "chmod", "chown"];
const NETWORK_COMMANDS = ["nc", "netcat", "nmap", "telnet", "iptables"];
const SYSTEM_COMMANDS = ["systemctl", "service", "kill", "killall", "mount"];
const SAFE_COMMANDS = ["ls", "git", "npm", "bun", "node", "python", "cat", "grep", ...];
const DANGEROUS_PATTERNS: RegExp[] = [...]; // 主要30パターン
const PROTECTED_PATHS = ["/etc/", "/usr/", "/sbin/", ...];

// バリデーション関数
export function validateCommand(command: string): ValidationResult { ... }

// CLI エントリポイント
async function main() { ... }
```

### 2. validate-command.test.ts の構造

```typescript
import { describe, expect, test } from "bun:test";
import { validateCommand } from "./validate-command";

describe("validateCommand", () => {
  describe("安全なコマンド", () => { /* ls, git, npm, docker ps, etc. */ });
  describe("危険なコマンド", () => { /* rm -rf /, sudo, nc, curl|bash, etc. */ });
  describe("エッジケース", () => { /* 空、長すぎ、バイナリ */ });
});
```

## 削除対象

`scripts/development/command-validator/` ディレクトリ全体（17ファイル）

## 設定変更

**home/.claude/settings.json**
```diff
- "command": "bun $HOME/dotfiles/scripts/development/command-validator/src/cli.ts"
+ "command": "bun $HOME/dotfiles/scripts/development/validate-command.ts"
```

## 実装手順

1. `validate-command.ts` を作成（既存ルールを移植）
2. `validate-command.test.ts` を作成（bun:test）
3. `bun test scripts/development/validate-command.test.ts` でテスト実行
4. `home/.claude/settings.json` のパス更新
5. 動作確認
6. `rm -rf scripts/development/command-validator/` で旧実装削除

## 検証方法

```bash
# テスト実行
bun test scripts/development/validate-command.test.ts

# 手動動作確認（Claude Code で Bash コマンド実行）
# - 安全: ls, git status, npm install
# - 危険: rm -rf /, sudo, curl|bash
```

## 削減効果

| 項目 | 既存 | 新規 |
|------|------|------|
| ファイル数 | 17 | 2 |
| 依存関係 | vitest, biome | なし |
| コード行数 | ~800行 | ~400行 |
