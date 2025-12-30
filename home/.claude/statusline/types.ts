// Type Definitions for statusline

export interface HookInput {
	model: { display_name: string };
	workspace: { current_dir: string };
	cwd?: string;
	session_id: string;
	cost: {
		total_cost_usd: number;
		total_duration_ms: number;
	};
	context_window?: {
		context_window_size: number;
		current_usage: {
			input_tokens: number;
			output_tokens: number;
			cache_creation_input_tokens: number;
			cache_read_input_tokens: number;
		} | null;
	};
	transcript_path?: string;
}

export interface GitStatus {
	branch: string;
	hasChanges: boolean;
	aheadBehind: string | null;
	diffStats: string | null;
}

export interface TranscriptEntry {
	type?: string;
	message?: {
		usage?: {
			input_tokens?: number;
			output_tokens?: number;
			cache_creation_input_tokens?: number;
			cache_read_input_tokens?: number;
		};
	};
	timestamp?: string;
}

export interface StatuslineConfig {
	git: {
		showBranch: boolean; // ブランチ名表示
		showAheadBehind: boolean; // ahead/behind表示
		showDiffStats: boolean; // 差分統計（+/-）表示
		alwaysShowMain: boolean; // main/masterでもahead/behind表示
	};
	rateLimits: {
		showFiveHour: boolean; // 5時間レート制限表示
		showWeekly: boolean; // 週間レート制限表示
		showPeriodCost: boolean; // 期間コスト（$119）表示
	};
	costs: {
		showDailyCost: boolean; // 日次コスト表示
		showSessionCost: boolean; // セッションコスト表示
	};
	tokens: {
		showContextUsage: boolean; // コンテキスト使用率表示
	};
	session: {
		showSessionId: boolean; // セッションID表示
		showElapsedTime: boolean; // 経過時間表示
		showInFirstLine: boolean; // セッション情報を第1行に表示
	};
	display: {
		showSeparators: boolean; // メトリクス間の区切り表示
	};
}

export interface UsageLimits {
	five_hour: { utilization: number; resets_at: string | null } | null;
	seven_day: { utilization: number; resets_at: string | null } | null;
	seven_day_sonnet: { utilization: number; resets_at: string | null } | null;
	seven_day_opus: { utilization: number; resets_at: string | null } | null;
}

export interface CachedUsageLimits {
	data: UsageLimits;
	timestamp: number;
}

export interface Credentials {
	claudeAiOauth: {
		accessToken: string;
		refreshToken: string;
		expiresAt: number;
		scopes: string[];
		subscriptionType: string;
	};
}

export interface CacheData<T> {
	data: T;
	timestamp: number;
}
