# 履歴を保存するファイルを指定（XDG準拠）
HISTFILE="${XDG_STATE_HOME:-$HOME/.local/state}/zsh/history"
# 履歴ディレクトリが存在しない場合は作成
[[ ! -d "${HISTFILE:h}" ]] && mkdir -p "${HISTFILE:h}"

# メモリ上に保存される履歴の数（最適化: 1000万 → 10万）
# 1000万件は過剰でメモリを圧迫し、履歴検索が遅くなる。
# 10万件は約3-6ヶ月分の履歴を保持でき、実用上十分な量。
# パフォーマンスと利便性のバランスを考慮した設定値。
HISTSIZE=100000

# HISTFILEで指定したファイルに保存される履歴の数（最適化: 1000万 → 10万）
# ディスク容量とファイル読み込み速度を考慮。
# 10万件で約10-20MBのファイルサイズとなり、起動時の読み込みも高速。
SAVEHIST=100000

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
setopt EXTENDED_HISTORY         # 実行時間とタイムスタンプを記録

# ヒストリ展開
setopt BANG_HIST                # !を使ったヒストリ展開を行う
