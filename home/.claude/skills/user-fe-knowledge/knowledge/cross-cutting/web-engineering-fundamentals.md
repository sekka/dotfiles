---
title: Web Engineering Fundamentals（Web開発基礎80問）
category: cross-cutting
tags: [frontend, backend, infrastructure, security, fundamentals, Q&A]
browser_support: 概念的な内容のため該当なし
created: 2026-01-31
updated: 2026-01-31
---

# Web Engineering Fundamentals（Web開発基礎80問）

> 出典: https://zenn.dev/rio_dev/articles/c0da74ae28bdcd
> 執筆日: 2022-11-24
> 更新日: 2023-03-07
> 追加日: 2026-01-31

Web開発の基礎概念80問をQ&A形式で網羅。フロントエンド、バックエンド、インフラ、セキュリティ、設計原則を横断的にカバーする。

---

## フロントエンドエンジニアリング

### JavaScriptイベントループ

**Q**: JavaScriptのイベントループとは？

**A**: 非同期タスクを実行可能にする仕組み。コールスタック、タスクキュー、マイクロタスクキューを使って処理を管理。

**詳細**:
1. 同期コードを実行（コールスタック）
2. マイクロタスクキューを処理（Promise, queueMicrotask）
3. タスクキューを処理（setTimeout, setInterval）
4. レンダリング

### TypeScript

**Q**: TypeScriptが解決する課題は？

**A**:
- 型安全性の確保
- IDE統合（自動補完、リファクタリング）
- 大規模開発での保守性向上

### ブラウザレンダリングパイプライン

**Q**: ブラウザのレンダリングパイプラインは？

**A**: Loading → Scripting → Layout → Painting

**詳細**:
1. **Loading**: HTML/CSS/JSのダウンロード
2. **Scripting**: JavaScriptの実行、DOMツリー構築
3. **Layout**: 要素のサイズ・位置計算
4. **Painting**: ピクセルの描画

### Critical Rendering Path

**Q**: Critical Rendering Pathとは？

**A**: ブラウザが最初の画面を表示するまでの処理経路。最適化目標は1000ms以下。

**最適化手法**:
- CSSのインライン化
- JavaScriptの遅延読み込み（defer, async）
- リソースのプリロード

### RAILモデル

**Q**: パフォーマンスのRAILモデルとは？

**A**:
- **Response**: ユーザー入力への応答 < 100ms
- **Animation**: フレームレート 16ms/フレーム（60fps）
- **Idle**: アイドル時間の活用 < 50ms
- **Load**: 初回表示 < 1000ms

### Core Web Vitals

**Q**: Core Web Vitalsの3つの指標は？

**A**:
- **LCP (Largest Contentful Paint)**: 最大コンテンツの描画時間（2.5秒以下が良好）
- **FID (First Input Delay)**: 最初の入力遅延（100ms以下が良好）
- **CLS (Cumulative Layout Shift)**: レイアウトシフトの累積（0.1以下が良好）

### SPA vs SSR vs SSG

**Q**: SPA、SSR、SSGの違いは？

**A**:

| 方式 | レンダリング | 初期表示 | SEO | 用途 |
|------|-------------|---------|-----|------|
| **SPA** | クライアント | 遅い | 弱い | ダッシュボード、管理画面 |
| **SSR** | サーバー | 速い | 強い | Eコマース、ニュースサイト |
| **SSG** | ビルド時 | 最速 | 最強 | ブログ、ドキュメント |

### CORS

**Q**: CORSとは？

**A**: Cross-Origin Resource Sharing。異なるオリジン間のリソース共有を制御するセキュリティ機能。

**実装例**:

```javascript
// サーバー側（Node.js/Express）
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://example.com');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});
```

### Virtual DOM

**Q**: Virtual DOMのdiffingアルゴリズムとは？

**A**: 仮想DOMツリーの差分を検出し、最小限のDOM操作で更新を適用する仕組み。

**手順**:
1. 新しいVirtual DOMを生成
2. 旧Virtual DOMと比較（diffing）
3. 変更部分のみを実DOMに反映（reconciliation）

### コンポーネント指向フレームワーク

**Q**: React/Vue/Angularの主な違いは？

**A**:

| フレームワーク | 特徴 | 学習曲線 |
|--------------|------|---------|
| **React** | ライブラリ、柔軟 | 中 |
| **Vue** | プログレッシブ、段階的導入可能 | 低 |
| **Angular** | フルフレームワーク、TypeScript標準 | 高 |

### アクセシビリティ

**Q**: アクセシビリティの重要性は？

**A**:
- WCAG（Web Content Accessibility Guidelines）準拠
- セマンティックHTML使用
- キーボードナビゲーション対応
- スクリーンリーダー対応

---

## デザイン原則

### 4つのデザイン原則

**Q**: デザインの4原則とは？

**A**:
1. **Proximity（近接）**: 関連要素を近くに配置
2. **Alignment（整列）**: 要素を揃える
3. **Repetition（反復）**: 一貫性のあるデザイン
4. **Contrast（コントラスト）**: 重要要素を強調

### 視覚的階層

**Q**: 視覚的階層とは？

**A**: フォントサイズ、太さ、色で情報の優先度を表現する手法。

### Gutenberg Diagram

**Q**: Gutenberg Diagramとは？

**A**: 視線がZ字型（左上→右上→左下→右下）に動くという法則。レイアウト設計に活用。

### Atomic Design

**Q**: Atomic Designとは？

**A**: UIを以下の5段階で構成する設計手法:

1. **Atoms**: 最小単位（ボタン、入力欄）
2. **Molecules**: Atomsの組み合わせ（検索フォーム）
3. **Organisms**: MoleculesとAtomsの組み合わせ（ヘッダー）
4. **Templates**: ページの骨格
5. **Pages**: 実際のコンテンツ

---

## バックエンド＆データベース

### OOP

**Q**: OOPの3大原則は？

**A**:
- **Encapsulation（カプセル化）**: データと処理をまとめる
- **Inheritance（継承）**: クラスの再利用
- **Polymorphism（ポリモーフィズム）**: 同じインターフェースで異なる実装

### データベース正規化

**Q**: 第3正規形（3NF）とは？

**A**:
1. **第1正規形**: 各カラムが単一の値を持つ
2. **第2正規形**: 部分関数従属を排除
3. **第3正規形**: 推移的関数従属を排除

**効果**: データの冗長性削減、更新異常の防止

### ACID

**Q**: ACIDトランザクションとは？

**A**:
- **Atomicity（原子性）**: 全て成功or全て失敗
- **Consistency（一貫性）**: データの整合性維持
- **Isolation（独立性）**: 並行処理の分離
- **Durability（永続性）**: コミット後のデータ保証

### ロールバック

**Q**: ロールバックとは？

**A**: トランザクション失敗時に変更を元に戻す仕組み。

### デッドロック

**Q**: デッドロック防止策は？

**A**:
- ロック順序の統一
- タイムアウト設定
- デッドロック検出＆強制終了

### N+1問題

**Q**: N+1問題とは？

**A**: 1回のクエリで親データを取得後、N回のクエリで子データを取得する非効率な問題。

**解決策**: JOIN、Eager Loading

```sql
-- ❌ N+1問題
SELECT * FROM users;
-- N回のクエリ
SELECT * FROM posts WHERE user_id = 1;
SELECT * FROM posts WHERE user_id = 2;

-- ✅ 解決策
SELECT * FROM users
JOIN posts ON users.id = posts.user_id;
```

### インデックス

**Q**: データベースインデックスとは？

**A**: 検索速度を向上させるデータ構造。B-Treeが一般的。

**注意**: 書き込み速度は低下する。

### 二重検証

**Q**: バリデーションはどこで行うべき？

**A**: フロントエンド＋バックエンドの二重検証が必須。

**理由**: フロントエンドは改ざん可能。

### APIバージョニング

**Q**: APIバージョニングが必要な理由は？

**A**: 後方互換性を保ちながら新機能を追加するため。

**手法**:
- URLパス: `/api/v1/users`
- ヘッダー: `Accept: application/vnd.api+json; version=1`

---

## インフラ＆ネットワーク

### OSI 7階層モデル

**Q**: HTTPはOSI第何層？

**A**: 第7層（アプリケーション層）

| 層 | 名称 | プロトコル例 |
|----|------|-------------|
| 7 | アプリケーション | HTTP, HTTPS |
| 4 | トランスポート | TCP, UDP |
| 3 | ネットワーク | IP |

### Docker vs VM

**Q**: DockerとVMの違いは？

**A**:

| 項目 | Docker | VM |
|------|--------|-----|
| **OS** | ホストOSを共有 | ゲストOS独立 |
| **起動速度** | 数秒 | 数分 |
| **リソース** | 軽量 | 重い |

### Kubernetes

**Q**: Kubernetesとは？

**A**: コンテナオーケストレーションツール。複数のDockerコンテナを管理。

**機能**: 自動スケーリング、ロードバランシング、自己修復

### Cookie vs Session vs Cache

**Q**: Cookie、Session、Cacheの違いは？

**A**:

| 項目 | 保存場所 | 用途 |
|------|---------|------|
| **Cookie** | クライアント | 認証トークン、設定 |
| **Session** | サーバー | ユーザー状態管理 |
| **Cache** | 両方 | パフォーマンス向上 |

### HTTPS

**Q**: HTTPSの暗号化仕組みは？

**A**: SSL/TLS による暗号化通信。

**手順**:
1. クライアントがサーバーの公開鍵を取得
2. 共通鍵を生成し、公開鍵で暗号化して送信
3. 以降、共通鍵で通信

### DMZ

**Q**: DMZ（非武装地帯）とは？

**A**: 外部ネットワークと内部ネットワークの間に設置する緩衝地帯。Webサーバーなどを配置。

### Proxy vs Reverse Proxy vs CDN

**Q**: Proxy、Reverse Proxy、CDNの違いは？

**A**:

| 項目 | 配置 | 用途 |
|------|------|------|
| **Proxy** | クライアント側 | 匿名化、フィルタリング |
| **Reverse Proxy** | サーバー側 | ロードバランシング、キャッシュ |
| **CDN** | 地理的分散 | 静的コンテンツ配信 |

### BFF (Backend for Frontend)

**Q**: BFFパターンとは？

**A**: フロントエンド専用のバックエンドAPI層を設ける設計。

**メリット**: フロントエンド要件に最適化、マイクロサービス間の集約

### マイクロサービス

**Q**: マイクロサービスのメリットは？

**A**:
- 独立したデプロイ
- 技術スタックの柔軟性
- スケーラビリティ

**デメリット**: 複雑性、運用コスト増

### Infrastructure as Code

**Q**: Infrastructure as Codeとは？

**A**: インフラ構成をコードで管理する手法。

**ツール**: Terraform, CloudFormation, Ansible

---

## セキュリティ

### CIAトライアド

**Q**: セキュリティのCIAトライアドとは？

**A**:
- **Confidentiality（機密性）**: 権限者のみアクセス
- **Integrity（完全性）**: データ改ざん防止
- **Availability（可用性）**: サービス継続性

### SQLインジェクション

**Q**: SQLインジェクション対策は？

**A**:
- プリペアドステートメント
- WAF（Web Application Firewall）

**例**:

```javascript
// ❌ 危険
const query = `SELECT * FROM users WHERE id = ${userId}`;

// ✅ 安全
const query = 'SELECT * FROM users WHERE id = ?';
db.query(query, [userId]);
```

### XSS (Cross-Site Scripting)

**Q**: XSS対策は？

**A**:
- 入力値のサニタイゼーション
- HTTPヘッダー（Content-Security-Policy）
- WAF

### CSRF (Cross-Site Request Forgery)

**Q**: CSRF対策は？

**A**: CSRFトークンの使用

```html
<form method="POST">
  <input type="hidden" name="csrf_token" value="ランダムトークン" />
  <!-- フォーム内容 -->
</form>
```

### パスワードセキュリティ

**Q**: パスワード保存のベストプラクティスは？

**A**:
- **ハッシュ化**: bcrypt、Argon2
- **ソルト**: ユーザーごとにランダム値追加
- **ストレッチング**: ハッシュ処理を複数回実行

### DDoS攻撃

**Q**: DDoS攻撃対策は？

**A**:
- IDS/IPS（侵入検知/防御システム）
- レート制限
- CDN（分散配信）

### セッションハイジャッキング

**Q**: セッションハイジャッキング対策は？

**A**:
- HTTPS通信
- セッションID再生成
- セッションタイムアウト

### VPN

**Q**: VPNとは？

**A**: Virtual Private Network。インターネット上に仮想の専用線を構築する技術。

### BASIC認証

**Q**: BASIC認証の仕組みは？

**A**: ユーザー名:パスワードをBase64エンコードしてHTTPヘッダーで送信。

**注意**: 平文に近いため、HTTPS必須。

---

## テスト＆方法論

### テストピラミッド vs テスティングトロフィー

**Q**: テストピラミッドとテスティングトロフィーの違いは？

**A**:

**テストピラミッド**:
- 下層: ユニットテスト（多）
- 中層: 統合テスト（中）
- 上層: E2Eテスト（少）

**テスティングトロフィー**:
- 中心: 統合テスト（多）
- 下層: ユニットテスト（中）
- 上層: E2Eテスト（少）
- 基盤: 静的解析

### システムテスト

**Q**: システムテストの種類は？

**A**:
- **回帰テスト**: 既存機能の検証
- **セキュリティテスト**: 脆弱性検証
- **ユーザビリティテスト**: UX検証
- **負荷テスト**: パフォーマンス検証

### Git merge vs rebase

**Q**: Git mergeとrebaseの違いは？

**A**:

| 項目 | merge | rebase |
|------|-------|--------|
| **履歴** | 分岐が残る | 一直線になる |
| **用途** | 本番ブランチへの統合 | ローカルブランチの整理 |

### Git-flow

**Q**: Git-flowのブランチ戦略は？

**A**:
- **main**: 本番リリース
- **develop**: 開発統合
- **feature**: 機能開発
- **release**: リリース準備
- **hotfix**: 緊急修正

### CI/CD

**Q**: CI/CDとは？

**A**:
- **CI (Continuous Integration)**: 自動ビルド＆テスト
- **CD (Continuous Deployment)**: 自動デプロイ

### 環境階層

**Q**: dev → test → staging → productionの役割は？

**A**:
- **dev**: 開発環境
- **test**: テスト環境
- **staging**: 本番同等の検証環境
- **production**: 本番環境

### DRY, KISS, YAGNI

**Q**: DRY、KISS、YAGNIとは？

**A**:
- **DRY (Don't Repeat Yourself)**: 重複コードを避ける
- **KISS (Keep It Simple, Stupid)**: シンプルに保つ
- **YAGNI (You Aren't Gonna Need It)**: 必要になるまで実装しない

### 結合度 vs 凝集度

**Q**: 結合度と凝集度の理想は？

**A**:
- **結合度**: 低い（疎結合）が良い
- **凝集度**: 高い（高凝集）が良い

### Big O 記法

**Q**: Big O記法とは？

**A**: アルゴリズムの計算量を表記する手法。

| 記法 | 性能 | 例 |
|------|------|-----|
| **O(1)** | 定数時間 | 配列の直接アクセス |
| **O(log n)** | 対数時間 | 二分探索 |
| **O(n)** | 線形時間 | ループ1回 |
| **O(n²)** | 二乗時間 | ネストループ |

---

## AWSクラウドサービス

### IAM

**Q**: IAMとは？

**A**: Identity and Access Management。認証・認可を管理。

### S3 + CloudFront

**Q**: S3とCloudFrontで静的サイトホスティングする方法は？

**A**:
1. S3バケットに静的ファイルをアップロード
2. CloudFrontディストリビューションを作成
3. S3をオリジンに設定
4. CloudFrontのURLで配信

### Lambda vs Fargate

**Q**: LambdaとFargateの使い分けは？

**A**:

| 項目 | Lambda | Fargate |
|------|--------|---------|
| **実行時間** | 最大15分 | 無制限 |
| **用途** | イベント駆動、短時間処理 | 長時間処理、コンテナアプリ |

---

## 注意事項

**執筆者の補足**:
- テストの深掘りは限定的
- GraphQLは言及のみ
- モバイル特化の考慮は未含

---

## 参考リンク

- [元記事: Zenn](https://zenn.dev/rio_dev/articles/c0da74ae28bdcd)
- [WCAG 2.1](https://www.w3.org/TR/WCAG21/)
- [Core Web Vitals](https://web.dev/vitals/)
- [Git-flow](https://nvie.com/posts/a-successful-git-branching-model/)
