---
name: researching-creative-cases
description: アワードやトレンドから日本の最新クリエイティブ事例（Web、広告、プロダクト、LP、タイポグラフィ、展示会、デザインイベント等）を調査し、厳選されたMarkdownレポートを生成します。チームのインスピレーション、クライアント提案、デザイントレンド分析に活用できます。
---

<objective>
国内外の主要アワードサイト（Awwwards、Red Dot、D&AD、ADC、Cannes Lions等）や専門ギャラリー（SANKOU!、MUUUUU.ORG、TypographyGallery等）から、日本の最新クリエイティブ事例を自動調査・文書化します。対象分野：Webデザイン、広告キャンペーン、プロダクトデザイン、LP（ランディングページ）、タイポグラフィ、展示会、デザインイベント、マーケティング事例。受賞情報、制作会社、技術・手法、トレンド分析を含む構造化Markdownレポートを生成し、チームのインスピレーションやクライアント提案に活用できます。
</objective>

<quick_start>
**基本的な実行方法:**
```
/researching-creative-cases
```
直近2ヶ月から20件の事例を収集し、`creative-cases/YYYYMMDD-web-creative-cases-YYYYMM-YYYYMM.md`に保存します

**開始前に確認する項目:**
1. チーム構成（デザイナー中心、混合、エンジニア中心）
2. 事例の範囲（幅広い業界カバレッジ、または特定業界）
3. 対象分野（Web、広告、プロダクト、LP、タイポグラフィ、展示会、イベント、マーケティング等）
4. 目的（インスピレーション、クライアント提案、トレンド分析）

**スキルが自動的に実行すること:**
- 複数のアワードサイト（Awwwards、Red Dot、D&AD、ADC、Cannes Lions、Webグランプリ、JAGDA、Tokyo TDC）を横断してWebSearchを並列実行
- 専門ギャラリー・メディア（SANKOU!、MUUUUU.ORG、81-web.com、AXIS、Advertising TIMES、宣伝会議）やトレンド記事を検索
- URLを検証し、各事例の詳細情報（制作手法、技術、素材、コンセプト等）を抽出
- 目次、分野別カテゴリ内訳、トレンド分析を含むMarkdownファイルを生成
</quick_start>

<success_criteria>
**完全性:**
- 目標件数の事例を収集（デフォルト: 20件）
- 各事例に含まれる情報: URL/参照先、受賞情報、制作会社/クリエイター、技術・手法・素材、評価ポイント
- Markdownファイルに含まれる情報: 対象期間、分野別カテゴリ内訳、目次、トレンド分析（10以上のトレンド）、参考リンク

**品質:**
- 全URL/参照先が検証済みで機能している（またはアーカイブリンクを提供）
- 受賞日・開催日が正確
- 制作会社名/クリエイター名が正式な表記
- 技術・手法・素材が実際の制作内容と一致
- ファイル名形式: `YYYYMMDD-creative-cases-YYYYMM-YYYYMM.md`（分野指定時: `YYYYMMDD-[分野]-cases-YYYYMM-YYYYMM.md`）
- ファイルサイズ: 20件で500行以上
</success_criteria>

<workflow>
**1. 要件の収集**
AskUserQuestionを使用して確認: チームタイプ、事例範囲、対象分野（Web/広告/プロダクト/LP/タイポグラフィ/展示会/イベント/マーケティング）、目的、期間（デフォルト: 2ヶ月）、件数（デフォルト: 20件）

**2. 並列リサーチ**
対象分野に応じて同時にWebSearch クエリを実行:

**Webデザイン:**
- Awwwards Japan（SOTD、Developer Award、Honorable Mention）
- CSS Design Awards（WOTD、Special Kudos）
- CSS Winner、FWA、日本のWebグランプリ
- デザインギャラリー（SANKOU!、MUUUUU.ORG、81-web.com、S5-Style、URAGAWA）

**広告・マーケティング:**
- Cannes Lions、D&AD Awards、ADC Awards、ACC TOKYO CREATIVITY AWARDS
- 宣伝会議、Advertising TIMES、ブレーン（Brain）
- Marketing Native、AdverTimes

**プロダクト:**
- Red Dot Design Award、iF Design Award、Good Design Award
- AXIS、デザインのひきだし

**タイポグラフィ:**
- Tokyo TDC、JAGDA新人賞
- Typography Gallery、タイポグラフィ年鑑

**展示会・イベント:**
- デザインイベント情報、Tokyo Midtown DESIGN TOUCH
- 21_21 DESIGN SIGHT、GOOD DESIGN EXHIBITION

**トレンド記事:**
- 2025-2026年のデザイントレンド（各分野）

**3. 選定と詳細調査**
- 受賞作品・注目事例を優先
- 多様性を確保: カテゴリ、制作会社/クリエイター、技術・手法・素材
- 各URL/参照先をWebFetchで検証し詳細を抽出
- 制作会社/クリエイター情報と制作手法・技術を検索
- 分野に応じた専門情報（素材、印刷技術、展示手法等）を収集

**URL検証（必須）**
各事例について以下を実行：
a) WebFetchでURLにアクセス
b) 404/403/タイムアウト → 正しいURLを検索（会社名 + "公式サイト"）
c) 見つからない → 別の事例を探す
d) 非公開・パスワード保護 → 除外

**検証時の注意：**
- ドメインを推測しない（必ずWebSearchで確認）
- 制作会社URLも同様に検証
- リダイレクト先が正しいか確認

**4. ドキュメント生成**
以下を含むMarkdownを生成:
- ヘッダー（対象期間、作成日、カテゴリ内訳）
- アワード注釈付き目次
- 構造化された事例詳細（各事例の標準フォーマット）
- トレンド分析表
- 参考リンク
</workflow>

<advanced_features>
**自動トレンド抽出:**
事例からキーワードをグループ化してトレンドカテゴリに分類:
- 技術トレンド: WebGL/3D、生成AI、Reactフレームワーク、インタラクティブ技術
- デザイントレンド: レトロ/ノスタルジア、ミニマリズム、グラスモーフィズム、可変フォント、手書き要素
- 素材・手法トレンド: サステナブル素材、特殊印刷、デジタルファブリケーション
- コンテンツトレンド: 採用キャンペーン、周年記念、サステナビリティ、D2C、体験型展示

**自動カテゴリ分類:**
分野横断的な事例分類:
- **業種別**: 企業ブランディング、ファッション・ライフスタイル、BtoB、ホスピタリティ・観光、教育・文化、テック・実験的、プロダクト・EC、食品・消費財
- **分野別**: Webデザイン、広告キャンペーン、プロダクトデザイン、LP、タイポグラフィ、展示会、デザインイベント、マーケティング

**クライアント提案向けキュレーション:**
業界・分野でフィルタリング: `--industry fashion` `--field advertising` `--client-type corporate`

**継続的トラッキング:**
前回のファイルと比較して、新規事例、新たなトレンド、制作会社/クリエイターランキングを特定
</advanced_features>

<validation>
**URL検証:**
- 全てのサイトURLと参考リンクが機能している（WebFetchを使用）
- Markdownリンク構文が正しい

**URL検証の具体的手順:**
1. WebFetchで各URLにアクセス（全件必須）
2. HTTPステータス確認（200以外は要対応）
3. ドメインの正確性確認（思い込み禁止）
   - 例：`words.inc` ではなく `words-inc.co.jp` が正しいか検索で確認
4. リダイレクト先の確認（意図したページか）

**検証失敗時のフロー:**
1. まず正しいURLを検索（会社名 + "公式サイト" or "事例"）
2. Archive.org で過去のURLを確認
3. 見つからない場合は事例を除外し、代替事例を収集

**情報の正確性:**
- 受賞日が検索結果と一致
- 制作会社名が公式表記
- 技術スタックが実際の実装と一致することを検証

**ドキュメント構造:**
- 対象期間を明記
- カテゴリがバランスよく分布（1-2件のカテゴリを避ける）
- 分析表に最低10のトレンドを記載
- 目次から全事例へリンク
</validation>

<examples>
**例1: 標準実行（Web中心）**
```
/researching-creative-cases
```
出力: `20260122-creative-cases-2025-12-2026-01.md`（2025年12月〜2026年1月の20件）

**例2: 広告キャンペーン特化**
```
/researching-creative-cases --field advertising --period "直近3ヶ月" --count 15
```
出力: `20260122-advertising-cases-2025-11-2026-01.md`（直近3ヶ月の広告事例15件）

**例3: プロダクトデザイン特化**
```
/researching-creative-cases --field product --industry fashion --count 10
```
出力: ファッション業界のプロダクトデザイン10件

**例4: タイポグラフィ・LP混合**
```
/researching-creative-cases --field "typography,lp" --count 20
```
出力: タイポグラフィとLP事例の混合20件

**例5: 出力フォーマット**
```markdown
# 直近2ヶ月 日本クリエイティブ事例集（20選）

**対象期間**: 2025年12月 〜 2026年1月
**作成日**: 2026年1月22日

**分野別内訳**:
- Webデザイン: 8件
- 広告キャンペーン: 5件
- プロダクトデザイン: 3件
- LP: 2件
- タイポグラフィ: 2件

**業種別内訳**:
- 企業ブランディング・周年記念: 3件
- ファッション・ライフスタイル: 5件
- コーポレート・BtoB: 4件
...

## 📋 目次
### 🏆 アワード受賞作品
1. [KOKUYO - Curiosity is Life](https://example.com) - Awwwards SOTD（Webデザイン）
2. [BEAMS 50周年キャンペーン](https://example.com) - ACC TOKYO（広告）
3. [無印良品 折りたたみ傘](https://example.com) - Good Design Award（プロダクト）
...

## トレンド分析
| トレンド | 概要 | 分野 | 活用事例 |
|---------|------|------|---------|
| **3D + WebGL** | 没入型の3D体験 | Web | KOKUYO, Dynamic Infinity |
| **Retro Revival** | 昭和レトロ、手書き要素 | Web, 広告 | 丸亀製麺, BEAMS |
| **可変フォント** | レスポンシブタイポグラフィ | タイポ, Web | Sony Type, モリサワ |
| **サステナブル素材** | 環境配慮素材の活用 | プロダクト | 無印良品, Patagonia |
...
```
</examples>

<anti_patterns>
**避けるべきこと:**
- 対象期間外の古い事例を含める（最新性が重要）
- カテゴリが偏る（全て企業サイトまたはファッションサイト）
- 未検証のURL（リンク切れは信頼性を損なう）
- 制作会社名や技術スタックの不正確な記載
- 事例横断的なトレンド分析の欠如
- 1000行を超えるドキュメント（必要に応じてエグゼクティブサマリーを追加）
- アワードサイトへの参考リンク不足

**URL関連の禁止事項:**
- ドメインの推測・思い込み（必ず検索で確認）
- 検証せずにURLを記載
- 制作会社URLの省略や推測
- 非公開・アクセス不可サイトの掲載

**品質チェック:**
1. WebFetchで各URLを検証
2. 受賞日がソースと一致することを確認
3. 公式な会社名表記を使用
4. トレンド分析を客観的に保つ（"今流行"のような主観的な表現を避ける）
5. デザイナー向けのヒントを実用的にする（非現実的な理想論を避ける）
</anti_patterns>

<common_patterns>
**標準的な事例フォーマット:**
```markdown
## N. サイト名

| 項目 | 内容 |
|------|------|
| **サイトURL** | [https://example.com](https://example.com) |
| **受賞** | Awwwards SOTD（2025/12/14） |
| **制作** | [制作会社名](https://company.com) |
| **技術** | WebGL, Three.js, Next.js |
| **カテゴリ** | 企業ブランディング |

### 評価ポイント・新規性
[1-2文でコンセプトを概要説明]

**デザイン・技術的特徴:**
- インパクトのある特徴1
- 革新性のある特徴2
- 実装に関する注記を含む特徴3

### デザイナー向け注目点
- 実践可能なテクニック1
- 実践可能なテクニック2

### クライアント提案での活用
- 提案シナリオ1
- 提案シナリオ2
```

**トレンド分析表:**
```markdown
| トレンド | 概要 | 活用事例 |
|---------|------|---------|
| **3D + WebGL** | 没入型のリアルな体験 | 事例A、事例B |
| **生成AI** | AIによるパーソナライゼーション | 事例C |
```

**URL検証の例:**
```
# 悪い例（思い込み）
サイトURL: https://words.inc ← 推測で記載

# 良い例（検証済み）
1. WebSearch「WORDS Inc. 公式サイト」
2. 結果から https://words-inc.co.jp を発見
3. WebFetchで確認 → 200 OK
サイトURL: https://words-inc.co.jp ← 検証済み
```
</common_patterns>

<reference_guides>
**アワードサイト:**
- [Awwwards Japan](https://www.awwwards.com/websites/Japan/) - 国際的なウェブデザインアワード
- [CSS Design Awards](https://www.cssdesignawards.com/) - CSS/UI/UXに特化
- [CSS Winner](https://www.csswinner.com/) - CSS/ウェブデザインアワード
- [FWA](https://thefwa.com/) - クリエイティビティ重視のアワード
- [Red Dot Design Award](https://www.red-dot.org/) - 国際的な権威あるデザインアワード
- [Web Grand Prix](https://award.dmi.jaa.or.jp/) - 日本の全国的なアワード

**デザインギャラリー:**
- [SANKOU!](https://sankoudesign.com/) - 日本のウェブデザインギャラリー
- [MUUUUU.ORG](https://muuuuu.org/) - 縦長ウェブデザインに特化したギャラリー
- [81-web.com](https://81-web.com/) - 日本のウェブデザインリンク集
- [S5-Style](https://www.s5-style.com/) - デザインの優れたウェブサイト集
- [URAGAWA](https://mirai-works.co.jp/uragawa/) - ウェブデザインの参考コレクション

**検索クエリテンプレート:**
- Awwwards: `Awwwards Japan 2025 December site of the day`
- CSS Winner: `CSS Winner 2025 Japan`
- Red Dot: `Red Dot Design Award 2025 digital design Japan`
- 日本のアワード: `2025 Webグランプリ 受賞`
- トレンド: `日本 ウェブデザイン 2025年 トレンド`
- 制作会社: `mount inc. Garden Eight SHIFTBRAIN 2025 制作実績`

**注目制作会社リスト:**
詳細は [featured-companies.md](./featured-companies.md) を参照してください。
優先的に検索すべき制作会社16社（Garden Eight、SUPER CROWDS、MONOPO、mount inc.、MEFILAS、STUDIO DETAILS、HOMUNCULUS、Quoitworks、TANE-be、mont.、THREE Inc.、IN FOCUS、TryMore、NEWTOWN、Fivestar Interactive、ARUTEGA）の特徴、強み、活動分野をまとめています。
</reference_guides>
