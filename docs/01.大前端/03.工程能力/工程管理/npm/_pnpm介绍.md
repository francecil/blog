---
title: pnpm介绍
date: 2022-05-06 20:40:35
permalink: /pages/cb086f/
categories: 
  - 大前端
  - 工程能力
  - 工程管理
  - npm
tags: 
  - 
titleTag: 草稿
---

## store 目录

将下载的东西提到全局，避免多个项目重复下载

问题：

## node_modules 结构，与 npm 的不同点

npm 是直接平铺在 node_modules 目录下的，如果出现多个版本，则在某个包在继续下一层 node_modules

pnpm 采用两级结构
```
node_modules/express/...
node_modules/.pnpm/express@4.17.1/node_modules/xxx
```

node_modules/express 里面是个软链接，链接的是 .pnpm 里的地址


https://pnpm.io/how-peers-are-resolved