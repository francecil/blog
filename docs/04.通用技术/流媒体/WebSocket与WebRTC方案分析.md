---
title: WebSocket 与 WebRTC 直播方案对比分析
date: 2016/08/24 11:00:00
tags: 
  - WebRTC
  - ffmpeg
permalink: /pages/bd3255/
categories: 
  - 通用技术
  - 流媒体
---

# WebSocket

## 同步

首先说同步策略

<!--more-->

### 采用RTMP协议

需要了解RTMP的协议，将音视频流(H264/SPEEX)构造成RTMP包，通过WebSocket发送到客户端
这样的话，开发成本大，需要搭建一台用于发送RTMP包的WebSocket服务器而不是普通的RTMP服务器
这东西网上基本没人做，搜到了一个别人做的demo，但是没有文档，实在难以研究,且不知性能如何

参考：http://my.oschina.net/langhuihui/blog

### 开两个WebSocket

我自己写的，从服务器端同时发送音视频流，由于音频方面我没做编解码直接推的PCM可能数据量较大，
视频的话采用jsmpeg解码然后通过canvas绘制

这样的话没有做同步。

可以参考我上次发的fiiser技术研究：

同步：每5s发送一个同步指令给客户端进行同步(具体细节我就不懂了)

编解码:BroadwayJS+SpeexJS 大概做法和我差不多 就是编解码的效率问题了

## 解码-软解码

如果是采用RTMP同步，客户端还要去写JS解协议包(这方面不懂，资料也比较少)

然后一般都是利用BroadwayJS+SpeexJS来解码，这两个是利用Emscripten把原生代码编译成JS，比普通JS效率高

## 渲染

Canvas+AudioContext 

## 支持情况

除IE外，其他大部分PC/Mobile浏览器(有的可能需要较新版本)都支持上述技术

## 延迟及卡顿情况

局域网内，我的方案基本没有延迟(200ms以内)和卡顿

## 开发成本

首先同步本身不好做，还有编解码这块，需要编译上述两个解码库然后找下文档看怎么用，然后服务端还得构造相应编码的流来测试。

想做好一套解决方案一个人基本搞不定

# WebRTC

## 同步及渲染

浏览器端已经做好同步策略，绑定`<video>`标签进行渲染

## 解码-硬解码

## 支持情况

- PC:Chrome29和火狐47以上支持，Opera 39以上支持，IE内核的浏览器、Edge、Safari不支持
- Mobile：Chrome for Android ，firefox for Android支持
Android WebView(5.0以上支持，4.4部分手机(samsung htc等)支持)，手机自带浏览器(4.4以上部分厂商支持)
QQ/UC/百度浏览器 正在测试，
WP手机不支持(可以考虑后面兼容ORTC)

参考 http://www.tutorialspoint.com/webrtc/webrtc_mobile_support.htm 并做了下验证

### Question:苹果用户怎么使用

苹果官方15年底声称Safari接下来会支持，有望在近两年得到使用

如果苹果用户想使用，可以下载 Bowser(http://www.openwebrtc.org/bowser/) 或者Chrome