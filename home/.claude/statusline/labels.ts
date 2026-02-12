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

/**
 * 表示用ラベル（UIに表示される文字列）
 *
 * この値は将来変更される可能性がありますが、
 * LABEL_KEYS の内部IDは変更されません。
 */
export const LABELS = {
	PRJ: "PRJ:",
	BR: "BR:",
	SES: "SES:",
	TOK: "TOK:",
	IN: "IN:",
	OUT: "OUT:",
	CMP: "CMP:",
	LMT: "LMT:",
	DAY: "DAY:",
	WK: "WK:",
	WKS: "WKS:",
} as const;

/**
 * 内部ID → 表示ラベルのマッピング
 */
export const LABEL_KEY_TO_DISPLAY: Record<LabelKey, string> = {
	[LABEL_KEYS.PROJECT]: LABELS.PRJ,
	[LABEL_KEYS.BRANCH]: LABELS.BR,
	[LABEL_KEYS.SESSION]: LABELS.SES,
	[LABEL_KEYS.TOKEN]: LABELS.TOK,
	[LABEL_KEYS.IO]: "IO:",
	[LABEL_KEYS.INPUT]: LABELS.IN,
	[LABEL_KEYS.OUTPUT]: LABELS.OUT,
	[LABEL_KEYS.COMPACT]: LABELS.CMP,
	[LABEL_KEYS.LIMIT]: LABELS.LMT,
	[LABEL_KEYS.DAILY]: LABELS.DAY,
	[LABEL_KEYS.WEEKLY]: LABELS.WK,
	[LABEL_KEYS.WEEKLY_SONNET]: LABELS.WKS,
};

/** grayカラー適用済みのラベルを返す */
export function label(key: keyof typeof LABELS): string {
	return colors.gray(LABELS[key]);
}

/** 内部IDからgrayカラー適用済みのラベルを返す */
export function labelById(id: LabelKey): string {
	return colors.gray(LABEL_KEY_TO_DISPLAY[id]);
}
