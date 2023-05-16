---
title: Webpack之TreeShaking
date: 2019-08-07 17:01:52
permalink: /pages/241333/
categories: 
  - 大前端
  - 工程能力
  - 编译构建
  - webpack
tags: 
  - 
titleTag: 草稿
---

## 前言

遇到一个问题:

某个npm包是这样的，
```js
//index.js
export moduleA from 'a.js'
export moduleB from 'b.js'

// 我们的代码中引入
import {moduleA} from 'xxx'
```
那么我们代码打包的时候，会把 moduleB 也打进去么? 如果会，不改变引入方式的情况需要怎么修改

## 