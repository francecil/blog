---
title: 浅谈 preload 预加载
date: 2018-7-10 10:18:32
categories: 大前端
tags:
  - 前端优化
---

# preload简介

一种资源预加载的方式。用于提高性能，方便开发人员控制资源加载。

preload 指示浏览器预先请求当前页面接下来会需要用到的资源。

在chrome中，采用 preload 预加载资源后，后续没有在对资源进行请求(3s)，控制台会提示说是否有必要预加载该资源。


<!--more-->


# 使用preload的几种方式

## 方式1：html页面书写link标签

`<link rel="preload" href="资源地址" as="script">` 

as 属性告诉浏览器加载的是什么资源，<a href="https://link.jianshu.com/?t=https://fetch.spec.whatwg.org/#concept-request-destination">常见取值有："script","style","image","media","document"</a>

不加as参数，资源请求优先级和异步xhr一样，非常低。(新版chrome无as或错误值将不会进行preload)

对于字体文件`as="font"`，需要加上`crossorigin`属性: <a href="https://drafts.csswg.org/css-fonts/#font-fetching-requirements">fonts were fetched using anonymous mode CORS </a>,
否则接下来的字体资源请求会重新获取（二次获取）。

```html
<link rel="preload" href="font.woff2" as="font" type="font/woff2" crossorigin>
```
type和as有一样的作用，取值不一样


> 一行代码实现css懒加载

```html
<link rel="preload" as="style" href="asyncstyle.css" onload="this.rel='stylesheet'">
```

> 响应式加载

```html
<link rel="preload" as="image" href="map.png" media="(max-width: 600px)">
<link rel="preload" as="script" href="map.js" media="(min-width: 601px)">
```
## 方式2：js创建link标签

```js
var elem = document.createElement("link");
elem.setAttribute("href", url);
elem.setAttribute("as", "script");
elem.setAttribute("rel", "preload");
document.head.appendChild(elem);
```

## 利用http响应头预加载

在html页面的响应头中增加 Link 响应头，其内容为`<./js/image-optimizer.js>; rel=preload; as=script`

在html文档下载完毕时，则会进行`./js/image-optimizer.js`的预加载

> 本地利用 fiddler4做个测试
1. 输入bpu localhost/test.html命令 拦截测试页面html请求，此时可以进行请求头和内容的修改
2. 点击 *Break on Response* 按钮 发起请求，并拦截响应，此处我们对响应头进行内容添加
3. 点击 *Run to Completino* 按钮,返回响应。

# 浏览器兼容性

<a href="https://caniuse.com/#search=preload">chrome 50+,safari 11+等</a>

> 检测`<link rel="preload">`是否被支持

```js
const preloadSupported = () => { 
  const link = document.createElement('link'); 
  const relList = link.relList; 
  if (!relList || !relList.supports) {
    return false; 
  }
  return relList.supports('preload'); 
};
```


# 与 prefetch 的异同点

## 区别

当前页面必要资源则采用`preload`,将来页面使用的资源采用`prefetch`

A页面发起 a.js 的 prefetch 预加载，在请求过程中此时调转到B页面，a.js 请求不会中断，而换成 preload预加载则请求会中断。

## 共通点
> Chrome 有四种缓存: HTTP 缓存，内存缓存，Service Worker 缓存和 Push 缓存。preload 和 prefetch 都被存储在 HTTP 缓存中。
>
>当一个资源被 preload 或者 prefetch 获取后，它可以从 HTTP 缓存移动至渲染器的内存缓存中。如果资源可以被缓存（比如说存在有效的cache-control 和 max-age），它被存储在 HTTP 缓存中可以被现在或将来的任务使用，如果资源不能被>缓存在 HTTP 缓存中，作为代替，它被放在内存缓存中直到被使用。

## 注意点
1. 当prefetch和preload预加载同一个资源时，实际会产生两次下载

## Chrome 对于 preload 和 prefetch 的网络优先级？
<img src="https://www.w3cplus.com/sites/default/files/blogs/2017/1708/preload-6.jpeg"></img>
(来源：https://docs.google.com/document/d/1bCDuq9H1ih9iNjgzyAL0gpwNFiEP4TZS-YLRp_RuMlc/edit#)
> perload利用as或type来表示请求资源的优先级。

按DevTools的标准，as取值对应的优先级如下：
- style-->Highest
- script,font-->High 
- image-->Low


Prefetch的优先级为 Lowest

从该表得到的其他信息：
1. 第一张图片预加载之前发起的脚本请求优先级为 High
2. 第一张图片预加载之后发起的脚本请求优先级为 Medium
3. 异步脚本请求优先级为 Low
4. 视口图片比非视口图片的请求优先级高

图片预加载之前：`script节点`在dom解析时处于图片节点之前


# DNS prefetch

预解析 DNS

默认情况下 `dns prefetch` 只对href属性的url地址进行dns预解析，但若当该网站处于https时则不会进行处理

可以通过`<meta http-equiv="x-dns-prefetch-control" content="on">`手动开启，此时https也可正常处理，可通过设置off来进行关闭，当设置off关闭后，再设置on就没有效果了。

利用 `<link rel="dns-prefetch" href="//host_name_to_prefetch.com">`手动预解析，一般用来预解析以下场景：请求重定向后的地址，js代码中的异步请求地址，图片请求地址，较晚被dom解析的script节点地址

# 参考文档

1. <a href="https://www.w3.org/TR/preload/">W3C preload 文档</a>
2. <a href="https://www.smashingmagazine.com/2016/02/preload-what-is-it-good-for/">Preload: What is it Good For?</a>
3. <a href="http://dev.chromium.org/developers/design-documents/dns-prefetching">chromium DNS Prefetching</a>
4. <a href="https://www.w3cplus.com/performance/reloading/preload-prefetch-and-priorities-in-chrome.html">Preload，Prefetch 和它们在 Chrome 之中的优先级</a> 
4. <a href="http://dev.chromium.org/developers/design-documents/dns-prefetching">DNS Prefetching</a>