---
title: PWA 笔记
date: 2021-09-21 21:02:37
permalink: /pages/c04dd8/
categories: 
  - 大前端
  - 专业领域
  - 跨端技术
  - PWA
tags: 
  - 
titleTag: 草稿
---


## 疑问

检测更新的时机是？

## 安装失败终止流程

## 开发
webpack 通过 [workbox-webpack-plugin](https://developers.google.com/web/tools/workbox/modules/workbox-webpack-plugin) 生成 sw

可以配置 


update on reload

## 更新时机


被动更新和主动更新

- 被动更新：超过时间，或者浏览器相关都关掉然后打开新页面，就会触发更新
> 受限于浏览器设计，只有一个 tab 的 reload 也不会触发更新
- 主动更新：主动调用 skipWaiting 接管页面

### 主动更新的三种策略
- 静默接管
- 立即刷新
- 提示刷新


-----

url hash 变更 sw.js?v=111

sw 内容变更

skipWaiting 阶段

- 手动点击 skipWaiting
- 关闭所有终端
- 代码里设置 self.skipWaiting()


https://lavas-project.github.io/pwa-book/chapter04/3-service-worker-dive.html


另外默认 24 小时触发更新

## 参考资料

- [谨慎处理 Service Worker 的更新](https://juejin.cn/post/6844903792522035208)