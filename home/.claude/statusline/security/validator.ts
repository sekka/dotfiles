import { realpath } from "fs/promises";
import { debug } from "../debug.ts";
import { BINARY_EXTENSIONS } from "../constants.ts";

/**
 * Phase 4.1: Security Module
 * パストトラバーサル攻撃、ファイルサイズ制限、バイナリファイル判定
 */
export class SecurityValidator {
	/**
	 * パストトラバーサル攻撃を防ぐためにファイルパスを検証
	 */
	static async validatePath(
		baseDir: string,
		filePath: string,
	): Promise<{ isValid: boolean; resolvedPath?: string }> {
		try {
			const resolvedBase = await realpath(baseDir);
			const resolvedPath = await realpath(filePath);

			if (!resolvedPath.startsWith(resolvedBase)) {
				console.error(`[SECURITY] Path traversal attempt: ${filePath}`);
				return { isValid: false };
			}

			return { isValid: true, resolvedPath };
		} catch (e) {
			const errorMsg = e instanceof Error ? e.message : String(e);
			debug(`Path validation failed: ${errorMsg}`, "verbose");
			return { isValid: false };
		}
	}

	/**
	 * ファイルサイズ制限チェック
	 */
	static validateFileSize(size: number, maxSize: number = 10 * 1024 * 1024): boolean {
		return size <= maxSize;
	}

	/**
	 * バイナリファイル拡張子チェック
	 */
	static isBinaryExtension(filePath: string): boolean {
		const ext = filePath.toLowerCase();
		const dotIndex = ext.lastIndexOf(".");
		if (dotIndex === -1) return false;

		return BINARY_EXTENSIONS.has(ext.substring(dotIndex));
	}
}
