---
title: websocket
date: 2022-05-06 20:40:35
permalink: /pages/a8af65/
categories: 
  - 通用技术
  - 网络基础
tags: 
  - 
titleTag: 草稿
---

断开原因：
- 一段时间不传递数据，会自动断开；（和服务器配置有关）；如果不想断开可以通过定时发送 ping/pong 解决




ping/pong: browser 只能发送 payload data，所以一般是自己包个对象，加个 type 属性来标识是 ping/pong 还是普通数据。
- 那服务端发的 pong 是 payload data 还是控制帧？如果是控制帧的话有效果么？


连接异常断开时，双方能互相感知么？

[前端WebSocket知识点总结](https://segmentfault.com/a/1190000038816821)