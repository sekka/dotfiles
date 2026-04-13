# Web セキュリティ基礎 — XSS / CSRF / SQL インジェクション対策

> Source: https://qiita.com/murasaki1994/items/81fabafaaa1fc0e8fade
> Added: 2026-04-13

Flask/Python の実装例付きの三大脆弱性と対策。

## XSS (Cross-Site Scripting)

ユーザー入力をそのまま HTML に出力することで悪意ある JS が実行される。

**対策**: 出力時にエスケープ
```python
import html
safe_output = html.escape(user_input)
```

## SQL インジェクション

フォーム入力に SQL 構文を混入させ DB を操作される。

**対策**: プレースホルダー（パラメータ化クエリ）
```python
# NG
cursor.execute(f"SELECT * FROM users WHERE name = '{name}'")
# OK
cursor.execute("SELECT * FROM users WHERE name = ?", (name,))
```

## CSRF (Cross-Site Request Forgery)

外部サイトから意図しないリクエストを送信させる。

**対策**: ランダムトークンをセッションで検証
```python
import secrets
session['csrf_token'] = secrets.token_hex()
if request.form['csrf_token'] != session['csrf_token']:
    abort(403)
```

## その他

- アクセスログに IP・メール・URI・メソッド・タイムスタンプを記録（不正検知用）
- 「悪いことをしたら必ずバレる」環境を整えることが抑止力になる
