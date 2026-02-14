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

# mlx_audio.tts.generate コマンドの実行可能性チェック
if ! mlx_audio.tts.generate --help >/dev/null 2>&1; then
    return 0
fi

_TTS_REFERENCE_AUDIO_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/qwen3-tts/reference-audio"

# モデルの定義
_TTS_MODEL_DEFAULT="mlx-community/Qwen3-TTS-12Hz-0.6B-Base-bf16"
_TTS_MODEL_HQ="mlx-community/Qwen3-TTS-12Hz-1.7B-Base-bf16"

# セキュリティ: テキスト入力のサニタイゼーション
# シェルメタ文字をエスケープしてコマンドインジェクションを防止
_tts_sanitize_text() {
    _tts_sanitize "$1" true
}

# セキュリティ: ファイルパスのサニタイゼーション
# ダブルクォート内で安全に使用できるようエスケープ
_tts_sanitize_path() {
    _tts_sanitize "$1" false
}

# セキュリティ: 共通サニタイゼーション関数
# 引数1: サニタイズするテキスト
# 引数2: シェルメタ文字もエスケープするか（true/false、デフォルト: false）
_tts_sanitize() {
    local text="$1"
    local escape_shell="${2:-false}"

    # 基本エスケープ（両関数共通）
    text="${text//\\/\\\\}"
    text="${text//\"/\\\"}"
    text="${text//\$/\\\$}"
    text="${text//\`/\\\`}"

    # シェルメタ文字エスケープ（テキスト用のみ）
    if [[ "$escape_shell" == "true" ]]; then
        text="${text//;/\\;}"
        text="${text//|/\\|}"
        text="${text//&/\\&}"
        text="${text//$'\n'/\\n}"
    fi

    echo "$text"
}

# 出力ファイル検出関数
# MLX Audioが生成したファイル（prefix_000.ext形式）を検索
# 引数1: 出力ディレクトリ
# 引数2: ファイルプレフィックス
# 引数3: 拡張子（デフォルト: wav）
_tts_find_output_file() {
    local output_dir="$1"
    local file_prefix="$2"
    local extension="${3:-wav}"

    setopt local_options nullglob

    local expected_file="${output_dir}/${file_prefix}.${extension}"
    local candidates=("${expected_file%.*}"_*.${extension})

    if [[ -f "$expected_file" ]]; then
        echo "$expected_file"
        return 0
    elif (( ${#candidates[@]} > 1 )); then
        # 複数ファイルがある場合は最新のものを選択
        echo "${candidates[-1]}"
        return 0
    elif (( ${#candidates[@]} == 1 )); then
        echo "${candidates[1]}"
        return 0
    fi

    echo "Error: Expected output file not created" >&2
    echo "Expected: $expected_file or ${expected_file%.*}_NNN.${extension}" >&2
    return 1
}

# 音声ファイルの再生（macOS専用）
# 引数1: 音声ファイルパス
_tts_playback() {
    local audio_file="$1"

    if [[ -z "$audio_file" || ! -f "$audio_file" ]]; then
        echo "Warning: Audio file not found for playback" >&2
        return 1
    fi

    echo "Playing audio..."
    afplay "$audio_file" || {
        echo "Warning: Playback failed" >&2
    }
}

# 一時ファイルのクリーンアップ
# 引数1: 音声ファイルパス
_tts_cleanup() {
    local audio_file="$1"
    [[ -f "$audio_file" ]] && rm -f "$audio_file" || {
        echo "Warning: Failed to clean up: $audio_file" >&2
    }
}

# 後方互換性のための統合関数（既存コードのため保持）
# 引数1: 音声ファイルパス
# 引数2: クリーンアップするか（true/false、デフォルト: true）
_tts_playback_and_cleanup() {
    local audio_file="$1"
    local cleanup="${2:-true}"

    _tts_playback "$audio_file" || return $?

    if [[ "$cleanup" == "true" ]]; then
        _tts_cleanup "$audio_file"
    fi
}

# TTS実行結果の検証
# exit code 144 は mlx-audio v0.3.1+ で音声生成成功を示す特殊コード
_tts_check_status() {
    local status=$1
    if (( status != 0 && status != 144 )); then
        echo "Error: TTS generation failed with status $status" >&2
        return $status
    fi
    return 0
}

# tts - 基本的なテキスト→音声生成+再生
# 使用例:
#   tts "こんにちは"                    # デフォルト(0.6B-Base)で再生
#   tts --hq "高品質テスト"              # 1.7Bモデルで高品質生成
#   tts -o output.wav "保存テスト"      # ファイル保存
#
# 将来的な拡張オプション（未実装）:
# - --voice: 音声選択（Base モデル用）
# - --speed: 話速調整（0.5〜2.0）
# - --pitch: ピッチ調整（-12〜12）
# - --instruct: 感情/スタイル指定（CustomVoice モデル用）
#
# これらのオプションを追加する場合は、以下の形式で extra_args に追加:
# extra_args+=(--speed "$speed_value")
function tts() {
    setopt local_options nullglob

    local model="$_TTS_MODEL_DEFAULT"
    local output_file=""
    local text=""
    local extra_args=()

    # 引数解析
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --hq)
                model="$_TTS_MODEL_HQ"
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
        cat >&2 <<'USAGE'
Usage: tts [--hq] [-o output.wav] <text>

Options:
  --hq              Use high-quality 1.7B model (default: 0.6B)
  -o, --output FILE Output to file (format: wav, mp3, flac, ogg, aac, opus)

Examples:
  tts "Hello world"                    # Play immediately
  tts -o output.mp3 "Save to file"      # Save as MP3
  tts --hq "High quality speech"        # Use 1.7B model
USAGE
        return 1
    fi

    # セキュリティ: テキスト入力のサニタイゼーション
    # mlx_audio.tts.generate に渡す前にエスケープ
    text=$(_tts_sanitize_text "$text")

    # 出力ファイルの決定
    local actual_output_file="$output_file"
    local auto_play=false

    if [[ -z "$output_file" ]]; then
        # 出力ファイル指定がない場合は一時ファイルを作成
        actual_output_file=$(mktemp --suffix=.wav) || {
            echo "Error: Failed to create temporary file" >&2
            return 1
        }
        auto_play=true
    else
        # セキュリティ: 出力ファイルパスのサニタイゼーション
        actual_output_file=$(_tts_sanitize_path "$output_file")
    fi

    local output_dir="${actual_output_file:h}"
    if [[ "$output_dir" == "$actual_output_file" ]]; then
        output_dir="."
    fi

    # ディレクトリ作成とエラーハンドリング
    if [[ ! -d "$output_dir" ]]; then
        mkdir -p "$output_dir" || {
            echo "Error: Failed to create output directory: $output_dir" >&2
            return 1
        }
    fi
    # 書き込み権限チェック
    if [[ ! -w "$output_dir" ]]; then
        echo "Error: Output directory not writable: $output_dir" >&2
        return 1
    fi

    local file_prefix="${actual_output_file:t:r}"
    if [[ -z "$file_prefix" ]]; then
        echo "Error: Invalid output filename" >&2
        return 1
    fi
    extra_args+=(--output_path "$output_dir" --file_prefix "$file_prefix")
    local ext="${actual_output_file:t:e}"
    if [[ -n "$ext" ]]; then
        # サポートされているフォーマットの検証
        local -r valid_formats=("wav" "mp3" "flac" "ogg" "aac" "opus")
        if [[ ! " ${valid_formats[*]} " =~ " ${ext} " ]]; then
            echo "Warning: Audio format '$ext' may not be supported" >&2
            echo "Supported formats: ${valid_formats[*]}" >&2
            echo "Proceeding anyway..." >&2
        fi
        extra_args+=(--audio_format "$ext")
    fi

    # TTS実行
    mlx_audio.tts.generate \
        --model "$model" \
        --text "$text" \
        --lang_code auto \
        --temperature 0 \
        "${extra_args[@]}"
    local tts_status=$?

    # コマンドの終了ステータスチェック
    # mlx-audio v0.3.1+ の内部実装による非エラー終了コード
    # exit code 144 は音声ファイル生成成功を示す特殊コード
    # 参考: セッション#S26 でのコミット 2084ea9
    # TODO(issue): MLX Audio公式でこのコードが文書化されているか確認
    # 参考: https://github.com/ml-explore/mlx-audio/issues
    _tts_check_status $tts_status || return $?

    # 出力ファイルの存在確認
    local playback_file
    playback_file=$(_tts_find_output_file "$output_dir" "${actual_output_file:t:r}" "${ext:-wav}") || return 1

    # 自動再生（output_fileが指定されていない場合のみ）
    if $auto_play; then
        _tts_playback_and_cleanup "$playback_file" true
    fi
}

# tts-clone - ボイスクローン（参照音声を使った声質の模倣）
# 使用例:
#   tts-clone ~/.local/share/qwen3-tts/reference-audio/my_voice.wav "読み上げテキスト"
#   tts-clone ref.wav "生成テキスト" --ref-text "参照音声の内容"
#
# 参照音声の要件:
#   - フォーマット: WAV（推奨）
#   - 長さ: 5〜10秒
#   - 品質: クリアな音声、ノイズなし
#   - パス: 絶対パス（セキュリティのため必須）
function tts-clone() {
    setopt local_options nullglob

    # 一時ファイルのクリーンアップ設定
    local temp_output_file
    temp_output_file=$(mktemp --suffix=.wav) || {
        echo "Error: Failed to create temporary file" >&2
        return 1
    }

    local model="$_TTS_MODEL_DEFAULT"
    local reference_audio=""
    local text=""
    local reference_text=""

    # 引数チェック
    if [[ $# -lt 2 ]]; then
        cat >&2 <<'USAGE'
Usage: tts-clone <reference_audio> <text> [--ref-text <reference_text>]

Arguments:
  reference_audio  Path to reference audio file (absolute path required)
  text            Text to synthesize

Options:
  --ref-text TEXT  Description of reference audio (improves quality)

Examples:
  tts-clone ~/.local/share/qwen3-tts/reference-audio/my_voice.wav "Hello"
  tts-clone /path/to/voice.wav "Test" --ref-text "Sample speech"
USAGE
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

    # ref-text 必須チェック（mlx-audio の Whisper STT バグ回避）
    if [[ -z "$reference_text" ]]; then
        {
            echo "Error: --ref-text is required."
            echo ""
            echo "Usage: tts-clone <ref_audio> <text> --ref-text <ref_audio_content>"
            echo "Example: tts-clone ref.wav \"Hello\" --ref-text \"Reference audio transcript\""
        } >&2
        return 1
    fi

    # セキュリティ: 入力値のサニタイゼーション
    text=$(_tts_sanitize_text "$text")
    reference_text=$(_tts_sanitize_text "$reference_text")

    # 参照音声ファイルの存在チェック
    if [[ ! -f "$reference_audio" ]]; then
        echo "Error: Reference audio file not found: $reference_audio" >&2
        return 1
    fi

    # セキュリティ: 絶対パス検証とパストラバーサル対策
    local real_path
    real_path=$(realpath "$reference_audio" 2>/dev/null) || {
        echo "Error: Invalid reference audio path: $reference_audio" >&2
        return 1
    }

    # 許可ディレクトリ内か確認
    if [[ ! "$real_path" =~ ^"$_TTS_REFERENCE_AUDIO_DIR"/* ]] && \
       [[ ! "$real_path" =~ ^"$HOME"/* ]]; then
        echo "Error: Reference audio must be in $_TTS_REFERENCE_AUDIO_DIR or HOME directories" >&2
        return 1
    fi

    # 以降は正規化されたパスを使用
    reference_audio="$real_path"

    # セキュリティ: 参照音声パスのサニタイゼーション
    reference_audio=$(_tts_sanitize_path "$reference_audio")

    # 一時出力ファイルのディレクトリ設定
    local output_dir="${temp_output_file:h}"
    if [[ "$output_dir" == "$temp_output_file" ]]; then
        output_dir="."
    fi

    # TTS実行
    # ボイスクローンパラメータ（mlx_audio.tts.generate v0.3.1+ で検証済み）
    # --ref_audio: 参照音声ファイルのパス
    # --ref_text: 参照音声の内容（必須、Whisper STTバグ回避のため）
    local tts_args=(
        --model "$model"
        --text "$text"
        --ref_audio "$reference_audio"
        --ref_text "$reference_text"
        --lang_code auto
        --temperature 0
        --output_path "$output_dir"
        --file_prefix "${temp_output_file:t:r}"
    )

    mlx_audio.tts.generate "${tts_args[@]}"
    local tts_status=$?

    # コマンドの終了ステータスチェック
    # mlx-audio v0.3.1+ の内部実装による非エラー終了コード
    # exit code 144 は音声ファイル生成成功を示す特殊コード
    # 参考: セッション#S26 でのコミット 2084ea9
    # TODO(issue): MLX Audio公式でこのコードが文書化されているか確認
    # 参考: https://github.com/ml-explore/mlx-audio/issues
    if ! _tts_check_status $tts_status; then
        local pattern="${temp_output_file:t:r}"
        [[ -n "$pattern" ]] && rm -f ./"${pattern}"*.wav 2>/dev/null
        return $tts_status
    fi

    # 生成されたファイルを探して再生
    local playback_file
    playback_file=$(_tts_find_output_file "$output_dir" "${temp_output_file:t:r}" "wav") || {
        local pattern="${temp_output_file:t:r}"
        [[ -n "$pattern" ]] && rm -f ./"${pattern}"*.wav 2>/dev/null
        return 1
    }

    # 再生とクリーンアップ
    _tts_playback_and_cleanup "$playback_file" true
}

# tts-voices - 参照音声の管理
# 使用例:
#   tts-voices              # 参照音声ディレクトリを開く
#
# 参照音声の配置場所: ~/.local/share/qwen3-tts/reference-audio/
function tts-voices() {
    # ディレクトリが存在しない場合は作成
    if [[ ! -d "$_TTS_REFERENCE_AUDIO_DIR" ]]; then
        mkdir -p "$_TTS_REFERENCE_AUDIO_DIR"
        echo "Created reference audio directory: $_TTS_REFERENCE_AUDIO_DIR"
    fi

    # yazi が利用可能ならyaziで開く
    if command -v yazi >/dev/null 2>&1; then
        yazi "$_TTS_REFERENCE_AUDIO_DIR"
    else
        open "$_TTS_REFERENCE_AUDIO_DIR"
    fi
}
