---
name: researching-creative-cases
description: アワードやトレンドから日本の最新クリエイティブ事例（Web、広告、プロダクト、MV・映像、LP、タイポグラフィ、パッケージ、空間、UI/UX、展示会等）を調査し、厳選されたMarkdownレポートを生成します。隣接分野の提案機能付き。チームのインスピレーション、クライアント提案、デザイントレンド分析に活用できます。
disable-model-invocation: false
---

<objective>
国内外の主要アワードサイト（Awwwards、Red Dot、D&AD、ADC、Cannes Lions、文化庁メディア芸術祭等）や専門ギャラリー（SANKOU!、MUUUUU.ORG、VIMEO Staff Picks等）から、日本の最新クリエイティブ事例を自動調査・文書化します。対象分野：Webデザイン、広告キャンペーン、プロダクトデザイン、MV・映像制作、LP、タイポグラフィ、パッケージ、空間デザイン、UI/UX、モーショングラフィックス、展示会、インスタレーション等。注目制作会社の実績を優先的にカバーし、ユーザーの興味に応じて隣接分野を提案します。受賞情報、制作会社/ディレクター、技術・手法、トレンド分析を含む構造化Markdownレポートを生成し、チームのインスピレーションやクライアント提案に活用できます。
</objective>

<quick_start>
**基本的な実行方法:**
```
/researching-creative-cases
```
直近2ヶ月から20件の事例を収集し、`creative-cases/YYYYMMDD-web-creative-cases-YYYYMM-YYYYMM.md`に保存します

**開始前に確認する項目:**
1. 対象分野（Web、広告、MV・映像、プロダクト、UI/UX、タイポグラフィ、パッケージ、空間、LP等）
2. 隣接分野も調査するか（推奨：選択分野に関連するジャンルを自動提案）
3. 対象期間（直近1週間〜6ヶ月）
4. 収集件数（10〜30件）
5. 目的（インスピレーション、クライアント提案、トレンド分析、競合調査）

**スキルが自動的に実行すること:**
- 複数のアワードサイト（Awwwards、Red Dot、D&AD、ADC、Cannes Lions、文化庁メディア芸術祭、MVA、Webグランプリ、JAGDA、Tokyo TDC、JPDA）を横断してWebSearchを並列実行
- 専門ギャラリー・メディア（SANKOU!、MUUUUU.ORG、VIMEO Staff Picks、AXIS、Advertising TIMES、宣伝会議、SpaceDesign）やトレンド記事を検索
- 注目制作会社（featured-companies.md記載の16社）の最新実績を優先的に検索
- ユーザーの選択分野に基づいて隣接分野を自動提案（例：Web選択時→MV・映像、UI/UX、モーショングラフィックスを提案）
- URLを検証し、各事例の詳細情報（制作手法、技術、素材、コンセプト、ディレクター等）を抽出
- 目次、分野別カテゴリ内訳、トレンド分析を含むMarkdownファイルを生成
</quick_start>

<success_criteria>
**完全性:**
- 目標件数の事例を収集（デフォルト: 20件）
- 各事例に含まれる情報: URL/参照先、受賞情報、制作会社/クリエイター/ディレクター、技術・手法・素材、評価ポイント
- 注目制作会社（featured-companies.md記載）の実績を複数件含む
- 隣接分野を有効にした場合、提案された関連ジャンルの事例も含む
- Markdownファイルに含まれる情報: 対象期間、分野別カテゴリ内訳、業種別内訳、注目制作会社の実績件数、目次、分野横断トレンド分析（10以上のトレンド）、隣接分野の発見セクション、参考リンク

**品質:**
- 全URL/参照先が検証済みで機能している（またはアーカイブリンクを提供）
- 受賞日・開催日が正確
- 制作会社名/クリエイター名/ディレクター名が正式な表記
- 技術・手法・素材が実際の制作内容と一致
- 分野固有の専門情報が適切に記載（MVなら尺・撮影手法、プロダクトなら素材、空間なら面積等）
- 隣接分野の関連性が論理的に説明されている
- ファイル名形式: `YYYYMMDD-creative-cases-YYYYMM-YYYYMM.md`（分野指定時: `YYYYMMDD-[分野]-cases-YYYYMM-YYYYMM.md`）
- ファイルサイズ: 20件で500行以上（隣接分野含む場合はより多い）
</success_criteria>

<workflow>
**1. 要件の収集**
AskUserQuestionを使用して以下を確認:

**質問1: 対象分野**
- 選択肢: 「Web中心（推奨）」「広告・マーケティング」「MV・映像制作」「プロダクトデザイン」「UI/UX・アプリ」「タイポグラフィ」「パッケージデザイン」「空間デザイン」「LP特化」「総合（複数分野）」
- multiSelect: true（複数選択可能）
- 説明: 注目制作会社の実績を優先的にカバーします

**質問2: 隣接分野も調査しますか？**
- 選択肢: 「はい（推奨）」「いいえ」
- multiSelect: false
- 説明: 選択した分野に関連する隣接ジャンルを自動提案します（例：Web選択時→MV、モーショングラフィックス、UI/UXを提案）

**質問3: 対象期間**
- 選択肢: 「直近1週間」「直近2週間」「直近1ヶ月」「直近2ヶ月（推奨）」「直近3ヶ月」「直近6ヶ月」
- multiSelect: false

**質問4: 収集件数**
- 選択肢: 「10件」「15件」「20件（推奨）」「30件」
- multiSelect: false

**質問5: 目的**
- 選択肢: 「チームインスピレーション（推奨）」「クライアント提案」「トレンド分析」「競合調査」
- multiSelect: true（複数選択可能）

**隣接分野の自動提案ロジック:**
- **Web選択時** → MV・映像、モーショングラフィックス、UI/UX、インタラクティブ作品
- **広告選択時** → MV・映像、グラフィック、パッケージ、空間デザイン（店舗什器等）
- **MV・映像選択時** → Web（特設サイト）、モーショングラフィックス、インスタレーション
- **プロダクト選択時** → パッケージ、グラフィック、空間デザイン
- **UI/UX選択時** → Web、モーショングラフィックス、プロダクト
- **タイポグラフィ選択時** → グラフィック、パッケージ、Web
- **パッケージ選択時** → プロダクト、グラフィック、タイポグラフィ
- **空間選択時** → インスタレーション、グラフィック、プロダクト

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

**MV・映像制作:**
- MVA（Music Video Awards）、文化庁メディア芸術祭
- VIMEO Staff Picks、VIMEO Awards
- Shots、The One Show
- 注目制作会社の映像実績（Garden Eight、mount inc.、IN FOCUS、TryMore、mont.等）

**プロダクト:**
- Red Dot Design Award、iF Design Award、Good Design Award
- AXIS、デザインのひきだし

**UI/UX・アプリ:**
- Awwwards（Mobile Excellence）、FWA（Mobile of the Day）
- App Design Inspiration、UI Movement
- Good Design Award（アプリ部門）

**タイポグラフィ:**
- Tokyo TDC、JAGDA新人賞
- Typography Gallery、タイポグラフィ年鑑

**パッケージデザイン:**
- JPDA（日本パッケージデザイン協会）、Pentawards
- デザインのひきだし、AXIS

**空間デザイン:**
- JCD（日本商環境デザイン協会）、DSA（日本空間デザイン協会）
- Space Design、商店建築

**モーショングラフィックス:**
- VIMEO Staff Picks（Motion Graphics）
- Motionographer、STASH

**展示会・イベント・インスタレーション:**
- 文化庁メディア芸術祭、アルスエレクトロニカ
- Tokyo Midtown DESIGN TOUCH、21_21 DESIGN SIGHT、GOOD DESIGN EXHIBITION

**注目制作会社の実績:**
- featured-companies.md記載の16社の最新実績を優先検索
- 各社公式サイトのWorks/実績ページ
- URAGAWAでの制作会社別実績

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
**注目制作会社の優先検索:**
featured-companies.md記載の16社の最新実績を優先的に検索・収集:
- 各社の公式サイトWorks/実績ページを巡回
- URAGAWA等のギャラリーサイトで制作会社別に検索
- 分野横断的に検索（Web、MV・映像、グラフィック等）
- レポート内に制作会社別の実績件数を明記

**隣接分野の自動提案:**
ユーザーの選択分野に基づいて関連ジャンルを提案:
- Web選択時 → MV・映像、モーショングラフィックス、UI/UX、インタラクティブ作品
- 広告選択時 → MV・映像、グラフィック、パッケージ、空間デザイン
- MV・映像選択時 → Web（特設サイト）、モーショングラフィックス、インスタレーション
- 同一制作会社が手がける隣接分野の作品を自動的に発見

**自動トレンド抽出:**
事例からキーワードをグループ化してトレンドカテゴリに分類:
- 技術トレンド: WebGL/3D、生成AI、Reactフレームワーク、インタラクティブ技術、リアルタイムレンダリング
- デザイントレンド: レトロ/ノスタルジア、ミニマリズム、グラスモーフィズム、可変フォント、手書き要素、Y2K
- 素材・手法トレンド: サステナブル素材、特殊印刷、デジタルファブリケーション、ミックスメディア
- コンテンツトレンド: 採用キャンペーン、周年記念、サステナビリティ、D2C、体験型展示、パーソナライゼーション
- 分野横断トレンド: Web×映像連携、フィジカル×デジタル融合

**自動カテゴリ分類:**
分野横断的な事例分類:
- **業種別**: 企業ブランディング、ファッション・ライフスタイル、エンタメ・音楽、BtoB、ホスピタリティ・観光、教育・文化、テック・実験的、プロダクト・EC、食品・消費財
- **分野別**: Webデザイン、広告キャンペーン、MV・映像制作、プロダクトデザイン、UI/UX、LP、タイポグラフィ、パッケージ、空間デザイン、モーショングラフィックス、展示会、インスタレーション

**クライアント提案向けキュレーション:**
業界・分野でフィルタリング: `--industry fashion` `--field advertising,mv` `--client-type corporate`

**継続的トラッキング:**
前回のファイルと比較して、新規事例、新たなトレンド、制作会社/クリエイター/ディレクターランキングを特定
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

**例5: MV・映像特化（注目制作会社優先）**
```
/researching-creative-cases --field "mv" --period "直近3ヶ月" --count 15
```
出力: `20260122-mv-cases-2025-11-2026-01.md`（Garden Eight、mount inc.、IN FOCUS等の映像実績を優先）

**例6: Web + 隣接分野提案**
```
/researching-creative-cases --field "web" --adjacent-fields true
```
→ 自動的にMV・映像、モーショングラフィックス、UI/UXも調査対象に含める

**例7: 総合（複数分野）**
```
/researching-creative-cases --field "web,advertising,mv,product" --count 30
```
出力: 4分野にまたがる総合事例30件

**例8: 出力フォーマット**
```markdown
# 直近2ヶ月 日本クリエイティブ事例集（25選）

**対象期間**: 2025年12月 〜 2026年1月
**作成日**: 2026年1月22日

**分野別内訳**:
- Webデザイン: 7件
- 広告キャンペーン: 5件
- MV・映像制作: 4件
- プロダクトデザイン: 3件
- UI/UX: 2件
- タイポグラフィ: 2件
- パッケージデザイン: 1件
- 空間デザイン: 1件

**業種別内訳**:
- 企業ブランディング・周年記念: 4件
- ファッション・ライフスタイル: 6件
- エンタメ・音楽: 5件
- コーポレート・BtoB: 4件
...

**注目制作会社の実績**:
- Garden Eight: 2件
- mount inc.: 2件（Web 1件、映像 1件）
- IN FOCUS: 1件
- SUPER CROWDS: 1件
...

## 📋 目次
### 🏆 アワード受賞作品
1. [KOKUYO - Curiosity is Life](https://example.com) - Awwwards SOTD（Web）
2. [BEAMS 50周年キャンペーン](https://example.com) - ACC TOKYO（広告）
3. [Ado - 唱](https://vimeo.com/xxx) - MVA 2025（MV・映像）[Garden Eight]
4. [無印良品 折りたたみ傘](https://example.com) - Good Design Award（プロダクト）
5. [Sony Music App](https://example.com) - Awwwards Mobile Excellence（UI/UX）
...

## 分野横断トレンド分析
| トレンド | 概要 | 主要分野 | 活用事例 |
|---------|------|---------|---------|
| **3D + WebGL** | 没入型の3D体験 | Web, MV | KOKUYO, 映像作品A |
| **Retro Revival** | 昭和レトロ、手書き要素 | Web, 広告, パッケージ | 丸亀製麺, BEAMS, 商品B |
| **可変フォント** | レスポンシブタイポグラフィ | タイポ, Web, UI | Sony Type, モリサワ |
| **生成AI活用** | AIによる映像生成・補助 | MV, 広告 | MV作品C, キャンペーンD |
| **サステナブル素材** | 環境配慮素材の活用 | プロダクト, パッケージ | 無印良品, Patagonia |
| **インタラクティブ体験** | 触れる・動かす体験設計 | Web, 空間, 展示 | サイトE, 店舗F |
...

## 隣接分野の発見
Webデザイン事例を調査する中で、以下の隣接分野の優れた事例も発見：
- **MV・映像**: 同一制作会社（Garden Eight、mount inc.等）が手がける映像作品
- **モーショングラフィックス**: Webサイトの動き→独立したMG作品
- **UI/UX**: Webの延長としてのアプリデザイン

→ これらの分野も合わせて調査することで、より包括的なインスピレーションを得られます
...
```
</examples>

<anti_patterns>
**避けるべきこと:**
- 対象期間外の古い事例を含める（最新性が重要）
- カテゴリや分野が偏る（全て企業Webサイトのみ、など）
- 注目制作会社の実績を調査しない（featured-companies.mdを活用すべき）
- 隣接分野の提案を無視する（同一制作会社の分野横断作品を見逃す）
- 未検証のURL/参照先（リンク切れは信頼性を損なう）
- 制作会社名/クリエイター名/ディレクター名や技術・手法の不正確な記載
- 事例横断的なトレンド分析の欠如
- 分野横断的な視点の欠如（Webだけ、MVだけ、など単一分野に閉じる）
- 分野固有の専門情報の欠如（MVなら尺・撮影手法、プロダクトなら素材、広告なら媒体など）
- 隣接分野の関連性を説明しない（なぜその分野も調査すべきか）
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
3. 公式な制作会社名/クリエイター名/ディレクター名表記を使用
4. 技術・手法・素材が実際の制作内容と一致することを確認
5. 注目制作会社（featured-companies.md）の実績を優先的に収集できているか確認
6. 隣接分野を有効にした場合、提案された分野の事例が含まれているか確認
7. 同一制作会社による分野横断的作品（例：Web + MV）を発見できているか確認
8. トレンド分析を客観的に保つ（"今流行"のような主観的な表現を避ける）
9. 分野横断的な視点を含める（単一分野に閉じない）
10. 分野別の専門性を確保（Webなら技術、MVなら尺・撮影手法、広告なら媒体、プロダクトなら素材等）
11. 隣接分野の関連性を論理的に説明（なぜその分野も調査すべきか）
12. デザイナー/クリエイター向けのヒントを実用的にする（非現実的な理想論を避ける）
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

**MV・映像制作:**
```markdown
## N. 作品名（アーティスト名 - 曲名）

| 項目 | 内容 |
|------|------|
| **参照先** | [VIMEO/YouTube URL](https://example.com) |
| **分野** | MV・映像制作 |
| **受賞** | MVA 2025、文化庁メディア芸術祭 |
| **アーティスト** | アーティスト名 |
| **制作会社** | [制作会社名](https://company.com) |
| **ディレクター** | ディレクター名 |
| **撮影** | 撮影監督名 |
| **編集** | 編集者名 |
| **手法** | 実写、CG、アニメーション、ミックス |
| **尺** | 3分45秒 |

### コンセプト・ストーリー
[1-2文でコンセプトやストーリーを説明]

**映像的特徴:**
- ビジュアル表現の工夫
- カメラワーク・編集技法
- VFX・CGの活用

**音楽との調和:**
- 曲との同期手法
- リズムとの連動

### 注目ポイント
- 技術的チャレンジ
- 独自の表現手法

### 提案での活用
- 応用可能なアイデア
```

**空間デザイン:**
```markdown
## N. プロジェクト名

| 項目 | 内容 |
|------|------|
| **参照先** | [プロジェクトURL](https://example.com) |
| **分野** | 空間デザイン |
| **受賞** | JCD Design Award 2025 |
| **クライアント** | ブランド名 |
| **空間デザイナー** | デザイナー/設計事務所名 |
| **用途** | 店舗、展示、オフィス、イベント |
| **面積** | ○○㎡ |
| **所在地** | 東京都○○区 |

### デザインコンセプト
[1-2文でコンセプトを説明]

**空間デザイン特徴:**
- 動線・レイアウトの工夫
- 素材・照明の選定
- ブランド体験の設計

### 注目ポイント
- 体験設計の工夫
- サステナビリティ配慮

### 提案での活用
- 応用可能な視点
```

**パッケージデザイン:**
```markdown
## N. 商品名

| 項目 | 内容 |
|------|------|
| **参照先** | [商品情報URL](https://example.com) |
| **分野** | パッケージデザイン |
| **受賞** | JPDA賞 2025 |
| **ブランド** | ブランド名 |
| **デザイナー** | デザイナー名 |
| **素材** | 紙、プラスチック、金属等 |
| **印刷技術** | オフセット、活版、箔押し等 |
| **商品カテゴリ** | 食品、化粧品、雑貨等 |

### デザインコンセプト
[1-2文でコンセプトを説明]

**デザイン特徴:**
- グラフィック表現
- 構造・形状の工夫
- 環境配慮

### 注目ポイント
- 棚映えの工夫
- 開封体験の設計

### 提案での活用
- 応用可能なアイデア
```

**トレンド分析表:**
```markdown
| トレンド | 概要 | 主要分野 | 活用事例 | 注目制作会社 |
|---------|------|---------|---------|-------------|
| **3D + WebGL** | 没入型のリアルな体験 | Web, MV | 事例A、事例B | Garden Eight |
| **生成AI** | AIによる映像・コンテンツ生成 | Web, 広告, MV | 事例C | mount inc. |
| **可変フォント** | レスポンシブタイポグラフィ | タイポ, Web, UI | 事例D | Quoitworks |
| **サステナブル素材** | 環境配慮素材の活用 | プロダクト, パッケージ | 事例E | - |
| **統合キャンペーン** | オンライン・オフライン融合 | 広告, 空間 | 事例F | SUPER CROWDS |
| **インタラクティブ体験** | 触れる・動かす体験設計 | Web, 空間, 展示 | 事例G | HOMUNCULUS |
| **Retro Revival** | 昭和レトロ、手書き要素 | Web, 広告, パッケージ | 事例H | TryMore |
| **フィジタル融合** | フィジカル×デジタル統合 | 空間, Web, インスタレーション | 事例I | IN FOCUS |
```

**隣接分野の発見パターン:**
```markdown
## 隣接分野の発見
Webデザイン事例を調査する中で、以下の隣接分野の優れた事例も発見：

### 同一制作会社による分野横断的作品
- **Garden Eight**: Webサイト（Awwwards SOTD） + MV制作（MVA受賞）
- **mount inc.**: キャンペーンサイト + ブランド映像
- **IN FOCUS**: コーポレートサイト + プロダクト映像

### 技術・手法の転用
- Webのモーショングラフィックス → 独立したMG作品
- UIアニメーション → MVの演出手法
- インタラクティブWeb → 体験型インスタレーション

### 推奨する隣接分野
次回調査時に含めることで、より包括的なインスピレーションを得られます：
- MV・映像制作（特にWeb制作会社が手がける映像作品）
- モーショングラフィックス
- UI/UXデザイン（Webの延長としてのアプリ）
```
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

**MV・映像:**
- [MVA（Music Video Awards）](https://www.mvajapan.com/) - 日本のMVアワード
- [文化庁メディア芸術祭](https://j-mediaarts.jp/) - アニメーション・映像部門
- [VIMEO Staff Picks](https://vimeo.com/channels/staffpicks) - VIMEO厳選作品
- [Shots](https://shots.net/) - 国際的な映像作品プラットフォーム

**パッケージデザイン:**
- [JPDA](https://www.jpda.or.jp/) - 日本パッケージデザイン協会
- [Pentawards](https://www.pentawards.com/) - 国際パッケージデザイン賞

**空間デザイン:**
- [JCD](https://www.jcd.or.jp/) - 日本商環境デザイン協会
- [DSA](https://www.dsa.or.jp/) - 日本空間デザイン協会

**UI/UX:**
- [App Design Inspiration](https://www.awwwards.com/websites/mobile-excellence/) - Awwwards Mobile
- [UI Movement](https://uimovement.com/) - UIアニメーション集

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

**映像・MV:**
- [VIMEO](https://vimeo.com/) - 高品質映像プラットフォーム
- [Motionographer](https://motionographer.com/) - モーショングラフィックス専門メディア
- [STASH](https://www.stashmedia.tv/) - デザイン・映像・VFX

**空間:**
- [Space Design](https://www.shotenkenchiku.com/space-design/) - 空間デザイン専門誌
- [商店建築](https://www.shotenkenchiku.com/) - 店舗・商業空間専門誌

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

**MV・映像:**
- MVA: `MVA 2025 受賞作品`
- VIMEO: `VIMEO Staff Picks Japan 2025`
- 文化庁: `文化庁メディア芸術祭 2025 アニメーション部門`

**パッケージ:**
- JPDA: `JPDA賞 2025 受賞作品`
- Pentawards: `Pentawards 2025 Japan`

**空間:**
- JCD: `JCD Design Award 2025`
- DSA: `DSA Design Award 2025`

**UI/UX:**
- App Design: `Awwwards Mobile Excellence 2025`
- Good Design: `グッドデザイン賞 2025 アプリ`

**トレンド:**
- 各分野: `日本 [分野名] デザイン 2025年 トレンド`

**制作会社/クリエイター:**
- `[制作会社名] 2025 制作実績`
- `[制作会社名] MV 映像 2025`
- `[ディレクター名] 2025 受賞`

**注目制作会社の実績検索:**
- Garden Eight: `Garden Eight 2025 作品`
- mount inc: `mount inc 2025 映像 MV`
- IN FOCUS: `IN FOCUS 2025 実績`
- TryMore: `TryMore 2025 映像制作`
- mont: `mont 2025 映像 ブランディング`

**注目制作会社リスト:**
詳細は [featured-companies.md](./featured-companies.md) を参照してください。
優先的に検索すべき制作会社16社（Garden Eight、SUPER CROWDS、MONOPO、mount inc.、MEFILAS、STUDIO DETAILS、HOMUNCULUS、Quoitworks、TANE-be、mont.、THREE Inc.、IN FOCUS、TryMore、NEWTOWN、Fivestar Interactive、ARUTEGA）の特徴、強み、活動分野をまとめています。
</reference_guides>
