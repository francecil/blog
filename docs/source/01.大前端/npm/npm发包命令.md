---
title: npm 发包过程
date: 2019/07/01 00:00:00
categories: 随笔
tags: 
  - npm
---

## 发布前准备

### npm pack 查看哪些文件会被发送

执行该命令后会生成一个 xxx.tgz 文件

这些要被打包发布的文件是通过以下命令筛选到的

1. package.json 的 files 配置（白名单模式）
2. .npmignore
3. .gitignore

<!-- more -->

只要其中一个生效，就会忽略余下的配置，参考自[How to ignore files from your npm package](https://zellwk.com/blog/ignoring-files-from-npm-package/)

所以，files 配置`["lib"]` 而 .npmignore 配置 `*.snap` 并不会过滤掉 lib 目录下的 snap 文件

因为 第一项配置生效了 也就忽略第二项配置了

那需要怎么做呢？ files 配置`["lib"]` 改为 `["lib","!*.snap"]` 即可


### link

npm link 发包前，先用本地项目连接调试下

npm link xxx 用测试项目链接待发布 npm 包





## 发布
```
npm publish 包名
```
## 撤销已发布的包

某个版本的包发布之后，不能再次发布相关版本的包。

如果发现有问题，只能升级包

不过可以进行撤回已发布的包（不提倡）
```
npm unpublish 包名
```
并且有要求：
1. 24小时内上传的
2. 即使撤回了，也不能再发这个版本的包

## 发布 beta 包

```sh
npm publish --tag beta
```