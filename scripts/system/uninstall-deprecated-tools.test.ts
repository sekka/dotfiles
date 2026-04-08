/**
 * uninstall-deprecated-tools.ts のテスト
 */

import { describe, expect, test } from "bun:test";
import { checkToolExists, DEPRECATED_TOOLS, FOSSIL_MCP_PATH } from "./uninstall-deprecated-tools";
import { join } from "node:path";

describe("uninstall-deprecated-tools", () => {
  describe("DEPRECATED_TOOLS", () => {
    test("agent-browser と pinchtab が含まれている", () => {
      expect(DEPRECATED_TOOLS).toContain("agent-browser");
      expect(DEPRECATED_TOOLS).toContain("pinchtab");
    });

    test("2つのツールが定義されている", () => {
      expect(DEPRECATED_TOOLS).toHaveLength(2);
    });
  });

  describe("FOSSIL_MCP_PATH", () => {
    test("$HOME/.local/bin/fossil-mcp のパスを返す", () => {
      const expected = join(process.env.HOME ?? "", ".local", "bin", "fossil-mcp");
      expect(FOSSIL_MCP_PATH).toBe(expected);
    });
  });

  describe("checkToolExists", () => {
    test("存在しないコマンドは false を返す", async () => {
      const result = await checkToolExists("__nonexistent_tool_xyz_12345__");
      expect(result).toBe(false);
    });

    test("存在するコマンド (bun) は true を返す", async () => {
      const result = await checkToolExists("bun");
      expect(result).toBe(true);
    });
  });
});
