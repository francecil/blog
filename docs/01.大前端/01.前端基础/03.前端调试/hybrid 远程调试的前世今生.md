---
title: hybrid 远程调试的前世今生
date: 2022-10-11 10:28:44
permalink: /pages/006356/
categories: 
  - 大前端
  - 前端基础
  - 前端调试
tags: 
  - 
---
# 前言

前端程序员最容易搞出 P0 事故的就是白屏，PC 上的白屏我们比较好调，打开 Chrome Devtools 就能看见。

但是手机上的白屏怎么调？以及远程用户手机上的白屏又该怎么调？ 这时候就需要使用**远程调试**的技术了。

<!-- more -->

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f43b57b757874127bdbc8aae21aa4eab~tplv-k3u1fbpfcp-zoom-1.image)


本文将对**远程调试**这个话题进行探讨，并给出最佳实践。



## 谁适合阅读本文档

有移动端 Web 开发背景，或者对移动端 Web 开发感兴趣的前端同学

  


## 预期收获

1.  了解远程调试的发展历程

<!---->

2.  掌握远程调试的基本原理

<!---->

3.  掌握不同场景的调试决策

  


## 分享思路

1.  介绍调试与远程调试的概念

<!---->

2.  介绍 hybrid 远程调试的发展历程以及相关技术

<!---->

3.  对调试方案进行对比，并提供最佳实践

<!---->

4.  对远程调试未来的一个畅想

  


## 特殊说明

-   hybrid：前端和客户端的混合开发，**一般是指**在客户端应用上启动 Webview 渲染 Web 页面，兼顾原生 App 和 Web 的优点。在本文中，为方便理解，**hybrid 泛指移动设备上的前端技术**，包含原来的 hybrid 应用、以及移动浏览器 Web。


# 调试与远程调试

## 调试

-   使用 Chrome Devtools 调试网页，是调试

<!---->

-   使用 VSCode Debugger 调试 Node 应用，也是调试

  


他们的共同点在于：

-   有一个**调试界面（client）** ，比如 Chrome Devtools 、VSCode Debugger

<!---->

-   有一个**目标调试服务（server）** ，比如 网页、Node 应用

<!---->

-   调试界面和目标服务之间约定了一个**调试协议（protocol）** ，比如 Chrome Devtools 的 `Chrome Devtools Protocol (CDP)` ，VSCode Debugger 的 `Debug Adapter Protocol`

<!---->

-   需要一个**传输通道（transport channel）** 来传递协议 ，比如**使用内部函数调用**，或者**基于网络传输的** **websocket** **方案，usb 传输**等等

  


因此，我们粗浅的定义调试由四部分组成

| **调试四要素**          |                             |
| ------------------ | --------------------------- |
| **调试界面（client）**   | **调试协议（protocol）**          |
| **目标调试服务（server）** | **传输通道（transport channel）** |

  


## 远程调试

相比调试，远程调试的**调试界面（client）** 和**目标调试服务（server）** 一定在不同的机器上；

此外，**远程调试**在**传输通道**上做了限定，需要借助一些物理介质（比如 WIFI、蓝牙、USB）来配合**传输通道（transport channel）** 传递协议

  


对于 hybrid 这个场景，远程调试的四要素分别是：

| 四要素| 说明 |
| --------------------------- | ------------------------------------------------------------------ |
| **调试界面（client）**            | Chrome Devtools 、Safari Inspector 等调试工具，目前 Chrome Devtools 使用率占比最高 |
| **目标调试服务（server）**          | 手机 web 页面                                                          |
| **调试协议（protocol）**          | Chrome Devtools Protocol ，Safari 的 Webkit Devtools Protocol        |
| **传输通道（transport channel）** | 可以是基于 USB 的请求转发、或者基于网络的 websocket 转发，根据不同场景来决定使用的技术

# 发展历程


![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/57709bc06fe74bb1b25f1de666764097~tplv-k3u1fbpfcp-watermark.image?)

## 阶段 0：WAP 时代的原始调试 - 2000

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4d01447fe4c343f894fe4706313c1e3b~tplv-k3u1fbpfcp-zoom-1.image)

  


早期的移动端网页称之为 WAP ，支持展示少量页面标签以及页面脚本。

  


当时存在着各种类型的操作系统，比如诺基亚的 Symbian、黑莓等等，大部分手机都会支持 WAP 。

以诺基亚为例，2005 年诺基亚手机内置 [S60 浏览器](https://en.wikipedia.org/wiki/Nokia_Browser_for_Symbian)，其内核用的 [Webkit](https://web.archive.org/web/20051206034449/http://opensource.nokia.com/projects/S60browser/)，支持 WAP 页面展示。

  


当前的页面形态还比较简单，加之混合应用还没起来，大部分情况下本地调试即可解决，因此远程调试还不是痛点。

  


一般还是采用 alert 这样的**本地调试**方案。

  


* * *

时间快进到 2009 年，Opera Mobile 10 发布，Symbian 系统可安装下载。

该浏览器牛逼之处在哪？其 **[支持局域网内远程调试](https://dev.opera.com/blog/opera-mobile-10-and-its-remote-debugging-party-trick/)**，无需 USB ，**领先同行数年！甚至如今（2022）Android Chrome 默认都不提供 WIFI 调试**，只能通过一些工具解决（下文会提到）

当前该方案的不足之处在于生态，如果统一市场的是 Opera 而不是 Chrome 的话...

[可以看这个 YouTube 视频](https://www.youtube.com/watch?v=sZt-k93qLbg)
1.  手机和电脑处于同一局域网
2.  电脑打开 Opera 浏览器，启用远程调试功能（默认开启端口 7001）
3.  手机打开 Opera 浏览器，进入调试页面，输入电脑 ip 和调试端口
4.  电脑展示手机 Opera 浏览器画面，此时可进行调试


## 阶段 1：Webkit 初期 - 2007

  


**2007 年** 首款 iPhone 和 Android 设备分别发布，自带 Webview 功能（采用的 Webkit 引擎）

  


那一开始如何进行 Webview 页面调试的呢？

-   Android：默认不提供调试功能，但提供了一些 [Android API ](https://developer.android.com/guide/webapps/debugging?hl=zh-cn#java)，可以控制页面（注入脚本，获取console 信息）

<!---->

-   iOS：默认提供 Debug Console 功能，可以在页面某个区域上直接展示调试弹窗

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/353aea20acfb426f8c2409643061a5e1~tplv-k3u1fbpfcp-watermark.image?)

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9dca53ce950f4d458af9eb9e9f1c54b5~tplv-k3u1fbpfcp-watermark.image?)

*引自* *[Step By Step: Turn On The iPhone/iPad’s Web Debugging Console · MaisonBisson](https://maisonbisson.com/post/step-by-step-turn-on-the-iphone-ipads-web-debugging-console/)*

首先 iOS 的调试方案不通用，还压缩了页面布局；Android 上调试需要懂 Android 的同学配合。

  


此时的调试如此麻烦，不如继续使用 alert 。

  


但 alert 本身就难用，此时有追求的前端同学就诞生了一个想法：

**画一个调试框，支持打印输出（重写 console** **api** **），执行输入脚本（eval）**

  


这也是后面介绍的 vconsole 等解决方案的雏形，但当时大家各做各的，貌似也没有较出名的开源方案。

## 阶段 2：Weinre（**We**b **In**spector **Re**mote）前端方案 - 2010

>  ☀️ 聪明的程序员大多是偷懒的

如果能在电脑上直接调试移动端页面，那效率就大大提高。可是客户端不支持，作为一个前端开发，怎么用前端技术来解决这个问题？


![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c0ab0f108c9342daa3e26b12b24996db~tplv-k3u1fbpfcp-watermark.image?)

**2010.12** ，Patrick Mueller 推出了 [weinre](https://people.apache.org/~pmuellr/weinre/docs/latest/) 工具，意为 **We**b **In**spector **Re**mote（见 [weinre - ChangeLog](https://people.apache.org/~pmuellr/weinre/docs/latest/ChangeLog.html)）

  


weinre 由三部分组成

1.  **本地调试器（Debug Client）** : 用的是 Webkit 的 Web Inspector

<!---->

2.  **服务端（Debug Server）** ：本地起的 http 服务（weinre 采用的 node 技术），用来与 Debug Client 和 Debug Target 进行通信

<!---->

3.  **目标页面（Debug Target）** ：移动端上的目标调试页面，需要在页面上注入一段 weinre 脚本，该脚本会与 Debug Server 进行通信，将当前页面的调试信息发往 Debug Server ，或收取 Debug Server 的信息来控制 Debug Target



![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7ab291405b324f4183621f9403705f71~tplv-k3u1fbpfcp-watermark.image?)

weinre 的原理如下：

1.  Debug Target 和 Debug Client 使用同一套调试协议（Webkit Devtools Protocol）

<!---->

2.  Debug Target 收到 Debug Client 的操作请求，将其解析为具体的 JS 操作，作用到当前页面并返回结果响应

<!---->

3.  Debug Target 内部也会监听一些事件，比较网络请求、日志输出，并将结果主动推到 Debug Client

<!---->

4.  Debug Target 和 Debug Client 使用 Debug Server 进行中转，支持多页调试。（**经典的发布订阅模式**）


![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2a5c017f3d93449eac68907f8a3776c3~tplv-k3u1fbpfcp-watermark.image?)


以最常用的「**Console 面板执行代码**」为例：

1.  重写页面全局 API ，包括 console 等

<!---->

2.  收到「执行代码」请求，使用 eval 执行代码，并将结果作为响应返回

<!---->

3.  如果直接过程中出现输出，则主动发起「输出日志」的请求


> ***weinre*** 使用纯前端能力，没有用到任何 native 能力。
> 
> 因此其功能有限，比如无法调试源码、监控所有请求（可以想一下为什么）。

但 ***weinre*** 提供了一个思路，即纯前端可以实现基础能力的任意远程调试

## 阶段 3：USB 连接调试 - 2012

weinre 方案故好，但还是缺少诸如完整的元素面板、完整的请求列表面板。

于是，轮到操作系统开始卷了。

-   2012.9 苹果发布了 [iOS 6](https://zh.m.wikipedia.org/zh/IOS_6) ，其[支持远程调试](https://firt.dev/ios-6/)

<!---->

-   2013.11 谷歌发布了 Android 4.4 ，使用 chromium 作为 webview，可以配合桌面 Chrome Devtools[ 实现远程调试](https://developer.chrome.com/docs/devtools/remote-debugging/webviews/)


![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b208e2d14be546deb0c5987700386324~tplv-k3u1fbpfcp-watermark.image?)

此时的**远程调试四要素**如下：

|     四要素   | **iOS**                  | **Android**              |
| --------------------------- | ------------------------ | ------------------------ |
| **调试界面（client）**            | Safari Web Inspector     | Chrome Devtools          |
| **目标调试服务（server）**          | iOS Webview              | Android Webview          |
| **调试协议（protocol）**          | Webkit Devtools Protocol | Chrome Devtools Protocol |
| **传输通道（transport channel）** | USB 请求转发                 | USB 请求转发 |

该阶段能够**实现完整的调试能力**，但**引入了 USB 作为调试通道**，增加了远程调试成本，且不适用于跨地远程调试

## 阶段 4：前端模拟 CDP - 2016

CDP，即 Chrome Devtools Protocol 。随着 Chrome 的优化，Safari 、Firefox 和 IE 等浏览器的没落，社区上使用 Chrome Devtools 调试的占比越来越大。

  


这个阶段其实没有什么创新性的突破，而是将原来的调试体系往 CDP 靠拢，社区出了如下方案：

-   [ios-webkit-debug-proxy](https://github.com/google/ios-webkit-debug-proxy) ：基于 USB 连接，使用 Chrome Devtools 调试 iOS Safari ，随着 Chrome Devtools Protocol 越发不兼容 webkit protocol，现在已无法单独使用，需要配合如下工具

<!---->

-   [remotedebug-ios-webkit-adapter](https://github.com/RemoteDebug/remotedebug-ios-webkit-adapter) ：协议适配器，将 webkit protocol 转换为 Chrome Devtools Protocol

  


而在基于 WIFI 通道的调试方案上，weinre 已不再兼容 Chrome Devtools Protocol ，于是社区又出了一款代替 weinre 的方案 -- [chii](https://github.com/liriliri/chii)

> 于 2020.4 推出，对标 weinre 的能力，只是将 webkit protocol 改为 Chrome Devtools Protocol ，weinre 无法获取到的，chii 也无法获取，比如网络只能捕获 xhr

  


于此同时，原先的「页面展示一个调试窗口」也出了几种较为好用的方案：

-   [vConsole](https://github.com/Tencent/vConsole) ：目标是更轻量的 console 控制器，由 Tencent 前端团队于 **2016.4** 开源

<!---->

-   [eruda](https://github.com/liriliri/eruda)：2017.3 推出，和 chii 是同一个作者


**简单总结下这个阶段：工具不断优化，并往 Chrome Devtools 调试靠拢**

## 阶段 5：WIFI + CDP

前面提到，社区调试方案逐步迁移到 Chrome Devtools 的调试体系，包括：

-   **USB 连接调试**，支持 Chrome Devtools 调试 iOS 和 Android （完整的调试能力）

<!---->

-   **前端模拟** **CDP**：基于纯前端能力，支持 Chrome Devtools 调试 iOS 和 Android（部分调试能力）

  


现在还有一个问题没有解决：**如何基于 WIFI 通道完整的调试** **Hybrid** **页面？**

> 解决了这个问题，我们就能抛开物理限制，实现跨地区的完整的远程调试

  


在分析这个问题之前，我们需要先解决如下问题：

-   USB 调试的原理是什么？

<!---->

-   怎么将 USB 通道替换为 WIFI 通道？

  


### Android USB 调试

Android 和 iOS 的 USB 调试过程不太一样，这里先讲 Android 的

-------

#### Android USB 调试原理

  


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1ee097a2210a41f381043860627e6e56~tplv-k3u1fbpfcp-zoom-1.image)

Android Chrome 在开启调试模式后，会启动 Unix Domain Socket Server（**固定端口 9229**） ，对其发送 `/json/list`请求可以获得可调试的页面列表；创建 socket client 并连上该 Server ，找到目标调试页面，对其收发 cdp 数据包，即可控制相应页面或者收到该页面的调试信息。

  


  


使用 usb 调试，实际是使用 **adb** 做了一层端口转发

```sh
adb forward tcp:9229 tcp:9229
```

**本地访问 9229 端口实际访问的是 Android 内部的 9229 端口**

  


PC 启动调试工具时，会创建一个 `socket client`，接着再通过 adb 连上了 `Unix Domain Socket Server` ，此后即可就进行 cdp 进行通信。

#### Android 绕过 USB


解决方案其实很简单，加一层 **websocket** 进行中转


![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c9f0ef280c564fb396e266beb7c9803a~tplv-k3u1fbpfcp-watermark.image?)

在 Android App 内部启动 2 个 socket client :

-   一个连接 `Unix Domain Socket Server` 收发数据，

<!---->

-   另外一个连接 PC 的 `socket server` 用来中转数据

  


然后 PC 的 socket server 再转发 CDP 数据给 `Chrome Devtools`

  


* * *

  


### iOS USB 调试

#### iOS USB 调试原理

  


iOS 和 Mac 之间进行 USB 通信，采用的是 USB 协议称之为 `usbmux` ，其本身是私有协议，用于自身应用使用，但是都被破解得差不多了...

  


`usbmuxd` 是 usbmux 协议的实现，是一个守护进程，随 iOS 设备和 Mac 设备的系统启动而启动，当 iOS 设备连接上 Mac ，之间的 usb 通信将通过 usbmuxd 这个中间服务进行

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/683f478ff7d64336aa42b228d7bc60d0~tplv-k3u1fbpfcp-zoom-1.image)

  


于是如果我们知道了 Web 远程调试对应的 USB 协议，那么就可以取代 Safari Inspector ，实现自己的调试终端。

> 相关的调试协议可以通过这个仓库找到 [GitHub - google/ios-webkit-debug-proxy: A DevTools proxy (Chrome Remote Debugging Protocol) for iOS ](https://github.com/google/ios-webkit-debug-proxy)，感兴趣的自行查阅

  


  


#### iOS 绕过 USB

  


同 Android ，要想取消 USB ，我们也需要启动了一个 websocket 来做指令中转。

  


要做指令中转，我们首先需要**找到远程调试服务的端口**。那么问题来了：iOS 的远程调试服务端口是多少？

不像 Android 的调试端口是固定的，iOS 设备的内部服务是启动时动态注册的。

  


对于这个问题，iOS 提供了一种类似「门卫」的解决方案：内部运行一个守护进程（lockdown），运行在固定端口（**62078**），支持系统服务访问能力。


![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fbda57a05c994f4081465f007166bd37~tplv-k3u1fbpfcp-watermark.image?)

于是可以先通过该服务找到 Web 调试服务（com.apple.webinspector）的端口，之后的过程和 Android 一样了。

### 方案缺陷

首先是使用成本，本地需要另外启动一个 socket server 服务。


那么把 socket server 服务部署在线上呢？的确可以降低用户的使用成本，比如我司的调试基建方案。


但是相应的，网络链路变长了，**容易出现时延问题**，如果是居家办公不在同一个办公网的话就更严重了。。

# 方案对比

打分规则：

-   不支持为 ❌

<!---->

-   支持，结合可用性和易用性打分，1~3 颗 ⭐


![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/bedbb149320d41028254d29f8118b55b~tplv-k3u1fbpfcp-watermark.image?)
> 点击放大查看~

# 最佳实践

1.  如果需要远程调试其他用户的页面

| **页面类型**                | **最佳方案**                                                                                                                                                                                                                                                   |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 公司内测 App web 页面        |   推动公司基建部门建设 「**WIFI 调试**」方案，否则使用「**其他 web 页面**」方案                                                                                                                                                                    |
| 公司线上 App web 页面        | 若需要**完整**的调试能力，下载对应版本 app 的内测包，然后同「**公司内测 App web 页面**」-   若仅仅是简单调试 console，同 「**其他 web 页面**」                                                                                                                                                                 |
| 其他 web 页面（如微信页、浏览器 Web） | 自行搭建 [chii](https://github.com/liriliri/chii) ；如果仅查看输出，直接用 [vConsole](https://github.com/Tencent/vConsole) 、 [eruda](https://github.com/liriliri/eruda) |

2.  如果是本地调试自己的手机页面

| **页面类型**         | **最佳方案**                                                                                                                                                                                                                                                              |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 公司内测 App web 页面        |   推动公司基建部门建设 「**WIFI 调试**」方案，否则使用「**其他 web 页面**」方案                                                                                                                                                                    |
| 公司线上 App web 页面        | 若需要**完整**的调试能力，下载对应版本 app 的内测包，然后同「**公司内测 App web 页面**」-   若仅仅是简单调试 console，同 「**其他 web 页面**」  
| 原生浏览器页面          | 打开手机调试设置，连接 USB 调试页面。如果不想用 Safari 调试 iOS 页面，需要自行部署 [ios-webkit-debug-proxy](https://github.com/google/ios-webkit-debug-proxy)    |
| 其他 App 页面        | 如果仅查看输出，直接用 [vConsole](https://github.com/Tencent/vConsole) 、 [eruda](https://github.com/liriliri/eruda) 页面内调试；否则可用采用「**前端模拟 CDP 远程调试**」方案：[chii](https://github.com/liriliri/chii)

# 未来畅想

上面讲了这么多，我们会发现调试方案非常的零碎，或者落地成本较高

  


我们希望未来的远程调试是这样的

| | |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **统一的调试协议**                | CDP                                                                                                                         |
| **统一的调试终端**                | Chrome Devtools                                                                                                             |
| **统一的调试地址配置**              | 允许手机配置本地调试的 Socket Server 地址，开启开发者模式后，所有浏览器 Web 页和内测 App Web 页将自动连上该 Socket Server ，PC 调试工具再与该 Server 通信（参考 Opera ，兼顾安全和效率） |
| **复用 Chrome Extension 能力** | 支持 React Devtools、Vue Devtools 等                                                                                            |
| **高效、安全、稳定的通信通道**          | 自动选择最优，通道包括 wifi、蓝牙、usb                                                                                                     |

第三点需要操作系统支持，其他的属于上层方案，总是可以实现。

未来可期~

# 参考资料

[usbmux协议分析 - Lazy Eval](https://zyqhi.github.io/2019/08/20/usbmuxd-protocol.html)

[揭秘浏览器远程调试技术](https://fed.taobao.org/blog/taofed/do71ct/chrome-remote-debugging-technics/)

[Webkit远程调试协议实战](https://fed.taobao.org/blog/taofed/do71ct/webkit-remote-debug-action/) [Webkit 远程调试协议初探](https://fed.taobao.org/blog/taofed/do71ct/webkit-remote-debug-test/)

[干货｜一定要知道的抖音小程序/小游戏调试原理！](https://zhuanlan.zhihu.com/p/382341601)

[iOS自动化测试驱动工具探索 - 掘金](https://juejin.cn/post/7070124427882528798)

[Web应用调试：现在是Weinre和JSConsole，最终会是WebKit的远程调试协议_Java_Werner Schuster_InfoQ精选文章](https://www.infoq.cn/article/2011/08/mobile-web-debugging)

[在越狱设备调试任意 iOS App 的 WebView - 字节时代](https://byteage.com/1.html)

[wap是什么渠道的简称（wap的另一层意思）](https://www.wwshidai.com/11051.html)

[跨终端Web之Hybrid App_移动_徐凯_InfoQ精选文章](https://www.infoq.cn/article/hybrid-app)
