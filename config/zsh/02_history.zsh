# 履歴を保存するファイルを指定
HISTFILE=~/.zsh_history

# メモリ上に保存される履歴の数
HISTSIZE=10000000

# HISTFILEで指定したファイルに保存される履歴の数
SAVEHIST=10000000

# 同じコマンドをヒストリに追加しない
setopt HIST_IGNORE_ALL_DUPS

# 端末間の履歴を共有
setopt SHARE_HISTORY


# 余分な空白は詰める
setopt HIST_REDUCE_BLANKS

# !を使ったヒストリ展開を行う
setopt bang_hist

# スペースから始まるコマンド行はヒストリに残さない
setopt HIST_IGNORE_SPACE

# glob展開のバグを修正
setopt nonomatch
