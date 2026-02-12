#!/bin/bash
# =============================================================================
# Qwen3 TTS Setup Script
# =============================================================================
#
# このスクリプトは Qwen3 TTS（テキスト読み上げ）環境をセットアップします：
#   - mlx-audio: MLX ベースの音声生成ツール
#   - 参照音声ディレクトリの作成
#
# =============================================================================
# 使い方
# =============================================================================
#
# 【初回セットアップ後の手順】
#
# 1. 参照音声を配置（任意）
#    $ cp your_reference.wav ~/.local/share/qwen3-tts/reference-audio/
#
# 2. TTS 実行
#    $ mlx-audio tts --text "読み上げたいテキスト" --output output.wav
#    $ mlx-audio tts --text "テキスト" --reference ~/.local/share/qwen3-tts/reference-audio/your_reference.wav --output output.wav
#
# 【モデルについて】
#    - 初回実行時にモデルが自動ダウンロードされます
#    - ダウンロード先: ~/.cache/huggingface/ 配下
#    - ネットワーク接続が必要です
#
# 【注意事項】
#    - macOS + Apple Silicon が前提
#    - ffmpeg が必要（音声変換に使用）
#    - mlx-audio は uv tool で管理（~/.local/bin/ にシムリンク配置）
#
# =============================================================================

set -euo pipefail

echo "=== Qwen3 TTS Setup ==="

# 前提条件チェック: uv
if ! command -v uv >/dev/null 2>&1; then
  echo "❌ Error: uv command not found."
  echo "   Please run: brew install uv"
  exit 1
fi
echo "✓ uv available"

# 前提条件チェック: ffmpeg
if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "❌ Error: ffmpeg command not found."
  echo "   Please run: brew install ffmpeg"
  exit 1
fi
echo "✓ ffmpeg available"

# mlx-audio のインストール
if uv tool list | grep -q mlx-audio; then
  echo "✓ mlx-audio already installed"
else
  echo "📥 Installing mlx-audio..."

  # 通常インストール
  if uv tool install mlx-audio --prerelease=allow; then
    echo "✓ mlx-audio installed"
  else
    # Issue #420 対策: numpy<2 でリトライ
    echo "⚠ Installation failed. Retrying with numpy<2 (Issue #420 workaround)..."
    if uv tool install mlx-audio --prerelease=allow --with 'numpy<2'; then
      echo "✓ mlx-audio installed (with numpy<2)"
    else
      echo "❌ Failed to install mlx-audio"
      exit 1
    fi
  fi
fi

# インストール確認
if uv tool list | grep -q mlx-audio; then
  echo "✓ mlx-audio installation verified"
else
  echo "❌ mlx-audio verification failed"
  exit 1
fi

# 参照音声ディレクトリ作成
XDG_DATA_HOME="${XDG_DATA_HOME:-$HOME/.local/share}"
REFERENCE_AUDIO_DIR="$XDG_DATA_HOME/qwen3-tts/reference-audio"

if [[ -d $REFERENCE_AUDIO_DIR ]]; then
  echo "✓ Reference audio directory exists: $REFERENCE_AUDIO_DIR"
else
  echo "📁 Creating reference audio directory..."
  mkdir -p "$REFERENCE_AUDIO_DIR"
  echo "✓ Created: $REFERENCE_AUDIO_DIR"
fi

echo ""
echo "=== Qwen3 TTS Setup Complete ==="
echo ""
echo "Next steps:"
echo "  1. (Optional) Place reference audio: cp your_reference.wav $REFERENCE_AUDIO_DIR/"
echo '  2. Run TTS: mlx-audio tts --text "Hello, world!" --output output.wav'
echo "  3. Model will be downloaded automatically on first run"
echo ""
