---
title: Git 子模块笔记
date: 2023-07-10 17:01:11
permalink: /pages/c8e5c5/
categories: 
  - 通用技术
  - Git
tags: 
  - 
titleTag: 草稿
---

将其他 Git 仓库引入主仓库作为一个子模块。

子模块和主仓库使用各自的 Git 提交历史和记录

```sh
# 将本地子模块的更改合入远程仓库
git submodule update --remote --merge
```

子模块有保护分支和分支合并的说法？怎么都是直接往指定分支提交？
> 有的，子模块也是一个完整的 git 仓库，因此可以往开发分支进行修改和提交并推送，然后远端合并，最后本地再切换分支并拉取代码

## 拓展阅读
- https://git-scm.com/book/zh/v2/Git-%E5%B7%A5%E5%85%B7-%E5%AD%90%E6%A8%A1%E5%9D%97
- https://iphysresearch.github.io/blog/post/programing/git/git_submodule/
- https://knightyun.github.io/2021/03/21/git-submodule