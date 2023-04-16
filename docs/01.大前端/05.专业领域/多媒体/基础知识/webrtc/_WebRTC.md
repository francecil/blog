---
title: WebRTC
date: 2019-12-16 14:08:54
permalink: /pages/a1ab6d/
categories: 
  - 大前端
  - 专业领域
  - 多媒体
  - 基础知识
  - webrtc
tags: 
  - 
titleTag: 草稿
---

# 背景知识

## STUN

内网穿透

## TURN

双端无法通信时用于转发数据

## ice

对 stun turn 做了封装，并有自己的一套协议


# 建联过程

## 创建 PeerConnection 实例

创建 pc 实例时，可以配置 iceServer 地址

pc 收到可用的 ice 候选后将该候选通过公网服务器发送给对端 pc 并进行添加


对端 pc 创建时执行一样的操作

这样双方会选择一个自己和对方都有的 ice 候选进行内网穿透

## session 描述传递

仍然是添加到自身并通过公网服务发往对面，对面一样的操作

这个 session 描述主要是本地支持的音视频编解码格式

## 添加音视频流

本地 pc 将音视频流添加到流通道中，在通道打通时对面就可以收到了