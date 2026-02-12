import { colors } from "./colors.ts";

/**
 * 内部ラベルID（設定ファイルで使用）
 *
 * 表示ラベルが変更されても、この内部IDは変更されないため、
 * lineBreakBefore などの設定が壊れません。
 */
export const LABEL_KEYS = {
	PROJECT: "project",
	BRANCH: "branch",
	SESSION: "session",
	TOKEN: "token",
	IO: "io",
	INPUT: "input",
	OUTPUT: "output",
	COMPACT: "compact",
	LIMIT: "limit",
	DAILY: "daily",
	WEEKLY: "weekly",
	WEEKLY_SONNET: "weekly_sonnet",
} as const;

export type LabelKey = typeof LABEL_KEYS[keyof typeof LABEL_KEYS];

/** grayカラー適用済みのラベルを返す */
export function label(key: string): string {
	return colors.gray(key + ":");
}
