---
title: fastclick 原理剖析与踩坑记录
date: 2021-09-21 21:02:37
permalink: /pages/36300d/
categories: 
  - 大前端
  - 专业领域
  - 跨端技术
  - H5
tags: 
  - 
titleTag: 草稿
---

1. 解决 click 300ms 问题
2. 解决点击穿透问题

某些移动端 webview 支持快速点击，自动跳过

body 上监听 touchStart touchEnd 事件， 记录 start 时的触发元素

在 end 时，如果是同个元素，阻止默认事件，并对触发元素发放一个 click 事件


## 存在问题

input 无法正常点击