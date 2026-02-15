# ===========================================
# 67_ai_availability.zsh - AI可用性検出
# NOTE: macOS (BSD stat) 専用。Linux環境ではCI早期終了で回避。
# DEPENDENCY: GNU coreutils (gtimeout) - managed via Brewfile
# ===========================================

# CLI応答性チェック関数（コマンドインジェクション対策 + gtimeout/timeout依存）
_check_cli_responsiveness() {
    local cli_name="$1"
    local timeout_seconds="${2:-2}"

    # セキュリティ: ホワイトリスト検証（コマンドインジェクション防止）
    local allowed_clis=("codex" "gemini" "copilot" "coderabbit")
    local found=0
    for allowed in "${allowed_clis[@]}"; do
        if [[ "$cli_name" == "$allowed" ]]; then
            found=1
            break
        fi
    done

    if (( ! found )); then
        echo "ERROR: Invalid CLI name: $cli_name" >&2
        return 1
    fi

    # gtimeout/timeout でCLI応答性チェック
    if [[ -z "$_timeout_cmd" ]]; then
        echo "WARNING: gtimeout not available, skipping CLI check for $cli_name" >&2
        return 0  # スキップして続行（認証ファイル存在で判定）
    fi

    if ! $_timeout_cmd "$timeout_seconds" "$cli_name" --version >/dev/null 2>&1; then
        echo "WARNING: $cli_name CLI not responding" >&2
        return 1
    fi

    return 0
}

# GNU coreutils依存（Brewfileで管理）
# macOSでは gtimeout として提供される
if command -v gtimeout >/dev/null 2>&1; then
    _timeout_cmd="gtimeout"
elif command -v timeout >/dev/null 2>&1; then
    _timeout_cmd="timeout"
else
    echo "ERROR: gtimeout not found. Install via: brew install coreutils" >&2
    _timeout_cmd=""
fi

# AI設定の連想配列定義（保守性向上: 新しいAI追加が容易）
typeset -A _ai_auth_files
_ai_auth_files=(
    [codex]="$HOME/.codex/auth.json"
    [gemini]="$HOME/.gemini/oauth_creds.json|$HOME/.gemini/.env"
    [copilot]=""  # GitHub CLI + copilot --version で検証済み
    [coderabbit]="$HOME/.coderabbit/auth.json|$HOME/.coderabbit/config.json|$HOME/.coderabbit/auth.token"
)

typeset -A _ai_env_vars
_ai_env_vars=(
    [codex]=""
    [gemini]="GEMINI_API_KEY"
    [copilot]=""
    [coderabbit]=""
)

# パフォーマンス最適化: 30分キャッシュ
_ai_cache_file="${XDG_CACHE_HOME:-$HOME/.cache}/ai-availability.cache"
_ai_cache_ttl=1800

# CI/CD環境では全外部AIを無効化（認証チェック前に早期終了）
if [[ -n "$CI" ]] || [[ -n "$GITHUB_ACTIONS" ]] || [[ -n "$GITLAB_CI" ]]; then
    export AI_AVAILABLE_MODELS="claude"
    export AI_HAS_CODEX=0
    export AI_HAS_GEMINI=0
    export AI_HAS_COPILOT=0
    export AI_HAS_CODERABBIT=0
    # セキュリティ: umask 077でディレクトリ/ファイル作成（CI環境でも安全な権限）
    (
        umask 077
        mkdir -p "$(dirname "$_ai_cache_file")"
        {
            echo "export AI_HAS_CODEX=0"
            echo "export AI_HAS_GEMINI=0"
            echo "export AI_HAS_COPILOT=0"
            echo "export AI_HAS_CODERABBIT=0"
            echo "export AI_AVAILABLE_MODELS='claude'"
        } >| "$_ai_cache_file"
    ) || echo "WARNING: Failed to write AI availability cache" >&2
    unset _ai_cache_file _ai_cache_ttl _timeout_cmd
    return 0
fi

# キャッシュ再利用チェック（30分TTL + 破損検証）
# NOTE: stat -f%m はmacOS/BSD専用（Linux環境ではCIブロックで早期終了するため問題なし）
if [[ -f "$_ai_cache_file" ]] && (( $(date +%s) - $(stat -f%m "$_ai_cache_file") < _ai_cache_ttl )); then
    # キャッシュ内容の完全性チェック（必須変数が全て含まれているか）
    local _cache_valid=1
    local _required_vars=("AI_HAS_CODEX" "AI_HAS_GEMINI" "AI_HAS_COPILOT" "AI_HAS_CODERABBIT" "AI_AVAILABLE_MODELS")

    for _var in "${_required_vars[@]}"; do
        if ! grep -qF "export ${_var}=" "$_ai_cache_file" 2>/dev/null; then
            _cache_valid=0
            break
        fi
    done

    if (( _cache_valid )); then
        # キャッシュ破損検証（source可能かチェック）
        if source "$_ai_cache_file" 2>/dev/null; then
            return 0  # キャッシュ有効
        else
            echo "WARNING: Cache corrupted, rebuilding..." >&2
            rm -f "$_ai_cache_file"
        fi
    else
        echo "WARNING: Cache incomplete, rebuilding..." >&2
        rm -f "$_ai_cache_file"
    fi
fi

# AI検出の共通ロジック（保守性向上: コード重複削減）
_detect_ai_availability() {
    local ai_name="$1"
    local auth_files="$2"   # パイプ区切り（複数ファイル対応）
    local env_var="$3"

    # CLI存在確認（先にチェック: CLI未インストール時は早期終了）
    if ! command -v "$ai_name" >/dev/null 2>&1; then
        return 1  # CLI未インストール
    fi

    # 環境変数チェック（優先）
    if [[ -n "$env_var" ]] && [[ -n "${(P)env_var}" ]]; then
        if _check_cli_responsiveness "$ai_name" 2; then
            return 0  # 利用可能
        else
            return 1  # CLI応答なし
        fi
    fi

    # 認証ファイルチェック（パイプ区切り対応）
    if [[ -n "$auth_files" ]]; then
        local IFS='|'
        local -a file_list=("${(@s:|:)auth_files}")
        local found=0

        for auth_file in "${file_list[@]}"; do
            if [[ -f "$auth_file" ]]; then
                # パーミッション検証
                local current_perm=$(stat -f%A "$auth_file" 2>/dev/null)
                if [[ "$current_perm" != "600" ]]; then
                    echo "WARNING: $auth_file has insecure permissions ($current_perm). Auto-fixing to 600..." >&2
                    chmod 600 "$auth_file"
                fi

                # シンボリックリンク検出（セキュリティ）
                if [[ -L "$auth_file" ]]; then
                    echo "ERROR: $auth_file is a symlink. Remove it for security." >&2
                    return 1
                fi

                found=1
                break
            fi
        done

        if (( found )); then
            # CLI応答性確認
            if _check_cli_responsiveness "$ai_name" 2; then
                return 0  # 利用可能
            else
                return 1  # CLI応答なし
            fi
        else
            return 1  # 認証ファイルなし
        fi
    fi

    return 1  # 環境変数も認証ファイルもなし
}

_ai_models=("claude")  # Claude Code常に利用可能

# Codex - 認証ファイル + パーミッション検証 + CLI応答性チェック
if _detect_ai_availability "codex" "${_ai_auth_files[codex]}" "${_ai_env_vars[codex]}"; then
    # jq による追加検証（OPENAI_API_KEY存在確認）
    if command -v jq >/dev/null 2>&1; then
        if jq -e 'has("OPENAI_API_KEY")' ~/.codex/auth.json >/dev/null 2>&1; then
            export AI_HAS_CODEX=1
            _ai_models+=("codex")
        else
            export AI_HAS_CODEX=0
        fi
    else
        echo "WARNING: jq not found. Using simplified Codex auth check." >&2
        export AI_HAS_CODEX=1
        _ai_models+=("codex")
    fi
else
    export AI_HAS_CODEX=0
fi

# Gemini - 環境変数 or OAuth or .env + CLI応答性
if _detect_ai_availability "gemini" "${_ai_auth_files[gemini]}" "${_ai_env_vars[gemini]}"; then
    # .envファイルの追加検証（GEMINI_API_KEY の存在確認）
    if [[ -f ~/.gemini/.env ]] && ! [[ -n "$GEMINI_API_KEY" ]]; then
        # セキュリティ: -F でリテラル検索（regex injection防止）
        if grep -qF 'GEMINI_API_KEY=' ~/.gemini/.env 2>/dev/null && grep -qE '^GEMINI_API_KEY=.+' ~/.gemini/.env 2>/dev/null; then
            export AI_HAS_GEMINI=1
            _ai_models+=("gemini")
        else
            export AI_HAS_GEMINI=0
        fi
    else
        export AI_HAS_GEMINI=1
        _ai_models+=("gemini")
    fi
else
    export AI_HAS_GEMINI=0
fi

# Copilot - GitHub CLI認証 + API疎通確認（タイムアウト保護）
# NOTE: gh api user は追加の信頼性チェック（ネットワーク遅延対策: 5秒タイムアウト）
_gh_ok=0
if [[ -n "$_timeout_cmd" ]]; then
    $_timeout_cmd 5 sh -c 'gh auth status >/dev/null 2>&1 && gh api user --jq .login >/dev/null 2>&1' && _gh_ok=1
else
    # timeout未インストール時はgh auth status のみチェック
    gh auth status >/dev/null 2>&1 && _gh_ok=1
fi

if (( _gh_ok )); then
    # Copilot CLI自体の存在と応答性を確認
    if ! command -v copilot >/dev/null 2>&1; then
        export AI_HAS_COPILOT=0
    else
        _copilot_ok=0
        if [[ -n "$_timeout_cmd" ]]; then
            $_timeout_cmd 2 copilot --version >/dev/null 2>&1 && _copilot_ok=1
        else
            copilot --version >/dev/null 2>&1 && _copilot_ok=1
        fi

        if (( _copilot_ok )); then
            export AI_HAS_COPILOT=1
            _ai_models+=("copilot")
        else
            export AI_HAS_COPILOT=0
        fi
    fi
else
    export AI_HAS_COPILOT=0
fi

# CodeRabbit - 認証ファイル + CLI応答性
if _detect_ai_availability "coderabbit" "${_ai_auth_files[coderabbit]}" "${_ai_env_vars[coderabbit]}"; then
    export AI_HAS_CODERABBIT=1
    _ai_models+=("coderabbit")
else
    export AI_HAS_CODERABBIT=0
fi

# AI利用可能リストをエクスポート
# NOTE: Claudeは常に含まれる（Claude Code本体）
export AI_AVAILABLE_MODELS="${(j:,:)_ai_models}"

# キャッシュ保存（ディレクトリがなければ作成）
# セキュリティ: キャッシュファイルを作成前に安全な権限でディレクトリ作成
# umask 077で一時的にデフォルト権限を制限
(
    umask 077
    mkdir -p "$(dirname "$_ai_cache_file")"
    {
        echo "export AI_HAS_CODEX='${AI_HAS_CODEX}'"
        echo "export AI_HAS_GEMINI='${AI_HAS_GEMINI}'"
        echo "export AI_HAS_COPILOT='${AI_HAS_COPILOT}'"
        echo "export AI_HAS_CODERABBIT='${AI_HAS_CODERABBIT}'"
        echo "export AI_AVAILABLE_MODELS='${AI_AVAILABLE_MODELS}'"
    } >| "$_ai_cache_file"
) || echo "WARNING: Failed to write AI availability cache" >&2

unset _ai_models _ai_cache_file _ai_cache_ttl _copilot_ok _gh_ok _ai_auth_files _ai_env_vars
