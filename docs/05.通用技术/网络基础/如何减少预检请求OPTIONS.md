---
title: 如何减少预检请求OPTIONS
date: 2018-12-16 10:18:32
tags: 
  - HTTP
  - 跨域
permalink: /pages/2f7a20/
categories: 
  - 通用技术
  - 网络基础
---

## 前言

先说结论，只能将复杂请求改造为简单请求

常见的做法是：
1. token放原生的请求头：Authorization 
2. Content-Type 改为text/plain 然后后端统一处理

<!--more-->

若无法修改请求，那么可以设置 `Access-Control-Max-Age` 响应

每个url的OPTIONS都有一个生命周期，在该时间内不会再次发生。chrome默认是5s

故我们可以通过设置`Access-Control-Max-Age`来提高周期上限。不过每个浏览器也是有上限的，比如chrome上限是10min。

故此，在10min内 对于 **同一请求（完整url相同,参数不同也视为不同url）** 不会再发第二次OPTIONS。

注意：若设置了 `disable-cache` 那么每次复杂请求都会发OPTIONS

## 后记

写这篇博客的背景是原来有个项目的前后端分离做的不对

前端资源(包括index.html)单独一台服务器，然后访问其他服务器的接口

实际这种应该在前端服务器这边做个转发，避免跨域。或者 index.html 放在后端服务器，其他资源放前端服务器，没有跨域问题