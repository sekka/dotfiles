#!/usr/bin/env bun

/**
 * HTML セマンティクス・アクセシビリティチェッカー
 *
 * 使用方法:
 *   bun ~/.claude/skills/improve-html/scripts/check-html.ts <file-or-glob> [options]
 *   cat index.html | bun ~/.claude/skills/improve-html/scripts/check-html.ts --stdin [options]
 *
 * オプション:
 *   --format=json|text       出力形式 (デフォルト: text)
 *   --severity=error|warning|info  最小重要度 (デフォルト: warning)
 *   --category=aria,forms,...  チェックカテゴリ (デフォルト: all)
 *   --config=path            プロジェクト設定ファイルパス (.htmlcheckrc.yaml)
 *   --stdin                  標準入力からHTMLを読み込む
 */

import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { parseArgs } from "node:util";
import { Glob } from "bun";
import { parseHTML } from "linkedom";
import { parse as parseYaml } from "yaml";

// ============================================
// 型定義
// ============================================

type Severity = "error" | "warning" | "info";

interface Violation {
	ruleId: string;
	ruleName: string;
	severity: Severity;
	category: string;
	message: string;
	element?: string;
	wcag?: string;
	suggestion?: string;
	why?: string;
}

interface CheckResult {
	file: string;
	violations: Violation[];
	summary: { errors: number; warnings: number; info: number };
}

interface RuleDefinition {
	id: string;
	name: string;
	severity: Severity;
	wcag?: string;
	selector?: string;
	check: string;
	attribute?: string;
	child?: string;
	values?: string[];
	property?: string;
	pattern?: string;
	function?: string;
	patterns?: string[];
	why?: string;
	suggestion?: string;
}

interface RuleFile {
	category: string;
	description: string;
	rules: RuleDefinition[];
}

interface ProjectConfig {
	ignore?: string[];
	severity_overrides?: Record<string, Severity>;
}

interface Options {
	format: "json" | "text";
	severity: Severity;
	categories: string[] | null;
	configPath: string | null;
	stdin: boolean;
	positionals: string[];
}

// ============================================
// ARIAロールデータ（インライン定義）
// ============================================

// ARIA仕様に基づくロール必須属性マップ
const ARIA_REQUIRED_ATTRS: Record<string, string[]> = {
	checkbox: ["aria-checked"],
	combobox: ["aria-expanded"],
	heading: ["aria-level"],
	listbox: [],
	menuitemcheckbox: ["aria-checked"],
	menuitemradio: ["aria-checked"],
	option: ["aria-selected"],
	progressbar: ["aria-valuenow", "aria-valuemin", "aria-valuemax"],
	radio: ["aria-checked"],
	scrollbar: ["aria-controls", "aria-valuenow", "aria-valuemin", "aria-valuemax"],
	separator: [], // focusable separator requires aria-valuenow
	slider: ["aria-valuenow", "aria-valuemin", "aria-valuemax"],
	spinbutton: ["aria-valuenow", "aria-valuemin", "aria-valuemax"],
	switch: ["aria-checked"],
	tab: ["aria-selected"],
	treeitem: [],
};

// 有効なARIAロール一覧
const VALID_ARIA_ROLES = new Set([
	"alert",
	"alertdialog",
	"application",
	"article",
	"banner",
	"blockquote",
	"button",
	"caption",
	"cell",
	"checkbox",
	"code",
	"columnheader",
	"combobox",
	"comment",
	"complementary",
	"contentinfo",
	"definition",
	"deletion",
	"dialog",
	"directory",
	"document",
	"emphasis",
	"feed",
	"figure",
	"form",
	"generic",
	"grid",
	"gridcell",
	"group",
	"heading",
	"img",
	"insertion",
	"link",
	"list",
	"listbox",
	"listitem",
	"log",
	"main",
	"mark",
	"marquee",
	"math",
	"menu",
	"menubar",
	"menuitem",
	"menuitemcheckbox",
	"menuitemradio",
	"meter",
	"navigation",
	"none",
	"note",
	"option",
	"paragraph",
	"presentation",
	"progressbar",
	"radio",
	"radiogroup",
	"region",
	"row",
	"rowgroup",
	"rowheader",
	"scrollbar",
	"search",
	"searchbox",
	"separator",
	"slider",
	"spinbutton",
	"status",
	"strong",
	"subscript",
	"superscript",
	"switch",
	"tab",
	"table",
	"tablist",
	"tabpanel",
	"term",
	"textbox",
	"time",
	"timer",
	"toolbar",
	"tooltip",
	"tree",
	"treegrid",
	"treeitem",
]);

// aria-checked 等の属性の有効値マップ
const ARIA_VALID_VALUES: Record<string, string[]> = {
	"aria-checked": ["true", "false", "mixed"],
	"aria-expanded": ["true", "false"],
	"aria-selected": ["true", "false"],
	"aria-current": ["page", "step", "location", "date", "time", "true", "false"],
	"aria-live": ["off", "polite", "assertive"],
	"aria-haspopup": ["false", "true", "menu", "listbox", "tree", "grid", "dialog"],
	"aria-autocomplete": ["inline", "list", "both", "none"],
	"aria-orientation": ["horizontal", "vertical", "undefined"],
	"aria-sort": ["ascending", "descending", "none", "other"],
	"aria-invalid": ["grammar", "false", "spelling", "true"],
	"aria-relevant": ["additions", "removals", "text", "all", "additions text"],
};

// ============================================
// ルールファイル読み込み
// ============================================

function loadRules(rulesDir: string): RuleFile[] {
	const files: RuleFile[] = [];
	const glob = new Glob("*.yaml");

	for (const file of glob.scanSync(rulesDir)) {
		const content = readFileSync(join(rulesDir, file), "utf-8");
		const parsed = parseYaml(content) as RuleFile;
		files.push(parsed);
	}

	// ファイル名順にソート（01-, 02-, ... の順序を保つ）
	files.sort((a, b) => a.category.localeCompare(b.category));
	return files;
}

function loadProjectConfig(configPath: string | null): ProjectConfig {
	const candidates = configPath ? [configPath] : [".htmlcheckrc.yaml", ".htmlcheckrc.yml"];

	for (const candidate of candidates) {
		const absPath = resolve(candidate);
		if (existsSync(absPath)) {
			const content = readFileSync(absPath, "utf-8");
			return parseYaml(content) as ProjectConfig;
		}
	}

	return {};
}

// ============================================
// チェック関数
// ============================================

const SEVERITY_ORDER: Record<Severity, number> = { error: 3, warning: 2, info: 1 };

function getElementSnippet(el: Element): string {
	const tag = el.tagName.toLowerCase();
	const attrs = Array.from(el.attributes)
		.slice(0, 4)
		.map((a: Attr) => `${a.name}="${a.value}"`)
		.join(" ");
	return `<${tag}${attrs ? " " + attrs : ""}>`;
}

function violation(
	rule: RuleDefinition,
	category: string,
	message: string,
	element?: Element,
): Violation {
	return {
		ruleId: rule.id,
		ruleName: rule.name,
		severity: rule.severity,
		category,
		message,
		element: element ? getElementSnippet(element) : undefined,
		wcag: rule.wcag,
		why: rule.why,
		suggestion: rule.suggestion,
	};
}

function hasAccessibleName(el: Element): boolean {
	// テキストコンテンツ
	if (el.textContent?.trim()) return true;
	// aria-label
	if (el.getAttribute("aria-label")?.trim()) return true;
	// aria-labelledby
	if (el.getAttribute("aria-labelledby")?.trim()) return true;
	// title
	if (el.getAttribute("title")?.trim()) return true;
	// alt (for img — 要素自身)
	if (el.tagName.toLowerCase() === "img" && el.getAttribute("alt") !== null) {
		return el.getAttribute("alt")?.trim() !== "";
	}
	// alt (for img — 子孫要素の img alt からネーム継承)
	const childImg = el.querySelector("img[alt]");
	if (childImg && childImg.getAttribute("alt")?.trim()) return true;
	// label[for] による関連付け（フォーム要素）
	const id = el.getAttribute("id");
	if (id) {
		const label = el.ownerDocument.querySelector(`label[for="${id}"]`);
		if (label?.textContent?.trim()) return true;
	}
	return false;
}

/** 祖先に aria-hidden="true" を持つ要素かどうか */
function isAriaHidden(el: Element): boolean {
	let current: Element | null = el;
	while (current) {
		if (current.getAttribute("aria-hidden") === "true") return true;
		current = current.parentElement;
	}
	return false;
}

function checkElementExists(
	document: Document,
	rule: RuleDefinition,
	category: string,
): Violation[] {
	if (!rule.selector) return [];
	if (document.querySelectorAll(rule.selector).length > 0) return [];
	return [violation(rule, category, `${rule.name}: ${rule.selector} が見つからない`)];
}

function checkElementNotExists(
	document: Document,
	rule: RuleDefinition,
	category: string,
): Violation[] {
	if (!rule.selector) return [];
	const elements = Array.from(document.querySelectorAll(rule.selector));
	return elements.map((el) => violation(rule, category, rule.name, el as Element));
}

function checkHasAttribute(
	document: Document,
	rule: RuleDefinition,
	category: string,
): Violation[] {
	if (!rule.selector || !rule.attribute) return [];
	const elements = Array.from(document.querySelectorAll(rule.selector));
	const violations: Violation[] = [];

	for (const el of elements) {
		const element = el as Element;
		if (!element.hasAttribute(rule.attribute)) {
			violations.push(
				violation(rule, category, `${rule.name}: ${rule.attribute}属性がない`, element),
			);
		}
	}

	return violations;
}

function checkAttributeNotEmpty(
	document: Document,
	rule: RuleDefinition,
	category: string,
): Violation[] {
	if (!rule.selector || !rule.attribute) return [];
	const elements = Array.from(document.querySelectorAll(rule.selector));
	const violations: Violation[] = [];

	for (const el of elements) {
		const element = el as Element;
		const val = element.getAttribute(rule.attribute);
		if (val !== null && val.trim() === "") {
			violations.push(
				violation(rule, category, `${rule.name}: ${rule.attribute}属性が空`, element),
			);
		}
	}

	return violations;
}

function checkAttributeValidValue(
	document: Document,
	rule: RuleDefinition,
	category: string,
): Violation[] {
	if (!rule.selector) return [];
	const elements = Array.from(document.querySelectorAll(rule.selector));
	const violations: Violation[] = [];

	for (const el of elements) {
		const element = el as Element;

		// ルールに values が直接指定されている場合（例: autocomplete, aria-live, aria-relevant）
		if (rule.attribute && rule.values) {
			const val = element.getAttribute(rule.attribute);
			if (val !== null) {
				// トークンリスト属性（aria-relevant等）はスペース区切りの個別トークンも許可
				const tokens = val.split(/\s+/);
				const isValid = tokens.every((t) => rule.values!.includes(t)) || rule.values.includes(val);
				if (!isValid) {
					violations.push(
						violation(
							rule,
							category,
							`${rule.name}: ${rule.attribute}="${val}" は無効な値`,
							element,
						),
					);
				}
			}
			continue;
		}

		// セレクタに含まれる各属性を検証（aria-checked, aria-expanded 等）
		for (const [attrName, validValues] of Object.entries(ARIA_VALID_VALUES)) {
			if (element.hasAttribute(attrName)) {
				const val = element.getAttribute(attrName) ?? "";
				if (!validValues.includes(val)) {
					violations.push(
						violation(
							rule,
							category,
							`${rule.name}: ${attrName}="${val}" は無効な値 (許可値: ${validValues.join(", ")})`,
							element,
						),
					);
				}
			}
		}
	}

	return violations;
}

function checkIdRefExists(document: Document, rule: RuleDefinition, category: string): Violation[] {
	if (!rule.selector || !rule.attribute) return [];
	const elements = Array.from(document.querySelectorAll(rule.selector));
	const violations: Violation[] = [];

	for (const el of elements) {
		const element = el as Element;
		const attrVal = element.getAttribute(rule.attribute);
		if (!attrVal) continue;

		for (const id of attrVal.trim().split(/\s+/)) {
			if (id && !document.getElementById(id)) {
				violations.push(
					violation(rule, category, `${rule.name}: id="${id}" が存在しない`, element),
				);
			}
		}
	}

	return violations;
}

function checkHeadingHierarchy(
	document: Document,
	rule: RuleDefinition,
	category: string,
): Violation[] {
	const headings = Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6"));
	const violations: Violation[] = [];
	let prevLevel = 0;

	for (const el of headings) {
		const element = el as Element;
		const level = parseInt(element.tagName.charAt(1), 10);
		if (prevLevel > 0 && level > prevLevel + 1) {
			violations.push(
				violation(rule, category, `${rule.name}: h${prevLevel}からh${level}へスキップ`, element),
			);
		}
		prevLevel = level;
	}

	return violations;
}

function checkUniqueElement(
	document: Document,
	rule: RuleDefinition,
	category: string,
): Violation[] {
	if (!rule.selector) return [];
	const elements = Array.from(document.querySelectorAll(rule.selector));
	if (elements.length <= 1) return [];
	return elements.map((el) =>
		violation(
			rule,
			category,
			`${rule.name}: ${rule.selector}が複数存在する (${elements.length}個)`,
			el as Element,
		),
	);
}

function checkHasChild(document: Document, rule: RuleDefinition, category: string): Violation[] {
	if (!rule.selector || !rule.child) return [];
	const violations: Violation[] = [];
	for (const el of Array.from(document.querySelectorAll(rule.selector))) {
		const element = el as Element;
		if (!element.querySelector(rule.child)) {
			violations.push(
				violation(rule, category, `${rule.name}: ${rule.child}が子要素にない`, element),
			);
		}
	}
	return violations;
}

function checkTextContent(document: Document, rule: RuleDefinition, category: string): Violation[] {
	if (!rule.selector) return [];
	const violations: Violation[] = [];
	for (const el of Array.from(document.querySelectorAll(rule.selector))) {
		const element = el as Element;
		if (!element.textContent?.trim() && !hasAccessibleName(element)) {
			violations.push(violation(rule, category, `${rule.name}: テキストコンテンツがない`, element));
		}
	}
	return violations;
}

function checkHasAccessibleName(
	document: Document,
	rule: RuleDefinition,
	category: string,
): Violation[] {
	if (!rule.selector) return [];
	const violations: Violation[] = [];
	for (const el of Array.from(document.querySelectorAll(rule.selector))) {
		const element = el as Element;
		// aria-hidden="true" の祖先内にある要素はスキップ（装飾的要素）
		if (isAriaHidden(element)) continue;
		if (!hasAccessibleName(element)) {
			violations.push(violation(rule, category, `${rule.name}: アクセシブルネームがない`, element));
		}
	}
	return violations;
}

function checkRoleRequiredAttrs(
	document: Document,
	rule: RuleDefinition,
	category: string,
): Violation[] {
	if (!rule.selector) return [];
	const violations: Violation[] = [];

	for (const el of Array.from(document.querySelectorAll(rule.selector))) {
		const element = el as Element;
		const role = element.getAttribute("role");
		if (!role) continue;
		const required = ARIA_REQUIRED_ATTRS[role];
		if (!required) continue;
		for (const attr of required) {
			if (!element.hasAttribute(attr)) {
				violations.push(
					violation(
						rule,
						category,
						`${rule.name}: role="${role}"に必須属性 ${attr} がない`,
						element,
					),
				);
			}
		}
	}

	return violations;
}

function checkRoleValid(document: Document, rule: RuleDefinition, category: string): Violation[] {
	if (!rule.selector) return [];
	const violations: Violation[] = [];

	for (const el of Array.from(document.querySelectorAll(rule.selector))) {
		const element = el as Element;
		const role = element.getAttribute("role");
		if (!role) continue;
		for (const r of role.trim().split(/\s+/)) {
			if (!VALID_ARIA_ROLES.has(r)) {
				violations.push(violation(rule, category, `${rule.name}: role="${r}" は無効`, element));
			}
		}
	}

	return violations;
}

function checkCssPropertyCheck(
	document: Document,
	rule: RuleDefinition,
	category: string,
): Violation[] {
	if (!rule.property || !rule.pattern) return [];
	const violations: Violation[] = [];
	const regex = new RegExp(rule.pattern, "i");
	const propRegex = new RegExp(`${rule.property}\\s*:\\s*([^;]+)`, "i");

	for (const el of Array.from(document.querySelectorAll("[style]"))) {
		const element = el as Element;
		const style = element.getAttribute("style") ?? "";
		const match = style.match(propRegex);
		if (match && regex.test(match[1])) {
			violations.push(
				violation(rule, category, `${rule.name}: ${rule.property}: ${match[1]}`, element),
			);
		}
	}

	return violations;
}

// ============================================
// ルール実行ディスパッチャ
// ============================================

function runRule(document: Document, rule: RuleDefinition, category: string): Violation[] {
	switch (rule.check) {
		case "element-exists":
			return checkElementExists(document, rule, category);
		case "element-not-exists":
			return checkElementNotExists(document, rule, category);
		case "has-attribute":
			return checkHasAttribute(document, rule, category);
		case "attribute-not-empty":
			return checkAttributeNotEmpty(document, rule, category);
		case "attribute-valid-value":
			return checkAttributeValidValue(document, rule, category);
		case "id-ref-exists":
			return checkIdRefExists(document, rule, category);
		case "heading-hierarchy":
			return checkHeadingHierarchy(document, rule, category);
		case "unique-element":
			return checkUniqueElement(document, rule, category);
		case "has-child":
			return checkHasChild(document, rule, category);
		case "text-content":
			return checkTextContent(document, rule, category);
		case "has-accessible-name":
			return checkHasAccessibleName(document, rule, category);
		case "role-required-attrs":
			return checkRoleRequiredAttrs(document, rule, category);
		case "role-valid":
			return checkRoleValid(document, rule, category);
		case "css-property-check":
			return checkCssPropertyCheck(document, rule, category);
		case "should-be-element":
			// セレクタにマッチする要素を違反として報告（より良い要素への提案）
			return checkElementNotExists(document, rule, category);
		case "css-a11y-conflict":
			// インラインスタイルのARIA競合チェック（css-property-checkに委譲）
			return checkCssPropertyCheck(document, rule, category);
		case "custom":
			// LLM解析が必要なカスタムチェックはスキップ
			return [];
		default:
			return [];
	}
}

// ============================================
// HTMLチェック実行
// ============================================

function checkHtml(
	html: string,
	filePath: string,
	ruleFiles: RuleFile[],
	config: ProjectConfig,
	options: Options,
): CheckResult {
	const { document } = parseHTML(html);
	const violations: Violation[] = [];

	const ignoredIds = new Set(config.ignore ?? []);
	const severityOverrides = config.severity_overrides ?? {};

	for (const ruleFile of ruleFiles) {
		// カテゴリフィルタ
		if (options.categories && !options.categories.includes(ruleFile.category)) {
			continue;
		}

		for (const rule of ruleFile.rules) {
			// 無視リストに含まれる場合はスキップ
			if (ignoredIds.has(rule.id)) continue;

			// 重要度オーバーライド適用
			const effectiveRule = severityOverrides[rule.id]
				? { ...rule, severity: severityOverrides[rule.id] as Severity }
				: rule;

			const ruleViolations = runRule(
				document as unknown as Document,
				effectiveRule,
				ruleFile.category,
			);
			violations.push(...ruleViolations);
		}
	}

	// 最小重要度フィルタ
	const minSeverityLevel = SEVERITY_ORDER[options.severity];
	const filtered = violations.filter((v) => SEVERITY_ORDER[v.severity] >= minSeverityLevel);

	const summary = { errors: 0, warnings: 0, info: 0 };
	for (const v of filtered) {
		if (v.severity === "error") summary.errors++;
		else if (v.severity === "warning") summary.warnings++;
		else summary.info++;
	}

	return { file: filePath, violations: filtered, summary };
}

// ============================================
// 出力フォーマット
// ============================================

function formatTextOutput(result: CheckResult): string {
	const lines: string[] = [];

	if (result.violations.length === 0) {
		lines.push(`${result.file}: 違反なし`);
		return lines.join("\n");
	}

	lines.push(`\n${result.file}`);
	lines.push("=".repeat(result.file.length));

	for (const v of result.violations) {
		const severityLabel = v.severity.toUpperCase();
		lines.push(`\n[${severityLabel}] ${v.ruleId}: ${v.ruleName}`);
		if (v.element) lines.push(`  要素: ${v.element}`);
		if (v.wcag) lines.push(`  WCAG: ${v.wcag}`);
		if (v.why) lines.push(`  理由: ${v.why}`);
		if (v.suggestion) lines.push(`  提案: ${v.suggestion}`);
		if (v.message && v.message !== v.ruleName) lines.push(`  詳細: ${v.message}`);
	}

	const { errors, warnings, info } = result.summary;
	lines.push(`\n合計: ${errors} エラー, ${warnings} 警告, ${info} 情報`);

	return lines.join("\n");
}

function formatJsonOutput(results: CheckResult[]): string {
	return JSON.stringify(results, null, 2);
}

// ============================================
// CLI引数パース
// ============================================

function parseOptions(): Options {
	const { values, positionals } = parseArgs({
		args: process.argv.slice(2),
		options: {
			format: { type: "string", default: "text" },
			severity: { type: "string", default: "warning" },
			category: { type: "string" },
			config: { type: "string" },
			stdin: { type: "boolean", default: false },
		},
		allowPositionals: true,
	});

	const format = values.format === "json" ? "json" : "text";
	const severity: Severity =
		values.severity === "error" ? "error" : values.severity === "info" ? "info" : "warning";
	const categories = values.category
		? (values.category as string).split(",").map((s) => s.trim())
		: null;

	return {
		format,
		severity,
		categories,
		configPath: (values.config as string) ?? null,
		stdin: values.stdin ?? false,
		positionals,
	};
}

// ============================================
// メイン処理
// ============================================

async function main(): Promise<void> {
	const options = parseOptions();

	// ルールディレクトリのパス（スクリプトからの相対パス）
	const scriptDir = import.meta.dir;
	const rulesDir = resolve(scriptDir, "../rules");

	if (!existsSync(rulesDir)) {
		console.error(`ルールディレクトリが見つかりません: ${rulesDir}`);
		process.exit(1);
	}

	const ruleFiles = loadRules(rulesDir);
	const config = loadProjectConfig(options.configPath);
	const results: CheckResult[] = [];

	if (options.stdin) {
		// 標準入力モード
		const html = await new Response(Bun.stdin.stream()).text();
		const result = checkHtml(html, "<stdin>", ruleFiles, config, options);
		results.push(result);
	} else {
		if (options.positionals.length === 0) {
			console.error("使用方法: bun check-html.ts <file-or-glob> [options]");
			console.error("       cat index.html | bun check-html.ts --stdin [options]");
			process.exit(1);
		}

		// ファイル/グロブモード
		for (const pattern of options.positionals) {
			const absPattern = resolve(pattern);

			if (existsSync(absPattern)) {
				// 単一ファイル
				const html = readFileSync(absPattern, "utf-8");
				const result = checkHtml(html, absPattern, ruleFiles, config, options);
				results.push(result);
			} else {
				// グロブパターン
				const glob = new Glob(pattern);
				for await (const file of glob.scan(".")) {
					const absFile = resolve(file);
					const html = readFileSync(absFile, "utf-8");
					const result = checkHtml(html, absFile, ruleFiles, config, options);
					results.push(result);
				}
			}
		}
	}

	if (results.length === 0) {
		console.error("HTMLファイルが見つかりませんでした");
		process.exit(1);
	}

	// 出力
	if (options.format === "json") {
		console.log(formatJsonOutput(results));
	} else {
		for (const result of results) {
			console.log(formatTextOutput(result));
		}

		// 複数ファイル時のサマリー
		if (results.length > 1) {
			const totalErrors = results.reduce((sum, r) => sum + r.summary.errors, 0);
			const totalWarnings = results.reduce((sum, r) => sum + r.summary.warnings, 0);
			const totalInfo = results.reduce((sum, r) => sum + r.summary.info, 0);
			console.log(
				`\n全体合計 (${results.length}ファイル): ${totalErrors} エラー, ${totalWarnings} 警告, ${totalInfo} 情報`,
			);
		}
	}

	// エラーがあれば exit code 1
	const hasErrors = results.some((r) => r.summary.errors > 0);
	if (hasErrors) {
		process.exit(1);
	}
}

main().catch((error) => {
	console.error("予期しないエラー:", error);
	process.exit(1);
});
