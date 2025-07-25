#!/bin/zsh
sound_info=$(osascript -e 'get volume settings')

# echo -n "#[bold][#[default]"

if [ "$(echo $sound_info | awk '{print $8}')" = "muted:false" ]; then
  sound_volume=$(expr $(echo $sound_info | awk '{print $2}' | sed "s/[^0-9]//g") / 6 )
  local i=0
  while [ $i -lt $sound_volume ]; do
    (( i++ ))
    echo -n "#[bold]■#[default]"
  done
  while [ $i -lt 16 ]; do
    (( i++ ))
    echo -n " "
  done
else
  echo -n "      #[fg=white]mute#[default]      "
fi

# echo -n "#[bold]]#[default]"
