---
title: WebPerformanceApi踩坑记录
date: 2018-06-04 10:39:26
permalink: /pages/fa651f/
sidebar: auto
categories: 
  - 随笔
  - 2018
tags: 
  - 
titleTag: 草稿
---
## 介绍：
https://w3c.github.io/resource-timing/

## 问题：

`responseStart、transferSize`为0，根据w3c描述，当值为0说明走的是本地缓存

> zero otherwise, including for resources retrieved from relevant application caches or from local resources.

但我这边测试响应为200OK

## transferSize 比 encodedBodySize 小的情况：
>  It is possible for transferSize value to be lower than encodedBodySize: when a cached response is successfully revalidated the transferSize reports the size of the response HTTP headers incurred during the revalidation, and encodedBodySize reports the size of the previously retrieved payload body.

缓存生效，transferSize为响应HTTP头的大小，而encodedBodySize为先前检索到的有效内容主体的大小。

200 from cache. 且transferSize一般为0

## encodedBodySize 为0 的情况：

> The encodedBodySize may be zero depending on the response code - e.g. HTTP 204 (No Content), 3XX, etc.

204,3XX 。