# cdしたあとで、自動的に pwd と lsa する
function chpwd() { pwd; lsa }

# echo $PATHの結果を整形
# https://takuya-1st.hatenablog.jp/entry/2017/02/14/191855
function path_show() { echo -e ${PATH//:/'\n'} }
