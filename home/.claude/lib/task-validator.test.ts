/**
 * タスク検証エンジンのユニットテスト
 * Zod + Gray-Matter の統合テスト
 */

import { describe, it, expect } from 'bun:test';
import { validateTask, isValidTransition } from './task-validator';

describe('TaskValidator', () => {
	describe('validate()', () => {
		it('should validate correct task file', () => {
			const validTask = `---
title: Test Task
phase: analyze
status: pending
problem: Test problem
solution: Test solution
created_at: 2025-01-01T00:00:00Z
updated_at: 2025-01-01T00:00:00Z
---

## Dependencies
- Task #1
- Task #2

## Success Criteria
- Criterion 1
- Criterion 2
`;
			const result = validateTask(validTask);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.title).toBe('Test Task');
				expect(result.data.phase).toBe('analyze');
				expect(result.data.status).toBe('pending');
				// Markdown セクションから解析された依存関係
				expect(Array.isArray(result.data.dependencies)).toBe(true);
				expect(result.data.dependencies.length).toBeGreaterThan(0);
				// Markdown セクションから解析された成功基準
				expect(Array.isArray(result.data.success_criteria)).toBe(true);
				expect(result.data.success_criteria.length).toBeGreaterThan(0);
			}
		});

		it('should handle gray-matter Date conversion for unquoted ISO 8601', () => {
			// Unquoted ISO 8601 はGray-Matterで Date オブジェクトに変換される
			const taskWithUnquotedDate = `---
title: Test
phase: analyze
status: pending
problem: Test
solution: Test
created_at: 2025-01-01T00:00:00Z
updated_at: 2025-01-01T00:00:00Z
---`;
			const result = validateTask(taskWithUnquotedDate);
			expect(result.success).toBe(true);
			if (result.success) {
				// Date オブジェクトは ISO 文字列に変換される
				expect(typeof result.data.created_at).toBe('string');
				expect(typeof result.data.updated_at).toBe('string');
			}
		});

		it('should preserve frontmatter arrays (regression test for fix #1)', () => {
			// Frontmatter で指定した配列が保持されることを確認
			const taskWithArrays = `---
title: Test
phase: analyze
status: pending
problem: Test
solution: Test
dependencies:
  - dep1
  - dep2
  - dep3
success_criteria:
  - criteria1
  - criteria2
created_at: 2025-01-01T00:00:00Z
updated_at: 2025-01-01T00:00:00Z
---`;
			const result = validateTask(taskWithArrays);
			expect(result.success).toBe(true);
			if (result.success) {
				// 修正1: Frontmatter データが上書きされない
				expect(result.data.dependencies).toEqual(['dep1', 'dep2', 'dep3']);
				expect(result.data.success_criteria).toEqual(['criteria1', 'criteria2']);
			}
		});

		it('should preserve context files from frontmatter', () => {
			const taskWithContext = `---
title: Test
phase: analyze
status: pending
problem: Test
solution: Test
context:
  files:
    - src/file1.ts
    - src/file2.ts
  patterns:
    - pattern1
    - pattern2
created_at: 2025-01-01T00:00:00Z
updated_at: 2025-01-01T00:00:00Z
---`;
			const result = validateTask(taskWithContext);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(Array.isArray(result.data.context.files)).toBe(true);
				expect(Array.isArray(result.data.context.patterns)).toBe(true);
			}
		});

		it('should handle parse errors gracefully (regression test for fix #2)', () => {
			// 不正な YAML で エラーが返される
			const invalidTask = `---
invalid yaml: [
---`;
			const result = validateTask(invalidTask);
			expect(result.success).toBe(false);
			if (!result.success) {
				// 修正2: エラーが適切に構築される
				expect(result.error.issues).toBeDefined();
				expect(result.error.issues.length).toBeGreaterThan(0);
				// パースエラーの場合は、Zod バリデーションエラーが返される
				// (required fields が不足しているため)
			}
		});

		it('should validate with minimal required fields', () => {
			const minimalTask = `---
title: Minimal Task
phase: plan
status: in-progress
problem: Minimal problem
solution: Minimal solution
created_at: 2025-01-01T00:00:00Z
updated_at: 2025-01-01T00:00:00Z
---`;
			const result = validateTask(minimalTask);
			expect(result.success).toBe(true);
			if (result.success) {
				// デフォルト値が適用される
				expect(Array.isArray(result.data.dependencies)).toBe(true);
				expect(result.data.dependencies.length).toBe(0);
				expect(Array.isArray(result.data.success_criteria)).toBe(true);
				expect(result.data.success_criteria.length).toBe(0);
			}
		});

		it('should reject missing required fields', () => {
			const incompleteTask = `---
title: Incomplete Task
phase: analyze
status: pending
---`;
			const result = validateTask(incompleteTask);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues).toBeDefined();
				expect(result.error.issues.length).toBeGreaterThan(0);
			}
		});

		it('should reject invalid phase', () => {
			const invalidPhaseTask = `---
title: Invalid Phase Task
phase: invalid_phase
status: pending
problem: Test
solution: Test
created_at: 2025-01-01T00:00:00Z
updated_at: 2025-01-01T00:00:00Z
---`;
			const result = validateTask(invalidPhaseTask);
			expect(result.success).toBe(false);
		});

		it('should reject invalid status', () => {
			const invalidStatusTask = `---
title: Invalid Status Task
phase: analyze
status: invalid_status
problem: Test
solution: Test
created_at: 2025-01-01T00:00:00Z
updated_at: 2025-01-01T00:00:00Z
---`;
			const result = validateTask(invalidStatusTask);
			expect(result.success).toBe(false);
		});

		it('should reject invalid ISO8601 date', () => {
			const invalidDateTask = `---
title: Invalid Date Task
phase: analyze
status: pending
problem: Test
solution: Test
created_at: invalid-date
updated_at: 2025-01-01T00:00:00Z
---`;
			const result = validateTask(invalidDateTask);
			expect(result.success).toBe(false);
		});

		it('should reject title exceeding max length', () => {
			const longTitle = 'a'.repeat(101);
			const longTitleTask = `---
title: ${longTitle}
phase: analyze
status: pending
problem: Test
solution: Test
created_at: 2025-01-01T00:00:00Z
updated_at: 2025-01-01T00:00:00Z
---`;
			const result = validateTask(longTitleTask);
			expect(result.success).toBe(false);
		});
	});

	describe('validatePhaseTransition()', () => {
		it('should allow analyze → plan transition', () => {
			expect(isValidTransition('analyze', 'plan')).toBe(true);
		});

		it('should allow plan → execute transition', () => {
			expect(isValidTransition('plan', 'execute')).toBe(true);
		});

		it('should allow execute → examine transition', () => {
			expect(isValidTransition('execute', 'examine')).toBe(true);
		});

		it('should reject analyze → execute transition (skip)', () => {
			expect(isValidTransition('analyze', 'execute')).toBe(false);
		});

		it('should reject plan → analyze transition (backward)', () => {
			expect(isValidTransition('plan', 'analyze')).toBe(false);
		});

		it('should reject execute → plan transition (backward)', () => {
			expect(isValidTransition('execute', 'plan')).toBe(false);
		});

		it('should reject examine → any transition (end state)', () => {
			expect(isValidTransition('examine', 'analyze')).toBe(false);
			expect(isValidTransition('examine', 'plan')).toBe(false);
			expect(isValidTransition('examine', 'execute')).toBe(false);
			expect(isValidTransition('examine', 'examine')).toBe(false);
		});

		it('should reject same phase transition', () => {
			expect(isValidTransition('analyze', 'analyze')).toBe(false);
			expect(isValidTransition('plan', 'plan')).toBe(false);
			expect(isValidTransition('execute', 'execute')).toBe(false);
		});
	});
});
