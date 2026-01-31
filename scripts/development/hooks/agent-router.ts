#!/usr/bin/env bun
/**
 * 自動エージェントルーティング Hook
 * UserPromptSubmit イベントで呼ばれ、ユーザープロンプトからキーワードを抽出し、
 * 適切なスキル/エージェントを提案する。
 */

// ============================================
// 型定義
// ============================================

interface HookInput {
	hook_event_name: string;
	user_message?: string;
}

interface HookOutput {
	approved: boolean;
	additionalContext?: string;
}

// ============================================
// ルーティングルール
// ============================================

interface RoutingRule {
	keywords: string[]; // トリガーキーワード（日本語・英語混在）
	suggestion: string; // 提案メッセージ
}

const ROUTING_RULES: RoutingRule[] = [
	{
		keywords: [
			"設計",
			"アーキテクチャ",
			"比較して",
			"どちらがいい",
			"design",
			"architecture",
			"compare",
			"which is better",
		],
		suggestion: "💡 設計判断が必要なタスクです。/ask-peer で外部相談を検討してください。",
	},
	{
		keywords: ["レビュー", "品質チェック", "review", "quality"],
		suggestion:
			"💡 コードレビューが必要です。/reviewing-parallel で包括的レビューを検討してください。",
	},
	{
		keywords: ["デバッグ", "エラー", "debug", "error", "バグ", "bug"],
		suggestion: "💡 デバッグが必要です。/debug スキルの使用を検討してください。",
	},
	{
		keywords: ["調べて", "ドキュメント", "research", "documentation", "リサーチ"],
		suggestion: "💡 調査が必要です。explore-docs エージェントの使用を検討してください。",
	},
	{
		keywords: ["リファクタ", "整理", "refactor", "simplify"],
		suggestion: "💡 リファクタリングが必要です。/refactor スキルの使用を検討してください。",
	},
];

// ============================================
// ルーティング判定
// ============================================

function detectRouting(message: string): string | null {
	const lowerMessage = message.toLowerCase();

	for (const rule of ROUTING_RULES) {
		for (const keyword of rule.keywords) {
			if (lowerMessage.includes(keyword.toLowerCase())) {
				return rule.suggestion;
			}
		}
	}

	return null;
}

// ============================================
// Hook ハンドラー
// ============================================

async function handleHook(input: HookInput): Promise<HookOutput> {
	const userMessage = input.user_message || "";

	// メッセージが空なら何もしない
	if (!userMessage.trim()) {
		return { approved: true };
	}

	// ルーティング判定
	const suggestion = detectRouting(userMessage);

	if (suggestion) {
		return {
			approved: true,
			additionalContext: suggestion,
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
		// エラー時も approved: true で続行（hookでClaude を止めない）
		console.log(JSON.stringify({ approved: true }));
		process.exit(0);
	}
}

if (import.meta.main) {
	main();
}
