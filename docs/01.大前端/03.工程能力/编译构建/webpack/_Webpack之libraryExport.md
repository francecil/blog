---
title: Webpack之libraryExport
date: 2019-08-19 14:09:25
permalink: /pages/f64cb9/
categories: 
  - 大前端
  - 工程能力
  - 编译构建
  - webpack
tags: 
  - 
titleTag: 草稿
---


看 element 代码有个不太清楚的点，

src/index.js 中
```js
export default {
  install,
  Input
}
```
使用时
```js
import Element from 'element-ui'

Vue.use(Element)

// 为什么这里可以取到 Input？？
import { Input } from 'element-ui'

Vue.component(Input.name, Input)
```

原来是 webpack `output.libraryExport` 配置的问题


1. commonjs 和 es module 的转换
2. nodejs 中使用 es module