---
title: npm供应链攻击
date: 2023-08-18 19:30:42
permalink: /pages/8f2a41/
categories: 
  - 大前端
  - 工程能力
  - 工程管理
  - npm
tags: 
  - 
titleTag: 草稿
---


1. lockfile 攻击
2. npm-scripts 攻击
3. 最新依赖攻击
4. 内部依赖混淆攻击：公共源发布易混淆的私有包，比如 @byted/xxx 
5. 历史漏洞攻击：安装后才知道漏洞，如何提前防护？
6. 木马源攻击：这个还没看懂。。

## npm-scripts 攻击（wip）

安装第三方依赖的时候，可以触发安装后钩子（postinstall），以帮助处理一些构建后工作，比如依赖安装失败选择源码构建。

但这个钩子可能会被不法分子利用，导致安全问题。


此外，husky 使用中，推荐使用 prepare 代替 postinstall: https://github.com/typicode/husky/issues/884


## 拓展阅读
- [npm安全：防止供应链攻击](https://zhuanlan.zhihu.com/p/599242750)，原文：[NPM security: preventing supply chain attacks](https://snyk.io/blog/npm-security-preventing-supply-chain-attacks/)



