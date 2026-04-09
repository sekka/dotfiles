#!/bin/bash
if ! command -v tcmux >/dev/null 2>&1; then exit 0; fi
stats=$(tcmux stats 2>/dev/null)
[ -z "$stats" ] && exit 0
[[ $stats =~ R:([0-9]+) ]] && running=${BASH_REMATCH[1]} || running=0
[[ $stats =~ W:([0-9]+) ]] && waiting=${BASH_REMATCH[1]} || waiting=0
out=""
[ "$running" -gt 0 ] && out="${running}R "
[ "$waiting" -gt 0 ] && out="${out}${waiting}W"
[ -n "$out" ] && echo "✻ $out "
