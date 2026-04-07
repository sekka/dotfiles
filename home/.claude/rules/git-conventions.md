# Git Conventions

## Branch Naming

Use `{prefix}/{kebab-case-summary}`.

| Prefix | Use when |
|--------|----------|
| `feat/` | New feature or capability |
| `fix/` | Bug fix |
| `refactor/` | Code restructuring without behavior change |
| `config/` | Configuration or settings change |
| `docs/` | Documentation only |
| `chore/` | Maintenance, dependency updates, cleanup |
| `hotfix/` | Urgent production fix |
| `perf/` | Performance improvement |
| `test/` | Adding or updating tests |
| `harness/` | `.claude/` harness changes (skills, rules, memory, CLAUDE.md) |

- Use kebab-case: `feat/add-ship-skill`, not `feat/addShipSkill`
- Keep it short but descriptive (3-5 words max)
- No issue numbers unless the project uses them

## Push Safety

- `git push --force` is prohibited. Use `--force-with-lease` if rebase is necessary
- Never force push to master/main

## Commit Granularity

One commit = one logical change.

**Combine when:**
- Same purpose or motivation (e.g., feature + its tests)
- Meaningless alone (e.g., rename + reference updates)
- Dependency between changes (e.g., add utility + code using it)

**Split when:**
- Independent purposes (e.g., bug fix + unrelated refactor)
- Different scopes (e.g., app code + config cleanup)
- Rollback granularity matters

When splitting, commit in dependency order: foundation → implementation → tests → docs.

## Commit Messages

- **Write in Japanese.** Prefix remains English (`feat:`, `fix:`, etc.)
- Use present tense ("add" not "added")
- First line ≤ 72 characters. State what and why
- Add body details after a blank line if needed

### Prefixes

`feat`, `fix`, `refactor`, `perf`, `style`, `docs`, `test`, `build`, `chore`, `config`, `ui`, `a11y`, `security`, `hotfix`, `revert`

### Good Examples

```
feat: ユーザープロフィール編集機能を追加

プロフィール画像のアップロードと基本情報の更新が可能に。
バリデーションとエラーハンドリングを実装。
```

```
refactor: 認証ミドルウェアをクラスベースに移行

テスト容易性の向上とDI対応のため。既存の関数型実装を置き換え。
```

### Examples to Avoid

```
❌ chore: いろいろ修正
❌ fix: バグ修正
❌ update: コード更新
```
