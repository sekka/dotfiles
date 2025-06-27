# --------------------------------------
# Core Configuration - Basic settings and custom functions
# --------------------------------------
# Note: Locale settings are centralized in .zprofile

# ディレクトリ変更時自動実行
function chpwd() { 
    pwd
    local file_count=$(ls -1A 2>/dev/null | wc -l)
    if [[ $file_count -lt 50 ]]; then
        lsa
    else
        ls
    fi
}

# PATH表示関数
function path_show() { echo -e ${PATH//:/'\n'} }