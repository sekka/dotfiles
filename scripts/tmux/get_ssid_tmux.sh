#!/bin/bash

# system_profilerを使用してSSIDを取得
ssid=$(system_profiler SPAirPortDataType 2>/dev/null | awk '/Current Network Information:/{getline; print $0}' | head -1 | awk -F':' '{print $1}' | sed 's/^[[:space:]]*//')

if [ -n "$ssid" ] && [ "$ssid" != "" ]; then
  # 有効なSSIDが取得できた場合
  echo "$ssid"
else
  # Wi-Fiインターフェースのステータスを確認
  wifi_interface=$(networksetup -listallhardwareports | grep -A 1 Wi-Fi | grep Device | awk '{print $2}')

  if [ -n "$wifi_interface" ]; then
    # インターフェースが存在するがSSIDが取得できない場合
    if ifconfig "$wifi_interface" | grep -q "status: active"; then
      echo "#[fg=yellow]接続中"
    else
      echo "#[fg=yellow]未接続"
    fi
  else
    # Wi-Fiインターフェースが見つからない場合
    echo "#[fg=red]✘"
  fi
fi
