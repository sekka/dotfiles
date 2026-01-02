import { debug } from "../debug.ts";

/**
 * Phase 4.4: シンプルなエラーログ出力
 */
export function logError(e: unknown, context: string): void {
	const errorMsg = e instanceof Error ? e.message : String(e);
	console.error(`[ERROR] ${context}: ${errorMsg}`);
}
