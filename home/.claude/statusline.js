#!/usr/bin/env node

// https://zenn.dev/little_hand_s/articles/dbd5fc27f5a2f0

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

// Constants
const COMPACTION_THRESHOLD = 200000

// Read JSON from stdin
let input = '';
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', async () => {
  try {
    const data = JSON.parse(input);

    // Extract values
    const model = data.model?.display_name || 'Unknown';
    const currentDir = data.workspace?.current_dir || data.cwd || '.';
    const dirName = path.basename(currentDir);
    const sessionId = data.session_id;
    const sessionCost = data.cost?.total_cost_usd || 0;

    // Get Git branch and status
    let gitInfo = '';
    if (currentDir && fs.existsSync(path.join(currentDir, '.git'))) {
      try {
        const branchName = execSync('git --no-optional-locks branch --show-current 2>/dev/null', {
          cwd: currentDir,
          encoding: 'utf-8'
        }).trim();

        if (branchName) {
          gitInfo = ` 🌿 ${branchName}`;

          // ahead/behind の計算（main/master以外のブランチの場合）
          if (branchName !== 'main' && branchName !== 'master') {
            const aheadBehind = getAheadBehind(currentDir);
            if (aheadBehind) {
              gitInfo += ` ${aheadBehind}`;
            }
          }

          // 追加/削除された行数を取得
          const diffStats = getDiffStats(currentDir);
          if (diffStats) {
            gitInfo += ` ${diffStats}`;
          }
        }
      } catch (e) {
        // Gitコマンドエラーは無視
      }
    }

    // Calculate token usage for current session
    // current_usage を優先的に使用し、より正確なコンテキスト使用率を取得
    let totalTokens = 0;

    if (data.context_window?.current_usage) {
      // current_usage が利用可能な場合はそれを使用
      const usage = data.context_window.current_usage;
      totalTokens = (usage.input_tokens || 0) +
        (usage.output_tokens || 0) +
        (usage.cache_creation_input_tokens || 0) +
        (usage.cache_read_input_tokens || 0);
    } else if (sessionId) {
      // current_usage が null の場合は、transcript ファイルから計算（フォールバック）
      const projectsDir = path.join(process.env.HOME, '.claude', 'projects');

      if (fs.existsSync(projectsDir)) {
        // Get all project directories
        const projectDirs = fs.readdirSync(projectsDir)
          .map(dir => path.join(projectsDir, dir))
          .filter(dir => fs.statSync(dir).isDirectory());

        // Search for the current session's transcript file
        for (const projectDir of projectDirs) {
          const transcriptFile = path.join(projectDir, `${sessionId}.jsonl`);

          if (fs.existsSync(transcriptFile)) {
            totalTokens = await calculateTokensFromTranscript(transcriptFile);
            break;
          }
        }
      }
    }

    // Calculate percentage
    const percentage = Math.min(100, Math.round((totalTokens / COMPACTION_THRESHOLD) * 100));

    // Format token display
    const tokenDisplay = formatTokenCount(totalTokens);

    // Color coding for percentage (same ratio as original article with 160K base)
    let percentageColor = '\x1b[32m'; // Green
    if (percentage >= 56) percentageColor = '\x1b[33m'; // Yellow (112K/200K)
    if (percentage >= 72) percentageColor = '\x1b[91m'; // Bright Red (144K/200K)

    // Get session clock (elapsed time)
    let sessionClock = '';
    if (sessionId) {
      const projectsDir = path.join(process.env.HOME, '.claude', 'projects');
      if (fs.existsSync(projectsDir)) {
        const projectDirs = fs.readdirSync(projectsDir)
          .map(dir => path.join(projectsDir, dir))
          .filter(dir => fs.statSync(dir).isDirectory());

        for (const projectDir of projectDirs) {
          const transcriptFile = path.join(projectDir, `${sessionId}.jsonl`);
          if (fs.existsSync(transcriptFile)) {
            const stats = fs.statSync(transcriptFile);
            const elapsed = Date.now() - stats.birthtimeMs;
            sessionClock = formatElapsedTime(elapsed);
            break;
          }
        }
      }
    }

    // Build status line
    // gitInfo の末尾に色リセットを追加して後続のテキストに影響しないようにする
    const gitInfoDisplay = gitInfo ? `${gitInfo}\x1b[0m` : '';
    const clockDisplay = sessionClock ? ` | ⏱️ ${sessionClock}` : '';
    const costDisplay = formatCost(sessionCost);
    const statusLine = `[${model}] 📁 ${dirName}${gitInfoDisplay} | 🪙 ${tokenDisplay} | ${percentageColor}${percentage}%\x1b[0m | 💵 ${costDisplay}${clockDisplay} \x1b[90m| ${sessionId}\x1b[0m`;

    console.log(statusLine);
  } catch (error) {
    // Fallback status line on error
    console.log('[Claude Code]');
  }
});

async function calculateTokensFromTranscript(filePath) {
  return new Promise((resolve, reject) => {
    let lastUsage = null;

    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    rl.on('line', (line) => {
      try {
        const entry = JSON.parse(line);

        // Check if this is an assistant message with usage data
        if (entry.type === 'assistant' && entry.message?.usage) {
          lastUsage = entry.message.usage;
        }
      } catch (e) {
        // Skip invalid JSON lines
      }
    });

    rl.on('close', () => {
      if (lastUsage) {
        // The last usage entry contains cumulative tokens
        const totalTokens = (lastUsage.input_tokens || 0) +
          (lastUsage.output_tokens || 0) +
          (lastUsage.cache_creation_input_tokens || 0) +
          (lastUsage.cache_read_input_tokens || 0);
        resolve(totalTokens);
      } else {
        resolve(0);
      }
    });

    rl.on('error', (err) => {
      reject(err);
    });
  });
}

function formatTokenCount(tokens) {
  if (tokens >= 1000000) {
    return `${(tokens / 1000000).toFixed(1)}M`;
  } else if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(1)}K`;
  }
  return tokens.toString();
}

// コストを $X.XX 形式でフォーマット
function formatCost(cost) {
  if (cost >= 1) {
    return `$${cost.toFixed(2)}`;
  } else if (cost >= 0.01) {
    return `$${cost.toFixed(2)}`;
  } else if (cost > 0) {
    // 1セント未満は小数点以下3桁まで表示
    return `$${cost.toFixed(3)}`;
  }
  return '$0.00';
}

// 経過時間を HH:MM:SS 形式でフォーマット
function formatElapsedTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

// 親ブランチ（origin/main または origin/master）との ahead/behind を計算
function getAheadBehind(cwd) {
  try {
    // 親ブランチを特定
    let parentBranch = '';
    try {
      execSync('git --no-optional-locks rev-parse --verify origin/main 2>/dev/null', {
        cwd,
        encoding: 'utf-8'
      });
      parentBranch = 'origin/main';
    } catch {
      try {
        execSync('git --no-optional-locks rev-parse --verify origin/master 2>/dev/null', {
          cwd,
          encoding: 'utf-8'
        });
        parentBranch = 'origin/master';
      } catch {
        return null;
      }
    }

    // ahead: 親ブランチにない自分のコミット数
    const ahead = parseInt(
      execSync(`git --no-optional-locks rev-list --count ${parentBranch}..HEAD 2>/dev/null`, {
        cwd,
        encoding: 'utf-8'
      }).trim() || '0',
      10
    );

    // behind: 自分にない親ブランチのコミット数
    const behind = parseInt(
      execSync(`git --no-optional-locks rev-list --count HEAD..${parentBranch} 2>/dev/null`, {
        cwd,
        encoding: 'utf-8'
      }).trim() || '0',
      10
    );

    // 結果を組み立て（黄色で表示）
    if (ahead > 0 && behind > 0) {
      return `\x1b[33m↑${ahead}↓${behind}\x1b[0m`;
    } else if (ahead > 0) {
      return `\x1b[33m↑${ahead}\x1b[0m`;
    } else if (behind > 0) {
      return `\x1b[33m↓${behind}\x1b[0m`;
    }

    return null;
  } catch {
    return null;
  }
}

// 追加/削除された行数を取得
function getDiffStats(cwd) {
  try {
    // unstaged + staged の diff を取得
    const unstagedDiff = execSync('git --no-optional-locks diff --numstat 2>/dev/null', {
      cwd,
      encoding: 'utf-8'
    });
    const stagedDiff = execSync('git --no-optional-locks diff --cached --numstat 2>/dev/null', {
      cwd,
      encoding: 'utf-8'
    });

    // 追加・削除行数を集計
    let added = 0;
    let deleted = 0;

    const parseDiff = (diffOutput) => {
      for (const line of diffOutput.split('\n')) {
        if (!line.trim()) continue;
        const parts = line.split('\t');
        if (parts.length >= 2) {
          // バイナリファイルは '-' になるのでスキップ
          const addCount = parseInt(parts[0], 10);
          const delCount = parseInt(parts[1], 10);
          if (!isNaN(addCount)) added += addCount;
          if (!isNaN(delCount)) deleted += delCount;
        }
      }
    };

    parseDiff(unstagedDiff);
    parseDiff(stagedDiff);

    // untracked files の行数も追加
    const untrackedFiles = execSync(
      'git --no-optional-locks ls-files --others --exclude-standard 2>/dev/null',
      { cwd, encoding: 'utf-8' }
    ).trim();

    if (untrackedFiles) {
      for (const file of untrackedFiles.split('\n')) {
        if (!file.trim()) continue;
        try {
          const filePath = path.join(cwd, file);
          if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            const content = fs.readFileSync(filePath, 'utf-8');
            added += content.split('\n').length;
          }
        } catch {
          // ファイル読み取りエラーは無視
        }
      }
    }

    // 結果を組み立て（緑で追加、赤で削除）
    if (added > 0 || deleted > 0) {
      return `\x1b[32m+${added}\x1b[0m \x1b[31m-${deleted}\x1b[0m`;
    }

    return null;
  } catch {
    return null;
  }
}
