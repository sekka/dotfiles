// ============================================================================
// Phase 3.1: Security Module (Extracted from utils.ts)
// ============================================================================

import { realpath } from "fs/promises";
import { debug } from "./logging.ts";

// ============================================================================
// Path Traversal Protection
// ============================================================================

/**
 * ファイルとディレクトリのセキュリティ検証ユーティリティ
 *
 * パストトラバーサル攻撃、シンボリックリンク攻撃、ファイルサイズ制限、
 * バイナリファイル検出などのセキュリティ検証を提供する。
 */
export class SecurityValidator {
	/**
	 * パストトラバーサル攻撃とシンボリックリンク攻撃を防ぐためにファイルパスを検証する
	 *
	 * 指定されたファイルパスが基本ディレクトリ内に存在し、
	 * パストトラバーサル攻撃やシンボリックリンク攻撃の対象でないことを確認する。
	 * 実パスの解決により、相対パスやシンボリックリンクを追跡してチェックする。
	 *
	 * @param {string} baseDir - 許可されたベースディレクトリのパス
	 * @param {string} filePath - 検証対象のファイルパス
	 * @returns {Promise<{ isValid: boolean; resolvedPath?: string }>} 検証結果と実パス
	 *
	 * @example
	 * const result = await SecurityValidator.validatePath("/tmp", "/tmp/file.txt");
	 * if (result.isValid) {
	 *   // ファイルパスは安全
	 *   console.log(result.resolvedPath);
	 * }
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
	 * ファイルサイズがMaxSize制限以下かどうかを検証する
	 *
	 * @param {number} size - 検証するファイルサイズ（バイト）
	 * @param {number} [maxSize=10485760] - 最大許可サイズ（デフォルト：10MB）
	 * @returns {boolean} ファイルサイズが制限以下であれば true
	 *
	 * @example
	 * const valid = SecurityValidator.validateFileSize(1024 * 1024); // 1MB
	 * // => true
	 * const invalid = SecurityValidator.validateFileSize(20 * 1024 * 1024); // 20MB
	 * // => false
	 */
	static validateFileSize(size: number, maxSize: number = 10 * 1024 * 1024): boolean {
		return size <= maxSize;
	}

	/**
	 * ファイル名がバイナリファイルの拡張子を持つかどうかを判定する
	 *
	 * テキストファイルの処理を避けるため、画像、ビデオ、圧縮ファイル、
	 * 実行可能ファイルなどの既知のバイナリ拡張子をチェックする。
	 * チェックは大文字小文字を区別しない。
	 *
	 * @param {string} filePath - チェック対象のファイルパス
	 * @returns {boolean} バイナリファイル拡張子であれば true
	 *
	 * @example
	 * SecurityValidator.isBinaryExtension("image.png"); // => true
	 * SecurityValidator.isBinaryExtension("script.js"); // => false
	 * SecurityValidator.isBinaryExtension("archive.zip"); // => true
	 */
	static isBinaryExtension(filePath: string): boolean {
		const BINARY_EXTENSIONS = new Set([
			".png",
			".jpg",
			".jpeg",
			".gif",
			".bmp",
			".ico",
			".mp4",
			".mov",
			".avi",
			".mkv",
			".zip",
			".tar",
			".gz",
			".7z",
			".bin",
			".so",
			".dylib",
			".dll",
			".pdf",
			".doc",
			".docx",
		]);

		const ext = filePath.toLowerCase();
		const dotIndex = ext.lastIndexOf(".");
		if (dotIndex === -1) return false;

		return BINARY_EXTENSIONS.has(ext.substring(dotIndex));
	}
}

// ============================================================================
// Unified Error Handling
// ============================================================================

/**
 * エラーが発生したコンテキストを示すカテゴリ
 *
 * @enum {string}
 * @readonly
 * @property {string} PERMISSION_DENIED - ファイルアクセス権限がない（EACCES）
 * @property {string} NOT_FOUND - ファイルまたはリソースが見つからない（ENOENT）
 * @property {string} TIMEOUT - 処理のタイムアウト
 * @property {string} JSON_PARSE - JSON パース失敗
 * @property {string} NETWORK - ネットワーク通信エラー
 * @property {string} UNKNOWN - 不明またはその他のエラー
 */
export enum ErrorCategory {
	PERMISSION_DENIED = "PERMISSION_DENIED",
	NOT_FOUND = "NOT_FOUND",
	TIMEOUT = "TIMEOUT",
	JSON_PARSE = "JSON_PARSE",
	NETWORK = "NETWORK",
	UNKNOWN = "UNKNOWN",
}

/**
 * 任意のエラーを ErrorCategory に分類する
 *
 * Node.js エラーコード（code プロパティ）を優先して判定し、
 * なければエラーメッセージパターンマッチングをフォールバックとして使用する。
 *
 * @param {unknown} e - 分類対象のエラー
 * @returns {ErrorCategory} 分類されたエラーカテゴリ
 *
 * @example
 * try {
 *   await fs.promises.readFile("/no/such/file");
 * } catch (error) {
 *   const category = categorizeError(error);
 *   // => ErrorCategory.NOT_FOUND
 * }
 */
export function categorizeError(e: unknown): ErrorCategory {
	const errorMsg = e instanceof Error ? e.message : String(e);
	const code = e instanceof Error ? (e as NodeJS.ErrnoException).code : undefined;

	// コードベースの判定を優先
	if (code === "EACCES") return ErrorCategory.PERMISSION_DENIED;
	if (code === "ENOENT") return ErrorCategory.NOT_FOUND;

	// メッセージベースのフォールバック
	if (errorMsg.includes("timeout") || errorMsg.includes("TimeoutError")) {
		return ErrorCategory.TIMEOUT;
	}
	if (errorMsg.includes("JSON") || errorMsg.includes("parse")) {
		return ErrorCategory.JSON_PARSE;
	}
	if (errorMsg.includes("fetch") || errorMsg.includes("Network")) {
		return ErrorCategory.NETWORK;
	}

	return ErrorCategory.UNKNOWN;
}

/**
 * エラーを分類してログ出力する
 *
 * エラーを ErrorCategory に分類し、カテゴリに応じて適切なログレベルで出力する。
 * コンテキスト情報を含めることで、エラーの発生箇所を特定しやすくする。
 *
 * @param {unknown} e - ログ出力するエラー
 * @param {string} context - エラーの発生コンテキスト（例：「API 呼び出し」「ファイル読み込み」）
 * @returns {void}
 *
 * @example
 * try {
 *   await fs.promises.readFile("/path/to/file");
 * } catch (error) {
 *   logCategorizedError(error, "設定ファイル読み込み");
 *   // 出力: [ERROR] 設定ファイル読み込み: File not found - ...
 * }
 */
export function logCategorizedError(e: unknown, context: string): void {
	const category = categorizeError(e);
	const errorMsg = e instanceof Error ? e.message : String(e);

	switch (category) {
		case ErrorCategory.PERMISSION_DENIED:
			console.error(`[ERROR] ${context}: Permission denied - ${errorMsg}`);
			break;
		case ErrorCategory.NOT_FOUND:
			debug(`${context}: File not found - ${errorMsg}`, "verbose");
			break;
		case ErrorCategory.TIMEOUT:
			console.error(`[ERROR] ${context}: Operation timed out - ${errorMsg}`);
			break;
		case ErrorCategory.JSON_PARSE:
			console.error(`[ERROR] ${context}: JSON parsing failed - ${errorMsg}`);
			break;
		case ErrorCategory.NETWORK:
			console.error(`[ERROR] ${context}: Network error - ${errorMsg}`);
			break;
		default:
			console.error(`[ERROR] ${context}: ${errorMsg}`);
	}
}
