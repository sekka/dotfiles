const GIT_TIMEOUT = 5000;

export interface GitStatus {
  branch: string;
  aheadBehind: string | null;
  diffStats: string | null;
}

const color = {
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  red: (s: string) => `\x1b[91m${s}\x1b[0m`,
};

async function run(cmd: string[], cwd: string): Promise<string> {
  const proc = Bun.spawn({ cmd, cwd, stdout: "pipe", stderr: "pipe" });
  const timer = setTimeout(() => proc.kill(), GIT_TIMEOUT);
  const code = await proc.exited;
  clearTimeout(timer);
  return code === 0 ? new Response(proc.stdout).text() : "";
}

async function parentBranch(cwd: string): Promise<string | null> {
  const [main, master] = await Promise.allSettled([
    run(["git", "--no-optional-locks", "rev-parse", "--verify", "origin/main"], cwd),
    run(["git", "--no-optional-locks", "rev-parse", "--verify", "origin/master"], cwd),
  ]);
  if (main.status === "fulfilled" && main.value.trim()) return "origin/main";
  if (master.status === "fulfilled" && master.value.trim()) return "origin/master";
  return null;
}

async function getAheadBehind(cwd: string): Promise<string | null> {
  const parent = await parentBranch(cwd);
  if (!parent) return null;

  const [ahead, behind] = await Promise.allSettled([
    run(["git", "--no-optional-locks", "rev-list", "--count", `${parent}..HEAD`], cwd),
    run(["git", "--no-optional-locks", "rev-list", "--count", `HEAD..${parent}`], cwd),
  ]);

  const a = parseInt((ahead.status === "fulfilled" ? ahead.value : "").trim() || "0", 10);
  const b = parseInt((behind.status === "fulfilled" ? behind.value : "").trim() || "0", 10);

  if (a > 0 && b > 0) return color.yellow(`↑${a}↓${b}`);
  if (a > 0) return color.yellow(`↑${a}`);
  if (b > 0) return color.yellow(`↓${b}`);
  return null;
}

async function getDiffStats(cwd: string): Promise<string | null> {
  const [unstaged, staged] = await Promise.allSettled([
    run(["git", "--no-optional-locks", "diff", "--numstat"], cwd),
    run(["git", "--no-optional-locks", "diff", "--cached", "--numstat"], cwd),
  ]);

  let added = 0;
  let deleted = 0;

  for (const result of [unstaged, staged]) {
    if (result.status !== "fulfilled") continue;
    for (const line of result.value.split("\n")) {
      if (!line.trim()) continue;
      const parts = line.split("\t");
      const an = parseInt(parts[0] ?? "", 10);
      const dn = parseInt(parts[1] ?? "", 10);
      if (!isNaN(an)) added += an;
      if (!isNaN(dn)) deleted += dn;
    }
  }

  return added > 0 || deleted > 0
    ? `${color.green(`+${added}`)} ${color.red(`-${deleted}`)}`
    : null;
}

export async function getGitStatus(cwd: string): Promise<GitStatus> {
  try {
    const branch = (
      await run(["git", "--no-optional-locks", "branch", "--show-current"], cwd)
    ).trim();
    if (!branch) return { branch: "", aheadBehind: null, diffStats: null };

    const [ab, ds] = await Promise.all([getAheadBehind(cwd), getDiffStats(cwd)]);
    return { branch, aheadBehind: ab, diffStats: ds };
  } catch {
    return { branch: "", aheadBehind: null, diffStats: null };
  }
}
