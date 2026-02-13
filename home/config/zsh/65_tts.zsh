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

# mlx_audio.tts.generate コマンドが利用可能かチェック
if ! command -v mlx_audio.tts.generate >/dev/null 2>&1; then
    return 0
fi

# コマンドが実際に実行可能かチェック（追加の安全性チェック）
# --help オプションで正常に動作するか確認
if ! mlx_audio.tts.generate --help >/dev/null 2>&1; then
    return 0
fi

_TTS_REFERENCE_AUDIO_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/qwen3-tts/reference-audio"

    # セキュリティ: テキスト入力のサニタイゼーション
    # シェルメタ文字をエスケープしてコマンドインジェクションを防止
    _tts_sanitize_text() {
        local text="$1"
        # バックスラッシュをエスケープ
        text="${text//\\/\\\\}"
        # ダブルクォートをエスケープ
        text="${text//\"/\\\"}"
        # ドル記号をエスケープ（変数展開防止）
        text="${text//\$/\\\$}"
        # バッククォートをエスケープ（コマンド置換防止）
        text="${text//\`/\\\`}"
        # セミコロンをエスケープ（コマンド連結防止）
        text="${text//;/\\;}"
        # パイプをエスケープ
        text="${text//|/\\|}"
        # アンパサンドをエスケープ
        text="${text//&/\\&}"
        # 改行をエスケープ
        text="${text//$'\n'/\\n}"
        echo "$text"
    }

    # セキュリティ: ファイルパスのサニタイゼーション
    # ダブルクォート内で安全に使用できるようエスケープ
    _tts_sanitize_path() {
        local path="$1"
        # ダブルクォートをエスケープ
        path="${path//\"/\\\"}"
        # ドル記号をエスケープ
        path="${path//\$/\\\$}"
        # バッククォートをエスケープ
        path="${path//\`/\\\`}"
        echo "$path"
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

        # 出力ファイル指定がなければデフォルトで再生
        if [[ -z "$output_file" ]]; then
            extra_args+=(--play)
        else
            # セキュリティ: 出力ファイルパスのサニタイゼーション
            output_file=$(_tts_sanitize_path "$output_file")

            local output_dir="${output_file:h}"
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
            extra_args+=(--output_path "$output_dir" --file_prefix "${output_file:t:r}")
            local ext="${output_file:t:e}"
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
        fi

        # TTS実行
        mlx_audio.tts.generate \
            --model "$model" \
            --text "$text" \
            "${extra_args[@]}"

        # コマンドの終了ステータスチェック
        local tts_status=$?
        if (( tts_status != 0 )); then
            echo "Error: TTS generation failed with status $tts_status" >&2
            return $tts_status
        fi

        # 出力ファイルが指定されている場合、ファイルが生成されたか確認
        if [[ -n "$output_file" ]]; then
            local expected_file="${output_dir}/${output_file:t:r}"
            if [[ -n "$ext" ]]; then
                expected_file="${expected_file}.${ext}"
            else
                expected_file="${expected_file}.wav"  # デフォルト
            fi

            # ファイルの存在確認（ワイルドカードで _000, _001 などのサフィックス対応）
            local generated_files=("${expected_file%.*}"_*.${ext:-wav})
            if [[ ! -f "$expected_file" ]] && [[ ! -f "${generated_files[1]}" ]]; then
                echo "Error: Expected output file not created" >&2
                echo "Expected: $expected_file or ${expected_file%.*}_NNN.${ext:-wav}" >&2
                return 1
            fi
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
        local model="mlx-community/Qwen3-TTS-12Hz-0.6B-CustomVoice-bf16"
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

        # 絶対パス検証（セキュリティベストプラクティス）
        if [[ "$reference_audio" != /* ]]; then
            echo "Error: Reference audio path must be absolute: $reference_audio" >&2
            echo "Hint: Use $_TTS_REFERENCE_AUDIO_DIR/your_file.wav or provide full path" >&2
            return 1
        fi

        # セキュリティ: 参照音声パスのサニタイゼーション
        reference_audio=$(_tts_sanitize_path "$reference_audio")

        # TTS実行
        # ボイスクローンパラメータ（mlx_audio.tts.generate v0.3.1+ で検証済み）
        # --ref_audio: 参照音声ファイルのパス
        # --ref_text: 参照音声の内容（オプショナル、品質向上に寄与）
        local tts_args=(
            --model "$model"
            --text "$text"
            --ref_audio "$reference_audio"
            --play
        )

        if [[ -n "$reference_text" ]]; then
            tts_args+=(--ref_text "$reference_text")
        fi

        mlx_audio.tts.generate "${tts_args[@]}"

        # コマンドの終了ステータスチェック
        local tts_status=$?
        if (( tts_status != 0 )); then
            echo "Error: TTS generation failed with status $tts_status" >&2
            return $tts_status
        fi
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
