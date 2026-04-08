#!/usr/bin/env bun

/**
 * macOS defaults設定の簡易チェックスクリプト
 *
 * デフォルトから変更されている一般的な設定項目をチェックして、
 * defaults writeコマンドとして出力します。
 *
 * 使用方法:
 *   bun scripts/system/check-defaults.ts
 */

import { $ } from "bun";

/**
 * Match mode for a defaults check.
 *
 * - eq:            matches if current value equals expected
 * - ne:            matches (customized) if current value differs from expected default
 * - lt:            matches if current value is numerically less than expected
 * - non-empty:     matches if current value is a non-empty string
 * - boolean-true:  matches if current value is truthy ("1" or "YES")
 * - boolean-false: matches if current value is falsy  ("0" or "NO")
 * - special:       caller handles comparison (used for keys with access restrictions)
 */
export type MatchMode =
  | "eq"
  | "ne"
  | "lt"
  | "non-empty"
  | "boolean-true"
  | "boolean-false"
  | "special";

export interface DefaultsCheck {
  domain: string;
  key: string;
  /** Expected / reference value. Meaning depends on matchMode. */
  expected: string;
  description: string;
  /** defaults write command to reproduce the customization */
  writeCommand: string;
  matchMode: MatchMode;
  /** Extra note printed below writeCommand (optional) */
  extraNote?: string;
}

// ---------------------------------------------------------------------------
// Data-driven check definitions — extracted from the original check-defaults.sh
// ---------------------------------------------------------------------------

export const CHECKS: DefaultsCheck[] = [
  // === Finder ===
  {
    domain: "NSGlobalDomain",
    key: "AppleShowAllExtensions",
    expected: "1",
    description: "全ての拡張子を表示: ON (デフォルト: OFF)",
    writeCommand: "defaults write NSGlobalDomain AppleShowAllExtensions -bool true",
    matchMode: "boolean-true",
  },
  {
    domain: "com.apple.finder",
    key: "AppleShowAllFiles",
    expected: "1",
    description: "隠しファイルを表示: ON (デフォルト: OFF)",
    writeCommand: "defaults write com.apple.finder AppleShowAllFiles -bool true",
    matchMode: "boolean-true",
  },
  {
    domain: "com.apple.finder",
    key: "ShowPathbar",
    expected: "1",
    description: "パスバーを表示: ON (デフォルト: OFF)",
    writeCommand: "defaults write com.apple.finder ShowPathbar -bool true",
    matchMode: "boolean-true",
  },
  {
    domain: "com.apple.finder",
    key: "ShowStatusBar",
    expected: "1",
    description: "ステータスバーを表示: ON (デフォルト: OFF)",
    writeCommand: "defaults write com.apple.finder ShowStatusBar -bool true",
    matchMode: "boolean-true",
  },
  {
    domain: "com.apple.finder",
    key: "_FXSortFoldersFirst",
    expected: "1",
    description: "フォルダを最初にソート: ON (デフォルト: OFF)",
    writeCommand: "defaults write com.apple.finder _FXSortFoldersFirst -bool true",
    matchMode: "boolean-true",
  },
  {
    domain: "com.apple.finder",
    key: "_FXShowPosixPathInTitle",
    expected: "1",
    description: "タイトルバーにフルパス表示: ON (デフォルト: OFF)",
    writeCommand: "defaults write com.apple.finder _FXShowPosixPathInTitle -bool true",
    matchMode: "boolean-true",
  },

  // === Dock ===
  {
    domain: "com.apple.dock",
    key: "autohide",
    expected: "1",
    description: "Dockの自動非表示: ON (デフォルト: OFF)",
    writeCommand: "defaults write com.apple.dock autohide -bool true",
    matchMode: "boolean-true",
  },
  {
    domain: "com.apple.dock",
    key: "autohide-delay",
    expected: "0.5",
    description: "Dock自動非表示の遅延",
    writeCommand: "", // dynamic: written at runtime using current value
    matchMode: "ne",
  },
  {
    domain: "com.apple.dock",
    key: "launchanim",
    expected: "0",
    description: "Dock起動アニメーション: OFF (デフォルト: ON)",
    writeCommand: "defaults write com.apple.dock launchanim -bool false",
    matchMode: "boolean-false",
  },
  {
    domain: "com.apple.dock",
    key: "tilesize",
    expected: "48",
    description: "Dockタイルサイズ",
    writeCommand: "", // dynamic: written at runtime using current value
    matchMode: "ne",
  },

  // === キーボード ===
  {
    domain: "NSGlobalDomain",
    key: "KeyRepeat",
    expected: "6",
    description: "キーリピート速度",
    writeCommand: "", // dynamic
    matchMode: "lt",
  },
  {
    domain: "NSGlobalDomain",
    key: "InitialKeyRepeat",
    expected: "25",
    description: "リピート開始までの時間",
    writeCommand: "", // dynamic
    matchMode: "lt",
  },
  {
    domain: "NSGlobalDomain",
    key: "NSAutomaticSpellingCorrectionEnabled",
    expected: "0",
    description: "スペルチェック自動修正: OFF (デフォルト: ON)",
    writeCommand: "defaults write NSGlobalDomain NSAutomaticSpellingCorrectionEnabled -bool false",
    matchMode: "boolean-false",
  },

  // === トラックパッド ===
  {
    domain: "com.apple.AppleMultitouchTrackpad",
    key: "Clicking",
    expected: "1",
    description: "タップでクリック: ON (デフォルト: OFF)",
    writeCommand:
      "defaults write com.apple.AppleMultitouchTrackpad Clicking -bool true\n  defaults write com.apple.driver.AppleBluetoothMultitouch.trackpad Clicking -bool true",
    matchMode: "boolean-true",
  },
  {
    domain: "com.apple.AppleMultitouchTrackpad",
    key: "TrackpadThreeFingerDrag",
    expected: "1",
    description: "3本指ドラッグ: ON (デフォルト: OFF)",
    writeCommand:
      "defaults write com.apple.AppleMultitouchTrackpad TrackpadThreeFingerDrag -bool true\n  defaults write com.apple.driver.AppleBluetoothMultitouch.trackpad TrackpadThreeFingerDrag -bool true",
    matchMode: "boolean-true",
  },
  {
    domain: "NSGlobalDomain",
    key: "com.apple.trackpad.scaling",
    expected: "1",
    description: "トラックパッド速度",
    writeCommand: "", // dynamic
    matchMode: "ne",
  },

  // === スクリーンショット ===
  {
    domain: "com.apple.screencapture",
    key: "type",
    expected: "png",
    description: "スクリーンショット形式",
    writeCommand: "", // dynamic
    matchMode: "ne",
  },
  {
    domain: "com.apple.screencapture",
    key: "disable-shadow",
    expected: "1",
    description: "スクリーンショットの影: OFF (デフォルト: ON)",
    writeCommand: "defaults write com.apple.screencapture disable-shadow -bool true",
    matchMode: "boolean-true",
  },
  {
    domain: "com.apple.screencapture",
    key: "location",
    expected: "",
    description: "スクリーンショット保存場所",
    writeCommand: "", // dynamic
    matchMode: "non-empty",
  },

  // === システム全般 ===
  {
    domain: "NSGlobalDomain",
    key: "NSAutomaticWindowAnimationsEnabled",
    expected: "0",
    description: "ウィンドウアニメーション: OFF (デフォルト: ON)",
    writeCommand: "defaults write NSGlobalDomain NSAutomaticWindowAnimationsEnabled -bool false",
    matchMode: "boolean-false",
  },
  {
    domain: "NSGlobalDomain",
    key: "AppleShowScrollBars",
    expected: "Always",
    description: "スクロールバー: 常に表示 (デフォルト: 自動)",
    writeCommand: 'defaults write NSGlobalDomain AppleShowScrollBars -string "Always"',
    matchMode: "eq",
  },
  {
    domain: "com.apple.desktopservices",
    key: "DSDontWriteNetworkStores",
    expected: "1",
    description: "ネットワークボリュームで.DS_Store作成抑制: ON (デフォルト: OFF)",
    writeCommand: "defaults write com.apple.desktopservices DSDontWriteNetworkStores -bool true",
    matchMode: "boolean-true",
  },
  {
    domain: "com.apple.CrashReporter",
    key: "DialogType",
    expected: "none",
    description: "クラッシュレポーター: 無効 (デフォルト: 有効)",
    writeCommand: 'defaults write com.apple.CrashReporter DialogType -string "none"',
    matchMode: "eq",
  },

  // === アクセシビリティ ===
  {
    domain: "com.apple.universalaccess",
    key: "showWindowTitlebarIcons",
    expected: "1",
    description: "ウインドウタイトルにアイコンを表示: ON (デフォルト: OFF)",
    writeCommand: "defaults write com.apple.universalaccess showWindowTitlebarIcons -bool true",
    matchMode: "special",
  },

  // === Safari ===
  {
    domain: "com.apple.Safari",
    key: "IncludeDevelopMenu",
    expected: "1",
    description: "Safari開発メニュー: ON (デフォルト: OFF)",
    writeCommand: "defaults write com.apple.Safari IncludeDevelopMenu -bool true",
    matchMode: "boolean-true",
  },
  {
    domain: "com.apple.Safari",
    key: "ShowFullURLInSmartSearchField",
    expected: "1",
    description: "Safari完全URL表示: ON (デフォルト: OFF)",
    writeCommand: "defaults write com.apple.Safari ShowFullURLInSmartSearchField -bool true",
    matchMode: "boolean-true",
  },
];

// ---------------------------------------------------------------------------
// Reader abstraction for testability
// ---------------------------------------------------------------------------

export type DefaultsReader = (
  domain: string,
  key: string,
) => Promise<{ value: string; error: boolean }>;

/**
 * Default implementation: calls `defaults read <domain> <key>` via Bun shell.
 */
export async function defaultsReader(
  domain: string,
  key: string,
): Promise<{ value: string; error: boolean }> {
  const result = await $`defaults read ${domain} ${key}`.nothrow().quiet();
  if (result.exitCode !== 0) {
    return { value: "", error: true };
  }
  return { value: result.stdout.toString().trim(), error: false };
}

// ---------------------------------------------------------------------------
// Core logic
// ---------------------------------------------------------------------------

export interface CheckResult {
  matches: boolean;
  current?: string;
  error?: boolean;
}

/**
 * Run a single DefaultsCheck and return whether it indicates a customization.
 * An optional reader is accepted so tests can inject a mock.
 */
export async function checkDefault(
  check: DefaultsCheck,
  reader: DefaultsReader = defaultsReader,
): Promise<CheckResult> {
  const { value, error } = await reader(check.domain, check.key);

  if (error) {
    return { matches: false, error: true };
  }

  switch (check.matchMode) {
    case "boolean-true":
      return { matches: value === "1" || value === "YES", current: value };

    case "boolean-false":
      return { matches: value === "0" || value === "NO", current: value };

    case "eq":
      return { matches: value === check.expected, current: value };

    case "ne":
      // Only report if the value was actually set (non-empty) and differs from default
      if (value === "") return { matches: false, current: value };
      return { matches: value !== check.expected, current: value };

    case "lt": {
      // Only report if the value was actually set (non-empty)
      if (value === "") return { matches: false, current: value };
      const num = Number(value);
      const threshold = Number(check.expected);
      if (Number.isNaN(num)) return { matches: false, current: value };
      return { matches: num < threshold, current: value };
    }

    case "non-empty":
      return { matches: value !== "", current: value };

    case "special":
      // Special keys may be unreadable on newer macOS; handle gracefully
      return { matches: value === "1" || value === "YES", current: value };
  }
}

/**
 * Build the write command string for a check result.
 * For dynamic commands the current value is substituted in.
 */
function buildWriteCommand(check: DefaultsCheck, current: string): string {
  if (check.writeCommand) return check.writeCommand;

  // Dynamic commands — build from current value
  switch (`${check.domain}:${check.key}`) {
    case "com.apple.dock:autohide-delay":
      return `defaults write com.apple.dock autohide-delay -float ${current}`;
    case "com.apple.dock:tilesize":
      return `defaults write com.apple.dock tilesize -int ${current}`;
    case "NSGlobalDomain:KeyRepeat":
      return `defaults write NSGlobalDomain KeyRepeat -int ${current}`;
    case "NSGlobalDomain:InitialKeyRepeat":
      return `defaults write NSGlobalDomain InitialKeyRepeat -int ${current}`;
    case "NSGlobalDomain:com.apple.trackpad.scaling":
      return `defaults write NSGlobalDomain com.apple.trackpad.scaling -float ${current}`;
    case "com.apple.screencapture:type":
      return `defaults write com.apple.screencapture type -string "${current}"`;
    case "com.apple.screencapture:location":
      return `defaults write com.apple.screencapture location -string "${current}"`;
    default:
      return `# (unknown write command for ${check.domain} ${check.key})`;
  }
}

/**
 * Build a human-readable description line with current value substituted where needed.
 */
function buildDescription(check: DefaultsCheck, current: string): string {
  // Checks with dynamic values embed the current value in the description
  switch (`${check.domain}:${check.key}`) {
    case "com.apple.dock:autohide-delay":
      return `Dock自動非表示の遅延: ${current}秒 (デフォルト: 0.5)`;
    case "com.apple.dock:tilesize":
      return `Dockタイルサイズ: ${current} (デフォルト: 48)`;
    case "NSGlobalDomain:KeyRepeat":
      return `キーリピート速度: ${current} (デフォルト: 6, 速いほど小さい値)`;
    case "NSGlobalDomain:InitialKeyRepeat":
      return `リピート開始までの時間: ${current} (デフォルト: 25, 速いほど小さい値)`;
    case "NSGlobalDomain:com.apple.trackpad.scaling":
      return `トラックパッド速度: ${current} (デフォルト: 1)`;
    case "com.apple.screencapture:type":
      return `スクリーンショット形式: ${current} (デフォルト: png)`;
    case "com.apple.screencapture:location":
      return `スクリーンショット保存場所: ${current} (デフォルト: デスクトップ)`;
    default:
      return check.description;
  }
}

// ---------------------------------------------------------------------------
// Section grouping for output
// ---------------------------------------------------------------------------

const SECTIONS: { heading: string; keys: string[] }[] = [
  {
    heading: "Finder設定",
    keys: [
      "NSGlobalDomain:AppleShowAllExtensions",
      "com.apple.finder:AppleShowAllFiles",
      "com.apple.finder:ShowPathbar",
      "com.apple.finder:ShowStatusBar",
      "com.apple.finder:_FXSortFoldersFirst",
      "com.apple.finder:_FXShowPosixPathInTitle",
    ],
  },
  {
    heading: "Dock設定",
    keys: [
      "com.apple.dock:autohide",
      "com.apple.dock:autohide-delay",
      "com.apple.dock:launchanim",
      "com.apple.dock:tilesize",
    ],
  },
  {
    heading: "キーボード設定",
    keys: [
      "NSGlobalDomain:KeyRepeat",
      "NSGlobalDomain:InitialKeyRepeat",
      "NSGlobalDomain:NSAutomaticSpellingCorrectionEnabled",
    ],
  },
  {
    heading: "トラックパッド設定",
    keys: [
      "com.apple.AppleMultitouchTrackpad:Clicking",
      "com.apple.AppleMultitouchTrackpad:TrackpadThreeFingerDrag",
      "NSGlobalDomain:com.apple.trackpad.scaling",
    ],
  },
  {
    heading: "スクリーンショット設定",
    keys: [
      "com.apple.screencapture:type",
      "com.apple.screencapture:disable-shadow",
      "com.apple.screencapture:location",
    ],
  },
  {
    heading: "システム全般",
    keys: [
      "NSGlobalDomain:NSAutomaticWindowAnimationsEnabled",
      "NSGlobalDomain:AppleShowScrollBars",
      "com.apple.desktopservices:DSDontWriteNetworkStores",
      "com.apple.CrashReporter:DialogType",
    ],
  },
  {
    heading: "アクセシビリティ設定",
    keys: ["com.apple.universalaccess:showWindowTitlebarIcons"],
  },
  {
    heading: "Safari設定",
    keys: ["com.apple.Safari:IncludeDevelopMenu", "com.apple.Safari:ShowFullURLInSmartSearchField"],
  },
];

// ---------------------------------------------------------------------------
// Main runner
// ---------------------------------------------------------------------------

export async function runAllChecks(reader: DefaultsReader = defaultsReader): Promise<number> {
  console.log("=== macOS設定のカスタマイズ箇所チェック ===");
  console.log("");

  // Build a quick lookup map by "domain:key"
  const checkMap = new Map<string, DefaultsCheck>();
  for (const check of CHECKS) {
    checkMap.set(`${check.domain}:${check.key}`, check);
  }

  let hasCustomization = false;

  for (const section of SECTIONS) {
    console.log(`## ${section.heading}`);

    for (const compositeKey of section.keys) {
      const check = checkMap.get(compositeKey);
      if (!check) continue;

      const result = await checkDefault(check, reader);

      if (check.matchMode === "special") {
        // universalaccess showWindowTitlebarIcons: may be unreadable on Sequoia+
        if (
          result.error ||
          (!result.matches && (result.current === "" || result.current === undefined))
        ) {
          console.log(
            "⚠ ウインドウタイトルアイコン設定: 読み取り不可（macOS Sequoia以降は権限制限あり）",
          );
          console.log("  → システム設定 > アクセシビリティ > ディスプレイ で手動確認してください");
        } else if (result.matches) {
          const desc = buildDescription(check, result.current ?? "");
          const cmd = buildWriteCommand(check, result.current ?? "");
          console.log(`✓ ${desc}`);
          console.log(`  ${cmd}`);
          hasCustomization = true;
        }
        continue;
      }

      if (result.matches) {
        const desc = buildDescription(check, result.current ?? "");
        const cmd = buildWriteCommand(check, result.current ?? "");
        console.log(`✓ ${desc}`);
        console.log(`  ${cmd}`);
        hasCustomization = true;
      }
    }

    console.log("");
  }

  console.log("=== チェック完了 ===");

  if (!hasCustomization) {
    console.log("✓ デフォルトから変更されている一般的な設定は見つかりませんでした。");
  } else {
    console.log("");
    console.log("💡 上記のコマンドをスクリプトに保存して使用できます。");
  }

  return hasCustomization ? 1 : 0;
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

export async function main(): Promise<number> {
  return runAllChecks();
}

if (import.meta.main) {
  const exitCode = await main();
  process.exit(exitCode);
}
