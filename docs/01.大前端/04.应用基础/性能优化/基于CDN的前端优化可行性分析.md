---
title: 基于CDN的前端优化可行性分析
date: 2018/05/14 01:00:00
tags: 
  - CDN
  - 前端优化
permalink: /pages/f1c102/
categories: 
  - 大前端
  - 应用基础
  - 性能优化
---

# 前言

探索 CDN 厂商能为前端页面提供的优化方案

<!--more-->

# 基本优化

## 资源压缩

> html,css,js等资源文件进行压缩

## 缓存控制

> 设置合理的缓存策略,文件设置版本号等等

## 域分片

> 增大http并发连接数

# 图像优化

## 分层加载

> 基于网络条件分层加载,提供多种压缩级别的图像资源

## 懒加载

> 仅加载当前浏览器视区可见的图像，当用户向下滑动时加载新图像,参考lazyload。除了图像外，其他资源也是同理

> 参考：http://taobaofed.org/blog/2016/04/06/optimize-in-tbhome#关键模块优先

## 特定浏览器的图像优化

> webp、jpeg2000等图像格式可以降低负载，而不影响图片质量

## 图像内联

> 对于小于10k(具体大小可商定)的图像资源采用base64内联

# js优化

## js合并

> 将无依赖的js打包为一个js，减少http请求数。还需要考虑到是否会让缓存失效

## 异步化

> 与dom无关的js放在页面渲染后加载

# 其他方向

## 组件预加载

> 利用浏览器空闲时间请求用户接下来可能会访问的组件。

用户行为预测分析

## http2

> 多路复用，header压缩

## dns-prefetch

见 `W3C_DNS_Prefetching.md`

## 尽早发送html部分响应

> 缩短提供第一部分html响应的世界，使浏览器更早下载资源。
>
> akamai 提供的 EdgeStart 功能。我理解应该是对服务端渲染网页的加速，可以探讨下

<a href="https://developer.akamai.com/learn/FEO/edgestart.html">What is EdgeStart?</a>

针对动态网页,需要客户配合设置一些标签位（或者看是否设置缓存策略），将动态网页分为两部分，设为标识位的内容先返回给前端（并带上我们的加速脚本），内容一般是一些可缓存的资源。未标识的为动态内容，需要回源渲染。

可以利用http的chunk，逐步把html文档推给用户。或者插入我们加速脚本 采用ajax请求获取数据。（需要CDN或源站配合配合

标志位内容可以先被解析，用于提高非缓存页面的渲染时间和TTFB

## big_pipe 块式传输

前端模块化，服务端块式传输。

## 监控由js发起的js请求，外链加速
对该对象的src属性重新定义
```js
Object.defineProperty(HTMLScriptElement.prototype, 'src', {
    enumerable: true,
    configurable: true,
    get: function(){
        return this.getAttribute('src')
    },
    set: function(newval){
        
        this.setAttribute('src','http://www.wangsu.com/'+newval);
    }
});
```
对于`doument.write('<script src="a.js"/>')` 需要额外处理
## CSS-DataURI

## 异步加载js不执行，按序执行

上文，我们提出了js异步，让js在domcontentload之后再去加载，js加载的过程中，只是简单的插入`<script>`节点到文档中，不能保证script的执行顺序。

未异步前，script是严格的按序执行的，而无论在浏览器的哪个节点，通过动态插入`script`的方式无法保证其执行顺序

最粗暴的做法即：前一个脚本onload事件触发后(脚本执行完毕)，执行下一个脚本的下载的执行

但是这样就变成顺序下载了，无法充分利用带宽。

我们可以利用`<object>`进行预下载，并做一套控制

(利用object tag 会生成blob,挺耗时的)

# 移动端优化

## AMP

