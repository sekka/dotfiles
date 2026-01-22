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
AskUserQuestionを使用して以下を確認:

**質問1: 対象分野**
- 選択肢: 「Web中心（推奨）」「広告・マーケティング」「プロダクトデザイン」「タイポグラフィ」「LP特化」「総合（複数分野）」
- multiSelect: true（複数選択可能）

**質問2: 対象期間**
- 選択肢: 「直近1週間」「直近2週間」「直近1ヶ月」「直近2ヶ月（推奨）」「直近3ヶ月」「直近6ヶ月」
- multiSelect: false

**質問3: 収集件数**
- 選択肢: 「10件」「15件」「20件（推奨）」「30件」
- multiSelect: false

**質問4: 目的**
- 選択肢: 「チームインスピレーション（推奨）」「クライアント提案」「トレンド分析」「競合調査」
- multiSelect: true（複数選択可能）

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

**URL/参照先検証（必須）**
各事例について以下を実行：
a) WebFetchでURL/参照先にアクセス
b) 404/403/タイムアウト → 正しいURL/記事を検索（ブランド名/プロジェクト名 + "受賞" or "事例"）
c) 見つからない → Archive.orgで確認、またはメディア記事を探す
d) 非公開・パスワード保護 → 代替の参照先（メディア記事、受賞リリース等）を検索
e) 参照先がない → 別の事例を探す

**検証時の注意：**
- ドメインを推測しない（必ずWebSearchで確認）
- 制作会社/クリエイターのURLも同様に検証
- リダイレクト先が正しいか確認
- 広告・プロダクト等でWebサイトがない場合は、メディア記事やアワードサイトの受賞ページを参照先とする

**4. ドキュメント生成**
以下を含むMarkdownを生成:
- ヘッダー（対象期間、作成日、分野別内訳、業種別内訳）
- アワード・分野注釈付き目次
- 構造化された事例詳細（分野に応じた標準フォーマット）
- 分野横断的トレンド分析表
- 参考リンク（アワードサイト、専門メディア、ギャラリー）
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
**URL/参照先検証:**
- 全てのURL/参照先と参考リンクが機能している（WebFetchを使用）
- Webサイトがない場合はメディア記事やアワードページを参照先とする
- Markdownリンク構文が正しい

**URL/参照先検証の具体的手順:**
1. WebFetchで各URL/参照先にアクセス（全件必須）
2. HTTPステータス確認（200以外は要対応）
3. ドメイン/URLの正確性確認（思い込み禁止）
   - 例：`words.inc` ではなく `words-inc.co.jp` が正しいか検索で確認
4. リダイレクト先の確認（意図したページか）
5. 広告・プロダクト等でWebサイトがない場合
   - メディア記事（宣伝会議、Advertising TIMES等）を検索
   - アワードサイトの受賞ページを参照
   - ブランドのプレスリリースを確認

**検証失敗時のフロー:**
1. まず正しいURLを検索（プロジェクト名 + "公式サイト" or "受賞" or "事例"）
2. メディア記事を検索（プロジェクト名 + "宣伝会議" or "Advertising TIMES"）
3. Archive.org で過去のURLを確認
4. 見つからない場合は事例を除外し、代替事例を収集

**情報の正確性:**
- 受賞日が検索結果と一致
- 制作会社名が公式表記
- 技術スタックが実際の実装と一致することを検証

**ドキュメント構造:**
- 対象期間を明記
- 分野別・業種別カテゴリがバランスよく分布（1-2件のカテゴリを避ける）
- 分析表に最低10のトレンドを記載（分野横断的な視点を含む）
- 目次から全事例へリンク
- 各分野固有の情報が適切に記載されている
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
- カテゴリや分野が偏る（全て企業Webサイトのみ、など）
- 未検証のURL/参照先（リンク切れは信頼性を損なう）
- 制作会社名/クリエイター名や技術・手法の不正確な記載
- 事例横断的なトレンド分析の欠如
- 分野固有の専門情報の欠如（プロダクトなら素材、広告なら媒体など）
- 1000行を超えるドキュメント（必要に応じてエグゼクティブサマリーを追加）
- アワードサイトや専門メディアへの参考リンク不足

**URL関連の禁止事項:**
- ドメインの推測・思い込み（必ず検索で確認）
- 検証せずにURLを記載
- 制作会社URLの省略や推測
- 非公開・アクセス不可サイトの掲載

**品質チェック:**
1. WebFetchで各URL/参照先を検証（アーカイブリンクも検討）
2. 受賞日・開催日がソースと一致することを確認
3. 公式な制作会社名/クリエイター名表記を使用
4. 技術・手法・素材が実際の制作内容と一致することを確認
5. トレンド分析を客観的に保つ（"今流行"のような主観的な表現を避ける）
6. 分野別の専門性を確保（Webなら技術、広告なら媒体、プロダクトなら素材等）
7. デザイナー/クリエイター向けのヒントを実用的にする（非現実的な理想論を避ける）
</anti_patterns>

<common_patterns>
**標準的な事例フォーマット:**

**Webデザイン:**
```markdown
## N. サイト名

| 項目 | 内容 |
|------|------|
| **URL** | [https://example.com](https://example.com) |
| **分野** | Webデザイン |
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

**広告・マーケティング:**
```markdown
## N. キャンペーン名

| 項目 | 内容 |
|------|------|
| **参照先** | [記事URL](https://example.com) |
| **分野** | 広告キャンペーン |
| **受賞** | ACC TOKYO CREATIVITY AWARDS（2025） |
| **クライアント** | ブランド名 |
| **制作** | [広告代理店・制作会社](https://company.com) |
| **媒体** | TV, Web, OOH, SNS |
| **カテゴリ** | ファッション・ライフスタイル |

### キャンペーン概要
[1-2文でキャンペーンコンセプトを説明]

**クリエイティブ特徴:**
- コミュニケーション戦略
- 統合キャンペーン施策
- 効果・反響

### 注目ポイント
- クリエイティブアプローチ
- メディア活用の工夫

### 提案での活用
- 応用可能なシナリオ
```

**プロダクトデザイン:**
```markdown
## N. プロダクト名

| 項目 | 内容 |
|------|------|
| **参照先** | [製品情報URL](https://example.com) |
| **分野** | プロダクトデザイン |
| **受賞** | Good Design Award 2025 |
| **ブランド** | ブランド名 |
| **デザイナー** | デザイナー名 |
| **素材** | アルミニウム、再生プラスチック |
| **カテゴリ** | 日用品 |

### デザインコンセプト
[1-2文でコンセプトを説明]

**デザイン特徴:**
- 機能性の工夫
- 素材選定の理由
- ユーザビリティ

### 注目ポイント
- イノベーション要素
- サステナビリティ配慮

### 提案での活用
- 応用可能な視点
```

**タイポグラフィ:**
```markdown
## N. 作品名/プロジェクト名

| 項目 | 内容 |
|------|------|
| **参照先** | [作品URL](https://example.com) |
| **分野** | タイポグラフィ |
| **受賞** | Tokyo TDC賞 2025 |
| **クライアント** | ブランド名（または自主制作） |
| **書体デザイナー** | デザイナー名 |
| **書体** | オリジナル書体 or 既存書体名 |
| **用途** | ブランディング、パッケージ、Web |

### デザインコンセプト
[1-2文でコンセプトを説明]

**タイポグラフィ特徴:**
- 文字デザインの工夫
- 可読性・視認性への配慮
- コンテクストとの調和

### 注目ポイント
- 書体選定の理由
- 組版の工夫

### 提案での活用
- 応用可能な手法
```

**トレンド分析表:**
```markdown
| トレンド | 概要 | 分野 | 活用事例 |
|---------|------|------|---------|
| **3D + WebGL** | 没入型のリアルな体験 | Web | 事例A、事例B |
| **生成AI** | AIによるパーソナライゼーション | Web, 広告 | 事例C |
| **可変フォント** | レスポンシブタイポグラフィ | タイポ, Web | 事例D |
| **サステナブル素材** | 環境配慮素材の活用 | プロダクト | 事例E |
| **統合キャンペーン** | オンライン・オフライン融合 | 広告 | 事例F |
```

**URL/参照先検証の例:**

**例1: Webサイトの検証**
```
# 悪い例（思い込み）
サイトURL: https://words.inc ← 推測で記載

# 良い例（検証済み）
1. WebSearch「WORDS Inc. 公式サイト」
2. 結果から https://words-inc.co.jp を発見
3. WebFetchで確認 → 200 OK
サイトURL: https://words-inc.co.jp ← 検証済み
```

**例2: 広告キャンペーン（Webサイトなし）の検証**
```
# 悪い例（参照先なし）
参照先: なし ← キャンペーンサイトがないため記載せず

# 良い例（メディア記事を参照）
1. WebSearch「BEAMS 50周年キャンペーン 2025 宣伝会議」
2. 宣伝会議の記事を発見
3. WebFetchで確認 → 200 OK
参照先: https://www.sendenkaigi.com/... ← メディア記事を参照先として検証済み

または
1. WebSearch「BEAMS 50周年 ACC TOKYO 受賞」
2. ACC TOKYOの受賞ページを発見
参照先: https://www.acc-awards.com/... ← アワードページを参照先として検証済み
```

**例3: プロダクトデザインの検証**
```
# 良い例（製品情報ページ）
1. WebSearch「無印良品 折りたたみ傘 Good Design Award」
2. 製品ページとGood Design Awardページを発見
3. 両方をWebFetchで確認
参照先: https://www.muji.com/... (製品ページ)、https://www.g-mark.org/... (受賞ページ) ← 複数参照先
```
```
</common_patterns>

<reference_guides>
**アワードサイト:**

**Webデザイン:**
- [Awwwards Japan](https://www.awwwards.com/websites/Japan/) - 国際的なウェブデザインアワード
- [CSS Design Awards](https://www.cssdesignawards.com/) - CSS/UI/UXに特化
- [CSS Winner](https://www.csswinner.com/) - CSS/ウェブデザインアワード
- [FWA](https://thefwa.com/) - クリエイティビティ重視のアワード
- [Web Grand Prix](https://award.dmi.jaa.or.jp/) - 日本の全国的なアワード

**広告・マーケティング:**
- [Cannes Lions](https://www.canneslions.com/) - 世界最大級の広告祭
- [D&AD Awards](https://www.dandad.org/) - 英国の権威ある広告賞
- [ADC Awards](https://www.oneclub.org/) - ニューヨークADC
- [ACC TOKYO CREATIVITY AWARDS](https://www.acc-awards.com/) - 日本のクリエイティブアワード
- [宣伝会議賞](https://www.sendenkaigi.com/) - 日本の広告賞

**プロダクトデザイン:**
- [Red Dot Design Award](https://www.red-dot.org/) - 国際的な権威あるデザインアワード
- [iF Design Award](https://ifdesign.com/) - ドイツの国際デザイン賞
- [Good Design Award](https://www.g-mark.org/) - 日本のグッドデザイン賞

**タイポグラフィ:**
- [Tokyo TDC](https://www.tdctokyo.org/) - 東京タイプディレクターズクラブ
- [JAGDA](https://www.jagda.or.jp/) - 日本グラフィックデザイン協会

**デザインギャラリー・メディア:**

**Web:**
- [SANKOU!](https://sankoudesign.com/) - 日本のウェブデザインギャラリー
- [MUUUUU.ORG](https://muuuuu.org/) - 縦長ウェブデザインに特化したギャラリー
- [81-web.com](https://81-web.com/) - 日本のウェブデザインリンク集
- [S5-Style](https://www.s5-style.com/) - デザインの優れたウェブサイト集
- [URAGAWA](https://mirai-works.co.jp/uragawa/) - ウェブデザインの参考コレクション

**総合デザイン:**
- [AXIS](https://www.axisinc.co.jp/) - デザイン専門誌
- [デザインのひきだし](https://www.amazon.co.jp/gp/bookseries/B00CL6YPLC) - グラフィック・プロダクトデザイン

**広告・マーケティング:**
- [Advertising TIMES](https://www.sendenkaigi.com/books/advertisingtimes/) - 広告業界誌
- [ブレーン（Brain）](https://www.sendenkaigi.com/books/brain/) - クリエイティブ専門誌
- [Marketing Native](https://marketingnative.jp/) - マーケティングメディア
- [AdverTimes](https://www.advertimes.com/) - 広告業界ニュース

**イベント・展示:**
- [21_21 DESIGN SIGHT](https://www.2121designsight.jp/) - 東京ミッドタウンのデザイン施設
- [GOOD DESIGN EXHIBITION](https://www.g-mark.org/exhibition/) - グッドデザイン賞受賞展
- [Tokyo Midtown DESIGN TOUCH](https://www.tokyo-midtown.com/jp/designtouch/) - デザインイベント

**検索クエリテンプレート:**

**Web:**
- Awwwards: `Awwwards Japan 2025 December site of the day`
- 日本のアワード: `2025 Webグランプリ 受賞`

**広告:**
- Cannes Lions: `Cannes Lions 2025 Japan Grand Prix`
- ACC: `ACC TOKYO CREATIVITY AWARDS 2025 受賞作品`
- 宣伝会議賞: `宣伝会議賞 2025 グランプリ`

**プロダクト:**
- Good Design: `グッドデザイン賞 2025 ベスト100`
- Red Dot: `Red Dot Design Award 2025 Japan winner`

**タイポグラフィ:**
- Tokyo TDC: `Tokyo TDC 2025 グランプリ`
- JAGDA: `JAGDA新人賞 2025`

**トレンド:**
- 各分野: `日本 [分野名] デザイン 2025年 トレンド`

**制作会社/クリエイター:**
- `[制作会社名] 2025 制作実績`
- `[クリエイター名] 2025 受賞`

**注目制作会社リスト:**
詳細は [featured-companies.md](./featured-companies.md) を参照してください。
優先的に検索すべき制作会社16社（Garden Eight、SUPER CROWDS、MONOPO、mount inc.、MEFILAS、STUDIO DETAILS、HOMUNCULUS、Quoitworks、TANE-be、mont.、THREE Inc.、IN FOCUS、TryMore、NEWTOWN、Fivestar Interactive、ARUTEGA）の特徴、強み、活動分野をまとめています。
</reference_guides>
