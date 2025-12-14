#!/bin/bash

# バッテリーの存在を確認
pmset_output=$(/usr/bin/pmset -g ps)

# バッテリーが存在しない場合（Mac mini, iMac等）は何も表示しない
if echo "$pmset_output" | grep -q "Now drawing from 'AC Power'" && ! echo "$pmset_output" | grep -q "InternalBattery"; then
  # バッテリーがないデバイスでは何も出力しない（空文字）
  echo ""
  exit 0
fi

# バッテリーがある場合の処理（従来通り）
battery=$(echo "$pmset_output" | awk '{ if (NR == 2) print $2 " " $3 }' | sed -e "s/;//g" -e "s/%//")
battery_quantity=$(echo "$battery" | awk '{print $2}')

if [[ ! $battery =~ discharging ]]; then
  echo "#[bg=blue,fg=white] ⚡ $battery_quantity% #[default]"
elif [[ "$battery_quantity" -le 15 ]]; then
  echo "#[bg=red,fg=white] $battery_quantity% #[default]"
else
  echo "#[bg=blue,fg=white] $battery_quantity% #[default]"
fi
