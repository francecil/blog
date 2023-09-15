---
title: 浅谈 View Transitions API
date: 2023-09-15 16:52:52
permalink: /pages/63d958/
categories: 
  - 大前端
  - 前端基础
  - 编程语言
  - HTML
tags: 
  - 
titleTag: 笔记
---
View Transitions API 提供一种视图切换动效的新方式。

在之前，要想实现同一区域内容变化的淡入淡出效果，我们需要基于绝对定位同时渲染这两个组件，再完成渲染后再移除组件。

但是现在浏览器提供了新的 API ，可以做到移除旧内容的同时且保留视觉展示（底层采用截图实现），并在新内容到来后进行过渡变换。

相比原来绝对定位的方案，更加解耦，且性能更好。

## 与 React useTransition 的区别

> 和 View Transitions API 完全不是一回事

React 本质上操作的是状态，两个状态之间变换的同时让 React 更新可打断，避免长任务卡顿。

## 未来发展

兼容性较差，chrome 111+ 支持

同时目前使用方式上还较为不便，期待后续更多框架的集成。

## 拓展阅读

- [View_Transitions_API MDN](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API)
- [浏览器要原生实现React的并发更新了？](https://juejin.cn/post/7270902621065412664)
- [使用全新的View Transitions API，实现B站PC客户端的深色主题切换效果](https://juejin.cn/post/7207810396420325413)