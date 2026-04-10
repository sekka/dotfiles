#!/usr/bin/env bun

/**
 * External Skills Sync Hook (SessionStart)
 *
 * Syncs external skills from upstream GitHub repositories.
 * Uses a 24-hour cache to avoid unnecessary network requests.
 *
 * Logic:
 * 1. Read the hardcoded EXTERNAL_SKILLS manifest
 * 2. For each skill, check if synced within the last 24 hours (cache)
 * 3. If not, use git ls-remote to get the latest commit hash
 * 4. If hash differs (or no cache), fetch raw files from GitHub API
 * 5. Write files to the skills directory, update cache
 *
 * Constraints:
 * - SessionStart hook is non-blocking (always exits with code 0)
 * - git ls-remote has a 10-second timeout
 * - Network errors are handled gracefully (offline = skip)
 */

import { mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";

// HOME environment variable validation
const HOME = process.env["HOME"];
if (!HOME) {
  console.error("[sync-external-skills] Error: HOME environment variable is not set");
  process.exit(0);
}

const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
const CACHE_FILE = join(HOME, ".claude", ".external-skills-sync-cache.json");
const SKILLS_DIR = join(HOME, "dotfiles", "home", ".claude", "skills");
const GIT_TIMEOUT_MS = 10_000;

interface SkillFile {
  src: string;
  dest: string;
}

interface ExternalSkill {
  name: string;
  repo: string;
  branch: string;
  files: SkillFile[];
}

interface CacheEntry {
  lastChecked: number;
  commitHash: string;
}

type Cache = Record<string, CacheEntry>;

const EXTERNAL_SKILLS: ExternalSkill[] = [
  {
    name: "difit-review",
    repo: "yoshiko-pg/difit",
    branch: "main",
    files: [
      { src: "skills/difit-review/SKILL.md", dest: "SKILL.md" },
      { src: "skills/difit-review/agents/openai.yaml", dest: "agents/openai.yaml" },
    ],
  },
  {
    name: "grill-me",
    repo: "mattpocock/skills",
    branch: "main",
    files: [{ src: "grill-me/SKILL.md", dest: "SKILL.md" }],
  },
];

/**
 * Load cache from disk
 */
async function loadCache(): Promise<Cache> {
  try {
    if (existsSync(CACHE_FILE)) {
      const file = Bun.file(CACHE_FILE);
      const data = JSON.parse(await file.text());
      if (data && typeof data === "object" && !Array.isArray(data)) {
        return data as Cache;
      }
    }
  } catch {
    // Cache load failure does not affect normal operation
  }
  return {};
}

/**
 * Save cache to disk
 */
async function saveCache(cache: Cache): Promise<void> {
  try {
    await Bun.write(CACHE_FILE, JSON.stringify(cache, null, 2));
  } catch (error) {
    if (process.env["DEBUG"]) {
      console.debug(
        `[sync-external-skills] Failed to save cache: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}

/**
 * Check if a skill is fresh in cache (within 24 hours)
 */
function isCacheFresh(name: string, cache: Cache): boolean {
  const entry = cache[name];
  if (!entry) return false;
  return Date.now() - entry.lastChecked < CACHE_DURATION_MS;
}

/**
 * Get the latest commit hash for a branch using git ls-remote
 */
async function getLatestCommitHash(repo: string, branch: string): Promise<string | null> {
  try {
    const url = `https://github.com/${repo}.git`;
    const proc = Bun.spawn(["git", "ls-remote", url, `refs/heads/${branch}`], {
      stdout: "pipe",
      stderr: "pipe",
    });

    // Apply timeout
    const timeoutId = setTimeout(() => {
      proc.kill();
    }, GIT_TIMEOUT_MS);

    const exitCode = await proc.exited;
    clearTimeout(timeoutId);

    if (exitCode !== 0) return null;

    const output = await new Response(proc.stdout).text();
    const line = output.trim().split("\n")[0];
    if (!line) return null;

    const hash = line.split("\t")[0];
    return hash || null;
  } catch {
    return null;
  }
}

/**
 * Fetch a raw file from GitHub
 */
async function fetchRawFile(repo: string, branch: string, path: string): Promise<string | null> {
  try {
    const url = `https://raw.githubusercontent.com/${repo}/${branch}/${path}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(15_000) });
    if (!response.ok) {
      if (process.env["DEBUG"]) {
        console.debug(`[sync-external-skills] HTTP ${response.status} for ${url}`);
      }
      return null;
    }
    return await response.text();
  } catch {
    return null;
  }
}

/**
 * Sync a single external skill
 */
async function syncSkill(
  skill: ExternalSkill,
  cache: Cache,
): Promise<{ updated: boolean; oldHash: string; newHash: string } | null> {
  const latestHash = await getLatestCommitHash(skill.repo, skill.branch);
  if (!latestHash) {
    // Offline or error — skip silently
    return null;
  }

  const cachedEntry = cache[skill.name];
  const cachedHash = cachedEntry?.commitHash ?? "";

  if (cachedHash === latestHash) {
    // Already up to date — update timestamp only
    cache[skill.name] = { lastChecked: Date.now(), commitHash: latestHash };
    return { updated: false, oldHash: cachedHash, newHash: latestHash };
  }

  // Fetch and write all files
  const skillDestDir = join(SKILLS_DIR, skill.name);
  for (const file of skill.files) {
    const content = await fetchRawFile(skill.repo, skill.branch, file.src);
    if (content === null) {
      console.error(`[sync-external-skills] Error: Failed to fetch ${file.src} from ${skill.repo}`);
      return null;
    }

    const destPath = join(skillDestDir, file.dest);
    const destDir = dirname(destPath);
    if (!existsSync(destDir)) {
      mkdirSync(destDir, { recursive: true });
    }
    await Bun.write(destPath, content);
  }

  cache[skill.name] = { lastChecked: Date.now(), commitHash: latestHash };
  return { updated: true, oldHash: cachedHash, newHash: latestHash };
}

/**
 * Main processing
 */
async function main() {
  try {
    const cache = await loadCache();
    let cacheModified = false;

    for (const skill of EXTERNAL_SKILLS) {
      // Skip if cache is fresh (within 24 hours)
      if (isCacheFresh(skill.name, cache)) {
        continue;
      }

      const result = await syncSkill(skill, cache);
      cacheModified = true;

      if (result === null) {
        // Error or offline — skip
        continue;
      }

      if (result.updated) {
        const shortOld = result.oldHash ? result.oldHash.slice(0, 7) : "none";
        const shortNew = result.newHash.slice(0, 7);
        console.log(`[sync-external-skills] Updated: ${skill.name} (${shortOld} → ${shortNew})`);
      }
    }

    if (cacheModified) {
      await saveCache(cache);
    }

    process.exit(0);
  } catch (error) {
    console.error(
      `[sync-external-skills] Error: ${error instanceof Error ? error.message : String(error)}`,
    );
    process.exit(0); // Non-blocking
  }
}

main();
