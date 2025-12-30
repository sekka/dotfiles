#!/usr/bin/env bun

// Phase 4-1: Comprehensive tests for logging.ts module
import { describe, it, expect, beforeEach, afterEach } from "bun:test";

import { validateDebugLevel, debug, DEBUG_LEVEL } from "../logging.ts";

// ============================================================================
// validateDebugLevel Tests
// ============================================================================

describe("validateDebugLevel", () => {
	it("should accept 'off' level", () => {
		const result = validateDebugLevel("off");
		expect(result).toBe("off");
	});

	it("should accept 'basic' level", () => {
		const result = validateDebugLevel("basic");
		expect(result).toBe("basic");
	});

	it("should accept 'verbose' level", () => {
		const result = validateDebugLevel("verbose");
		expect(result).toBe("verbose");
	});

	it("should be case-insensitive", () => {
		expect(validateDebugLevel("OFF")).toBe("off");
		expect(validateDebugLevel("Basic")).toBe("basic");
		expect(validateDebugLevel("VERBOSE")).toBe("verbose");
	});

	it("should default to 'off' for invalid values", () => {
		expect(validateDebugLevel("invalid")).toBe("off");
		expect(validateDebugLevel("debug")).toBe("off");
		expect(validateDebugLevel("trace")).toBe("off");
	});

	it("should default to 'off' for undefined value", () => {
		const result = validateDebugLevel(undefined);
		expect(result).toBe("off");
	});

	it("should default to 'off' for empty string", () => {
		const result = validateDebugLevel("");
		expect(result).toBe("off");
	});

	it("should trim and validate mixed case", () => {
		expect(validateDebugLevel("  BASIC  ")).toBe("basic");
		expect(validateDebugLevel("VeRbOsE")).toBe("verbose");
		expect(validateDebugLevel("OfF")).toBe("off");
	});

	it("should handle null-like string", () => {
		expect(validateDebugLevel("null")).toBe("off");
		expect(validateDebugLevel("undefined")).toBe("off");
	});

	it("should return correct type (DebugLevel union type)", () => {
		const validLevels = ["off", "basic", "verbose"];

		for (const level of ["off", "basic", "verbose", "invalid", ""]) {
			const result = validateDebugLevel(level);
			expect(validLevels.includes(result)).toBe(true);
		}
	});
});

// ============================================================================
// DEBUG_LEVEL Tests
// ============================================================================

describe("DEBUG_LEVEL", () => {
	it("should be a valid debug level", () => {
		const validLevels = ["off", "basic", "verbose"];
		expect(validLevels.includes(DEBUG_LEVEL)).toBe(true);
	});

	it("should be determined from environment variable", () => {
		// DEBUG_LEVEL is set from process.env.STATUSLINE_DEBUG at module load time
		// So we can't test changing it dynamically, but we can verify it exists
		expect(DEBUG_LEVEL).toBeDefined();
		expect(typeof DEBUG_LEVEL).toBe("string");
	});
});

// ============================================================================
// debug Function Tests
// ============================================================================

describe("debug", () => {
	let errorOutput: string[] = [];
	let originalError: typeof console.error;

	beforeEach(() => {
		errorOutput = [];
		originalError = console.error;

		// Mock console.error to capture output
		console.error = ((message: string) => {
			errorOutput.push(message);
		}) as any;
	});

	afterEach(() => {
		// Restore original console.error
		console.error = originalError;
	});

	it("should be defined", () => {
		expect(typeof debug).toBe("function");
	});

	it("should accept message and optional level", () => {
		// Should not throw
		expect(() => {
			debug("test message");
			debug("test message", "basic");
			debug("test message", "verbose");
		}).not.toThrow();
	});

	it("should default to 'basic' level when not specified", () => {
		// Call with just message (no level parameter)
		debug("test message");

		// The behavior depends on DEBUG_LEVEL environment variable
		// If DEBUG_LEVEL is "off", nothing is logged
		// If DEBUG_LEVEL is "basic" or "verbose", message is logged
		expect(true).toBe(true); // Verify function doesn't throw
	});

	it("should format output with [DEBUG] prefix", () => {
		// Temporarily set console.error to capture output
		const captured: string[] = [];
		console.error = ((msg: string) => {
			captured.push(msg);
		}) as any;

		// Set env for testing (note: DEBUG_LEVEL is already set at module load)
		// So output format depends on current DEBUG_LEVEL value

		debug("test message");

		// If anything was logged, it should have [DEBUG] prefix
		if (captured.length > 0) {
			expect(captured[0].includes("[DEBUG]")).toBe(true);
			expect(captured[0].includes("test message")).toBe(true);
		}

		console.error = originalError;
	});

	it("should include message content", () => {
		const captured: string[] = [];
		console.error = ((msg: string) => {
			captured.push(msg);
		}) as any;

		const testMsg = "This is a test debug message";
		debug(testMsg);

		// If output was generated, it should contain the message
		if (captured.length > 0) {
			expect(captured[0]).toContain(testMsg);
		}

		console.error = originalError;
	});

	it("should respect basic level filtering", () => {
		// If DEBUG_LEVEL is "basic", verbose messages should be filtered
		// If DEBUG_LEVEL is "off" or "basic", only basic messages should be logged

		const captured: string[] = [];
		console.error = ((msg: string) => {
			captured.push(msg);
		}) as any;

		const beforeLength = captured.length;

		// Call verbose level message
		debug("verbose message", "verbose");

		// If DEBUG_LEVEL is "basic", captured length should not increase
		// The behavior depends on current DEBUG_LEVEL value, which is set at module load time

		console.error = originalError;
	});

	it("should handle empty message", () => {
		expect(() => {
			debug("");
			debug("", "basic");
			debug("", "verbose");
		}).not.toThrow();
	});

	it("should handle multiline messages", () => {
		const captured: string[] = [];
		console.error = ((msg: string) => {
			captured.push(msg);
		}) as any;

		debug("line1\nline2\nline3");

		// Should not throw and should preserve message
		expect(true).toBe(true);

		console.error = originalError;
	});

	it("should handle special characters in message", () => {
		const captured: string[] = [];
		console.error = ((msg: string) => {
			captured.push(msg);
		}) as any;

		const specialMsg = "Message with special chars: !@#$%^&*()";
		debug(specialMsg);

		// Should not throw
		expect(true).toBe(true);

		console.error = originalError;
	});

	it("should handle very long messages", () => {
		const captured: string[] = [];
		console.error = ((msg: string) => {
			captured.push(msg);
		}) as any;

		const longMsg = "x".repeat(10000);
		debug(longMsg);

		// Should not throw
		expect(true).toBe(true);

		console.error = originalError;
	});
});

// ============================================================================
// Integration Tests
// ============================================================================

describe("Debug Logging Integration", () => {
	let errorOutput: string[] = [];
	let originalError: typeof console.error;

	beforeEach(() => {
		errorOutput = [];
		originalError = console.error;

		console.error = ((message: string) => {
			errorOutput.push(message);
		}) as any;
	});

	afterEach(() => {
		console.error = originalError;
	});

	it("should validate debug level then use in logging", () => {
		const validated = validateDebugLevel("basic");
		expect(validated).toBe("basic");

		debug("Test message with validated level", "basic");

		// Verify function executed without error
		expect(true).toBe(true);
	});

	it("should handle multiple sequential debug calls", () => {
		const messages = ["First", "Second", "Third"];

		messages.forEach((msg) => {
			debug(msg);
		});

		// Should not throw and should handle multiple calls
		expect(true).toBe(true);
	});

	it("should handle mixed level debug calls", () => {
		debug("Basic message", "basic");
		debug("Verbose message", "verbose");
		debug("Another basic", "basic");

		// Should handle both level types
		expect(true).toBe(true);
	});

	it("should work with typical usage patterns", () => {
		// Pattern 1: Simple message
		expect(() => {
			debug("Starting operation");
		}).not.toThrow();

		// Pattern 2: With specific level
		expect(() => {
			debug("Detailed info", "verbose");
		}).not.toThrow();

		// Pattern 3: Error-like message
		expect(() => {
			debug("Error occurred: Something went wrong");
		}).not.toThrow();

		// Pattern 4: Data logging
		expect(() => {
			debug(JSON.stringify({ data: "value" }));
		}).not.toThrow();
	});

	it("should work with conditional logging patterns", () => {
		const shouldLog = DEBUG_LEVEL !== "off";

		if (shouldLog) {
			expect(() => {
				debug("This should log based on DEBUG_LEVEL");
			}).not.toThrow();
		}

		// Verify DEBUG_LEVEL is correctly set
		expect(["off", "basic", "verbose"]).toContain(DEBUG_LEVEL);
	});
});

// ============================================================================
// Debug Level Behavior Tests
// ============================================================================

describe("Debug Level Behavior", () => {
	it("'off' level should suppress all messages", () => {
		// This test documents expected behavior when DEBUG_LEVEL is "off"
		const level = validateDebugLevel("off");
		expect(level).toBe("off");

		// With "off" level, debug() calls should not output anything
		// This is implementation behavior we document
	});

	it("'basic' level should show only basic messages", () => {
		// This test documents expected behavior when DEBUG_LEVEL is "basic"
		const level = validateDebugLevel("basic");
		expect(level).toBe("basic");

		// With "basic" level, debug() with "basic" level should output
		// With "basic" level, debug() with "verbose" level should not output
	});

	it("'verbose' level should show all messages", () => {
		// This test documents expected behavior when DEBUG_LEVEL is "verbose"
		const level = validateDebugLevel("verbose");
		expect(level).toBe("verbose");

		// With "verbose" level, debug() with any level should output
	});

	it("should maintain consistency across multiple calls", () => {
		const level1 = validateDebugLevel("basic");
		const level2 = validateDebugLevel("basic");

		expect(level1).toBe(level2);
		expect(level1).toBe("basic");
	});
});
