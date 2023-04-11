---
title: WebAssembly 初探
date: 2020/01/10 00:00:00
tags: 
  - WebAssembly
permalink: /pages/25ca35/
categories: 
  - 大前端
  - 前端基础
  - 编程语言
  - WebAssembly
---

## 前言

本文是对 WebAssembly 技术体系的概括

<!-- more -->

相应的技术不会深入讲解，将在以后的文章讲到

## 二进制表示与文本表示

其实就是编码解析时给了个约定，某个字节代表了某个含义，这样通过有限的字节就可以进行复杂的表示

wat 的内容为文本

wasm 的内容为二进制

https://github.com/WebAssembly/wabt 提供了文件在线转换的工具

对于 Uint8Array ，自己也写了一个脚本，用于转换为文本

## 与 asm.js 的关系

asm.js 是火狐搞的，写法上还是 js 的写法，只不过通过某些技术让引擎能够确定变量类型，少了某些环节

## 内存模型

默认只有整型和浮点类型，其他类型需要通过开辟内存使用

## 其他语言转 wasm

llvm 工具转换

理论上来说，所有强类型语言都可以支撑转成 wasm

对于前端er来说，用ts是成本较低的一种，相应的技术为： assemblyScript

## 拓展阅读

https://www.cnblogs.com/jixiaohua/category/1404779.html

MDN