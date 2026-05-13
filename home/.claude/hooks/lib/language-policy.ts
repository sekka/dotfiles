/**
 * Shared utility for language-policy.md parsing.
 * Used by language-reminder.ts and language-check.ts.
 */

/**
 * language-policy.md テキストから現在のレベル番号を抽出する。
 * "Current level: L{N}" パターンを case-insensitive で探す。
 * 見つからない場合は null を返す。
 */
export function parseCurrentLevel(text: string): number | null {
  const match = text.match(/Current level:\s*L(\d+)/i);
  if (!match || !match[1]) return null;
  return parseInt(match[1], 10);
}
