#!/bin/bash
# Qwen3 TTS 環境のセットアップ（mlx-audio、参照音声ディレクトリ）

# shellcheck source=lib/common.sh
source "$(dirname "$0")/lib/common.sh"
log_section "09: TTS setup"

# --- mlx-audio インストール ---

if uv tool list | grep -q mlx-audio; then
  log_skip "mlx-audio はインストール済み"
else
  log_info "mlx-audio をインストールしています..."

  if uv tool install mlx-audio --prerelease=allow; then
    log_info "mlx-audio をインストールしました"
  else
    log_warn "通常インストールに失敗しました。numpy<2 でリトライしています..."
    if uv tool install mlx-audio --prerelease=allow --with 'numpy<2'; then
      log_info "mlx-audio をインストールしました（numpy<2 使用）"
    else
      log_error "mlx-audio のインストールに失敗しました"
      exit 1
    fi
  fi
fi

# インストール確認
if ! uv tool list | grep -q mlx-audio; then
  log_error "mlx-audio のインストール確認に失敗しました"
  exit 1
fi

# --- 参照音声ディレクトリ ---

XDG_DATA_HOME="${XDG_DATA_HOME:-$HOME/.local/share}"
REFERENCE_AUDIO_DIR="$XDG_DATA_HOME/qwen3-tts/reference-audio"

if [[ -d $REFERENCE_AUDIO_DIR ]]; then
  log_skip "参照音声ディレクトリは既に存在します: $REFERENCE_AUDIO_DIR"
else
  log_info "参照音声ディレクトリを作成しています..."
  mkdir -p "$REFERENCE_AUDIO_DIR"
  log_info "作成しました: $REFERENCE_AUDIO_DIR"
fi

# --- サマリー ---

log_section "09: 完了"
log_info "TTS 実行例: mlx_audio.tts.generate --model mlx-community/Qwen3-TTS-12Hz-0.6B-Base-bf16 --text 'Hello' --play"
