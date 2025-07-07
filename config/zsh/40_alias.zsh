# ファイル操作系エイリアス
alias l="eza"
alias lsa="eza --long --all --binary --bytes --group --header --links --inode --modified --created --changed --git --git-repos --time-style long-iso"

alias tree="tree -NC"
alias rm="rm -i"
alias cp="cp -i"
alias mv="mv -i"
alias mkdir="mkdir -p"

# 開発系エイリアス
alias be="bundle exec"

alias sudo="sudo "

# 検索系エイリアス
alias ag="ag --smart-case --stats --pager \"less -F -R\""
alias agh="ag --hidden --smart-case --stats --pager \"less -F -R\""

alias rg="rg --smart-case --stats --pretty"
alias vp="vim +PlugInstall +qall"
alias nrun="npm run \$(commands | peco)"
alias yrun="yarn \$(commands | peco)"
alias mrun="mise run"

# セッション管理エイリアス
alias t="tmux"
alias td="tmux detach"
alias ta="tmux attach"
alias tat="tmux attach -t"
alias tm="tmuximum"

# ディレクトリ移動エイリアス
alias ..="cd .."
alias ...="cd ../.."
alias ....="cd ../../.."

# パイプ用グローバルエイリアス
alias -g L="| less -F -R"
alias -g H="| head"
alias -g T="| tail -F -R"
alias -g G="| grep"
alias -g CL="| color"

alias grep="grep --color -n -I --exclude='*.svn-*' --exclude='entries' --exclude='*/cache/*'"

# クリップボード連携
if which pbcopy >/dev/null 2>&1 ; then
    # Mac
    alias -g C="| pbcopy"
elif which xsel >/dev/null 2>&1 ; then
    alias -g C="| xsel --input --clipboard"
elif which putclip >/dev/null 2>&1 ; then
    alias -g C="| putclip"
fi

alias claude="$HOME/.claude/local/claude"
