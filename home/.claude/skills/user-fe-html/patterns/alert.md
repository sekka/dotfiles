# アラート / ライブリージョン (Alert / Live Region)

## 必要なARIA属性
- アラート（緊急）: `role="alert"` または `aria-live="assertive"`
- ステータス（非緊急）: `role="status"` または `aria-live="polite"`
- `aria-atomic`: リージョン全体を読み上げるか

## 最小実装例

### アラート（エラー通知）
```html
<!-- コンテナはDOMに事前配置し、中身を動的に更新 -->
<div role="alert">
  <strong>エラー:</strong> メールアドレスの形式が正しくありません。
</div>
```

### ステータス（保存確認）
```html
<div role="status" aria-live="polite" aria-atomic="true">
  変更を保存しました。
</div>
```

### ログ（チャットメッセージ）
```html
<div role="log" aria-live="polite" aria-label="チャットメッセージ">
  <div>ユーザーA: こんにちは</div>
  <div>ユーザーB: お疲れ様です</div>
</div>
```

## 重要な実装ルール
1. ライブリージョンのコンテナはページロード時にDOMに存在させる
2. コンテンツを動的に挿入/更新して通知をトリガーする
3. `role="alert"`と`aria-live`を同時に指定しない

## よくある間違い
- コンテナとコンテンツを同時にDOMに挿入（通知が発火しない）
- 非緊急の更新に`assertive`を使用（ユーザーの作業を中断する）
- `aria-atomic`未指定で部分的な読み上げになる
- ライブリージョンが多すぎてノイズになる
