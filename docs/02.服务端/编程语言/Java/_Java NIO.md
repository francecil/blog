---
title: Java NIO
date: 2020-06-29 22:18:37
permalink: /pages/0a38aa/
categories: 
  - 服务端
  - 编程语言
  - Java
tags: 
  - 
titleTag: 草稿
---
# 简介
[Java IO文章][1]我们讲诉了Java IO的大部分用法。
## 那么 Java NIO又是什么呢?
nio 由jdk 1.4引入，提供使用IO服务的通用API,覆盖当今商业OS普遍提供的高效IO特性，允许接入新型Channel和Selector
## 为什么引入Java NIO?
JVM 中与特定平台相关的细枝末节(一些功能强大的特性就在其中)被隐藏起来
java nio提供了新的抽象
>注意：您无法使用每一种操作系统的每一种特性，但是这些新类还是提供了强大的新框
架，涵盖了当今商业操作系统普遍提供的高效I/O特性。不仅如此， java.nio.channels.spi还
提供了新的服务提供接口（ SPI），允许接入新型通道和选择器，同时又不违反规范的一致性。


# 缓冲区
## 基础`java.nio.Buffer`




  [1]: http://hongweipeng.com/index.php/archives/729/