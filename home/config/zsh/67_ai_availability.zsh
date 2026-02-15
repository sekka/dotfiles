# ===========================================
# 67_ai_availability.zsh - AI可用性検出
# DEPENDENCY: GNU coreutils (gtimeout) - managed via Brewfile
# ===========================================

# Cross-platform stat helpers
# These functions provide macOS/Linux compatibility for file metadata operations

_get_file_mtime() {
    local filepath="$1"
    if [[ ! -f "$filepath" ]]; then
        echo "0"
        return 1
    fi

    local mtime
    # macOS: -f%m, Linux: -c%Y
    mtime=$(stat -f%m "$filepath" 2>/dev/null || stat -c%Y "$filepath" 2>/dev/null)

    if [[ -z "$mtime" ]]; then
        echo "WARNING: Failed to get mtime for $filepath" >&2
        echo "0"
        return 1
    fi

    echo "$mtime"
}

_get_file_size() {
    local filepath="$1"
    if [[ ! -f "$filepath" ]]; then
        echo "0"
        return 1
    fi

    local size
    # macOS: -f%z, Linux: -c%s
    size=$(stat -f%z "$filepath" 2>/dev/null || stat -c%s "$filepath" 2>/dev/null)

    if [[ -z "$size" ]]; then
        echo "WARNING: Failed to get size for $filepath" >&2
        echo "0"
        return 1
    fi

    echo "$size"
}

_get_file_perms() {
    local filepath="$1"
    if [[ ! -f "$filepath" ]]; then
        echo "???"
        return 1
    fi

    local perms
    # macOS: -f%OLp (octal permissions), Linux: -c%a
    perms=$(stat -f%OLp "$filepath" 2>/dev/null || stat -c%a "$filepath" 2>/dev/null)

    if [[ -z "$perms" ]]; then
        echo "WARNING: Failed to get permissions for $filepath" >&2
        echo "???"
        return 1
    fi

    echo "$perms"
}

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
if [[ -f "$_ai_cache_file" ]]; then
    _cache_mtime=$(_get_file_mtime "$_ai_cache_file")
    _cache_age=$(( $(date +%s) - _cache_mtime ))

    if (( _cache_age < _ai_cache_ttl )); then
        # キャッシュ内容の完全性チェック（必須変数が全て含まれているか）
        _cache_valid=1
        _required_vars=("AI_HAS_CODEX" "AI_HAS_GEMINI" "AI_HAS_COPILOT" "AI_HAS_CODERABBIT" "AI_AVAILABLE_MODELS")

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
    if _check_cli_responsiveness "$ai_name" 2; then
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
                # SECURITY: 所有者確認でTOCTOU攻撃を防止（chmod前に確認）
                local file_owner
                if command -v stat >/dev/null 2>&1; then
                    file_owner=$(stat -f%Su "$auth_file" 2>/dev/null || stat -c%U "$auth_file" 2>/dev/null)
                fi

                if [[ -z "$file_owner" ]]; then
                    echo "WARNING: Failed to get owner for $auth_file" >&2
                    return 1
                fi

                if [[ "$file_owner" != "$USER" ]]; then
                    echo "ERROR: $auth_file is not owned by $USER (owner: $file_owner)" >&2
                    return 1
                fi

                # パーミッション検証（600 or 400 を許可）
                local current_perm=$(_get_file_perms "$auth_file")
                if [[ "$current_perm" != "600" ]] && [[ "$current_perm" != "400" ]]; then
                    echo "WARNING: $auth_file has insecure permissions ($current_perm). Auto-fixing to 600..." >&2
                    chmod 600 "$auth_file" 2>/dev/null || {
                        echo "ERROR: Failed to fix permissions for $auth_file" >&2
                        return 1
                    }
                fi

                # シンボリックリンク検出（セキュリティ）
                if [[ -L "$auth_file" ]]; then
                    echo "ERROR: $auth_file is a symlink. Remove it for security." >&2
                    return 1
                fi

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
# SECURITY: stdin を /dev/null にリダイレクト（入力待ちブロック防止）
_gh_ok=0
if [[ -n "$_timeout_cmd" ]]; then
    $_timeout_cmd 5 sh -c 'gh auth status </dev/null >/dev/null 2>&1 && gh api user --jq .login </dev/null >/dev/null 2>&1' && _gh_ok=1
else
    # timeout未インストール時はgh auth status のみチェック
    gh auth status </dev/null >/dev/null 2>&1 && _gh_ok=1
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
# bash互換のため IFS を利用した配列結合
if [[ -n "$ZSH_VERSION" ]]; then
    export AI_AVAILABLE_MODELS="${(j:,:)_ai_models}"
else
    # bash環境（サブシェルでIFSを変更）
    export AI_AVAILABLE_MODELS="$(IFS=','; echo "${_ai_models[*]}")"
fi

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
unset -f _get_file_mtime _get_file_size _get_file_perms
