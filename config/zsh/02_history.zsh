# 履歴を保存するファイルを指定
HISTFILE=~/.zsh_history

# メモリ上に保存される履歴の数
HISTSIZE=10000000

# HISTFILEで指定したファイルに保存される履歴の数
SAVEHIST=10000000

# 履歴の重複除去とパフォーマンス最適化
setopt HIST_IGNORE_ALL_DUPS     # 同じコマンドをヒストリに追加しない
setopt HIST_EXPIRE_DUPS_FIRST   # 履歴がサイズ上限に達したら重複から削除
setopt HIST_FIND_NO_DUPS        # 履歴検索中に重複を表示しない
setopt HIST_SAVE_NO_DUPS        # 重複したコマンドを保存しない

# 履歴の共有と動作設定
setopt SHARE_HISTORY            # 端末間の履歴を共有
setopt INC_APPEND_HISTORY       # コマンド実行時に即座に履歴ファイルに追加
setopt HIST_VERIFY              # 履歴展開時に一度編集状態にする

# 履歴の品質向上
setopt HIST_REDUCE_BLANKS       # 余分な空白は詰める
setopt HIST_IGNORE_SPACE        # スペースから始まるコマンド行はヒストリに残さない
setopt EXTENDED_HISTORY         # 実行時間とタイムスタンプを記録

# ヒストリ展開
setopt BANG_HIST                # !を使ったヒストリ展開を行う

# glob展開のバグを修正
setopt nonomatch
