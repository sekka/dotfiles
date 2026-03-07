# 調査: getfresh.dev - Fresh ターミナルベース IDE・テキストエディタ

## 調査対象

https://getfresh.dev/

## 概要

**Fresh** (getfresh.dev) は次世代のオープンソース ターミナルベース コードエディタ兼 IDE です。Vim/Emacs のようなターミナルエディタのパワーと、VS Code のような現代的な GUI エディタの使いやすさを組み合わせています。

> ⚠️ **注意**: Deno の Web フレームワーク「Fresh (fresh.deno.dev)」とは別のプロジェクトです。

- GitHub: https://github.com/sinelaw/fresh

## 主な機能

- **LSP 対応**: コード補完、定義ジャンプ、インラインエラー診断
- **プラグイン**: TypeScript で書いたプラグインで拡張可能
- **モダン UX**: Ctrl+S、Ctrl+F などの馴染みのあるキーバインド、マウスサポート、メニュー、コマンドパレット
- **高パフォーマンス**: 即時起動、数ギガバイトのファイルも効率的に処理
- **マルチカーソル編集**: ブロック選択、マクロ
- **分割ビュー**: 複数ファイルの同時表示
- **Git 統合**: ファイルエクスプローラーに Git 統合
- **セッション永続化**: デタッチ/リアタッチ機能

## メリット

- **設定不要で使える**: Vim/Emacs と異なり初期設定なしですぐに使える
- **クロスプラットフォーム**: Linux、macOS、Windows 対応
- **多様なインストール方法**: Homebrew、npm、cargo（Rust）、ビルド済みバイナリ
- **IDE 水準の機能**: ターミナルにいながら IDE の機能が使える
- **学習コストが低い**: 一般的なキーバインドを使用

## デメリット・注意点

- **ターミナルエディタ**: GUI エディタ（VS Code など）に慣れている場合、利点が薄い
- **比較的新しい**: 成熟度が VS Code や Neovim と比べると低い可能性
- **プラグインエコシステム**: Neovim や VS Code ほどプラグインが豊富ではない可能性

## インストール方法

```bash
# Homebrew
brew install sinelaw/fresh/fresh

# npm
npm install -g fresh-term

# Cargo
cargo install fresh-term
```

## 判断のポイント

ターミナルで多くの時間を過ごし、IDE 水準の機能を求めながら Vim/Emacs の設定に時間を使いたくない場合に最適。dotfiles でのエディタ設定として検討できる。VS Code をメインにしているなら導入メリットは薄いかもしれない。
