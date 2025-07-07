#!/bin/bash

# Claude コマンドの同期スクリプト
# プロジェクトの .claude/commands/ から ~/.claude/commands/ へシンボリックリンクを作成

# カラー定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ディレクトリの定義
SOURCE_DIR="${HOME}/dotfiles/.claude/commands"
TARGET_DIR="${HOME}/.claude/commands"

echo "🔄 Claude コマンドの同期を開始します..."

# ターゲットディレクトリが存在しない場合は作成
if [ ! -d "$TARGET_DIR" ]; then
    echo "📁 ディレクトリを作成: $TARGET_DIR"
    mkdir -p "$TARGET_DIR"
fi

# 同期カウンター
created=0
skipped=0
updated=0

# ソースディレクトリ内の全ての .md ファイルを処理
for file in "$SOURCE_DIR"/*.md; do
    # ファイルが存在しない場合はスキップ（globパターンがマッチしない場合）
    [ -e "$file" ] || continue
    
    # ファイル名を取得
    filename=$(basename "$file")
    target_link="$TARGET_DIR/$filename"
    
    # 既存のリンクまたはファイルをチェック
    if [ -L "$target_link" ]; then
        # シンボリックリンクが既に存在する場合
        current_target=$(readlink "$target_link")
        if [ "$current_target" = "$file" ]; then
            echo -e "${YELLOW}⏭️  スキップ:${NC} $filename (既に正しくリンクされています)"
            ((skipped++))
        else
            # 異なるファイルを指している場合は更新
            echo -e "${GREEN}🔄 更新:${NC} $filename"
            rm "$target_link"
            ln -s "$file" "$target_link"
            ((updated++))
        fi
    elif [ -e "$target_link" ]; then
        # 通常のファイルが存在する場合
        echo -e "${RED}⚠️  警告:${NC} $filename は通常のファイルとして存在します。手動で確認してください。"
    else
        # リンクを新規作成
        echo -e "${GREEN}✅ 作成:${NC} $filename"
        ln -s "$file" "$target_link"
        ((created++))
    fi
done

# 逆方向のチェック：ホームディレクトリにあるがプロジェクトにないリンクを検出
echo ""
echo "🔍 孤立したリンクをチェック中..."
orphaned=0
for link in "$TARGET_DIR"/*.md; do
    [ -L "$link" ] || continue
    
    target=$(readlink "$link")
    if [[ "$target" == "$SOURCE_DIR"/* ]] && [ ! -e "$target" ]; then
        filename=$(basename "$link")
        echo -e "${RED}🗑️  孤立したリンク:${NC} $filename (削除しました)"
        rm "$link"
        ((orphaned++))
    fi
done

# サマリー表示
echo ""
echo "📊 同期完了:"
echo "   ✅ 新規作成: $created"
echo "   🔄 更新: $updated"
echo "   ⏭️  スキップ: $skipped"
[ $orphaned -gt 0 ] && echo "   🗑️  削除: $orphaned"

echo ""
echo "✨ 同期が完了しました！"