/**
 * 基本検証モジュール（バリデーション段階1）
 *
 * 責務：
 * - コマンド入力の基本的な形式検証（型チェック、存在確認）
 * - バッファオーバーフロー対策（コマンド長の制限）
 * - バイナリ/エンコード済みコンテンツの検出（インジェクション対策）
 *
 * 入力：文字列型のシェルコマンド
 * 出力：ValidationResult | null（違反検出時のみ結果を返す）
 *
 * セキュリティ保証：
 * - 入力長2000文字以下に制限
 * - 制御文字やバイナリデータを検出・ブロック
 * - UTF-8以外のエンコードされたペイロードを検出
 */

import type { ValidationResult } from "../types";

/**
 * コマンド長を検証
 * @param command - 検証するコマンド
 * @returns 検証結果（制限以内ならnull、超過ならviolation）
 */
export function validateLength(command: string): ValidationResult | null {
	if (command.length > 2000) {
		return {
			isValid: false,
			severity: "MEDIUM",
			violations: ["Command too long (potential buffer overflow)"],
			sanitizedCommand: command,
		};
	}
	return null;
}

/**
 * バイナリまたはエンコード済みコンテンツを検出
 * @param command - 検証するコマンド
 * @returns 検証結果（バイナリ検出ならviolation、平文ならnull）
 */
export function detectBinaryContent(command: string): ValidationResult | null {
	if (/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\xFF]/.test(command)) {
		return {
			isValid: false,
			severity: "HIGH",
			violations: ["Binary or encoded content detected"],
			sanitizedCommand: command,
		};
	}
	return null;
}

/**
 * 基本的な形式検証（型チェック、存在チェック）
 * @param command - 検証するコマンド
 * @returns 検証結果（無効ならviolation、有効ならnull）
 */
export function validateBasicFormat(command: string): ValidationResult | null {
	if (!command || typeof command !== "string") {
		return {
			isValid: false,
			severity: "LOW",
			violations: ["Invalid command format"],
			sanitizedCommand: command,
		};
	}
	return null;
}

/**
 * 一連の基本検証を実行
 * @param command - 検証するコマンド
 * @returns 最初に見つかった違反、またはnull（全て合格）
 */
export function runBasicValidation(command: string): ValidationResult | null {
	// 順序が重要：存在チェック → 長さチェック → エンコード検出
	let result = validateBasicFormat(command);
	if (result) return result;

	result = validateLength(command);
	if (result) return result;

	result = detectBinaryContent(command);
	if (result) return result;

	return null;
}
