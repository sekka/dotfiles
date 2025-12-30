export interface HookInput {
	tool_name: string;
	tool_input: {
		command?: string;
	};
	session_id?: string;
}

export interface ValidationResult {
	isValid: boolean;
	severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
	violations: string[];
	sanitizedCommand: string;
}

export interface SecurityRules {
	CRITICAL_COMMANDS: string[];
	PRIVILEGE_COMMANDS: string[];
	NETWORK_COMMANDS: string[];
	SYSTEM_COMMANDS: string[];
	DANGEROUS_PATTERNS: RegExp[];
	PROTECTED_PATHS: string[];
	SAFE_EXECUTABLE_PATHS: string[];
	SAFE_RM_PATHS: string[];
}

export interface HookOutput {
	hookSpecificOutput: {
		hookEventName: string;
		permissionDecision: "allow" | "block" | "ask";
		permissionDecisionReason: string;
	};
}

/**
 * 安全なコマンド実行ビルダーの型
 * シェルインジェクション対策用のパラメータ化コマンド構築
 */
export interface SafeCommandBuilder {
	/** 実行するコマンド */
	command: string;

	/** コマンドの引数配列 */
	args: string[];

	/** シェルエスケープされた実行可能な文字列 */
	escaped: string;
}
