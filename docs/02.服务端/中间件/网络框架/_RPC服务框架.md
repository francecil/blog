---
title: RPC服务框架
date: 2023-05-15 21:24:49
permalink: /pages/2c1106/
categories: 
  - 服务端
  - 中间件
  - 网络框架
tags: 
  - 
titleTag: 草稿
---

# RPC 相比 HTTP 的优势是什么？

RPC 是调用方式，底层的网络传输可以基于 TCP/UDP ，也可以基于 HTTP

从传输效率和序列化性能上讲：

传输效率：报文更小，传输更快
- RPC 可以基于自定义的 TCP 或者 HTTP2，让发送的报文更小；而 HTTP1.1 会存在较多无用的报文
- 如果同时采用 HTTP2 对比，则 RPC 框架提前封装好的序列化速度更快

序列化性能：RPC 框架基于 thrift 协议可以实现高效的序列化，相比 HTTP 大多采用的 JSON 协议，拥有更小的体积、更快的序列化速度

---

拓展阅读：[HTTP和RPC的优缺点](https://developer.aliyun.com/article/634470)