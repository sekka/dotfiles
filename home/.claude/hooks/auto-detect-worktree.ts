/**
 * git worktree 自動検出 Hook
 *
 * @purpose
 * セッション開始時に git worktree を検出し、専用設定を読み込む。
 * worktree ごとに異なる Claude Code 設定を適用できるようにする。
 *
 * @inspired-by
 * 松尾研究所の実践的なAIコーディング管理手法
 * https://zenn.dev/mkj/articles/868e0723efa060
 *
 * @features
 * - worktree の自動検出
 * - worktree 専用設定の読み込み
 * - ウェルカムメッセージの表示
 */

import type {
  SessionStartEvent,
  HookResponse,
} from '@anthropic-ai/claude-code';
import * as fs from 'fs';
import * as path from 'path';

// worktree 設定ファイル名
const WORKTREE_CONFIG_FILE = '.worktree-config.json';

// worktree 設定の型定義
interface WorktreeConfig {
  branch: string;
  purpose?: string;
  created: string;
  claudeConfig?: {
    model?: 'sonnet' | 'opus' | 'haiku';
    [key: string]: any;
  };
}

/**
 * 現在のディレクトリが worktree かどうかを判定
 */
function isWorktree(): boolean {
  const gitPath = path.join(process.cwd(), '.git');
  if (!fs.existsSync(gitPath)) return false;
  return fs.statSync(gitPath).isFile();
}

/**
 * worktree 設定ファイルを読み込む
 */
function loadWorktreeConfig(): WorktreeConfig | null {
  const cwd = process.cwd();
  const configPath = path.join(cwd, WORKTREE_CONFIG_FILE);

  if (!fs.existsSync(configPath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Failed to load worktree config:', error);
    return null;
  }
}

/**
 * worktree 情報を取得
 */
function getWorktreeInfo(): { branch: string; path: string } | null {
  const cwd = process.cwd();
  const gitPath = path.join(cwd, '.git');

  if (!fs.existsSync(gitPath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(gitPath, 'utf-8');
    // gitdir: /path/to/main/.git/worktrees/feature-a
    const match = content.match(/gitdir:\s*(.+)/);

    if (match) {
      const gitdir = match[1].trim();
      const branch = path.basename(gitdir);
      return { branch, path: cwd };
    }
  } catch (error) {
    console.error('Failed to read .git file:', error);
  }

  return null;
}

/**
 * worktree 設定を適用
 */
function applyWorktreeConfig(config: WorktreeConfig): HookResponse {
  const messages: string[] = [];

  // Claude Code 設定を適用
  if (config.claudeConfig) {
    if (config.claudeConfig.model) {
      messages.push(`モデル: ${config.claudeConfig.model}`);
    }
  }

  const configMessages = messages.length > 0
    ? `\n${messages.map(m => `  - ${m}`).join('\n')}`
    : '';

  return {
    message: `
📁 git worktree を検出しました

ブランチ: ${config.branch}
目的: ${config.purpose || '（未設定）'}
作成日: ${new Date(config.created).toLocaleDateString('ja-JP')}${configMessages}
`.trim()
  };
}

/**
 * デフォルトのウェルカムメッセージ
 */
function createDefaultWelcome(worktreeInfo: { branch: string; path: string }): HookResponse {
  return {
    message: `
📁 git worktree で作業中

ブランチ: ${worktreeInfo.branch}
パス: ${worktreeInfo.path}

💡 ヒント:
worktree 専用の設定を保存するには、${WORKTREE_CONFIG_FILE} を作成してください。
`.trim()
  };
}

/**
 * メインの hook ハンドラー
 */
export default {
  /**
   * セッション開始時に実行
   */
  onSessionStart: async (event: SessionStartEvent): Promise<HookResponse | void> => {
    // worktree かどうかを判定
    if (!isWorktree()) {
      // 通常のリポジトリ
      return;
    }

    // worktree 情報を取得
    const worktreeInfo = getWorktreeInfo();

    if (!worktreeInfo) {
      // worktree 情報が取得できない
      return;
    }

    // worktree 設定を読み込み
    const config = loadWorktreeConfig();

    if (config) {
      // 設定がある場合は適用
      return applyWorktreeConfig(config);
    } else {
      // 設定がない場合はデフォルトのメッセージ
      return createDefaultWelcome(worktreeInfo);
    }
  },
};
