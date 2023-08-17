---
title: Node 中的当前目录路径
date: 2023-08-17 22:21:56
permalink: /pages/7a927c/
categories: 
  - 大前端
  - 专业领域
  - 服务端
  - js
tags: 
  - 
titleTag: 草稿
---

对于 CommonJS 文件，人们经常使用 __dirname 访问当前目录并将相对路径解析为绝对路径。这在原生 ES 模块中不被支持。相反，我们建议使用以下方法 (例如生成外部模块的绝对 id)：
```js
// rollup.config.js
import { fileURLToPath } from 'node:url'

export default {
  ...,
  // 为 <currentdir>/src/some-file.js 生成绝对路径
  external: [fileURLToPath(new URL('src/some-file.js', import.meta.url))]
};
```