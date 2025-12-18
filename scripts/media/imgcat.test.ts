import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import { mkdirSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  printOsc,
  printSt,
  parseArgs,
  displayImageFromFile,
} from "./imgcat";

describe("imgcat", () => {
  describe("printOsc", () => {
    test("通常のターミナルではESC]を返す", () => {
      const originalTerm = process.env.TERM;
      process.env.TERM = "xterm-256color";

      const result = printOsc();
      expect(result).toBe("\x1b]");

      process.env.TERM = originalTerm;
    });

    test("tmux内ではDCSラップシーケンスを返す", () => {
      const originalTerm = process.env.TERM;
      process.env.TERM = "screen-256color";

      const result = printOsc();
      expect(result).toBe("\x1bPtmux;\x1b\x1b]");

      process.env.TERM = originalTerm;
    });
  });

  describe("printSt", () => {
    test("通常のターミナルではBELを返す", () => {
      const originalTerm = process.env.TERM;
      process.env.TERM = "xterm-256color";

      const result = printSt();
      expect(result).toBe("\x07");

      process.env.TERM = originalTerm;
    });

    test("tmux内ではBEL + ESC backslashを返す", () => {
      const originalTerm = process.env.TERM;
      process.env.TERM = "screen-256color";

      const result = printSt();
      expect(result).toBe("\x07\x1b\\");

      process.env.TERM = originalTerm;
    });
  });

  describe("parseArgs", () => {
    test("ファイル名のみを指定した場合", () => {
      const result = parseArgs(["image.png"]);
      expect(result).toEqual({
        files: ["image.png"],
        printFilename: false,
        showHelp: false,
      });
    });

    test("複数のファイル名を指定した場合", () => {
      const result = parseArgs(["image1.png", "image2.jpg"]);
      expect(result).toEqual({
        files: ["image1.png", "image2.jpg"],
        printFilename: false,
        showHelp: false,
      });
    });

    test("-pオプションを指定した場合", () => {
      const result = parseArgs(["-p", "image.png"]);
      expect(result).toEqual({
        files: ["image.png"],
        printFilename: true,
        showHelp: false,
      });
    });

    test("--printオプションを指定した場合", () => {
      const result = parseArgs(["--print", "image.png"]);
      expect(result).toEqual({
        files: ["image.png"],
        printFilename: true,
        showHelp: false,
      });
    });

    test("-hオプションを指定した場合", () => {
      const result = parseArgs(["-h"]);
      expect(result).toEqual({
        files: [],
        printFilename: false,
        showHelp: true,
      });
    });

    test("--helpオプションを指定した場合", () => {
      const result = parseArgs(["--help"]);
      expect(result).toEqual({
        files: [],
        printFilename: false,
        showHelp: true,
      });
    });

    test("不明なオプションを指定した場合はnullを返す", () => {
      const result = parseArgs(["--unknown", "image.png"]);
      expect(result).toBeNull();
    });

    test("引数なしの場合は空のファイルリストを返す", () => {
      const result = parseArgs([]);
      expect(result).toEqual({
        files: [],
        printFilename: false,
        showHelp: false,
      });
    });
  });

  describe("displayImageFromFile", () => {
    let testDir: string;

    beforeEach(() => {
      testDir = join(tmpdir(), `imgcat-test-${Date.now()}`);
      mkdirSync(testDir, { recursive: true });
    });

    afterEach(() => {
      if (existsSync(testDir)) {
        rmSync(testDir, { recursive: true, force: true });
      }
    });

    test("存在しないファイルの場合はfalseを返す", async () => {
      const result = await displayImageFromFile(
        join(testDir, "nonexistent.png"),
        false
      );
      expect(result).toBe(false);
    });

    test("存在するファイルの場合はtrueを返す", async () => {
      // テスト用の画像ファイル（1x1の白いPNG）のBase64
      const pngBase64 =
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";
      const testFile = join(testDir, "test.png");
      writeFileSync(testFile, Buffer.from(pngBase64, "base64"));

      // 注意: この関数はstdoutに出力するため、実際の出力はテストしない
      // ファイルが存在する場合にtrueを返すことのみ確認
      const result = await displayImageFromFile(testFile, false);
      expect(result).toBe(true);
    });
  });
});
