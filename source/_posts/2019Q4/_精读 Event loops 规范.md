
## 前言

以前回答别人浏览器中 Event loops 过程的问题时，只懂得说：

1. 执行一次宏任务；
2. 执行并清空微任务队列 
3. 回到1

这样说也不算错，直到有一天有人问我， `UI Render` 属于什么任务，执行时机是什么？这属实把我整蒙圈了，于是就有了本文

本文主要从以下几点入手

- 查找规范
- 背景知识
- 规范的内容和注意事项
- Q&A




## 查找规范

ECMAScript 中没有定义 Event loops ，根据我的另外一篇文章 <a href="./通读 HTML Standard.md">通读 HTML Standard</a> ，得知其定义在 [HTML 规范]((https://html.spec.whatwg.org/#event-loops))中，由 WHATWG 维护




## 背景知识


### JavaScript Engine, JavaScript Runtime, Rendering Engine

先理清几个概念。

- JavaScript 执行引擎([JavaScript Engine](https://en.wikipedia.org/wiki/JavaScript_engine))：将 js 脚本转换为可运行的机器代码指令，**实现 ECMAScript 标准**。常见的执行引擎有 chrome 的 v8 ，Firefox 的 SpiderMonkey 等等。不限于在浏览器中使用，如 Node.js 的 JavaScript 执行引擎也是用的 v8 。

- JavaScript 运行时环境(JavaScript Runtime)： 为 JavaScript 引擎的执行提供一个运行环境，包括解释编译，内存管理，事件循环，使用程序库（如 Web API）等等。JavaScript 引擎的实现完全独立于运行时环境，因此其可以运行于不同的环境，这些运行时环境由宿主程序提供，如浏览器，Node.js，所以有浏览器运行时环境、 Node.js 运行时环境等等。下面用一张图来展示浏览器运行时环境

  ![](https://upload-images.jianshu.io/upload_images/9277731-471a9f26730e58b3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
  
- 渲染引擎(Rendering Engine)： 用于渲染网页内容，通过共享的 DOM 数据结构与 JavaScript 执行引擎协同工作。常见的有 chrome 的 Blink, Firefox 的 Gecko, Safari 的 WebKit 。渲染引擎还可用于除 Web 浏览器外的应用程序，如电子邮件客户端。

- 浏览器内核：倾向于只指渲染引擎。

- 浏览器：包括用户界面、渲染引擎、网络、数据存储、用户界面后端（如 alert）、浏览器引擎（传递用户指令给渲染引擎）、等。好像有点旧？
  
  ![](https://upload-images.jianshu.io/upload_images/9277731-5d22cf02cc1b0d4d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

为什么有的浏览器支持新语法，有的不支持？因为它们的执行引擎不同，并且同种浏览器的不同版本用的执行引擎版本也就不同，比如新版的 chrome 能用 es 新语法而旧版不行

为什么不同浏览器渲染出来的页面样式可能不一样或者它们支持的 css 程度不一样？因为它们的渲染引擎不同

为什么 Node.js 上调用不了 DOM 的 API？因为该 API 由浏览器运行时环境提供，而 Node.js 运行时环境中没有该 API ，类似的也没有 localStorage 等 api

为什么不同浏览器支持的音视频编解码不一样？也是渲染引擎不同的原因。 
> chrome 的 video 标签会经 Blink 创建 WebMediaPlayer 实例，该 player 将 buffer 传给 FFmpeg 进行解码，然后将解码后数据丢给渲染器对象进行渲染，最后让 video 标签进行播放显示\
> 参考自 [从Chrome源码看audio/video流媒体实现](https://www.yinchengli.com/2018/07/08/chrome-media-stream/)

浏览器运行时， html 规范， event loop

### 调用栈

JavaScript 是单线程的，意味着它只有一个调用栈，同一时间只能执行一个任务。

调用栈也叫执行上下文栈（Execution Context Stack），当调用一个函数时就会产生一个新的执行上下文，并将该执行上下文入栈

![](https://camo.githubusercontent.com/5b52d8937591413cc2dc2f4d25526a061d9c7dc3/687474703a2f2f70302e7168696d672e636f6d2f743031653835386332363934333864363935612e6a7067)

如图，全局上下文最先入栈

JavaScript 执行引擎只会一直执行栈顶的函数，它根本不知道什么是 microTask ， event loop 丢给它什么他就执行什么

## 规范

接下来，我们将对 Event loops 规范进行解读，本文的引用部分，均翻译自规范。

[规范原文地址](https://html.spec.whatwg.org/multipage/webappapis.html#event-loops)

*题外话：* 发现 whatwg 有个[中文站](https://whatwg-cn.github.io/) ，前面的基础部分可以对照着看，其他的翻译不及时且较为生硬建议看原文

### 定义



### 任务队列

### 处理模型

### 通用任务源(Generic task sources)

由用户代理根据某种规则去选择一个 task queues ，从该 task queues 中取出队头 task

### 总结

每个 event loop 有多个任务队列，每轮 event loop 会根据某种规则去选择一个 task queues，从该 task queues 中取出队头 task 进行执行，而后执行 microTask queue ，再进行页面渲染

![](https://upload-images.jianshu.io/upload_images/9277731-ba04dce7fd0153cf.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## Q&A

### IE 的 event loop

ie 整个浏览器只有一个 event loop ，某个页面死循环了会导致其他页面也崩溃？

### 示例1xxx

q:ssss

平时所说的触发回流是在哪进行的,getBoundingClientRect 触发的回流和 UI render 有什么关系么

a:xxx

### UI rendering 属于 task 么

### 渲染是同步还是异步的

### 浏览器渲染时机

刷新频率， 规范没有规定策略，不同浏览数实现不同

### requestAnimationFrame 

在下次重绘之前调用指定的回调函数更新动画

在 UI Render 阶段执行。但是具体在哪轮 event loop 后，由浏览器决定

## 参考文档

1. [Event loops 规范](https://html.spec.whatwg.org/multipage/webappapis.html#event-loops)
2. [Web标准阅读入门之如何使用官网 - 人马座的文章 - 知乎](https://zhuanlan.zhihu.com/p/51275207)
3. [从event loop规范探究javaScript异步及浏览器更新渲染时机](https://github.com/aooy/blog/issues/5)
4. [跟着 Event loop 规范理解浏览器中的异步机制](https://github.com/fi3ework/blog/issues/29)
5. [【朴灵评注】JavaScript 运行机制详解：再谈Event Loop](https://blog.csdn.net/lin_credible/article/details/40143961)


