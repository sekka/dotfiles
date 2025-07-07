
ZSHHOME="${HOME}/dotfiles/home/config/zsh"

if [ -d $ZSHHOME -a -r $ZSHHOME -a \
    -x $ZSHHOME ]; then
    for i in $ZSHHOME/*; do
        [[ ${i##*/} = *.zsh ]] &&
            [ \( -f $i -o -h $i \) -a -r $i ] && . $i
    done
fi

# LM Studio path is managed in config/zsh/00_path.zsh

# Docker CLI completions
add_to_fpath "$HOME/.docker/completions"
