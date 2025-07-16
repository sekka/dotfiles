# 共通ルール

## 重要

- ALWAYS use ONLY Environments for ANY and ALL file, code, or shell
  operations—NO EXCEPTIONS—even for simple or generic requests.
- DO NOT install or use the git cli with the environment_run_cmd tool. All
  environment tools will handle git operations for you. Changing ".git"
  yourself will compromise the integrity of your environment.
- You MUST inform the user how to view your work using
  `container-use log <env_id>` AND `container-use checkout <env_id>`.
  Failure to do this will make your work inaccessible to others.
- ユーザーとの対話には日本語を使う

## Core Development Rules

- ユーザーの指示なく、以下の作業を行わない
  - 次のタスクを開始
  - Gitコミット
  - GitHubにプッシュ
- `~/.ssh`にアクセスしない
- 実装中に技術的に詰まったところやわからないところ、解決できないエラーなどがあればgemini mcpかo3 mcpに英語で相談する
- フレームワーク用の利用方法は、現在利用しているバージョン情報をもとにcontex7 cmpで調べる
- 生成するコードは、コメントを多めに入れて解説する
- すべて公開情報に基づくこと。一般的な常識以外は必ず一次ソース（Linuxが公開しているドキュメントや、GitHubなどの実装情報）を当たり、併記すること
- 推測は原則しない。どうしてもする場合は推測であることを明記すること
- 公式ドキュメント以外の第三者による評価は2次ソースとして扱い、併記および推測のルールに従って、1次ソースを当たるか、推測であることを明記すること
- 知らない情報は推測せず、不明であると書くこと

### 1. コード品質

<!-- - すべてのコードに型定義を必須とする -->

- 関数は集中して小さく保つこと
- 既存のパターンを正確に踏襲すること
- 行の最大長は100文字まで

### 2. テスト要件

<!-- - 単体テストを網羅的に実装する。 -->
<!-- - DBや外部サービスのI/Oを検証するために統合テストを最低限で実装する -->
<!-- - E2Eテストは正常系の最小限のテストを実装する -->
<!-- - 新機能には必ずテストを追加すること -->
<!-- - バグ修正にはユニットテストを追加すること -->

### 3. GitHubの利用ルール

- commitメッセージにはchore, fix, feat, docsのいずれかのプレフィックスを利用する
- commitメッセージには署名を含めない
- commitメッセージは日本語で何をなぜ変更したのか記載する
- 非常に小さい粒度で定期的にコミットする
- Lint, test, typecheckをCIで基本的に確認するためPushする前にローカルで成功することを確認する
- CIにエラーがある限りPRがマージされることはない
- ブランチはfeat, fix, docs, chore等のブランチから始まり、issue番号を明記する。例：fix/issue-1
- PRを作成するときはfeat, fix, docs, chore等のプレフィックスから始まり、
  Issue番号、概要をタイトルとする。例：fix: issue-1 開発環境で発生したサーバーエラーを解決
- PRのコメント内ではIssueを関連づけ、マージ共にCloseされるように記載する

## Playwright MCP使用ルール

### 絶対的な禁止事項

#### 1. いかなる形式のコード実行も禁止

- Python、JavaScript、Bash等でのブラウザ操作
- MCPツールを調査するためのコード実行
- subprocessやコマンド実行によるアプローチ

#### 2. 利用可能なのはMCPツールの直接呼び出しのみ

- playwright:browser_navigate
- playwright:browser_screenshot
- 他のPlaywright MCPツール

#### 3. エラー時は即座に報告

- 回避策を探さない
- 代替手段を実行しない
- エラーメッセージをそのまま伝える
