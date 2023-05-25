---
title: 通读「PWA 应用实战」
date: 2021-09-21 21:02:37
permalink: /pages/4e9aec/
categories: 
  - 大前端
  - 专业领域
  - 跨端技术
  - PWA
tags: 
  - 通读
titleTag: 草稿
---
## sw 注册过程

### 作用域

表示某 sw 文件可以控制的页面范围，默认作用域为 sw 文件的 path
> 注意是页面纬度的，和页面里的资源的请求地址没有关系

举例，以下页面（xxx.com/index.html）加载了一个 `/a/b/` 路径的文件

```html
<!DOCTYPE html>
  <head>
    <title>Service Worker Demo</title>
  </head>
  <body>
    <script>
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./a/b/sw.js')
          .then(reg => {
            console.log(reg)
          })
      }
    </script>
  </body>
</html>
```

则此 sw 文件只能控制 `xxx.com/a/b/` 下的页面，不能控制 `xxx.com/index.html` 这个页面以及 `xxx.com/a/c/` 的页面 
> 这里说的控制即这些页面应用 sw ,由 sw 接管缓存

还可以进一步指定默认作用域的子作用域，且必须是默认作业域的子作用域，比如 /a/b/d 

```js
navigator.serviceWorker.register('./a/b/sw.js', {
    scope: '/a/b/d/'
})
```

如果设置其他作用域比如 `/a/c` 就会报错


如果真想提升 sw 的作用域，有方法么？也是有的，可以设置 sw 文件的响应头，修改「最大作用域」
```
Service-Worker-Allowed: /a/c/
```
表明该 sw 文件允许接管 `/a/c/` 路径下的页面

举例，对于这个页面 https://fe-examples.github.io/pwa-examples/scope/index.html

加载了 `/scope/page/sw.js` ，却配置了 `/scope/p2` 的作用域，默认是会报错的

通过代理给这个文件加响应头
```sh
https://fe-examples.github.io/pwa-examples/scope/page/page_sw.js resHeaders://{resHeader.json} 

#resHeader.json
Service-Worker-Allowed: https://fe-examples.github.io/pwa-examples/scope/p2/
#
```

则不再报错，sw 文件拥有 /scope/p2 的作用域了，可以成功代理请求
```
Q: 响应头和配置的作用域不一致会怎样？
A: 可以不一致，响应头表示的是最大作用域，配置的作用域必须是最大作用域的子集，否则还是报错
```

### 作用域污染

多个 sw 控制一个页面的情况，或者某个页面不受预期的被控制，即作用域污染。



举例：
```
.
└── demo
    ├── a/
    │   ├── a-sw.js
    │   └── index.html
    ├── b/
    │   └── index.html
    └── root-sw.js
```

/a/index.html 加载的 /a/a-sw.js ，仅能控制 a 的页面

/b/index.html 加载的 /root-sw.js ，可以控制所有页面

为了使 a 页面仅被 a-sw 控制，需要：
注销非当前作用域的 sw ，重新注册自己作用域的 sw

Q: 作用域污染有什么影响？
A: 页面被不受预期的 sw 控制，可能导致访问异常。由于各个作用域页面的控制权不一定是同个开发者，导致问题排查难度变大

### 注册原则

spa: sw 放根目录，index.html 中引用，即作用域为 /
mpa: 根据业务结构决定单个还是多个
    - 单个：业务相似度高，公共资源和请求较多
    - 多个：不同 path 差异较大，相当于不同子站，公共资源和请求较少。比如不同的活动页。需要注意污染问题


### 更新

浏览器可以根据 url 或文件内容变更检测到 sw 升级

实践中我们更常用 url 带版本号链接的方式  `./sw.js?v=12323` 方便追踪版本

sw 更新升级时，浏览器进行异步处理：重新触发注册、安装、激活、控制页面

### 容错

线上 sw 有 bug 怎么办？两个方式：

1. 走 bugfix 页面上线流程，代码里注销 sw (西瓜创作平台的实现方式)
2. 【推荐】sw 注册时通过「开关」请求进行容错降级，该开关请求不可被缓存，可快速上线。
  a. 可以是一个 ajax 接口请求
  b. 也可以是一个带全局 flag 变量的 js 脚本
  c. 如果无网，加载不了这个开关，不进行 sw 注销

## 工作原理

### 生命周期

注册

安装
进行预缓存
```js
addEventListener('install', event => {
  const preCache = async () => {
    const cache = await caches.open('static-v1');
    return cache.addAll([
      '/',
      '/about/',
      '/static/styles.css'
    ]);
  };
  event.waitUntil(preCache());
});
```

激活
激活后，可以监听 fetch 事件

控制各个事件成功

1. 注册
2. 执行 sw 代码，若无报错，执行 3
2. 执行 install 回调

安装失败即终结生命周期，那怎么算是安装失败？

里面抛异常也不行，需要通过 waitUntil 方法拓展生命周期 
```js
self.addEventListener('install', event => {
  // 引入 event.waitUntil 方法
  event.waitUntil(new Promise((resolve, reject) => {
    // 模拟 promise 返回错误结果的情况
    reject('安装出错')
    // resolve('安装成功')
  }))
})
```

同样，激活里面也可以通过 waitUntil 延迟激活时机，与 install 不同的是，reject 不影响激活，始终会激活成功

https://developer.mozilla.org/zh-CN/docs/Web/API/ExtendableEvent/waitUntil





Q: 注销旧的，并安装新的，会发生什么情况？
A: 同 sw 更新，旧的会走注销流程，但由于这个过程是异步的，在完全注销前，还是能够 fetch 请求

### 终端

多个终端共用 sw 工作线程

sw 激活和 sw 控制是不同的事

被动激活，同时会 sw 控制；
通过 skipWaiting api 进行手动激活，页面需要再次刷新才能被 sw 控制，可以通过 clientsClaim api 主动控制未受 sw 控制的终端



### 激活的时机

默认：首次安装会立即激活，但是不会控制页面，需要再次刷新页面才会
更新：已被 sw 控制的页面进行刷新，触发 sw 更新，

sw 更新后，处于 waiting 态，需要关闭所有相关终端，重新打开页面才能激活

对于开发以及用户都不太友好

有以下解决方案
1. devtool 勾选 upload on reload 选项。当页面 reload ，将强制更新 sw 并激活。
> 注意：如果更新了 sw ，首次刷新页面只是安装了 sw，需要再次刷新才能激活。如果在第二次刷新前又改了sw ，则第二次刷新还是仅安装 sw，需要再次刷新才能生效
2. devtool 手动点击 skipWaiting ,立即生效
以上方式对普通用户都不太友好
3.  


skipWaiting: 跳过激活 



### 更新方式

手动更新
24h 自动更新
用户手动刷新

###  Q&A

Q: 为什么首次加载页面，请求无法被拦截？
A: 默认激活后，但是不会拿到控制权，需要重新刷新页面才有

Q: 激活完成后，页面主要请求都以加载完毕，需要再次访问页面才能进行资源 cache ，需要第三次访问才会实现缓存命中。但要是第二次访问页面时无网，怎么解决？
A: 通过预缓存技术在 sw 首次安装时主动 cache ，下文会提到


Q: 一个页面在一次加载周期内，可能会先后被不同的 sw 控制，或者旧页面被新 sw 接管。有什么最佳实践么？
A: 会被不同 sw 控制，表明使用 skipWaiting 进行激活了；预期到缓存数据不一致的现象会导致问题，则不要使用 skipWaiting() 跳过 waiting 状态;
https://zhuanlan.zhihu.com/p/51118741

Q: html 页面是怎么被离线访问的？
A: 即使离线， sw 仍然在运行，fetch 里面命中了 html 请求，走了缓存。需要注意的是， html 必须采用 network first 的原则
> 之前出了个故障就是 html 没采用 network first ，且没做定时更新策略，开关策略和兜底逻辑；导致页面影响了 24h 才自动更新

Q: spa 只缓存主路径，但如果访问子路径会报错，怎么解决?
A: 正常无网在当前页面里访问子路径不会报错，但是如果用户刷新页面就会报错，因为对应的 request url 不在 cache 里；要想避免这个问题就需要把所有关键子路径的页面也做 cache
两个策略：
1. sw install 时 cache
2. spa 路由变更时 cache
虽然都是同个页面，会造成额外的流量损耗么？




## 调试



## 离线缓存

通过 cache api 和 indexed db 实现，前者保存请求响应具体内容，后者维护过期时间.

处理异常情况，实现各种请求响应策略，预缓存

实际应用中我们采用官方的 workbox 

### 预缓存

通过 cache addAll api 在 sw 安装期间主动 cache

注意重名资源的加载

## 用户留存

探讨了几种提供用户留存的方式

个人觉得 ROI 较低，使用场景不多，


## 性能

讲述了一些提高 pwa 性能的方案

摘抄自：https://developers.google.com/web/fundamentals/primers/service-workers/high-performance-loading

### 使用 app shell 渲染基础骨架

https://developers.google.com/web/fundamentals/architecture/app-shell

### 切勿使用“直通式”提取处理程序

不需要 fetch 拦截功能时，就不要编写相关处理，其有额外开销

```js
// Don't do this!
self.addEventListener('fetch', event => {
  event.respondWith(fetch(event.request));
});
```

### 适时使用导航预加载功能

https://developers.google.com/web/updates/2017/02/navigation-preload

## SEO 

### 背景

spa 的 seo 较差，即使 Google 和 百度已经逐渐支持 js 渲染内容爬取，但是还有很多渲染引擎未处理

两种方案：
1. SSR , 本文不介绍
2. 结合 AMP/MIP 方案

### AMP/MIP

制定 html 编写规范：https://amp.dev/documentation/guides-and-tutorials/learn/spec/amphtml.html :不支持外链 js

amp 页面的资源加载走 amp cache :Google 的 CDN , 爬虫爬取时认为该页面是 AMP 且符合 AMP 规范即将资源写入缓存，用户从 Google 搜索引擎点击 amp 结果，会创建一个 iframe ,异步打开 amp cache cdn 的 amp html 页面

amp 规范的元素需要依赖 amp js 运行时

限制较多，简单页面/交互较少页面适合使用

### 结合 PWA

全站 AMP: 在 amp 基础上增加 sw 支持：支持添加桌面和离线缓存；缺点则 amp 缺点：不支持复杂交互

Q: amp 不支持 外链 js，怎么添加 sw 支持?
A: 有自己的自定义组件，比如 mip 的 mip-install-serviceworker 组件

AMP 预加载 pwa: amp 作为中间页，预加载 pwa 页面。amp 供搜索引擎爬取

配置原页面地址
```html
<link rel="canonical" href="https://pwa.host/some/path">
```
预加载也是用 sw ,sw 里面对 pwa 的资源进行预缓存

## 实战

基于 webpack & workbox 的 demo

## 总结  & 最佳实践

对 sw 不太熟悉，只是尝新，担心造成事故，采用 network-first 准没错

skip 

## 其他
