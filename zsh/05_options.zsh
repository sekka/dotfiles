# 日本語ファイル名を表示可能にする
setopt print_eight_bit

# beep を無効にする
setopt no_beep

# 入力しているコマンド名が間違っている場合にもしかして：を出す。
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

# 同時に起動したzshの間でヒストリを共有する
setopt share_history

# 同じコマンドをヒストリに残さない
setopt hist_ignore_all_dups

# ヒストリファイルに保存するとき、すでに重複したコマンドがあったら古い方を削除する
setopt hist_save_nodups

# スペースから始まるコマンド行はヒストリに残さない
setopt hist_ignore_space

# ヒストリに保存するときに余分なスペースを削除する
setopt hist_reduce_blanks

# 補完候補が複数あるときに自動的に一覧表示する
setopt auto_menu

# 高機能なワイルドカード展開を使用する
setopt extended_glob
