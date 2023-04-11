---
title: HTTP状态码
date: 2020/01/02 03:00:00
tags: 
  - HTTP
permalink: /pages/58bfaf/
categories: 
  - 通用技术
  - 网络基础
---

## 前言

仅记录一些可能误用的状态码

<!-- more -->

## 3xx

### 301 

永久重定向（下次再访问原链接，浏览器会直接访问重定向后的链接）

一般用到的场景就是
- 原域名不维护了
- http 转 https

### 302 303 307 

临时重定向，大部分重定向都采用的临时的

http1.0 中只有 302

在 http1.1 中细分为 303 307 

浏览器会根据状态码做不同的操作

原请求是 get/head 请求的话没有区别

非 get/head 请求的话就会有区别

规范要求 302 重定向时请求方法和请求主体不变，但是不是所有浏览器都遵守，所以这是不可预测的

303 明确说明非 get/head 请求会转为 get 请求
> 通常作为 PUT 或 POST 操作的返回结果

307 明确说明请求方法和请求主体不变

有些文章说 get 请求不会自动带上请求参数，其实是 location 响应码控制的，服务端是可以控制的，控制不了的只有 request body

## 参考

https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Status

https://www.56way.com/p/98.html

https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Status/307