---
title: passive是如何提高滚屏性能的
date: 2019/12/24 00:00:00
categories: 大前端
tags: 
  - HTML
---

## 前言

某个交互事件比如 touchmove ，加不加 passive ，不是都得等到事件回调后（宏任务）才执行页面滚动（UI render）么？

## 介绍

`target.addEventListener(type, listener, options);` 

passive 为 options 的一个参数

MDN 中对 passive 的描述为：
> 设置为true时，表示 listener 永远不会调用 preventDefault()。如果 listener 仍然调用了这个函数，客户端将会忽略它并抛出一个控制台警告。

<!-- more -->

一般来说，用户交互触发了某个交互事件，在该事件执行完毕后，会进行相应的 UI Render
> 比如滚动交互事件，在 UI Render 时会更新滚动条并对页面做偏移

在事件执行过程中，可以手动调用 preventDefault ，这样在 UI Rendering 阶段便不会进行对应的视图变化

## 问题

正常情况下， `touchstart -> touchmove -> touchend` 可以产生滚动的效果

但如果其中的某个阶段调用了 preventDefault ，那么便不会进行滚动。

由于浏览器无法知道事件触发时是否会进行 preventDefault ，因此其会等到整轮事件结束才滚动，于是前面的交互事件结束，执行 UI Render 时并不会更新视图

## passive 的使用

passive 可以告知浏览器，该事件不会

