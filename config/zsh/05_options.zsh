# 日本語ファイル名を表示可能にする
setopt print_eight_bit

# beep を無効にする
setopt no_beep

# 入力しているコマンド名が間違っている場合にもしかして：を出す
setopt correct

# 色を使う
setopt prompt_subst

# ^Dでログアウトしない
setopt ignore_eof

# ^Q/^Sのフローコントロールを無効にする
setopt no_flow_control

# バックグラウンドジョブが終了したらすぐに知らせる
setopt no_tify

# '#' 以降をコメントとして扱う
setopt interactive_comments

# ディレクトリ名だけでcdする
setopt auto_cd

# cd したら自動的にpushdする
setopt auto_pushd

# 重複したディレクトリを追加しない
setopt pushd_ignore_dups

# 補完候補リストを詰めて表示
setopt list_packed

# 補完候補にファイルの種類も表示する
setopt list_types

# カッコの対応などを自動的に補完する
setopt auto_param_keys

# = の後はパス名として補完する
setopt magic_equal_subst

# 補完候補が複数あるときに自動的に一覧表示する
setopt auto_menu

# 高機能なワイルドカード展開を使用する
setopt extended_glob

# --- 高度なzshオプション ---

# 補完機能の強化
setopt auto_list              # 曖昧な補完で自動的に選択肢を一覧表示
setopt complete_in_word       # 単語の途中でも補完可能
setopt always_to_end          # 補完時にカーソルを単語の末尾に移動
setopt glob_complete          # globパターンから補完候補を生成

# ディレクトリ操作の改善
setopt pushd_silent           # pushdとpopdでディレクトリスタックを表示しない
setopt pushd_to_home          # 引数なしのpushdで$HOMEに移動
setopt auto_name_dirs         # 絶対パスの変数を自動的にディレクトリ名として使用

# パス検索の改善
setopt path_dirs              # スラッシュを含むコマンド名でもパス検索を実行

# グロブとパターンマッチの改善
setopt numeric_glob_sort      # 数値を含むファイル名を数値順でソート
setopt glob_dots              # ドットファイルもグロブ対象に含める（明示的に指定時）

# ジョブ制御の改善
setopt long_list_jobs         # ジョブの詳細情報を表示
setopt check_jobs             # ログアウト時に実行中のジョブを確認

# コマンドライン編集の改善
setopt combining_chars        # 結合文字を正しく表示

# --- セキュリティ強化オプション ---
setopt no_clobber             # ファイル上書き防止
setopt rm_star_wait           # rm * の確認待機
setopt hist_ignore_space      # 機密コマンドの履歴除外
