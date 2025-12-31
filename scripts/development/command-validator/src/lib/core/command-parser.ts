/**
 * コマンドパース モジュール
 * コマンドチェーンの分割とパース
 */

/**
 * コマンドチェーンを分割
 * &&, ||, ; で区切られたコマンドを分割
 * クォートで囲まれた部分は分割対象外
 *
 * @param command - 分割するコマンドチェーン
 * @returns 分割されたコマンドの配列
 *
 * @example
 * splitCommandChain("echo hello && ls -la") // => ["echo hello", "ls -la"]
 * splitCommandChain("cat 'file.txt' && echo done") // => ["cat 'file.txt'", "echo done"]
 */
export function splitCommandChain(command: string): string[] {
	const commands: string[] = [];
	let current = "";
	let inQuotes = false;
	let quoteChar = "";

	for (let i = 0; i < command.length; i++) {
		const char = command[i];
		const nextChar = command[i + 1];

		if ((char === '"' || char === "'") && !inQuotes) {
			inQuotes = true;
			quoteChar = char;
			current += char;
		} else if (char === quoteChar && inQuotes) {
			inQuotes = false;
			quoteChar = "";
			current += char;
		} else if (inQuotes) {
			current += char;
		} else if (char === "&" && nextChar === "&") {
			commands.push(current.trim());
			current = "";
			i++;
		} else if (char === "|" && nextChar === "|") {
			commands.push(current.trim());
			current = "";
			i++;
		} else if (char === ";") {
			commands.push(current.trim());
			current = "";
		} else {
			current += char;
		}
	}

	if (current.trim()) {
		commands.push(current.trim());
	}

	return commands.filter((cmd) => cmd.length > 0);
}

/**
 * コマンドが特定のチェーンセパレータを含むかチェック
 * @param command - チェックするコマンド
 * @param separator - チェックするセパレータ（"&&", "||", ";", "all"）
 * @returns セパレータを含む場合true
 */
export function hasChainSeparator(
	command: string,
	separator: "&&" | "||" | ";" | "all" = "all",
): boolean {
	if (separator === "all") {
		return command.includes("&&") || command.includes("||") || command.includes(";");
	}
	return command.includes(separator);
}

/**
 * コマンドが && セパレータを含むかチェック
 * @param command - チェックするコマンド
 * @returns && を含む場合true
 */
export function hasAndOperator(command: string): boolean {
	return command.includes("&&");
}

/**
 * コマンドが || セパレータを含むかチェック
 * @param command - チェックするコマンド
 * @returns || を含む場合true
 */
export function hasOrOperator(command: string): boolean {
	return command.includes("||");
}

/**
 * コマンドが ; セパレータを含むかチェック
 * @param command - チェックするコマンド
 * @returns ; を含む場合true
 */
export function hasSemicolonOperator(command: string): boolean {
	return command.includes(";");
}

/**
 * セパレータの種類を判定して対応するチェーンコマンドを取得
 * @param command - チェックするコマンド
 * @returns チェーンコマンドがあれば配列、なければnull
 */
export function getChainedCommands(command: string): string[] | null {
	if (hasAndOperator(command) || hasOrOperator(command) || hasSemicolonOperator(command)) {
		return splitCommandChain(command);
	}
	return null;
}
