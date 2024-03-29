---
title: web灰度发布方案
date: 2023-08-19 00:35:19
permalink: /pages/43baad/
categories: 
  - 服务端
  - 服务部署
tags: 
  - 
titleTag: 笔记
---

web 灰度发布一般用的是 cookie 染色方案。

## 方案描述

web 命中灰度流量时，下发带灰度标识的 cookie 并进行前端存储。

下次重新访问页面时，灰度服务系统可以很方便的知道需要命中的灰度版本，避免页面前后不统一。

回滚策略：取消灰度/紧急回滚，则下次访问页面，cookie 将会失效重置。流量走向旧版本。类似的，如果是发布了新版本，则流量走向新版本

## 拓展阅读

- [基于 Nginx 实现一个灰度系统](https://juejin.cn/post/7250914419579944997)
- [前端灰度发布落地方案](https://juejin.cn/post/7010751591087079460)