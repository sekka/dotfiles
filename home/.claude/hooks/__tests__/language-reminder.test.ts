import { describe, expect, test } from "bun:test";
import { parseCurrentLevel } from "../language-reminder";

describe("parseCurrentLevel", () => {
  test("L3 を正しく抽出する", () => {
    const text = `# Language Policy\n### Current level: L3\n`;
    expect(parseCurrentLevel(text)).toBe(3);
  });

  test("L0 を正しく抽出する", () => {
    const text = `### Current level: L0\n`;
    expect(parseCurrentLevel(text)).toBe(0);
  });

  test("L8 を正しく抽出する", () => {
    const text = `### Current level: L8\n`;
    expect(parseCurrentLevel(text)).toBe(8);
  });

  test("大文字小文字を区別しない", () => {
    const text = `### Current Level: L5\n`;
    expect(parseCurrentLevel(text)).toBe(5);
  });

  test("行の途中にあっても抽出できる", () => {
    const text = `some text Current level: L2 more text`;
    expect(parseCurrentLevel(text)).toBe(2);
  });

  test("L が数字を伴わない場合は null", () => {
    const text = `### Current level: L\n`;
    expect(parseCurrentLevel(text)).toBeNull();
  });

  test("マッチしない場合は null", () => {
    const text = `# Language Policy\nNo level defined here.\n`;
    expect(parseCurrentLevel(text)).toBeNull();
  });

  test("空文字列は null", () => {
    expect(parseCurrentLevel("")).toBeNull();
  });

  test("Lxx (複数桁) も正しく抽出する", () => {
    const text = `Current level: L10`;
    expect(parseCurrentLevel(text)).toBe(10);
  });
});
