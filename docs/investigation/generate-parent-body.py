#!/usr/bin/env python3
"""Generate updated body for parent issue #20 with sub-issue links."""
import sys

if len(sys.argv) < 18:
    print(f"Usage: {sys.argv[0]} <n1> <n2> ... <n17>", file=sys.stderr)
    sys.exit(1)

nums = sys.argv[1:18]

body = f"""リストの各項目について、sub-issuesを作成しそれへの参照リンクをつけたら完了を意味するチェックをつけて。
sub-issuesではその項目の内容にどんな効用やメリット・デメリットがあるかレポーティングして。
レポーティングの結果を私が確認して、導入したいかどうか判断を下す。

- [x] https://github.com/googleworkspace/cli → #{nums[0]}
- [x] https://x.com/tomoaki_imai/status/2030061902295093466 → #{nums[1]}
- [x] https://x.com/pouhiroshi/status/2030071072968871977 → #{nums[2]}
- [x] https://x.com/azu_re/status/2029936988670021940 → #{nums[3]}
- [x] https://x.com/tom_doerr/status/2030040275079368847 → #{nums[4]}
- [x] https://github.com/nabeelhyatt/coworkpowers → #{nums[5]}
- [x] https://github.com/playcanvas/editor → #{nums[6]}
- [x] https://www.opensourceprojects.dev/post/993c493f-28ec-4a77-9b21-0bed3b45ed5c → #{nums[7]}
- [x] https://x.com/yoshiko_pg/status/2029938566516855172 → #{nums[8]}
- [x] https://github.com/EdamAme-x/claudex → #{nums[9]}
- [x] https://getfresh.dev/ → #{nums[10]}
- [x] https://x.com/suin/status/2025525553823191550 → #{nums[11]}
- [x] https://x.com/ctatedev/status/2028960626685386994 → #{nums[12]}
- [x] https://x.com/amagitakayosi/status/2028979494984499577 → #{nums[13]}
- [x] https://x.com/oikon48/status/2030171170885321056 → #{nums[14]}
- [x] https://x.com/ryoppippi/status/2028670064254447621 → #{nums[15]}
- [x] https://x.com/kmizu/status/2028446966997569933 → #{nums[16]}"""

print(body)
