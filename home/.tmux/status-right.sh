#!/bin/bash
# tcmux エージェント状態のコンパクト表示
if ! command -v tcmux >/dev/null 2>&1; then exit 0; fi
agents=$(tcmux lsw 2>/dev/null)
[ -z "$agents" ] && exit 0
running=$(echo "$agents" | grep -c "Running")
waiting=$(echo "$agents" | grep -c "Waiting")
out=""
[ "$running" -gt 0 ] 2>/dev/null && out="${running}R "
[ "$waiting" -gt 0 ] 2>/dev/null && out="${out}${waiting}W"
[ -n "$out" ] && echo "✻ $out "
