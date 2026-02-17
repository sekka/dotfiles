# ===========================================
# 67_ai_availability.zsh - AI可用性検出
# DEPENDENCY: GNU coreutils (gtimeout) - managed via Brewfile
# ===========================================

# CLI応答性チェック関数
_check_cli_responsiveness() {
    local cli_name="$1"
    local timeout_seconds="${2:-2}"
    local timeout_cmd="${3:-}"

    if [[ -z "$timeout_cmd" ]]; then
        return 0  # timeout未インストール時はスキップ
    fi

    "$timeout_cmd" "$timeout_seconds" "$cli_name" --version >/dev/null 2>&1
}

# GNU coreutils依存（Brewfileで管理）
if command -v gtimeout >/dev/null 2>&1; then
    _timeout_cmd="gtimeout"
else
    _timeout_cmd=""
fi

# AI設定の連想配列定義（保守性向上: 新しいAI追加が容易）
typeset -A _ai_auth_files
_ai_auth_files[codex]="$HOME/.codex/auth.json"
_ai_auth_files[gemini]="$HOME/.gemini/oauth_creds.json|$HOME/.gemini/.env"
_ai_auth_files[copilot]=""  # GitHub CLI + copilot --version で検証済み
_ai_auth_files[coderabbit]="$HOME/.coderabbit/auth.json|$HOME/.coderabbit/config.json|$HOME/.coderabbit/auth.token"

typeset -A _ai_env_vars
_ai_env_vars[codex]=""
_ai_env_vars[gemini]="GEMINI_API_KEY"
_ai_env_vars[copilot]=""
_ai_env_vars[coderabbit]=""

# パフォーマンス最適化: 30分キャッシュ
_ai_cache_file="${XDG_CACHE_HOME:-$HOME/.cache}/ai-availability.cache"
_ai_cache_ttl=1800

# キャッシュ再利用チェック（30分TTL）
if [[ -f "$_ai_cache_file" ]]; then
    local _cache_age=$(( $(date +%s) - $(stat -f%m "$_ai_cache_file") ))
    if (( _cache_age < _ai_cache_ttl )) && \
       source "$_ai_cache_file" 2>/dev/null && \
       [[ -n "${AI_HAS_CODEX+x}" ]]; then  # 簡易検証：変数が定義されているか
        return 0
    fi
    rm -f "$_ai_cache_file"
fi

# AI検出の共通ロジック（保守性向上: コード重複削減）
_detect_ai_availability() {
    local ai_name="$1"
    local auth_files="$2"   # パイプ区切り（複数ファイル対応）
    local env_var="$3"

    # Step 1: CLI存在確認（先にチェック: CLI未インストール時は早期終了）
    if ! command -v "$ai_name" >/dev/null 2>&1; then
        return 1  # CLI未インストール
    fi

    # Step 2: CLI応答性チェック（最優先: OAuth/キャッシュ認証を検出）
    # NOTE: Gemini (OAuth), CodeRabbit (動的認証) はファイル/環境変数なしでも動作可能
    if _check_cli_responsiveness "$ai_name" 2 "$_timeout_cmd"; then
        return 0  # 利用可能
    fi

    # Step 3: フォールバック - 環境変数チェック
    if [[ -n "$env_var" ]] && [[ -n "${(P)env_var}" ]]; then
        return 0  # 環境変数認証あり（CLI応答なしでも一旦判定）
    fi

    # Step 4: フォールバック - 認証ファイルチェック（パイプ区切り対応）
    if [[ -n "$auth_files" ]]; then
        local IFS='|'
        local -a file_list=("${(@s:|:)auth_files}")

        for auth_file in "${file_list[@]}"; do
            if [[ -f "$auth_file" ]]; then
                return 0  # 認証ファイル存在
            fi
        done
    fi

    return 1  # CLI応答なし かつ 環境変数/認証ファイルもなし
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
        # jqが無い場合は慎重に判定（CLI応答性チェックに委ねる）
        export AI_HAS_CODEX=0
        echo "WARNING: jq not found. Codex availability check may be inaccurate." >&2
    fi
else
    export AI_HAS_CODEX=0
fi

# Gemini - 環境変数 or OAuth or .env + CLI応答性（タイムアウト5秒）
# NOTE: Gemini CLI は OAuth 認証のため、初回実行時に応答が遅い場合がある
_gemini_available=0

# Step 1: CLI存在確認
if command -v "gemini" >/dev/null 2>&1; then
    # Step 2: CLI応答性チェック（Gemini専用: 5秒タイムアウト）
    if _check_cli_responsiveness "gemini" 5 "$_timeout_cmd"; then
        _gemini_available=1
    # Step 3: フォールバック - 環境変数チェック
    elif [[ -n "${_ai_env_vars[gemini]}" ]] && [[ -n "$GEMINI_API_KEY" ]]; then
        _gemini_available=1
    # Step 4: フォールバック - 認証ファイルチェック
    elif [[ -f ~/.gemini/oauth_creds.json ]] || [[ -f ~/.gemini/.env ]]; then
        # .envファイルの追加検証（GEMINI_API_KEY の存在確認）
        if [[ -f ~/.gemini/.env ]]; then
            if grep -qE '^GEMINI_API_KEY=.+$' ~/.gemini/.env 2>/dev/null; then
                _gemini_available=1
            fi
        else
            _gemini_available=1  # OAuth認証ファイル存在
        fi
    fi
fi

if (( _gemini_available )); then
    export AI_HAS_GEMINI=1
    _ai_models+=("gemini")
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
export AI_AVAILABLE_MODELS="${(j:,:)_ai_models}"

# キャッシュ保存
mkdir -p "$(dirname "$_ai_cache_file")"
{
    echo "export AI_HAS_CODEX='${AI_HAS_CODEX}'"
    echo "export AI_HAS_GEMINI='${AI_HAS_GEMINI}'"
    echo "export AI_HAS_COPILOT='${AI_HAS_COPILOT}'"
    echo "export AI_HAS_CODERABBIT='${AI_HAS_CODERABBIT}'"
    echo "export AI_AVAILABLE_MODELS='${AI_AVAILABLE_MODELS}'"
} >| "$_ai_cache_file" 2>/dev/null || echo "WARNING: Failed to write AI availability cache" >&2

unset _ai_models _ai_cache_file _ai_cache_ttl _copilot_ok _gh_ok _ai_auth_files _ai_env_vars
