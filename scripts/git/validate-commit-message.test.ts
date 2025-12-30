import { describe, it, expect } from "bun:test";
import {
	validateCommitMessage,
	hasCommandInjectionPattern,
	hasAISignature,
} from "./validate-commit-message";

describe("validateCommitMessage - 基本機能", () => {
	// 正常系
	it("should allow simple commit message", () => {
		const result = validateCommitMessage("fix: Bug fix");
		expect(result.valid).toBe(true);
		expect(result.errors).toHaveLength(0);
	});

	it("should allow multi-line commit message", () => {
		const result = validateCommitMessage(
			"feat: Add new feature\n\nDetailed description of the change",
		);
		expect(result.valid).toBe(true);
	});

	// CWE-78: コマンド検出
	it("should detect echo command after newline", () => {
		const result = validateCommitMessage("Fix bug\necho malicious");
		expect(result.valid).toBe(false);
	});

	it("should detect eval command", () => {
		const result = validateCommitMessage("Update\neval $(cmd)");
		expect(result.valid).toBe(false);
	});

	it("should detect command substitution with $(...)", () => {
		const result = validateCommitMessage("Fix\nSomething $(whoami)");
		expect(result.valid).toBe(false);
	});

	it("should detect command substitution with backticks", () => {
		const result = validateCommitMessage("Add\nResult: `whoami`");
		expect(result.valid).toBe(false);
	});

	it("should detect command chaining with semicolon", () => {
		const result = validateCommitMessage("Fix\necho test; rm -rf /");
		expect(result.valid).toBe(false);
	});

	it("should detect command chaining with AND operator", () => {
		const result = validateCommitMessage("Update\n&& bash -c cmd");
		expect(result.valid).toBe(false);
	});

	// AI署名検出
	it("should detect Claude Code signature", () => {
		const result = validateCommitMessage("feat: Feature\n\n🤖 Generated with Claude Code");
		expect(result.valid).toBe(false);
		expect(result.errors.some((e) => e.includes("AI署名"))).toBe(true);
	});

	it("should detect Co-Authored-By signature", () => {
		const result = validateCommitMessage(
			"fix: Bug\n\nCo-Authored-By: Claude <noreply@anthropic.com>",
		);
		expect(result.valid).toBe(false);
	});

	// メッセージサイズ
	it("should reject very long messages", () => {
		const longMessage = "a".repeat(11000);
		const result = validateCommitMessage(longMessage);
		expect(result.valid).toBe(false);
		expect(result.errors.some((e) => e.includes("長すぎます"))).toBe(true);
	});

	it("should allow normal size messages", () => {
		const msg = "feat: Feature\n\n" + "a".repeat(5000);
		const result = validateCommitMessage(msg);
		expect(result.valid).toBe(true);
	});

	// 第一行の長さ
	it("should reject first line over 72 characters", () => {
		const result = validateCommitMessage(
			"This is a very long commit message title that exceeds the recommended 72 char limit",
		);
		expect(result.valid).toBe(false);
		expect(result.errors.some((e) => e.includes("タイトルが長すぎます"))).toBe(true);
	});

	// エッジケース
	it("should handle empty message", () => {
		const result = validateCommitMessage("");
		expect(result.valid).toBe(false);
		expect(result.errors.some((e) => e.includes("空"))).toBe(true);
	});

	it("should allow keyword in first line", () => {
		const result = validateCommitMessage("fix: Update eval function description");
		expect(result.valid).toBe(true);
	});

	// 新しいテストケース：コメント行と空行のスキップ
	it("should skip comment lines when finding first line", () => {
		const message = "# This is a comment\n# Another comment\nfix: actual title";
		const result = validateCommitMessage(message);
		expect(result.valid).toBe(true);
	});

	it("should skip empty lines when finding first line", () => {
		const message = "\n\nfix: title after empty lines";
		const result = validateCommitMessage(message);
		expect(result.valid).toBe(true);
	});

	it("should handle mixed empty lines and comments", () => {
		const message = "\n# Comment\n\nfix: real title";
		const result = validateCommitMessage(message);
		expect(result.valid).toBe(true);
	});

	// 絵文字テスト
	it("should count emoji as single character", () => {
		const titleWithEmoji = "fix: " + "🐛".repeat(35); // 5 + 35 = 40文字
		const result = validateCommitMessage(titleWithEmoji);
		expect(result.valid).toBe(true); // 40文字 < 72文字
	});

	it("should reject title with too many emojis", () => {
		const titleWithEmoji = "fix: " + "🐛".repeat(70); // 5 + 70 = 75文字
		const result = validateCommitMessage(titleWithEmoji);
		expect(result.valid).toBe(false); // 75文字 > 72文字制限
	});

	// 長すぎるタイトルのエラーメッセージテスト
	it("should provide helpful error message for too long title", () => {
		const longTitle = "fix: " + "a".repeat(70); // 74文字
		const result = validateCommitMessage(longTitle);
		expect(result.valid).toBe(false);
		expect(result.errors[0]).toContain("削減が必要");
		expect(result.errors[0]).toContain("2文字"); // 74 - 72 = 2
	});

	it("should show title preview in error message", () => {
		const longTitle = "fix: " + "long".repeat(30); // かなり長いタイトル
		const result = validateCommitMessage(longTitle);
		expect(result.valid).toBe(false);
		expect(result.errors[0]).toContain("タイトル:");
	});
});

describe("hasCommandInjectionPattern", () => {
	it("should detect shell commands", () => {
		expect(hasCommandInjectionPattern("Fix\necho test")).toBe(true);
	});

	it("should detect command substitution", () => {
		expect(hasCommandInjectionPattern("Fix\n$(whoami)")).toBe(true);
	});

	it("should return false for safe messages", () => {
		expect(hasCommandInjectionPattern("feat: Normal message")).toBe(false);
	});
});

describe("hasAISignature", () => {
	it("should detect Claude Code signature", () => {
		expect(hasAISignature("🤖 Generated with Claude Code")).toBe(true);
	});

	it("should detect Co-Authored-By signature", () => {
		expect(hasAISignature("Co-Authored-By: Claude")).toBe(true);
	});

	it("should return false for normal messages", () => {
		expect(hasAISignature("feat: Normal feature")).toBe(false);
	});
});
