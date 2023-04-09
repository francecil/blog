#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e


push_addr=`git@github.com:francecil/francecil.github.io.git`
commit_info=`git describe --all --always --long`
dist_path=docs/.vuepress/dist # 打包生成的文件夹路径
push_branch=master # 推送的分支

# 生成静态文件
npm run build

# 进入生成的文件夹
cd $dist_path

git init
git config user.name "francecil"
git config user.email "396324491@qq.com"
git add -A
git commit -m "deploy, $commit_info"
git push -f $push_addr HEAD:$push_branch

cd -
rm -rf $dist_path
