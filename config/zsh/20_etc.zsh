# cdしたあとで、自動的に pwd と条件付きでlsa実行（最適化版）
function chpwd() { 
    pwd
    # ファイル数が50未満の場合のみlsaを実行（パフォーマンス最適化）
    local file_count=$(ls -1A 2>/dev/null | wc -l)
    if [[ $file_count -lt 50 ]]; then
        lsa
    else
        # 大きなディレクトリでは基本的なlsのみ
        ls
    fi
}

# echo $PATHの結果を整形
# https://takuya-1st.hatenablog.jp/entry/2017/02/14/191855
function path_show() { echo -e ${PATH//:/'\n'} }
