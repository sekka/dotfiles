
ZSHHOME="${HOME}/dotfiles/config/zsh"

if [ -d $ZSHHOME -a -r $ZSHHOME -a \
    -x $ZSHHOME ]; then
    for i in $ZSHHOME/*; do
        [[ ${i##*/} = *.zsh ]] &&
            [ \( -f $i -o -h $i \) -a -r $i ] && . $i
    done
fi

# Added by LM Studio CLI (lms)
add_to_path "$HOME/.lmstudio/bin" append

# Docker CLI completions
add_to_fpath "$HOME/.docker/completions"
