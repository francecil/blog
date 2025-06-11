#!/bin/bash

# 设置颜色
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 创建目标目录
TARGET_DIR="docs/@assets/img"
mkdir -p "$TARGET_DIR"

echo "正在搜索 juejin.byteimg 图片引用..."
echo "----------------------------------------"

# 使用 find 命令查找所有 .md 文件，并对每个文件执行 grep
find . -type f -name "*.md" -exec grep -l "juejin.byteimg" {} \; | while read -r file; do
    echo -e "${GREEN}处理文件: ${file}${NC}"
    
    # 获取文件的相对路径深度
    file_dir=$(dirname "$file")
    # 计算从文件所在目录到目标目录的相对路径
    rel_path=""
    if [[ "$file_dir" == "." ]]; then
        rel_path="$TARGET_DIR"
    else
        # 计算需要返回的层级数
        depth=$(echo "$file_dir" | tr -cd '/' | wc -c)
        # 构建相对路径
        rel_path=""
        for ((i=0; i<depth; i++)); do
            rel_path="../$rel_path"
        done
        rel_path="${rel_path}${TARGET_DIR}"
    fi
    
    # 提取并下载图片（添加去重处理）
    grep -o "https://[^)]*juejin.byteimg.com[^)\"]*" "$file" | sort | uniq | while read -r orig_url; do
        # 修改包含watermark的URL
        if [[ "$orig_url" == *watermark* ]]; then
            download_url="${orig_url//watermark/zoom-1}"
            echo -e "${YELLOW}转换水印链接: ${orig_url} -> ${download_url}${NC}"
        else
            download_url="$orig_url"
        fi
        
        # 从原始URL中提取 key（不修改的URL）
        key=$(echo "$orig_url" | grep -o '[a-f0-9]\{32\}' | head -1)
        
        if [ -n "$key" ]; then
            # 构建新的文件名和路径
            new_filename="${key}.png"
            new_path="${TARGET_DIR}/${new_filename}"
            new_ref="${rel_path}/${new_filename}"
            
            # 如果文件不存在，则下载
            if [ ! -f "$new_path" ]; then
                echo -e "${YELLOW}下载图片: ${download_url}${NC}"
                if ! curl -s -L "$download_url" -o "$new_path"; then
                    echo -e "${YELLOW}下载失败，使用原始URL重试: ${orig_url}${NC}"
                    curl -s -L "$orig_url" -o "$new_path"
                fi
                
                # 检查下载是否成功
                if [ ! -s "$new_path" ]; then
                    echo -e "${YELLOW}图片下载失败或为空，删除无效文件${NC}"
                    rm -f "$new_path"
                fi
            fi
            
            # 替换文件中的图片引用（使用原始URL）
            if [ -f "$new_path" ]; then
                echo -e "${BLUE}更新引用: ${orig_url} -> ${new_ref}${NC}"
                sed -i '' "s|${orig_url}|${new_ref}|g" "$file"
            fi
        fi
    done
    
    echo "----------------------------------------"
done

echo "处理完成！"