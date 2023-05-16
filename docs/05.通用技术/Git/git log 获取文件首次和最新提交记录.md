---
title: 基于 git log 校准博客文章创建时间
date: 2023-04-09 22:57:12
permalink: /pages/090a90/
tags: 
  - 
categories: 
  - 通用技术
  - Git
---

# 起因
原先在 github 维护了一个个人博客仓库，很简单，就是存粹放 Markdown 文件，没有用任何博客框架。

最近要用 vuepress 搭建博客站点，然后遇到了一个问题：
> 编译后的文章生成时间是当前时间，而不是我最早创建这个文件的时间，导致所有文章都是当前同时发布，这不符预期。

可以理解，vuepress 并不知道应该将这些 Markdown 文件视为新文件还是旧文件，对于我们的诉求，我们认为它是旧文件，创建时间应该用最初的 git 提交记录时间。
于是，问题转化为，如何使用 git 命令获取文件的创建时间

<!-- more -->

# 具体诉求
1. 文件调整目录后依然能找到之前的提交记录
2. 需要获取文件的首次和最新的 git 提交时间
3. 命令尽可能高效，获取 100 个文件的时间需要在 1s 内完成


# git log 命令

[git log 命令](https://git-scm.com/docs/git-log/zh_HANS-CN) 可以用于显示提交日志

```sh
# 1. 显示 filepath 文件的提交记录，前面加 -- 是为了防止于选项冲突
git log -- <filepath>
# 2. 增加 git 配置参数 --no-pager ，不显示翻页行为，直接将结果输出
git --no-pager log -- <filepath>
# 3. 增加 --follow 参数，可以追踪文件重命名前的提交日志
git  --no-pager log --follow -- <filepath>
# 4. 增加 --format 参数，只保留提交时间
git  --no-pager log --follow --format=%ad -- <filepath>
```

示例：
```sh
git  --no-pager log --follow --format=%ad  -- docs/about/index.md
```
输出：
```sh
Thu Apr 6 12:12:39 2023 +0800
Wed Apr 5 17:16:56 2023 +0800
Wed Dec 11 22:07:05 2019 +0800
Wed Dec 11 20:03:17 2019 +0800
```

接下来，我们需要获取首次以及最新提交时间

## 获取最新提交时间

```sh
# 方式1: 增加 -1 参数，将显示的提交数量限制在 1 个。
git --no-pager log -1 --follow --format=%ad -- docs/about/index.md

# 方式2: 对结果进行过滤，获取第一项。性能上会稍差点，因为实际取了所有记录再做过滤
git log --follow --format=%ad -- docs/about/index.md | head -1
```

结论：使用方式1命令
```sh
git --no-pager log -1 --follow --format=%ad -- <filepath>
```

## 获取首次提交时间

```sh
# [无效]方式1: 增加 --reverse 参数，以相反的顺序输出第一项
# 然而结果不符预期，结果为重命名后的第一条记录。系 git bug ，在使用了 --reverse 参数后，--follow 参数将失效，详见：https://www.spinics.net/lists/git/msg212266.html
git log --reverse --follow --format=%ad -- docs/about/index.md | head -1

# 方式2: 对结果进行过滤，获取最后一项。性能上会稍差点，因为实际取了所有记录再做过滤
git log --follow --format=%ad -- docs/about/index.md | tail -1

# 方式3: 基于方式1的问题，先获取了该文件的所有重命名记录，进而获取
# 详见 https://stackoverflow.com/a/35380344
# 比较麻烦，性能也未提升，不适合本情况
git log --name-only --pretty="format:"  --follow docs/about/index.md | sort -u | xargs git log --reverse --format=%ad -- | head -1
```

结论：使用方式2命令
```sh
git log --follow --format=%ad -- <filepath> | tail -1
```

# 边界情况
- 如果是本地的新增文件，那么此时还没有 Git 提交记录，需要用系统文件创建时间作为文件的首次创建时间。
```js
/** 获取文件创建时间 */
async function getFileBirthime(filePath) {
  const gitFileInitTime = await execSync(`git log --follow --format=%ad -- ${filePath} | tail -1`, {
    encoding: 'utf8'
  })
  if (gitFileInitTime) {
    return new Date(gitFileInitTime)
  }
  const stat = fs.statSync(filePath);
  return getSystemBirthtime(stat)
}
// 获取系统文件创建时间
function getSystemBirthtime(stat) {
  // 在一些系统下无法获取birthtime属性的正确时间，使用atime代替
  return stat.birthtime.getFullYear() != 1970 ? stat.birthtime : stat.atime
}
```
- 文件路径中可能含有空格等需转义字符，故执行 shell 时需要前置处理下文件路径，将 `"` 字符进行转义，外部再包上 `""` ，shell 将忽略双引号内部的转义字符
```js
execSync(`git log --follow --format=%ad -- "${filePath.replace(/"/g, '\\"')}" | tail -1`)
```
# 参考文档
- [How to retrieve the last modification date of all files in a git repository](https://serverfault.com/questions/401437/how-to-retrieve-the-last-modification-date-of-all-files-in-a-git-repository/401450#401450)：介绍了如何获取 git 仓库中，如何获取提交记录的最早和最新修改时间。
