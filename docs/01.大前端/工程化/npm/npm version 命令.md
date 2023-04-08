---
title: npm version 命令
date: 2019/05/01 00:00:00
tags: 
  - npm
permalink: /pages/b57f9e/
categories: 
  - 大前端
  - 工程化
  - npm
---

## 前言

对于 NodeJS 项目中，我们经常需要变更 package.json 中的版本信息。

正常操作是，手动修改 package.json 文件的版本信息，然后再commit。

每次这样做，操作太繁琐。

实际上，我们可以使用 `npm version <newversion>` 命令

<!-- more -->

## 使用

```bash
npm version [<newversion> | major | minor | patch | premajor | preminor | prepatch | prerelease | from-git]
```
- major: 主版本号 1.0.0->2.0.0
- minor: 次版本号 1.0.0->1.1.0
- patch: 补丁号 1.0.0->1.0.1 / 1.0.0-2->1.0.0 (预备版本转正式版本)

发布预备版本，大致同上，只是会在版本号后加 -0 说明这个新版本是个预备版本

- premajor: 预备主版本 2.2.2-1 -> 3.0.0-0
- preminor: 预备次版本 2.2.2-1 -> 2.3.0-0
- prepatch: 预备补丁版本 2.2.2-1 -> 2.2.3-0
  > 如果不想要 `-0` ，需要手动指定版本号 `npm version 2.2.3`
- prerelease: 预发布版本 2.2.2 -> 2.2.3-0 / 2.2.3-0 -> 2.2.3-1
  > 如果想要 2.2.2 -> 2.2.2-1 ，即预备版本作为 bugfix 用，需要手动指定版本号 `npm version 2.2.2-1`
## version 命令具体做了什么？

比如当前版本为 0.1.1，使用`npm version patch`后，会执行以下操作：

1. 修改 package.json 的 version 为0.1.2
2. git commit -m "0.1.2"
3. git tag -a v0.1.2

也可以指定 commit的信息
```bash
npm version patch -m "Upgrade to v%s"  # %s 会自动替换成版本号
# 此时提交信息为： Upgrade to v0.1.2
```

注：使用 `npm version <newversion>` 命令，需要当前工作区为clean状态，否则会执行失败。

## 最佳实践

补丁号版本作为正常版本，预备版本作为 bugfix 

同时次版本和补丁版本的版本号从 0 开始，且不超过 10

也就是说，正常项目发版可能是
```
1.0.0 (npm version patch)->
1.0.1 (new verison) (npm version 1.0.1-1)->
1.0.1-1 (bugfix version) (npm version prerelease)->
1.0.1-2 (bugfix version) (npm version 1.0.2)->
1.0.2 (new verison)
...
1.0.9 (只到 x.x.9 版本) (npm version minor)->
1.1.0 
...
1.9.0 (只到 x.9.x 版本) (npm version major)->
2.0.0
```

## 参考

https://www.jianshu.com/p/9e64bdf1e8f9
