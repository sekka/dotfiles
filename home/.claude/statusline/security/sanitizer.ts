/**
 * Phase 3.4: sanitizeForLogging() の型混合解決
 * デバッグログ用のセンシティブ情報をマスキングする関数
 */
export function sanitizeForLogging(obj: unknown): unknown {
	const sensitiveKeys = new Set([
		"token",
		"accesstoken",
		"password",
		"secret",
		"refreshtoken",
		"credentials",
	]);

	// Phase 3.4: 配列を明示的に処理
	if (Array.isArray(obj)) {
		return obj.map((item) => sanitizeForLogging(item));
	}

	// Phase 3.4: オブジェクトを処理
	if (typeof obj === "object" && obj !== null) {
		const sanitized: Record<string, unknown> = {};
		for (const [key, value] of Object.entries(obj)) {
			if (sensitiveKeys.has(key.toLowerCase())) {
				sanitized[key] = "***REDACTED***";
			} else if (value !== null && typeof value === "object") {
				sanitized[key] = sanitizeForLogging(value);
			} else {
				sanitized[key] = value;
			}
		}
		return sanitized;
	}

	return obj;
}
