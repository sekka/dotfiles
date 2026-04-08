import { describe, it, expect } from "bun:test";
import { getGitStatus } from "../git.ts";

describe("getGitStatus — real git repo", () => {
  it("returns a non-empty branch name for the dotfiles repo", async () => {
    const status = await getGitStatus("/Users/kei/dotfiles");
    expect(status.branch).toBeTruthy();
    expect(typeof status.branch).toBe("string");
  });

  it("aheadBehind is string or null", async () => {
    const status = await getGitStatus("/Users/kei/dotfiles");
    expect(status.aheadBehind === null || typeof status.aheadBehind === "string").toBe(true);
  });

  it("diffStats is string or null", async () => {
    const status = await getGitStatus("/Users/kei/dotfiles");
    expect(status.diffStats === null || typeof status.diffStats === "string").toBe(true);
  });
});

describe("getGitStatus — non-git directory", () => {
  it("returns empty branch for /tmp", async () => {
    const status = await getGitStatus("/tmp");
    expect(status.branch).toBe("");
  });

  it("returns null aheadBehind for /tmp", async () => {
    const status = await getGitStatus("/tmp");
    expect(status.aheadBehind).toBeNull();
  });

  it("returns null diffStats for /tmp", async () => {
    const status = await getGitStatus("/tmp");
    expect(status.diffStats).toBeNull();
  });
});
