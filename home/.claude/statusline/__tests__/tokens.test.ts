#!/usr/bin/env bun

// Tests for tokens.ts - Token calculation functions
import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { writeFileSync, unlinkSync, mkdtempSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

// Mock data types
interface TranscriptEntry {
	type: "user" | "assistant";
	message?: {
		usage?: {
			input_tokens?: number;
			output_tokens?: number;
			cache_creation_input_tokens?: number;
			cache_read_input_tokens?: number;
		};
	};
}

interface HookInput {
	session_id?: string;
	transcript_path?: string;
	context_window?: {
		context_window_size?: number;
		total_input_tokens?: number;
		total_output_tokens?: number;
		current_usage?: {
			input_tokens?: number;
			output_tokens?: number;
			cache_creation_input_tokens?: number;
			cache_read_input_tokens?: number;
		};
	};
}

// We need to dynamically import the modules to test them
let tokensModule: any;

beforeEach(async () => {
	// Dynamic import to get fresh module state
	tokensModule = await import("../tokens.ts");
});

// ============================================================================
// calculateTokensFromTranscript Tests (via getContextTokens)
// ============================================================================

describe("calculateTokensFromTranscript (conversation-based)", () => {
	let tmpDir: string;
	let transcriptPath: string;

	beforeEach(() => {
		// Create temporary directory for test files
		tmpDir = mkdtempSync(join(tmpdir(), "statusline-test-"));
		transcriptPath = join(tmpDir, "transcript.jsonl");
	});

	afterEach(() => {
		// Clean up temporary files
		try {
			unlinkSync(transcriptPath);
		} catch {
			// Ignore errors if file doesn't exist
		}
	});

	it("should calculate tokens from single assistant entry", async () => {
		// Single turn: user + assistant
		const transcript: TranscriptEntry[] = [
			{ type: "user" },
			{
				type: "assistant",
				message: {
					usage: {
						input_tokens: 1000,
						output_tokens: 500,
						cache_creation_input_tokens: 100,
						cache_read_input_tokens: 200,
					},
				},
			},
		];

		writeFileSync(transcriptPath, transcript.map((e) => JSON.stringify(e)).join("\n"));

		const hookInput: HookInput = {
			session_id: "test",
			transcript_path: transcriptPath,
			context_window: { context_window_size: 200000 },
		};

		const result = await tokensModule.getContextTokens(hookInput);

		// Expected: 1000 + 500 + 100 + 200 = 1800
		expect(result.tokens).toBe(1800);
	});

	it("should sum all assistant entries across multiple turns", async () => {
		// Multiple turns: user + assistant + user + assistant
		const transcript: TranscriptEntry[] = [
			{ type: "user" },
			{
				type: "assistant",
				message: {
					usage: {
						input_tokens: 1000,
						output_tokens: 500,
					},
				},
			},
			{ type: "user" },
			{
				type: "assistant",
				message: {
					usage: {
						input_tokens: 2000,
						output_tokens: 800,
					},
				},
			},
		];

		writeFileSync(transcriptPath, transcript.map((e) => JSON.stringify(e)).join("\n"));

		const hookInput: HookInput = {
			session_id: "test",
			transcript_path: transcriptPath,
			context_window: { context_window_size: 200000 },
		};

		const result = await tokensModule.getContextTokens(hookInput);

		// Expected: (1000 + 500) + (2000 + 800) = 4300
		expect(result.tokens).toBe(4300);
	});

	it("should handle cache tokens in multiple turns", async () => {
		const transcript: TranscriptEntry[] = [
			{ type: "user" },
			{
				type: "assistant",
				message: {
					usage: {
						input_tokens: 1000,
						output_tokens: 500,
						cache_creation_input_tokens: 100,
						cache_read_input_tokens: 0,
					},
				},
			},
			{ type: "user" },
			{
				type: "assistant",
				message: {
					usage: {
						input_tokens: 800,
						output_tokens: 400,
						cache_creation_input_tokens: 0,
						cache_read_input_tokens: 300,
					},
				},
			},
		];

		writeFileSync(transcriptPath, transcript.map((e) => JSON.stringify(e)).join("\n"));

		const hookInput: HookInput = {
			session_id: "test",
			transcript_path: transcriptPath,
			context_window: { context_window_size: 200000 },
		};

		const result = await tokensModule.getContextTokens(hookInput);

		// Expected: (1000 + 500 + 100) + (800 + 400 + 300) = 3100
		expect(result.tokens).toBe(3100);
	});

	it("should return 0 for empty transcript", async () => {
		writeFileSync(transcriptPath, "");

		const hookInput: HookInput = {
			session_id: "test",
			transcript_path: transcriptPath,
			context_window: { context_window_size: 200000 },
		};

		const result = await tokensModule.getContextTokens(hookInput);

		expect(result.tokens).toBe(0);
	});

	it("should handle transcript with only user entries", async () => {
		const transcript: TranscriptEntry[] = [{ type: "user" }, { type: "user" }];

		writeFileSync(transcriptPath, transcript.map((e) => JSON.stringify(e)).join("\n"));

		const hookInput: HookInput = {
			session_id: "test",
			transcript_path: transcriptPath,
			context_window: { context_window_size: 200000 },
		};

		const result = await tokensModule.getContextTokens(hookInput);

		expect(result.tokens).toBe(0);
	});

	it("should skip invalid JSON lines", async () => {
		const lines = [
			JSON.stringify({ type: "user" }),
			JSON.stringify({
				type: "assistant",
				message: { usage: { input_tokens: 1000, output_tokens: 500 } },
			}),
			"INVALID JSON LINE",
			JSON.stringify({
				type: "assistant",
				message: { usage: { input_tokens: 2000, output_tokens: 800 } },
			}),
		];

		writeFileSync(transcriptPath, lines.join("\n"));

		const hookInput: HookInput = {
			session_id: "test",
			transcript_path: transcriptPath,
			context_window: { context_window_size: 200000 },
		};

		const result = await tokensModule.getContextTokens(hookInput);

		// Should skip invalid line and sum valid entries
		expect(result.tokens).toBe(4300);
	});
});

// ============================================================================
// getContextTokens Priority Tests
// ============================================================================

describe("getContextTokens priority order", () => {
	let tmpDir: string;
	let transcriptPath: string;

	beforeEach(() => {
		tmpDir = mkdtempSync(join(tmpdir(), "statusline-test-"));
		transcriptPath = join(tmpDir, "transcript.jsonl");
	});

	afterEach(() => {
		try {
			unlinkSync(transcriptPath);
		} catch {
			// Ignore
		}
	});

	it("should prioritize transcript over total_input_tokens/total_output_tokens", async () => {
		const transcript: TranscriptEntry[] = [
			{ type: "user" },
			{
				type: "assistant",
				message: {
					usage: {
						input_tokens: 1000,
						output_tokens: 500,
					},
				},
			},
		];

		writeFileSync(transcriptPath, transcript.map((e) => JSON.stringify(e)).join("\n"));

		const hookInput: HookInput = {
			session_id: "test",
			transcript_path: transcriptPath,
			context_window: {
				context_window_size: 200000,
				total_input_tokens: 50000, // Session cumulative (should be ignored)
				total_output_tokens: 30000, // Session cumulative (should be ignored)
			},
		};

		const result = await tokensModule.getContextTokens(hookInput);

		// Should use transcript (1500), not total tokens (80000)
		expect(result.tokens).toBe(1500);
	});

	it("should use current_usage when transcript is not available", async () => {
		const hookInput: HookInput = {
			context_window: {
				context_window_size: 200000,
				current_usage: {
					input_tokens: 1000,
					output_tokens: 500,
					cache_creation_input_tokens: 100,
					cache_read_input_tokens: 200,
				},
			},
		};

		const result = await tokensModule.getContextTokens(hookInput);

		// Should use current_usage: 1000 + 500 + 100 + 200 = 1800
		expect(result.tokens).toBe(1800);
	});

	it("should fall back to total_input_tokens/total_output_tokens when transcript and current_usage are unavailable", async () => {
		const hookInput: HookInput = {
			context_window: {
				context_window_size: 200000,
				total_input_tokens: 50000,
				total_output_tokens: 30000,
			},
		};

		const result = await tokensModule.getContextTokens(hookInput);

		// Should use total tokens: 50000 + 30000 = 80000
		expect(result.tokens).toBe(80000);
	});
});

// ============================================================================
// Current Usage Priority Tests (T: display)
// ============================================================================

describe("getContextTokens current_usage priority for T: display", () => {
	let tmpDir: string;
	let transcriptPath: string;

	beforeEach(() => {
		tmpDir = mkdtempSync(join(tmpdir(), "statusline-test-"));
		transcriptPath = join(tmpDir, "transcript.jsonl");
	});

	afterEach(() => {
		try {
			unlinkSync(transcriptPath);
		} catch {
			// Ignore
		}
	});

	it("should prioritize current_usage for T: when both current_usage and transcript exist", async () => {
		// Transcript has different values
		const transcript: TranscriptEntry[] = [
			{ type: "user" },
			{
				type: "assistant",
				message: {
					usage: {
						input_tokens: 5000,
						output_tokens: 3000,
					},
				},
			},
		];

		writeFileSync(transcriptPath, transcript.map((e) => JSON.stringify(e)).join("\n"));

		const hookInput: HookInput = {
			session_id: "test",
			transcript_path: transcriptPath,
			context_window: {
				context_window_size: 200000,
				current_usage: {
					input_tokens: 1000,
					output_tokens: 500,
					cache_creation_input_tokens: 100,
					cache_read_input_tokens: 200,
				},
			},
		};

		const result = await tokensModule.getContextTokens(hookInput);

		// T: should use current_usage: (1000 + 100 + 200) + 500 = 1800
		// Note: output_tokens included as forward-looking estimate for next turn's context
		expect(result.tokens).toBe(1800);
		expect(result.percentage).toBe(1); // 1800/200000 ≈ 1%
	});

	it("should use transcript for IO: when both current_usage and transcript exist", async () => {
		// Transcript has cumulative session values
		const transcript: TranscriptEntry[] = [
			{ type: "user" },
			{
				type: "assistant",
				message: {
					usage: {
						input_tokens: 5000,
						output_tokens: 3000,
						cache_creation_input_tokens: 500,
					},
				},
			},
		];

		writeFileSync(transcriptPath, transcript.map((e) => JSON.stringify(e)).join("\n"));

		const hookInput: HookInput = {
			session_id: "test",
			transcript_path: transcriptPath,
			context_window: {
				context_window_size: 200000,
				current_usage: {
					input_tokens: 1000,
					output_tokens: 500,
					cache_creation_input_tokens: 100,
					cache_read_input_tokens: 200,
				},
			},
		};

		const result = await tokensModule.getContextTokens(hookInput);

		// IO: should use transcript cumulative values
		// inputTokens: 5000 + 500 = 5500
		// outputTokens: 3000
		expect(result.inputTokens).toBe(5500);
		expect(result.outputTokens).toBe(3000);
	});

	it("should use current_usage for both T: and IO: when transcript is unavailable", async () => {
		const hookInput: HookInput = {
			context_window: {
				context_window_size: 200000,
				current_usage: {
					input_tokens: 1000,
					output_tokens: 500,
					cache_creation_input_tokens: 100,
					cache_read_input_tokens: 200,
				},
			},
		};

		const result = await tokensModule.getContextTokens(hookInput);

		// T: from current_usage
		expect(result.tokens).toBe(1800); // (1000 + 100 + 200) + 500

		// IO: also from current_usage (no transcript fallback)
		expect(result.inputTokens).toBe(1300); // 1000 + 100 + 200
		expect(result.outputTokens).toBe(500);
	});

	it("should maintain transcript fallback when current_usage is unavailable", async () => {
		const transcript: TranscriptEntry[] = [
			{ type: "user" },
			{
				type: "assistant",
				message: {
					usage: {
						input_tokens: 1000,
						output_tokens: 500,
					},
				},
			},
		];

		writeFileSync(transcriptPath, transcript.map((e) => JSON.stringify(e)).join("\n"));

		const hookInput: HookInput = {
			session_id: "test",
			transcript_path: transcriptPath,
			context_window: { context_window_size: 200000 },
		};

		const result = await tokensModule.getContextTokens(hookInput);

		// Should fall back to transcript for all values
		expect(result.tokens).toBe(1500);
		expect(result.inputTokens).toBe(1000);
		expect(result.outputTokens).toBe(500);
	});
});

// ============================================================================
// Input/Output Token Tests
// ============================================================================

describe("getContextTokens I/O tokens", () => {
	let tmpDir: string;
	let transcriptPath: string;

	beforeEach(() => {
		tmpDir = mkdtempSync(join(tmpdir(), "statusline-test-"));
		transcriptPath = join(tmpDir, "transcript.jsonl");
	});

	afterEach(() => {
		try {
			unlinkSync(transcriptPath);
		} catch {
			// Ignore
		}
	});

	it("should return correct inputTokens/outputTokens when using transcript", async () => {
		const transcript: TranscriptEntry[] = [
			{ type: "user" },
			{
				type: "assistant",
				message: {
					usage: {
						input_tokens: 1000,
						output_tokens: 500,
						cache_creation_input_tokens: 100,
						cache_read_input_tokens: 200,
					},
				},
			},
		];

		writeFileSync(transcriptPath, transcript.map((e) => JSON.stringify(e)).join("\n"));

		const hookInput: HookInput = {
			session_id: "test",
			transcript_path: transcriptPath,
			context_window: { context_window_size: 200000 },
		};

		const result = await tokensModule.getContextTokens(hookInput);

		// Input tokens: input_tokens + cache_creation_input_tokens + cache_read_input_tokens
		// 1000 + 100 + 200 = 1300
		expect(result.inputTokens).toBe(1300);
		// Output tokens: output_tokens only
		expect(result.outputTokens).toBe(500);
		// Total: 1300 + 500 = 1800
		expect(result.tokens).toBe(1800);
	});

	it("should sum I/O tokens across multiple assistant entries", async () => {
		const transcript: TranscriptEntry[] = [
			{ type: "user" },
			{
				type: "assistant",
				message: {
					usage: {
						input_tokens: 1000,
						output_tokens: 500,
						cache_creation_input_tokens: 100,
					},
				},
			},
			{ type: "user" },
			{
				type: "assistant",
				message: {
					usage: {
						input_tokens: 2000,
						output_tokens: 800,
						cache_read_input_tokens: 300,
					},
				},
			},
		];

		writeFileSync(transcriptPath, transcript.map((e) => JSON.stringify(e)).join("\n"));

		const hookInput: HookInput = {
			session_id: "test",
			transcript_path: transcriptPath,
			context_window: { context_window_size: 200000 },
		};

		const result = await tokensModule.getContextTokens(hookInput);

		// Turn 1 input: 1000 + 100 = 1100
		// Turn 2 input: 2000 + 300 = 2300
		// Total input: 3400
		expect(result.inputTokens).toBe(3400);
		// Turn 1 output: 500
		// Turn 2 output: 800
		// Total output: 1300
		expect(result.outputTokens).toBe(1300);
		// Total: 3400 + 1300 = 4700
		expect(result.tokens).toBe(4700);
	});

	it("should provide inputTokens/outputTokens when using total tokens", async () => {
		const hookInput: HookInput = {
			context_window: {
				context_window_size: 200000,
				total_input_tokens: 50000,
				total_output_tokens: 30000,
			},
		};

		const result = await tokensModule.getContextTokens(hookInput);

		expect(result.inputTokens).toBe(50000);
		expect(result.outputTokens).toBe(30000);
	});
});

// ============================================================================
// /clear behavior Tests
// ============================================================================

describe("getContextTokens /clear behavior", () => {
	let tmpDir: string;
	let transcriptPath: string;

	beforeEach(() => {
		tmpDir = mkdtempSync(join(tmpdir(), "statusline-test-"));
		transcriptPath = join(tmpDir, "transcript.jsonl");
	});

	afterEach(() => {
		try {
			unlinkSync(transcriptPath);
		} catch {
			// Ignore
		}
	});

	it("should reset T: to 0 after /clear while maintaining IO: from transcript", async () => {
		// Simulate /clear: context_window exists, current_usage is null, transcript has cumulative data
		const transcript: TranscriptEntry[] = [
			{ type: "user" },
			{
				type: "assistant",
				message: {
					usage: {
						input_tokens: 5000,
						output_tokens: 3000,
						cache_creation_input_tokens: 500,
						cache_read_input_tokens: 200,
					},
				},
			},
		];

		writeFileSync(transcriptPath, transcript.map((e) => JSON.stringify(e)).join("\n"));

		const hookInput: HookInput = {
			session_id: "test",
			transcript_path: transcriptPath,
			context_window: {
				context_window_size: 200000,
				current_usage: null,
			},
		};

		const result = await tokensModule.getContextTokens(hookInput);

		// T: should be reset to 0 after /clear
		expect(result.tokens).toBe(0);
		expect(result.percentage).toBe(0);

		// IO: should maintain cumulative transcript values
		// inputTokens: 5000 + 500 + 200 = 5700
		// outputTokens: 3000
		expect(result.inputTokens).toBe(5700);
		expect(result.outputTokens).toBe(3000);
	});

	it("should return zeros when /clear executed with no transcript data", async () => {
		// Simulate /clear with empty transcript: context_window exists, current_usage is null, transcript is empty
		writeFileSync(transcriptPath, "");

		const hookInput: HookInput = {
			session_id: "test",
			transcript_path: transcriptPath,
			context_window: {
				context_window_size: 200000,
				current_usage: null,
			},
		};

		const result = await tokensModule.getContextTokens(hookInput);

		// All values should be 0
		expect(result.tokens).toBe(0);
		expect(result.percentage).toBe(0);
		expect(result.inputTokens).toBe(0);
		expect(result.outputTokens).toBe(0);
	});

	it("should fall back to transcript when context_window is completely absent (regression check)", async () => {
		// This confirms legacy behavior when context_window doesn't exist at all
		const transcript: TranscriptEntry[] = [
			{ type: "user" },
			{
				type: "assistant",
				message: {
					usage: {
						input_tokens: 1000,
						output_tokens: 500,
					},
				},
			},
		];

		writeFileSync(transcriptPath, transcript.map((e) => JSON.stringify(e)).join("\n"));

		const hookInput: HookInput = {
			session_id: "test",
			transcript_path: transcriptPath,
			// No context_window field at all
		};

		const result = await tokensModule.getContextTokens(hookInput);

		// Should fall back to transcript for all values
		expect(result.tokens).toBe(1500);
		expect(result.inputTokens).toBe(1000);
		expect(result.outputTokens).toBe(500);
		expect(result.percentage).toBe(1); // 1500/200000 = 0.75% → rounds to 1%
	});

	it("should maintain existing transcript fallback test compatibility", async () => {
		// This confirms the existing "should maintain transcript fallback" test still works
		const transcript: TranscriptEntry[] = [
			{ type: "user" },
			{
				type: "assistant",
				message: {
					usage: {
						input_tokens: 1000,
						output_tokens: 500,
					},
				},
			},
		];

		writeFileSync(transcriptPath, transcript.map((e) => JSON.stringify(e)).join("\n"));

		const hookInput: HookInput = {
			session_id: "test",
			transcript_path: transcriptPath,
			context_window: { context_window_size: 200000 },
		};

		const result = await tokensModule.getContextTokens(hookInput);

		// Should fall back to transcript for all values
		expect(result.tokens).toBe(1500);
		expect(result.inputTokens).toBe(1000);
		expect(result.outputTokens).toBe(500);
	});

	it("should handle transcript file read errors gracefully", async () => {
		// Test with non-existent transcript path
		const hookInput: HookInput = {
			session_id: "test",
			transcript_path: "/non/existent/path/transcript.jsonl",
			context_window: {
				context_window_size: 200000,
				current_usage: null,
			},
		};

		const result = await tokensModule.getContextTokens(hookInput);

		// Should return zeros when transcript cannot be read
		expect(result.tokens).toBe(0);
		expect(result.percentage).toBe(0);
		expect(result.inputTokens).toBe(0);
		expect(result.outputTokens).toBe(0);
	});
});
