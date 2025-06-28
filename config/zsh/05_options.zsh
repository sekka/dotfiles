setopt print_eight_bit        # 日本語ファイル名を表示可能にする
setopt no_beep                # beep を無効にする
setopt correct                # 入力しているコマンド名が間違っている場合にもしかして：を出す
setopt prompt_subst           # 色を使う
setopt ignore_eof             # ^Dでログアウトしない
setopt no_flow_control        # ^Q/^Sのフローコントロールを無効にする
setopt no_tify                # バックグラウンドジョブが終了したらすぐに知らせる
setopt interactive_comments   # '#' 以降をコメントとして扱う
setopt auto_cd                # ディレクトリ名だけでcdする
setopt auto_pushd             # cd したら自動的にpushdする
setopt pushd_ignore_dups      # 重複したディレクトリを追加しない
setopt list_packed            # 補完候補リストを詰めて表示
setopt list_types             # 補完候補にファイルの種類も表示する
setopt auto_param_keys        # カッコの対応などを自動的に補完する
setopt magic_equal_subst      # = の後はパス名として補完する
setopt auto_menu              # 補完候補が複数あるときに自動的に一覧表示する
setopt extended_glob          # 高機能なワイルドカード展開を使用する

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
setopt nonomatch              # グロブパターンにマッチしない場合もエラーにしない

# ジョブ制御の改善
setopt long_list_jobs         # ジョブの詳細情報を表示
setopt check_jobs             # ログアウト時に実行中のジョブを確認

# コマンドライン編集の改善
setopt combining_chars        # 結合文字を正しく表示

# --- セキュリティ強化オプション ---
setopt no_clobber             # リダイレクト(>)での既存ファイル上書きを防止。上書きには>!または>|を使用
setopt rm_star_wait           # rm * 実行時に10秒間の確認待機。誤って全ファイル削除を防ぐ
setopt hist_ignore_space      # スペースで始まるコマンドを履歴に残さない。パスワード等の機密情報入力時に使用
setopt no_all_export          # 変数の自動エクスポートを防止
setopt no_global_export       # 関数の自動エクスポートを防止
setopt warn_create_global     # 関数内でグローバル変数作成時に警告
setopt pipe_fail              # パイプラインの右側のコマンドがエラーの場合、全体をエラーとする

# --- パフォーマンス強化オプション ---
setopt no_bg_nice             # バックグラウンドジョブの優先度を下げない
setopt no_hup                 # シェル終了時にジョブにHUPシグナルを送らない
setopt no_check_jobs          # シェル終了時にジョブの確認をスキップ（高速化）
