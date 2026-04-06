#!/usr/bin/env bun

import { describe, it, expect } from "bun:test";
import { extractFilePath } from "../auto-lint-hook";

describe("extractFilePath", () => {
	it("valid JSON with file_path → returns path string", () => {
		const input = JSON.stringify({ tool_input: { file_path: "/tmp/foo.ts" } });
		expect(extractFilePath(input)).toBe("/tmp/foo.ts");
	});

	it("valid JSON without file_path → returns null", () => {
		const input = JSON.stringify({ tool_input: {} });
		expect(extractFilePath(input)).toBeNull();
	});

	it("valid JSON with empty file_path → returns empty string", () => {
		const input = JSON.stringify({ tool_input: { file_path: "" } });
		expect(extractFilePath(input)).toBe("");
	});

	it("empty string input → returns null", () => {
		expect(extractFilePath("")).toBeNull();
	});

	it("invalid JSON → returns null", () => {
		expect(extractFilePath("not-json")).toBeNull();
	});

	it("JSON with null tool_input → returns null", () => {
		const input = JSON.stringify({ tool_input: null });
		expect(extractFilePath(input)).toBeNull();
	});
});
