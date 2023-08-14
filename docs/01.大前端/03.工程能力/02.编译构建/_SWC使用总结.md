---
title: SWC使用总结
date: 2018-02-01 14:50:28
permalink: /pages/3ca772/
categories: 
  - 大前端
  - 工程能力
  - 编译构建
tags: 
  - 
titleTag: 草稿
---

https://swc.rs/docs/migrating-from-babel

swc 的定位是转译器，将高版本的 es 转到低版本 es 

使用 Rust 编写，性能更好，用于替换 babel

## swc 与 babel 的测试结果

https://juejin.cn/post/7236670763272798266

- swc、esbuild 相比 babel、terser 会快很多
- 使用swc or esbuild的时候可能会碰到一些兼容性问题，需要自己排查解决