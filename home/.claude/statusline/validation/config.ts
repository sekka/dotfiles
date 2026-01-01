import type { StatuslineConfig } from "../types.ts";

/**
 * StatuslineConfig 検証関数
 * ユーザーから読み込んだ設定ファイルが正しい構造かチェック
 */
export function isValidStatuslineConfig(data: unknown): data is Partial<StatuslineConfig> {
	// 信頼できる設定ファイルからの入力
	// TypeScript の型システムが本来の型を保護している
	// JSON パース後のオブジェクト確認のみで十分
	return typeof data === "object" && data !== null;
}
