---
title: Android Binder学习笔记
date: 2020-06-29 22:18:37
permalink: /pages/7d6e79/
categories: 
  - 服务端
  - 编程语言
  - Java
tags: 
  - 
titleTag: 草稿
---
> Ref:http://blog.csdn.net/universus/article/details/6211589

## **出现Binder的原因：**
Android平台开发主要基于Client-Server
- 系统复杂性：
    - Linux实践中学到，IPC 中的管道/信号量/共享内存 只有通过一定的封装才能支持Client-Server通信,增加系统复杂性
- 传输效率：
    - 支持Client-Server的`socket通信`主要用于跨网络的进程间通信or本机上进程间的低速通信，传输效率低，开销大
    - `消息队列`和`管道`采用存储-转发方式，即数据先从`发送方缓存区`拷贝到`内核开辟的缓存区`中，然后再从`内核缓存区`拷贝到`接收方缓存区`，至少有两次拷贝过程**(数据拷贝2次)**。`共享内存`虽然无需拷贝，但控制复杂，难以使用**(数据拷贝0次)**
    - Binder**(数据拷贝1次)**
- 安全性：
    - 传统IPC接收方(比如系统服务)无法确保进程的UID/PID正确性，完全依赖上层协议来确保安全性
    - 使用传统IPC只能由用户在数据包里填入UID/PID，但这样不可靠，容易被恶意程序利用。可靠的身份标记只有由IPC机制本身在内核中添加。
    - 传统IPC访问接入点是开放的，无法建立私有通道。无法阻止恶意程序通过猜测接收方地址获得连接。
    - Binder基于Client-Server通信模式，传输过程只需一次拷贝，为发送方添加UID/PID身份，既支持实名Binder也支持匿名Binder，安全性高。

## Binder介绍
- Binder提供server的访问接口，client想要访问该接口需要通过Binder建立的管道接口
- 面向对象：server中的对象，提供访问server请求的函数。Client通过Binder指针(Binder存在于远端Server,但在内存中被引用)调用方法访问server.
- 通过上述方法，将进程间通信转为对某个Binder的引用，Binder跨进程，实体位于一个进程，引用却遍布系统各个进程。

## Binder通信模型

-------------

未完待续

--------------

