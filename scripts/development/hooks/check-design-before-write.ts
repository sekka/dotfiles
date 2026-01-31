#!/usr/bin/env bun
/**
 * 重要変更前の相談提案 Hook
 * PreToolUse(Edit|Write) イベントで呼ばれ、設計ファイルへの変更を検出し、
 * /ask-peer での設計レビューを提案する。
 */

// ============================================
// 型定義
// ============================================

interface HookInput {
	hook_event_name: string;
	tool_name?: string;
	tool_input?: {
		file_path?: string;
		content?: string;
		old_string?: string;
		new_string?: string;
	};
}

interface HookOutput {
	approved: boolean;
	additionalContext?: string;
}

// ============================================
// 検出パターン
// ============================================

// パス検出パターン
const DESIGN_PATH_PATTERNS = [
	/DESIGN\.md$/i,
	/architecture\//i,
	/schema\//i,
	/core\//i,
	/config\//i,
	/types\//i,
];

// 内容検出パターン（クラス、インターフェース、型定義など）
const DESIGN_CONTENT_PATTERNS = [
	/^\s*class\s+\w+/m,
	/^\s*interface\s+\w+/m,
	/^\s*type\s+\w+\s*=/m,
	/^\s*@dataclass/m,
	/^\s*class\s+\w+\(Protocol\)/m, // Python Protocol
];

// ============================================
// 検出ロジック
// ============================================

function isDesignFile(filePath: string): boolean {
	return DESIGN_PATH_PATTERNS.some((pattern) => pattern.test(filePath));
}

function hasDesignContent(content: string): boolean {
	return DESIGN_CONTENT_PATTERNS.some((pattern) => pattern.test(content));
}

// ============================================
// Hook ハンドラー
// ============================================

async function handleHook(input: HookInput): Promise<HookOutput> {
	const filePath = input.tool_input?.file_path || "";
	const content = input.tool_input?.content || "";
	const newString = input.tool_input?.new_string || "";

	// ファイルパスが空なら何もしない
	if (!filePath) {
		return { approved: true };
	}

	// 設計ファイルへの変更を検出
	const isDesignPath = isDesignFile(filePath);
	const hasDesign = hasDesignContent(content) || hasDesignContent(newString);

	if (isDesignPath || hasDesign) {
		return {
			approved: true,
			additionalContext:
				"⚠️ 設計ファイルを変更しようとしています。/ask-peer で設計レビューを検討してください。",
		};
	}

	return { approved: true };
}

// ============================================
// メイン
// ============================================

async function main(): Promise<void> {
	try {
		const chunks: Buffer[] = [];
		for await (const chunk of process.stdin) {
			chunks.push(chunk);
		}
		const input: HookInput = JSON.parse(Buffer.concat(chunks).toString("utf-8"));
		const output = await handleHook(input);
		console.log(JSON.stringify(output));
		process.exit(0);
	} catch (error) {
		// エラー時も approved: true で続行
		console.log(JSON.stringify({ approved: true }));
		process.exit(0);
	}
}

if (import.meta.main) {
	main();
}
