# ===========================================
# Qwen3 TTS - テキスト音声合成
# ===========================================
# MLX Audio (mlx-audio) を使用したTTS機能
# 多言語対応、高品質な音声生成
#
# 使用方法:
#   tts "こんにちは"                      - デフォルトモデル(0.6B)で再生
#   tts --hq "高品質テスト"                - 1.7Bモデルで高品質生成
#   tts -o output.wav "保存テスト"        - ファイル保存
#   tts-clone ref.wav "生成テキスト"      - ボイスクローン再生
#   tts-voices                           - 参照音声ディレクトリを開く

# mlx-audioの存在チェック
if ! uv tool list 2>/dev/null | grep -q mlx-audio; then
    echo "Warning: mlx-audio is not installed. Install with: uv tool install mlx-audio" >&2
else
    # データディレクトリのデフォルト設定
    : ${XDG_DATA_HOME:="$HOME/.local/share"}
    local REFERENCE_AUDIO_DIR="$XDG_DATA_HOME/qwen3-tts/reference-audio"

    # tts - 基本的なテキスト→音声生成+再生
    # 使用例:
    #   tts "こんにちは"                    # デフォルト(0.6B-Base)で再生
    #   tts --hq "高品質テスト"              # 1.7Bモデルで高品質生成
    #   tts -o output.wav "保存テスト"      # ファイル保存
    function tts() {
        local model="mlx-community/Qwen3-TTS-12Hz-0.6B-Base-bf16"
        local output_file=""
        local text=""
        local extra_args=()

        # 引数解析
        while [[ $# -gt 0 ]]; do
            case "$1" in
                --hq)
                    model="mlx-community/Qwen3-TTS-12Hz-1.7B-Base-bf16"
                    shift
                    ;;
                -o|--output)
                    output_file="$2"
                    shift 2
                    ;;
                *)
                    text="$1"
                    shift
                    ;;
            esac
        done

        # テキストチェック
        if [[ -z "$text" ]]; then
            echo "Usage: tts [--hq] [-o output.wav] <text>" >&2
            return 1
        fi

        # 出力ファイル指定がなければデフォルトで再生
        if [[ -z "$output_file" ]]; then
            extra_args+=(--play)
        else
            extra_args+=(-o "$output_file")
        fi

        # TTS実行
        uv tool run --from mlx-audio mlx_audio.tts.generate \
            --model "$model" \
            --text "$text" \
            "${extra_args[@]}"
    }

    # tts-clone - ボイスクローン+再生
    # 使用例:
    #   tts-clone ref.wav "生成テキスト"
    #   tts-clone ref.wav "生成テキスト" --ref-text "参照音声の内容"
    function tts-clone() {
        local model="mlx-community/Qwen3-TTS-12Hz-0.6B-CustomVoice-bf16"
        local reference_audio=""
        local text=""
        local reference_text=""

        # 引数チェック
        if [[ $# -lt 2 ]]; then
            echo "Usage: tts-clone <reference_audio> <text> [--ref-text <reference_text>]" >&2
            return 1
        fi

        reference_audio="$1"
        text="$2"
        shift 2

        # オプション引数の処理
        while [[ $# -gt 0 ]]; do
            case "$1" in
                --ref-text)
                    reference_text="$2"
                    shift 2
                    ;;
                *)
                    echo "Unknown option: $1" >&2
                    return 1
                    ;;
            esac
        done

        # 参照音声ファイルの存在チェック
        if [[ ! -f "$reference_audio" ]]; then
            echo "Error: Reference audio file not found: $reference_audio" >&2
            return 1
        fi

        # TTS実行
        local tts_args=(
            --model "$model"
            --text "$text"
            --reference-audio "$reference_audio"
            --play
        )

        if [[ -n "$reference_text" ]]; then
            tts_args+=(--reference-text "$reference_text")
        fi

        uv tool run --from mlx-audio mlx_audio.tts.generate "${tts_args[@]}"
    }

    # tts-voices - 参照音声ディレクトリを開く
    # 使用例:
    #   tts-voices
    function tts-voices() {
        # ディレクトリが存在しない場合は作成
        if [[ ! -d "$REFERENCE_AUDIO_DIR" ]]; then
            mkdir -p "$REFERENCE_AUDIO_DIR"
            echo "Created reference audio directory: $REFERENCE_AUDIO_DIR"
        fi

        # yazi が利用可能ならyaziで開く
        if command -v yazi >/dev/null 2>&1; then
            yazi "$REFERENCE_AUDIO_DIR"
        else
            open "$REFERENCE_AUDIO_DIR"
        fi
    }
fi
