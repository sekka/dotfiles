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
        elif (( ${#candidates[@]} > 0 )); then
            echo "${candidates[1]}"
            return 0
        fi

        echo "Error: Expected output file not created" >&2
        echo "Expected: $expected_file or ${expected_file%.*}_NNN.${extension}" >&2
        return 1
    }

    # 音声再生とクリーンアップ（macOS専用）
    # 引数1: 音声ファイルパス
    # 引数2: クリーンアップするか（true/false、デフォルト: true）
    _tts_playback_and_cleanup() {
        local audio_file="$1"
        local cleanup="${2:-true}"

        if [[ -z "$audio_file" || ! -f "$audio_file" ]]; then
            echo "Warning: Audio file not found for playback" >&2
            return 1
        fi

        echo "Playing audio..."
        afplay "$audio_file" || {
            echo "Warning: Playback failed" >&2
        }

        # クリーンアップ
        if [[ "$cleanup" == "true" ]]; then
            rm -f "$audio_file" || {
                echo "Warning: Failed to clean up: $audio_file" >&2
            }
        fi
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
            echo "" >&2
            echo "Options:" >&2
            echo "  --hq              Use high-quality 1.7B model (default: 0.6B)" >&2
            echo "  -o, --output FILE Output to file (format: wav, mp3, flac, ogg, aac, opus)" >&2
            echo "" >&2
            echo "Examples:" >&2
            echo "  tts \"Hello world\"                    # Play immediately" >&2
            echo "  tts -o output.mp3 \"Save to file\"      # Save as MP3" >&2
            echo "  tts --hq \"High quality speech\"        # Use 1.7B model" >&2
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
            actual_output_file="audio_output_$$.wav"
            auto_play=true
        else
            # セキュリティ: 出力ファイルパスのサニタイゼーション
            actual_output_file=$(_tts_sanitize_path "$output_file")
        fi

        local output_dir="${actual_output_file:h}"
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

        extra_args+=(--output_path "$output_dir" --file_prefix "${actual_output_file:t:r}")
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
            "${extra_args[@]}"

        # コマンドの終了ステータスチェック
        # mlx-audio v0.3.1+ の内部実装による非エラー終了コード
        # exit code 144 は音声ファイル生成成功を示す特殊コード
        # 参考: セッション#S26 でのコミット 2084ea9
        # TODO: MLX Audio公式でこのコードが文書化されているか確認
        local tts_status=$?
        if (( tts_status != 0 && tts_status != 144 )); then
            echo "Error: TTS generation failed with status $tts_status" >&2
            return $tts_status
        fi

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
        local temp_output_file="audio_clone_$$.wav"
        trap 'rm -f ./audio_clone_$$*.wav' EXIT ERR

        local model="mlx-community/Qwen3-TTS-12Hz-0.6B-Base-bf16"
        local reference_audio=""
        local text=""
        local reference_text=""

        # 引数チェック
        if [[ $# -lt 2 ]]; then
            echo "Usage: tts-clone <reference_audio> <text> [--ref-text <reference_text>]" >&2
            echo "" >&2
            echo "Arguments:" >&2
            echo "  reference_audio  Path to reference audio file (absolute path required)" >&2
            echo "  text            Text to synthesize" >&2
            echo "" >&2
            echo "Options:" >&2
            echo "  --ref-text TEXT  Description of reference audio (improves quality)" >&2
            echo "" >&2
            echo "Examples:" >&2
            echo "  tts-clone ~/.local/share/qwen3-tts/reference-audio/my_voice.wav \"Hello\"" >&2
            echo "  tts-clone /path/to/voice.wav \"Test\" --ref-text \"Sample speech\"" >&2
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
        if [[ -n "$reference_text" ]]; then
            reference_text=$(_tts_sanitize_text "$reference_text")
        fi

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
            --output_path "$output_dir"
            --file_prefix "${temp_output_file:t:r}"
        )

        mlx_audio.tts.generate "${tts_args[@]}"

        # コマンドの終了ステータスチェック
        # mlx-audio v0.3.1+ の内部実装による非エラー終了コード
        # exit code 144 は音声ファイル生成成功を示す特殊コード
        # 参考: セッション#S26 でのコミット 2084ea9
        # TODO: MLX Audio公式でこのコードが文書化されているか確認
        local tts_status=$?
        if (( tts_status != 0 && tts_status != 144 )); then
            echo "Error: TTS generation failed with status $tts_status" >&2
            return $tts_status
        fi

        # 生成されたファイルを探して再生
        local playback_file
        playback_file=$(_tts_find_output_file "$output_dir" "${temp_output_file:t:r}" "wav") || return 1

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
