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

    // Get Git branch
    let branch = '';
    if (currentDir && fs.existsSync(path.join(currentDir, '.git'))) {
      try {
        const branchName = execSync('git --no-optional-locks branch --show-current 2>/dev/null', {
          cwd: currentDir,
          encoding: 'utf-8'
        }).trim();
        if (branchName) {
          branch = ` 🌿 ${branchName}`;
        }
      } catch (e) {
        // Gitコマンドエラーは無視
      }
    }

    // Calculate token usage for current session
    let totalTokens = 0;

    if (sessionId) {
      // Find all transcript files
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

    // Build status line
    const statusLine = `[${model}] 📁 ${dirName}${branch} | 🪙 ${tokenDisplay} | ${percentageColor}${percentage}%\x1b[0m \x1b[90m| ${sessionId}\x1b[0m`;

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
