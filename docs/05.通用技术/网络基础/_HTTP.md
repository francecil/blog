---
title: HTTP
date: 2020-03-13 19:23:26
permalink: /pages/3b39e7/
categories: 
  - 通用技术
  - 网络基础
tags: 
  - 
titleTag: 草稿
---
## 请求方法

### HEAD 

获取请求资源的头部信息，且这些信息与 GET 请求拿到的信息一致

不带响应正文

一般用于下载前先用 HEAD 请求读取文件大小

## 响应头

`X-Frame-Options` 用于防止网页被放入iframe
DENY ：页面不能被嵌入到任何iframe或frame中；
SAMEORIGIN ：页面只能被本站页面嵌入到iframe或者frame中；
ALLOW-FROM ：页面允许frame或frame加载。