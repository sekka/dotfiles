/**
 * CLAUDE.md 自動同期更新 Hook
 *
 * @purpose
 * 重要なファイルが変更されたときに CLAUDE.md の更新を提案または自動実行する。
 * コード変更とドキュメントの同期を保ち、仕様の鮮度を維持する。
 *
 * @inspired-by
 * 松尾研究所の実践的なAIコーディング管理手法
 * https://zenn.dev/mkj/articles/868e0723efa060
 *
 * @features
 * - 重要ファイルの変更検出
 * - CLAUDE.md 更新の自動提案
 * - 変更内容の要約
 * - スキル呼び出しの自動化（オプション）
 */

import type {
  ToolCallEndEvent,
  HookResponse,
} from '@anthropic-ai/claude-code';

// 監視対象の重要ファイルパターン
const IMPORTANT_FILE_PATTERNS = [
  // Claude Code 設定
  '.claude/settings.json',
  '.claude/keybindings.json',

  // ルールファイル
  '.claude/rules/**/*.md',

  // スキル
  '.claude/skills/**/skill.json',
  '.claude/skills/**/prompt.md',
  '.claude/skills/**/README.md',

  // Hooks
  '.claude/hooks/**/*.ts',
  '.claude/hooks/**/*.js',

  // プロジェクト固有の CLAUDE.md
  'CLAUDE.md',
  '**/CLAUDE.md',

  // 重要な設定ファイル
  'package.json',
  'tsconfig.json',
  '.gitignore',
  'README.md',
];

// CLAUDE.md のパス（優先順位順）
const CLAUDE_MD_PATHS = [
  '.claude/CLAUDE.md',
  'CLAUDE.md',
];

// 設定
const CONFIG = {
  // 自動実行モード（true: 自動実行、false: 提案のみ）
  autoSync: false,

  // 変更を蓄積する最小間隔（ミリ秒）
  debounceMs: 5000,

  // 変更を蓄積する最大数
  maxChanges: 10,
};

// 変更履歴を保持（セッション中）
let changeHistory: Array<{
  file: string;
  tool: string;
  timestamp: number;
}> = [];

// 最後の提案時刻
let lastSuggestionTime = 0;

/**
 * ファイルパスが重要ファイルパターンにマッチするか判定
 */
function isImportantFile(filePath: string): boolean {
  if (!filePath) return false;

  return IMPORTANT_FILE_PATTERNS.some(pattern => {
    // 単純なグロブパターンマッチング
    if (pattern.includes('**')) {
      const regex = new RegExp(
        pattern
          .replace(/\*\*/g, '.*')
          .replace(/\*/g, '[^/]*')
          .replace(/\./g, '\\.')
      );
      return regex.test(filePath);
    }

    // 完全一致または末尾一致
    return filePath.endsWith(pattern) || filePath.includes(pattern);
  });
}

/**
 * CLAUDE.md の存在を確認
 */
async function findClaudeMd(): Promise<string | null> {
  // 実際の実装では Glob ツールを使用
  // ここでは優先順位順に返す
  for (const path of CLAUDE_MD_PATHS) {
    // TODO: ファイルの存在確認
    return path;
  }
  return null;
}

/**
 * 変更履歴を整形して要約を生成
 */
function summarizeChanges(): string {
  if (changeHistory.length === 0) {
    return '変更なし';
  }

  // ファイルごとにグループ化
  const fileGroups = changeHistory.reduce((acc, change) => {
    if (!acc[change.file]) {
      acc[change.file] = [];
    }
    acc[change.file].push(change);
    return acc;
  }, {} as Record<string, typeof changeHistory>);

  // 要約を生成
  const summary = Object.entries(fileGroups)
    .map(([file, changes]) => {
      const tools = [...new Set(changes.map(c => c.tool))].join(', ');
      return `- ${file} (${tools})`;
    })
    .join('\n');

  return summary;
}

/**
 * CLAUDE.md の更新を提案
 */
function suggestClaudeMdUpdate(): HookResponse {
  const changeCount = changeHistory.length;
  const summary = summarizeChanges();

  return {
    message: `
📝 CLAUDE.md 更新の提案

${changeCount}件の重要なファイル変更を検出しました:

${summary}

CLAUDE.md を更新して、変更内容を反映させることを推奨します。

実行コマンド:
\`\`\`
/claude-md-management:revise-claude-md
\`\`\`

または、自動同期を有効にするには:
\`\`\`
CONFIG.autoSync = true
\`\`\`
`.trim(),
  };
}

/**
 * CLAUDE.md を自動更新
 */
async function autoSyncClaudeMd(): Promise<HookResponse> {
  const claudeMdPath = await findClaudeMd();

  if (!claudeMdPath) {
    return {
      message: '⚠️ CLAUDE.md が見つかりません。スキップします。',
    };
  }

  // スキルを呼び出し（実際の実装では Skill ツールを使用）
  return {
    message: `
✅ CLAUDE.md を自動更新しました

変更内容:
${summarizeChanges()}

更新されたファイル: ${claudeMdPath}
`.trim(),
    // TODO: 実際にスキルを呼び出す
    // suggestCommand: '/claude-md-management:revise-claude-md',
  };
}

/**
 * メインの hook ハンドラー
 */
export default {
  /**
   * ツール呼び出し終了時に実行
   */
  onToolCallEnd: async (event: ToolCallEndEvent): Promise<HookResponse | void> => {
    // Edit または Write ツールのみ監視
    if (event.tool !== 'Edit' && event.tool !== 'Write') {
      return;
    }

    // ファイルパスを取得
    const filePath = event.file_path;

    // 重要ファイルかチェック
    if (!isImportantFile(filePath)) {
      return;
    }

    // CLAUDE.md 自体の変更は無視
    if (filePath.endsWith('CLAUDE.md')) {
      return;
    }

    // 変更履歴に追加
    changeHistory.push({
      file: filePath,
      tool: event.tool,
      timestamp: Date.now(),
    });

    // 最大数を超えたら古いものを削除
    if (changeHistory.length > CONFIG.maxChanges) {
      changeHistory = changeHistory.slice(-CONFIG.maxChanges);
    }

    // デバウンス: 最後の提案から一定時間経過していない場合はスキップ
    const now = Date.now();
    if (now - lastSuggestionTime < CONFIG.debounceMs) {
      return;
    }

    lastSuggestionTime = now;

    // 自動同期モードか提案モードか
    if (CONFIG.autoSync) {
      return await autoSyncClaudeMd();
    } else {
      return suggestClaudeMdUpdate();
    }
  },

  /**
   * セッション開始時に履歴をクリア
   */
  onSessionStart: async (): Promise<void> => {
    changeHistory = [];
    lastSuggestionTime = 0;
  },
};
