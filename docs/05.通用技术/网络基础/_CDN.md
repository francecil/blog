---
title: CDN
date: 2020/04/01 00:00:00
categories: 
  - 通用技术
  - 网络基础
tags: 
  - CDN
permalink: /pages/98f4c4/
titleTag: 草稿
---

## 加速原理

- 多级代理缓存，减少源站压力
- 就近节点，提高访问速度

<!--more-->

## 寻找节点的过程

就是 dns 解析的过程

dns 服务器利用 edns协议 带上用户出口ip，

向cdn厂商的dns请求a记录，cdn厂商估计出口ip和dns服务器ip，综合的给出一个ip

待续

## 拓展阅读

https://www.jianshu.com/p/1dae6e1680ff