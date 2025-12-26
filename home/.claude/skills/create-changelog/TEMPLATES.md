# チェンジログテンプレート集

このファイルは、様々な形式のチェンジログ・リリースノートテンプレートを提供します。

---

## 1. 標準リリースノート

```markdown
# Release Notes - v[X.Y.Z] ([YYYY-MM-DD])

## ハイライト

このリリースでは[主要な変更内容]を実装しました。[ユーザーへの主なメリット]が期待できます。

## 統計

- 新機能: X件
- 改善: X件
- バグ修正: X件
- コミット数: X
- コントリビューター: X名

---

## 新機能

### [機能名]

[1-2文の説明]

**使い方**:
```bash
# コマンド例
```

**関連PR**: #123

---

## 改善

### [改善内容]

[1-2文の説明]

**Before/After**:

- Before: [旧動作]
- After: [新動作]

---

## バグ修正

### [修正内容]

**問題**: [何が壊れていたか]
**影響**: [影響を受けていたユーザー]
**修正**: [どう修正したか]

---

## 破壊的変更

### [変更内容]

**変更点**: [何が変わったか]
**影響**: [影響を受けるコード/設定]
**移行ガイド**:

```diff
- 旧コード
+ 新コード
```

---

## 依存関係の更新

| パッケージ | 旧バージョン | 新バージョン |
|-----------|-------------|-------------|
| package-a | 1.0.0 | 2.0.0 |
| package-b | 3.1.0 | 3.2.0 |

---

## コントリビューター

このリリースに貢献いただいた方々:

- @contributor1
- @contributor2

---

## フルチェンジログ

[v1.0.0...v1.1.0](https://github.com/org/repo/compare/v1.0.0...v1.1.0)

```

---

## 2. Keep a Changelog 形式

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- 新機能の説明

### Changed
- 変更の説明

### Deprecated
- 非推奨になった機能

### Removed
- 削除された機能

### Fixed
- バグ修正の説明

### Security
- セキュリティ修正の説明

---

## [1.1.0] - 2024-01-15

### Added
- ユーザーダッシュボード機能を追加 (#123)
- APIレートリミット機能を追加 (#124)

### Changed
- ログイン画面のUIを改善 (#125)
- パフォーマンスを20%改善 (#126)

### Fixed
- ログアウト時のセッション残存バグを修正 (#127)
- 日本語表示の文字化けを修正 (#128)

---

## [1.0.0] - 2024-01-01

### Added
- 初回リリース
- ユーザー認証機能
- 基本的なCRUD操作

[Unreleased]: https://github.com/org/repo/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/org/repo/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/org/repo/releases/tag/v1.0.0
```

---

## 3. ユーザー向けリリースノート

```markdown
# 🎉 [プロダクト名] v[X.Y.Z] がリリースされました！

## 今回のアップデート

### ✨ 新しくできること

#### [機能名]
[ユーザー目線での説明。技術用語を避け、何ができるようになったかを明確に]

![スクリーンショット](./images/feature.png)

**使い方**:
1. [手順1]
2. [手順2]
3. [手順3]

---

### 🚀 改善されたこと

- **[改善1]**: [ユーザーへのメリット]
- **[改善2]**: [ユーザーへのメリット]

---

### 🐛 修正されたこと

- [修正1]: [どんな問題が解消されたか]
- [修正2]: [どんな問題が解消されたか]

---

### ⚠️ ご注意ください

[破壊的変更がある場合、ユーザーが取るべきアクションを明確に]

**移行手順**:
1. [手順1]
2. [手順2]

---

## アップデート方法

```bash
npm update [パッケージ名]
```

---

## フィードバック

ご意見・ご要望は[こちら](https://github.com/org/repo/issues)からお寄せください。

```

---

## 4. 開発者向け詳細チェンジログ

```markdown
# v[X.Y.Z] Technical Changelog

## Overview

- **Release Date**: YYYY-MM-DD
- **Commits**: X
- **Files Changed**: X
- **Insertions**: +X
- **Deletions**: -X

---

## Breaking Changes

### API Changes

#### `GET /api/users`

**Before**:
```json
{
  "users": [...]
}
```

**After**:

```json
{
  "data": [...],
  "meta": { "total": 100 }
}
```

**Migration**:

- Update response parsing to use `data` instead of `users`
- Handle new `meta` field for pagination

---

## New Features

### Feature: [機能名]

**Commits**:

- `abc1234` - feat: initial implementation
- `def5678` - feat: add error handling

**Files**:

- `src/features/new-feature/index.ts` (new)
- `src/features/new-feature/types.ts` (new)
- `src/routes/index.ts` (modified)

**API**:

```typescript
// 新しい関数のシグネチャ
function newFeature(options: Options): Result
```

---

## Performance Improvements

### Database Query Optimization

**Before**: Average query time 250ms
**After**: Average query time 50ms
**Improvement**: 80% faster

**Changes**:

- Added index on `users.email`
- Optimized JOIN query in `getUserWithProfile`

---

## Bug Fixes

### Fix: [バグの説明]

**Issue**: #123
**Root Cause**: [原因の技術的説明]
**Solution**: [解決策の技術的説明]

**Affected Files**:

- `src/services/auth.ts`

---

## Dependency Updates

| Package | From | To | Notes |
|---------|------|-----|-------|
| express | 4.18.0 | 4.19.0 | Security fix |
| prisma | 5.0.0 | 5.1.0 | New features |

---

## Database Migrations

### Migration: `20240115_add_user_preferences`

```sql
ALTER TABLE users ADD COLUMN preferences JSONB DEFAULT '{}';
CREATE INDEX idx_users_preferences ON users USING GIN (preferences);
```

**Rollback**:

```sql
DROP INDEX idx_users_preferences;
ALTER TABLE users DROP COLUMN preferences;
```

---

## Configuration Changes

### New Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `FEATURE_FLAG_X` | No | `false` | Enable feature X |

### Deprecated Environment Variables

| Variable | Replacement | Remove in |
|----------|-------------|-----------|
| `OLD_VAR` | `NEW_VAR` | v2.0.0 |

```

---

## コミット種別の絵文字

| 絵文字 | 種別 | 説明 |
|--------|------|------|
| 🎉 | feat | 新機能 |
| ✨ | improve | 改善 |
| 🐛 | fix | バグ修正 |
| ⚡ | perf | パフォーマンス |
| ♻️ | refactor | リファクタリング |
| 📝 | docs | ドキュメント |
| ✅ | test | テスト |
| 🔧 | chore | 雑務 |
| 🔒 | security | セキュリティ |
| ⚠️ | breaking | 破壊的変更 |
