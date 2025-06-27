# if [[ "${(L)$( uname -s )}" == darwin ]] && (( $+commands[arch] )); then
#     alias brew="arch -arch x86_64 /usr/local/bin/brew"
#     alias x64='exec arch -arch x86_64 "$SHELL"'
#     alias a64='exec arch -arch arm64e "$SHELL"'
#     switch-arch() {
#         if  [[ "$(uname -m)" == arm64 ]]; then
#             arch=x86_64
#         elif [[ "$(uname -m)" == x86_64 ]]; then
#             arch=arm64e
#         fi
#         exec arch -arch $arch "$SHELL"
#     }
# fi
#
# setopt magic_equal_subst

ZSHHOME="${HOME}/dotfiles/config/zsh"

if [ -d $ZSHHOME -a -r $ZSHHOME -a \
    -x $ZSHHOME ]; then
    for i in $ZSHHOME/*; do
        [[ ${i##*/} = *.zsh ]] &&
            [ \( -f $i -o -h $i \) -a -r $i ] && . $i
    done
fi

# Added by LM Studio CLI (lms)
export PATH="$PATH:/Users/kei/.lmstudio/bin"
# The following lines have been added by Docker Desktop to enable Docker CLI completions.
fpath=(/Users/kei/.docker/completions $fpath)
autoload -Uz compinit
compinit
# End of Docker CLI completions
