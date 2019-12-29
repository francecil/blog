
---
title: Web 缓存
date: 2019/12/29 00:00:00
categories: 大前端
tags: 
  - 缓存
---

## 前言

本篇内容仅是记录，方便自己查阅，无干货

<!-- more -->

首先明确一点，浏览器缓存被清了，那些响应头也会被清，不存在有响应头然后没有实际缓存文件的情况



## Cache-Control 响应头

### max-age 

指定缓存的有效期

### s-maxage 

指定代理缓存（如cdn缓存）的有效期，优先级比 max-age 高



### no-cache 

表示每次都需要去服务端判断是否取缓存，不走本地强缓存

## Expires 响应头

表示资源过期时间，以服务端时间为准

优先级比 `Cache-Control` 低

**因此如果通过 Expires 判断缓存过期，而本地时间又比服务端快资源有效期以上，就会出现始终不能命中强缓存的情况**


## Last-modified 响应头

表示服务端文件的最后修改时间

当缓存过期时，再次发起请求，会带个 `If-Modified-Since` 请求头，其值为之前返回的 `Last-modified` 响应头的值

服务端会去查询在该时间点后文件是否被修改，若被修改，返回新的资源, 200 响应以及 `Last-modified` 的新值；否则返回 304 响应，根据 Cache-Control 或 Expires 重新设置过期时间


## ETag 响应头

由于 `Last-modified` 只精确到秒，且如果内容没变但是最后修改时间变了，还是会当新资源请求

于是 http1.1 加了一个 `ETag` 响应头

其值为根据文件内容生成的 hash

**优先级比 `Last-modified` 高**

当缓存过期时，再次发起请求，会带上 `If-None-Match` 请求头，其值为之前返回的 `ETag` 响应头的值

服务器会去该值和服务器文件的 hash 进行比对，若不同，返回新的资源和 200 响应以及 `ETag` 的新值；否则返回 304 响应，根据 Cache-Control 或 Expires 重新设置过期时间



## 总流程

借用参考文献1 中的某张图

![alloyteam](http://www.alloyteam.com/wp-content/uploads/2016/03/%E5%9B%BE%E7%89%8761.png)

## 参考

1. [浅谈 Web 缓存](http://www.alloyteam.com/2016/03/discussion-on-web-caching/)
