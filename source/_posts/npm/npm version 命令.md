---
title: npm version 命令
date: 2019/05/01 00:00:00
categories: 随笔
tags: 
  - npm
---

## 前言

对于 NodeJS 项目中，我们经常需要变更 package.json 中的版本信息。

正常操作是，手动修改 package.json 文件的版本信息，然后再commit。

每次这样做，操作太繁琐。

实际上，我们可以使用 `npm version <newversion>` 命令

## 使用

```bash
npm version [<newversion> | major | minor | patch | premajor | preminor | prepatch | prerelease | from-git]
```
- major：主版本号
- minor：次版本号
- patch：补丁号
- premajor：预备主版本
- prepatch：预备次版本
- prerelease：预发布版本

比如当前版本为 0.1.1，使用`npm version patch`后，会执行以下操作：

1. 修改 package.json 的 version 为0.1.2
2. git commit -m "0.1.2"
3. npm tag -a v0.1.2

也可以指定 commit的信息
```bash
npm version patch -m "Upgrade to v%s"  # %s 会自动替换成版本号
# 此时提交信息为： Upgrade to v0.1.2
```

注：使用 `npm version <newversion>` 命令，需要当前工作区为clean状态，否则会执行失败。

## 参考

https://www.jianshu.com/p/9e64bdf1e8f9