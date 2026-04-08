/**
 * check-defaults.ts のテスト
 */

import { describe, expect, test, mock, beforeEach, afterEach, spyOn } from "bun:test";
import { CHECKS, checkDefault, type DefaultsCheck, type MatchMode } from "./check-defaults";

// --- unit tests for CHECKS array ---

describe("CHECKS", () => {
  test("26個のチェックが定義されている", () => {
    expect(CHECKS.length).toBe(26);
  });

  test("全てのチェックにdomainとkeyとdescriptionが設定されている", () => {
    for (const check of CHECKS) {
      expect(check.domain).toBeTruthy();
      expect(check.key).toBeTruthy();
      expect(check.description).toBeTruthy();
    }
  });

  test("静的writeCommandを持つチェックは空でない文字列を持つ", () => {
    // Dynamic checks (ne/lt/non-empty modes with no fixed command) have empty writeCommand.
    // Static checks must have a non-empty writeCommand.
    const dynamicKeys = new Set([
      "com.apple.dock:autohide-delay",
      "com.apple.dock:tilesize",
      "NSGlobalDomain:KeyRepeat",
      "NSGlobalDomain:InitialKeyRepeat",
      "NSGlobalDomain:com.apple.trackpad.scaling",
      "com.apple.screencapture:type",
      "com.apple.screencapture:location",
    ]);
    for (const check of CHECKS) {
      const compositeKey = `${check.domain}:${check.key}`;
      if (dynamicKeys.has(compositeKey)) {
        expect(check.writeCommand).toBe("");
      } else {
        expect(check.writeCommand).toBeTruthy();
      }
    }
  });

  test("全てのチェックにmatchModeが設定されている", () => {
    const validModes: MatchMode[] = [
      "eq",
      "ne",
      "lt",
      "non-empty",
      "boolean-true",
      "boolean-false",
      "special",
    ];
    for (const check of CHECKS) {
      expect(validModes).toContain(check.matchMode);
    }
  });
});

// --- unit tests for checkDefault() ---

describe("checkDefault", () => {
  test("eq モード: 値が一致する場合 matches=true を返す", async () => {
    const check: DefaultsCheck = {
      domain: "com.apple.finder",
      key: "ShowPathbar",
      expected: "1",
      description: "パスバーを表示",
      writeCommand: "defaults write com.apple.finder ShowPathbar -bool true",
      matchMode: "eq",
    };

    // Mock checkDefault by providing a fake reader
    const result = await checkDefault(check, async () => ({ value: "1", error: false }));
    expect(result.matches).toBe(true);
    expect(result.current).toBe("1");
  });

  test("eq モード: 値が一致しない場合 matches=false を返す", async () => {
    const check: DefaultsCheck = {
      domain: "com.apple.finder",
      key: "ShowPathbar",
      expected: "1",
      description: "パスバーを表示",
      writeCommand: "defaults write com.apple.finder ShowPathbar -bool true",
      matchMode: "eq",
    };

    const result = await checkDefault(check, async () => ({ value: "0", error: false }));
    expect(result.matches).toBe(false);
  });

  test("ne モード: 値が期待値と異なる場合 matches=true を返す", async () => {
    const check: DefaultsCheck = {
      domain: "com.apple.dock",
      key: "autohide-delay",
      expected: "0.5",
      description: "Dock自動非表示の遅延",
      writeCommand: "defaults write com.apple.dock autohide-delay -float 0",
      matchMode: "ne",
    };

    const result = await checkDefault(check, async () => ({ value: "0", error: false }));
    expect(result.matches).toBe(true);
    expect(result.current).toBe("0");
  });

  test("ne モード: 値がデフォルトと同じ場合 matches=false を返す", async () => {
    const check: DefaultsCheck = {
      domain: "com.apple.dock",
      key: "autohide-delay",
      expected: "0.5",
      description: "Dock自動非表示の遅延",
      writeCommand: "defaults write com.apple.dock autohide-delay -float 0.5",
      matchMode: "ne",
    };

    const result = await checkDefault(check, async () => ({ value: "0.5", error: false }));
    expect(result.matches).toBe(false);
  });

  test("lt モード: 値が期待値より小さい場合 matches=true を返す", async () => {
    const check: DefaultsCheck = {
      domain: "NSGlobalDomain",
      key: "KeyRepeat",
      expected: "6",
      description: "キーリピート速度",
      writeCommand: "defaults write NSGlobalDomain KeyRepeat -int 2",
      matchMode: "lt",
    };

    const result = await checkDefault(check, async () => ({ value: "2", error: false }));
    expect(result.matches).toBe(true);
    expect(result.current).toBe("2");
  });

  test("lt モード: 値が期待値と同じまたは大きい場合 matches=false を返す", async () => {
    const check: DefaultsCheck = {
      domain: "NSGlobalDomain",
      key: "KeyRepeat",
      expected: "6",
      description: "キーリピート速度",
      writeCommand: "defaults write NSGlobalDomain KeyRepeat -int 6",
      matchMode: "lt",
    };

    const result = await checkDefault(check, async () => ({ value: "6", error: false }));
    expect(result.matches).toBe(false);
  });

  test("non-empty モード: 値が空でない場合 matches=true を返す", async () => {
    const check: DefaultsCheck = {
      domain: "com.apple.screencapture",
      key: "location",
      expected: "",
      description: "スクリーンショット保存場所",
      writeCommand: 'defaults write com.apple.screencapture location -string "/path"',
      matchMode: "non-empty",
    };

    const result = await checkDefault(check, async () => ({
      value: "/Users/kei/Desktop",
      error: false,
    }));
    expect(result.matches).toBe(true);
  });

  test("non-empty モード: 値が空の場合 matches=false を返す", async () => {
    const check: DefaultsCheck = {
      domain: "com.apple.screencapture",
      key: "location",
      expected: "",
      description: "スクリーンショット保存場所",
      writeCommand: 'defaults write com.apple.screencapture location -string ""',
      matchMode: "non-empty",
    };

    const result = await checkDefault(check, async () => ({ value: "", error: false }));
    expect(result.matches).toBe(false);
  });

  test("boolean-true モード: 値が '1' の場合 matches=true を返す", async () => {
    const check: DefaultsCheck = {
      domain: "NSGlobalDomain",
      key: "AppleShowAllExtensions",
      expected: "1",
      description: "全ての拡張子を表示",
      writeCommand: "defaults write NSGlobalDomain AppleShowAllExtensions -bool true",
      matchMode: "boolean-true",
    };

    const result = await checkDefault(check, async () => ({ value: "1", error: false }));
    expect(result.matches).toBe(true);
  });

  test("boolean-true モード: 値が 'YES' の場合も matches=true を返す", async () => {
    const check: DefaultsCheck = {
      domain: "com.apple.finder",
      key: "AppleShowAllFiles",
      expected: "1",
      description: "隠しファイルを表示",
      writeCommand: "defaults write com.apple.finder AppleShowAllFiles -bool true",
      matchMode: "boolean-true",
    };

    const result = await checkDefault(check, async () => ({ value: "YES", error: false }));
    expect(result.matches).toBe(true);
  });

  test("boolean-false モード: 値が '0' の場合 matches=true を返す", async () => {
    const check: DefaultsCheck = {
      domain: "com.apple.dock",
      key: "launchanim",
      expected: "0",
      description: "Dock起動アニメーション",
      writeCommand: "defaults write com.apple.dock launchanim -bool false",
      matchMode: "boolean-false",
    };

    const result = await checkDefault(check, async () => ({ value: "0", error: false }));
    expect(result.matches).toBe(true);
  });

  test("boolean-false モード: 値が 'NO' の場合も matches=true を返す", async () => {
    const check: DefaultsCheck = {
      domain: "com.apple.dock",
      key: "launchanim",
      expected: "0",
      description: "Dock起動アニメーション",
      writeCommand: "defaults write com.apple.dock launchanim -bool false",
      matchMode: "boolean-false",
    };

    const result = await checkDefault(check, async () => ({ value: "NO", error: false }));
    expect(result.matches).toBe(true);
  });

  test("エラー時 error=true を返す", async () => {
    const check: DefaultsCheck = {
      domain: "com.apple.finder",
      key: "ShowPathbar",
      expected: "1",
      description: "パスバーを表示",
      writeCommand: "defaults write com.apple.finder ShowPathbar -bool true",
      matchMode: "eq",
    };

    const result = await checkDefault(check, async () => ({ value: "", error: true }));
    expect(result.error).toBe(true);
    expect(result.matches).toBe(false);
  });

  test("non-empty モード: エラー時は matches=false を返す", async () => {
    const check: DefaultsCheck = {
      domain: "com.apple.screencapture",
      key: "location",
      expected: "",
      description: "スクリーンショット保存場所",
      writeCommand: 'defaults write com.apple.screencapture location -string ""',
      matchMode: "non-empty",
    };

    const result = await checkDefault(check, async () => ({ value: "", error: true }));
    expect(result.matches).toBe(false);
    expect(result.error).toBe(true);
  });
});
