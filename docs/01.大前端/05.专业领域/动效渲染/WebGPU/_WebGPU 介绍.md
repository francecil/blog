---
title: WebGPU 介绍
date: 2023-06-26 16:09:24
permalink: /pages/1c26a6/
categories: 
  - 大前端
  - 专业领域
  - 动效渲染
  - WebGPU
tags: 
  - 
titleTag: 草稿
---

1. WebGPU 是什么以及出现的原因
2. WebGPU 和 WebGL 的区别与联系
3. 如何学习 WebGPU
4. WebGPU 未来的发展方向

<!-- more -->

## WebGPU 是什么

WebGPU 是一套基于浏览器的图形 API，内部封装了现代 GPU API（微软的 Dx12、苹果的 Metal、科纳斯组织的 Vulkan），提供了更强大的 GPU 运算能力

## 为什么会出现 WebGPU

一句话：跨平台的 OpenGL 方案维护困难&进展缓慢，各大平台选择自研原生的 GPU API。主流平台支持上后，Web 直接打包这套 API 就直接实现了 WebGPU。

## WebGPU vs WebGL

兼容性、性能

webgpu 那套东西也是裁剪了不少现代图形api的功能， 也不是全部都用， 那么这就要求封装出另一套东西，像webgl一样。

## 如何学习 WebGPU

- 新手教程：[MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/WebGPU_API)

## WebGPU 未来的发展方向

一定会取代 WebGPU ，现在的 WebGL 三方库也在迭代成 WebGPU 版本了

## 参考资料

- [WebGPU 到底是什么? - Orillusion的回答 - 知乎](https://www.zhihu.com/question/315103318/answer/2407067274)
- [WebGPU 的概念与使用](https://developer.mozilla.org/zh-CN/docs/Web/API/WebGPU_API)