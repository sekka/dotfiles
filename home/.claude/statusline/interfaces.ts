// ============================================================================
// Phase 3-2: Dependency Injection Interfaces
// ============================================================================

import type { StatuslineConfig } from "./config.ts";
import type { UsageLimits } from "./utils.ts";

/**
 * トークン取得プロバイダーのインターフェース
 * テスト時にモックに置き換え可能
 */
export interface TokenProvider {
	/**
	 * Claude APIトークンを取得
	 * @returns トークン文字列、またはnull
	 */
	getToken(): Promise<string | null>;
}

/**
 * API レスポンスプロバイダーのインターフェース
 * テスト時にモックに置き換え可能
 */
export interface UsageLimitsProvider {
	/**
	 * Anthropic API から使用制限情報を取得
	 * @param token API認証トークン
	 * @returns 使用制限データ、またはnull
	 */
	fetchLimits(token: string): Promise<UsageLimits | null>;
}

/**
 * 設定読み込みプロバイダーのインターフェース
 * テスト時にモックに置き換え可能
 */
export interface ConfigProvider {
	/**
	 * ステータスライン設定を読み込む
	 * @returns マージされた設定オブジェクト
	 */
	loadConfig(): Promise<StatuslineConfig>;
}

/**
 * キャッシュストレージプロバイダーのインターフェース
 * テスト時にメモリストレージに置き換え可能
 */
export interface CacheProvider {
	/**
	 * キャッシュから値を取得
	 * @param key キャッシュキー
	 * @returns キャッシュ値、またはnull
	 */
	get<T>(key: string): Promise<T | null>;

	/**
	 * キャッシュに値を保存
	 * @param key キャッシュキー
	 * @param value 保存する値
	 * @param ttlMs キャッシュの有効期限（ミリ秒）
	 */
	set<T>(key: string, value: T, ttlMs: number): Promise<void>;

	/**
	 * キャッシュをクリア
	 * @param key キャッシュキー
	 */
	clear(key: string): Promise<void>;
}

/**
 * ステータスラインのコア依存関係
 * 注入可能な依存関係をまとめたコンテナ
 */
export interface StatuslineServices {
	tokenProvider: TokenProvider;
	usageLimitsProvider: UsageLimitsProvider;
	configProvider: ConfigProvider;
	cacheProvider: CacheProvider;
}
