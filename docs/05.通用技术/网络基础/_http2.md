---
title: http2
date: 2019-12-15 21:22:34
permalink: /pages/b50a84/
categories: 
  - 通用技术
  - 网络基础
tags: 
  - 
titleTag: 草稿
---
# 新特性

## 二进制分帧

信息进一步拆分，如 http1.1 中的 header 封装到 header 帧中 request body 封装到 Data 帧

## 头部压缩

SPDY 也是支持头部压缩的

双端维护首部表，新的首部键值追加或替换首部表数据

具体流程不太懂

## 多路复用

消息是分帧的，共用一个tcp链接，根据流标识负重组

解决域名并发请求限制的问题

## 服务端推送 server push

可以在应用服务器中配置，如 nginx 中配置 http2_push ，还会推送对应的资源给客户端
```
    location / {
      root   /usr/share/nginx/html;
      index  index.html index.htm;
      http2_push /style.css;
      http2_push /example.png;
    }
```

不过这样配置太死

可以在响应头中加 `Link: </styles.css>; rel=preload; as=style`

并修改 nginx 配置

```
    location = / {
        proxy_pass http://upstream;
        http2_push_preload on;
    }
```

如果有一端不支持 http2 会回退到 preload 预加载

### 存在的问题

资源必须放在一起，而如今静态资源 CDN 化是标配，主域也走 CDN 化会存在较多问题

无法感知客户端是否存在缓存，多发一次造成浪费

有一些新的发展方向，具体可以看这篇文章：https://juejin.cn/post/6877063824861167623

## vs http3

http3 使用的 udp ；解决 http2 因为丢包导致滑动窗口堵塞的问题  

# 参考

https://juejin.im/post/5a4dfb2ef265da43305ee2d0#heading-14