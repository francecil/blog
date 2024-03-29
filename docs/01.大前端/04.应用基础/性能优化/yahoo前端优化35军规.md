---
title: yahoo前端优化35军规
date: 2018/05/10 01:00:00
tags: 
  - 前端优化
permalink: /pages/de4baf/
categories: 
  - 大前端
  - 应用基础
  - 性能优化
---

# 前言

本文为 yahoo 前端优化35军规的梗概，部分优化技术已过时，请注意分辨

<!--more-->

# 内容
## 1.尽量减少HTTP请求数

1. 资源合并
2. 小图片base64编码
3. 多图合并为单图
4. CSS Sprites，通过background-image和background-position属性来定位要显示的部分

## 2. 减少DNS查找

组件分散到2-4个主机名，这是同时减少DNS查找和允许高并发下载的折中方案

## 3. 避免重定向

HTTP 重定向是一项用于将客户端重定向到设备专用网址的常用技术。

但采用重定向会增加延迟。

若必须重定向的话，请使用HTTP重定向（响应体为空）并用301(永久转移)或302（暂时转移）状态码。（两者区别在于302会被url拦截，具体百度

因为系统会根据 HTTP 请求标头中的用户代理来执行重定向。 例子：

```
HTTP/1.1 301 Moved Permanently
Location: http://example.com/newuri
Content-Type: text/html
```


若难以实现HTTP重定向，则用js再去做。该做法多了文档下载，js解析的过程。

**注意1：**有一种常见的极其浪费资源的重定向，就是URL尾部缺少一个斜线的时候。

例如，跳转到http://astrology.yahoo.com/astrology会返回一个重定向到http://astrology.yahoo.com/astrology/的301响应（注意添在尾部的斜线）。

在Apache中可以用Alias，mod_rewrite或者DirectorySlash指令来取消不必要的重定向。

**注意2：**进行双向重定向与单向重定向

将访问桌面版网页的移动用户重定向到对应的移动版网页 -- “单向”重定向

在移动用户以及桌面设备用户分别访问桌面版网站和移动网站上的网页时，对他们进行重定向 --“双向”重定向

https://developers.google.com/search/mobile-sites/mobile-seo/separate-urls#automatic-redirection


<!--more-->


## 4. 缓存Ajax

Ajax GET请求，可以使用客户端缓存（而且只要地址一样，它总是会使用客户端缓存）

e.g: 邮箱web,请求通讯录数据，请求时返回结果带上通讯录最后修改的时间。后续请求带上该时间戳&t=xxx，若通讯录没有改变则请求缓存。若通讯录做了修改，时间戳改变，后续该请求新的数据.

**注意：**可能只适用于单用户，如这边的通讯录数据可以多人更改的话，就不能缓存了

## 5. 延迟加载组件

与渲染页面无关的内容可以往后。

比如淘宝首页，把非关键模块放入了懒加载队列，满足一定条件的时候再去加载，参考：http://taobaofed.org/blog/2016/04/06/optimize-in-tbhome#关键模块优先

## 6. 预加载组件

利用浏览器空闲时间请求用户接下来可能会访问的组件。

1. 无条件预加载 
> 比如：搜索主页，预加载后面搜索页一定会出现的资源
2. 条件性预加载
> 猜测用户将要跳转到哪里并据此预加载。比如正在填写“添加表单”，后面会跳到表单详情，则先把表单详情的资源拿到
3. 提前预加载
> 比如提供了一个新版网站入口。用户从旧版转向新版时，资源都是初次加载，会比较慢。此时可以选择预加载

## 7. 减少dom元素数量

只在语义上有意义的时候使用`<div>`，而不是因为它能够渲染一个新行

按需加载

`document.getElementsByTagName('*').length` 查看dom元素数量

## 8. 跨域分离组件

可以最大化并行下载。与 **`2. 减少DNS查找`** 结合，一般不超过2-4个域

## 9. 尽量少用，合理使用iframe

缺点：
1. 代价高，即使是空白的iframe
2. 浏览器返回按钮失效
3. 堵塞主页面的onload事件，
4. 与主页面共享连接池，而浏览器对相同域的连接有限制，所以会影响页面的并行加载

优点：
1. 可以引入缓慢的第三方内容，如广告
2. iframe引入了安全沙箱，可避免引入的页面对自己的页面产生不利的影响。比如防止访问父页面dom,防止读写cookie等数据

建议：
> 如果要使用iframe,采用动态给iframe添加src属性值的方式（js脚本放在body底部）。
> 可以避免上述缺点的3和4

## 10. 避免404

请求不存在的脚本文件，即使返回404，仍会去解析响应内容，无疑多了很多处理时间

# css 部分

## 11. 避免在css中使用表达式 

运算多次，性能消耗大。

现代浏览器已不支持了，无需了解。

## 12. 使用link而不是@import导入样式表

使用更加标准的link标记，而不是使用IE专用的@import语句

## 13. 避免使用Filters(滤镜)

滤镜会阻塞渲染，影响性能。

现代浏览器已不支持了，无需了解。

## 14. 把样式表放在顶部

之所以放在顶部，是为了能让页面逐步渲染（渐进式呈现（render progressively））

# js部分

## 15. 去除重复脚本

## 16. 尽量减少DOM访问

1. 缓存已访问过的dom元素
2. 一批节点操作，不用一个一个的在dom树上操作，应该一起操作完再放dom树上
3. 避免js直接修改布局，而是用js让节点选择预定义的其他css布局 

## 17. 设计“智能”的事件处理程序

举例：监听A节点下的10个子节点的点击事件。应该把事件处理器绑定A节点而不是10个节点各自绑定。

通过事件冒泡获知哪个按钮是事件源

这样做维护方便（取消监听时只要取消一处），性能好（只有一个事件监听器）

## 18. 把脚本放在底部

脚本会堵塞页面的解析和渲染。

如果脚本不存在document依赖，则可以放在页面底部

# js,css

## 19. 将js和css作为外部文件引用

优点：
1. 提高复用性
2. 可以被浏览器缓存
3. 提高可维护性

缺点：
增加额外请求

在下面三种情况下应该考虑直接在**页面中**定义脚本和样式：
1. 不复用
2. 页面不被经常访问
3. 脚本和样式很少

## 20. 压缩JAVASCRIPT和CSS

压缩，混淆。

# 图片
## 21. 优化图片

gif采用`<video>`实现

图片继续压缩

## 22. 优化 CSS Sprite

在`1.尽量减少HTTP请求数`中提到的技术。

通过background-image和background-position属性来定位要显示的部分

该技术的注意点：
1. 选用<a href="https://www.toptal.com/developers/css/sprite-generator">工具</a>完成图片合并，省去人工测量像素位置
2. 额外维护工作：某图片修改了，不仅需要生成新的图片，还涉及css的修改
3. 一般只能使用固定大小的盒子，这样才能够遮挡住不应该看到的部分

几个优化建议：
1. 尽可能使用横向组合图片，这比纵向组合图片的体积通常更小一点
2. 尽量使图片具有接近的色系，这样最终组合出来的图片也会小一些。
3. 尽量使用小一些的图片，并且图片之间的间隙尽量也小一些，目的还是为了最终组合出来的图片体积更小

## 23. 不要在页面中缩放图片

不要因为html本身可以设置宽高来使用**本不需要的大图**，

若需要`<img width="100" height="100" src="mycat.jpg" alt="My Cat" />`

那么图片本身应该是100x100 px的，而不是去缩放500x500 px。

请记住并遵守这条原则：你需要在网页中显示什么尺寸的图片，就请图片设计人员提供什么尺寸的图片，而不是在网页中进行缩放。

## 24. 使favicon.ico尽可能小并可缓存

**注意：**即便你不管它，浏览器也会自动请求它，导致出现404。放在

建议：
1. 1KB左右，百度：在线favicon.icon制作
2. 可缓存
3. 放在其他主机，避免请求时带上cookie

# cookie

## 25. 减小Cookie的体积

1. 设置合适的有效期
2. 设置合适的域级别
3. 尽可能小

## 26. 把组件放在不含cookie的域下

页面请求某个域时，会带上该域的cookie，对于一些静态资源，该cookie是没有必要发送的，此时可以把这些静态资源放在另外的域上。

除了不带cookie,还增加了页面资源的并发下载

# 移动端

## 27. 保证单个内容体积＜25K

iOS safari 早期版本（v3.2） 不能缓存超过25K（未压缩大小）的组件。 

现在版本应该能比较大了，也不知道其他浏览器支持的都多大= =

不过，总的来说**20. 压缩JAVASCRIPT和CSS**是必要的

## 28. 将组件直接打包到页面

例子：
1. CSS中还有小图片的请求，可以直接把小图片base64化替换该css样式的图片url
2. 邮件内容带图片，这种图片也是作为正文的一部分被编码进去的，无需新请求

# 服务器

## 29. Gzip组件

请求头中带有如下信息
```
Accept-Encoding: gzip, deflate
```
这是根据浏览器的设置决定的,表示浏览器接受的压缩格式。

web服务器通过Content-Encoding相应头来通知客户端数据采用了哪种压缩方式。
```
Content-Encoding: gzip
```
## 30. 避免将img的src属性设置为空

早期浏览器仍会发送请求，现代浏览器不会发了。

设置为空，本意可能是想先不加载，等页面解析完再用js去设置img的src。

应该采取更好的实现方式：ImageLoader

## 31. 配置ETags

ETags 是一个字符串，作为某组件某版本的唯一标识符。

服务器响应组件资源时，带上ETags响应头。

```
HTTP/1.1 200 OK
Last-Modified: Tue, 12 Dec 2006 03:03:59 GMT
ETag: "10c24bc-4ab-457e1c1f"
Content-Length: 12195
```

浏览器继续请求组件时，会用If-None-Match请求头来把ETag传回源服务器。如果匹配成功，返回304，就减少了12195字节的响应

```
GET /i/yahoo.gif HTTP/1.1
      Host: us.yimg.com
      If-Modified-Since: Tue, 12 Dec 2006 03:03:59 GMT
      If-None-Match: "10c24bc-4ab-457e1c1f"
      HTTP/1.1 304 Not Modified
```

## 32. 对Ajax用GET请求

推荐用GET请求的原因：
1. GET请求能利用客户端的缓存
2. POST请求进行了两次请求：先发送请求头再发送数据

但是，长度方面可能会有限制。

语义不易理解，违背RESTful原则

## 33. 尽早发送缓冲区内容

后台服务器还在组装html页面的时候，先发一部分到给浏览器，一般是head之后。这样浏览器端可以先去加载head中指定的资源 和页面的剩余部分加载是并行的。

当响应耗时主要在后台的动态页面组装时，最能体现优势

具体实现技术应该是动态网页相关的，暂时不是很理解，这边先留个坑。

## 34. 使用CDN

<a href="http://www.wangsu.com/">网宿科技</a>了解一下

## 35. 添上Expires或者Cache-Control HTTP头

~~需要总结下缓存控制的用法。这边先留个坑~~

这两个都是用于强缓存(200 form cache)的，

> Cache-Control:缓存时间值
> Expires:绝对时间
同时存在时，`Cache-Control` 优先于`Expires `，使用`Cache-Control`的一个好处是不用担心服务端时间和本地时间不一致

这篇总结的还行：<a href="https://www.cnblogs.com/wonyun/p/5524617.html">http协商缓存VS强缓存</a>

这里补充两点：

1. 浏览器开发者工具开启 **Disable cache**后，任何请求都不会走本地强缓存，但是会走304协商缓存（强制刷新除外）
2. 未开启**Disable cache**的状态下，ctrl+F5强制刷新，对于`page load`前的请求，都是不走缓存(强缓存和协商缓存`cache-control:no-cache`)的，但是`page load`后的请求不受限制可以走缓存

# 其他新技术

## DNS预解析-dns-prefetch

见 `W3C_DNS_Prefetching.md`


# 后记

以上内容只是对35优化原则的简单记录和个人见解，非译文。

yahoo原文：https://developer.yahoo.com/performance/rules.html

分享几篇写的不错的：

1. <a href="https://www.cnblogs.com/xianyulaodi/p/5755079.html">雅虎前端优化的35条军规</a>
2. <a href="http://www.cnblogs.com/chenxizhang/archive/2013/05/20/3088196.html">优化网站设计系列文章总结和导读</a>
