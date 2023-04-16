---
title: DNS
date: 2022-05-06 20:40:35
permalink: /pages/dcd57c/
categories: 
  - 通用技术
  - 网络基础
tags: 
  - 
titleTag: 草稿
---

解析过程：


hosts <-> 本地 DNS 缓存 <-> 本地 DNS 服务器和缓存 <-> （递归过程）
- 转发模式：<-> 上一级 DNS 服务器 <-> 根据上一级是否配置转发模式判断是否继续找上一级还是找根 DNS 服务器 <-> ...（递归过程）
- 非转发模式：-> 根 DNS 服务器，返回顶级域名服务器 IP -> 本地 DNS 服务器 -> ... -> 逐级查找，直到找到具体域名的主机 -> 本地 DNS 服务器（迭代过程）


客户端到本地 dns 服务器的查询是一个递归过程
本地dns服务器向上解析的过程，转发是递归，非转发是迭代




问题：
- 根服务器的域名是怎么知道的？内置
- 转发的优势？
 - 优势：转发到一个具有更大缓存或者某区域缓存的 DNS 服务器；找根可能会涉及跨网跨境，转发的查找速度比找根更快
 - 劣势：运营商污染；缓存清除不及时
- 根服务器把 cn 相关域名删除，会导致 cn 网络瘫痪么？IP 任播技术，走的是国内镜像，定时同步，此时把从上到下的 「cn 删除记录」过滤掉
 - IP 任播：IP 地址可以指定给一至多个不同物理节点的网络接口，访问最近的
- 使用 TCP 还是 UDP 传输？

参考：
https://www.zhihu.com/question/23042131
http://road2ai.info/2017/08/15/WindowsServer-DNSForward/
https://www.zhihu.com/question/436017407
https://chinese.freecodecamp.org/news/tcp-vs-udp-which-is-faster/