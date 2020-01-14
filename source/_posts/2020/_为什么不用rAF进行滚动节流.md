---
title: 为什么不用rAF进行滚动节流
date: 2020-01-07 11:12:40
categories: 大前端
tags: 
  - 长列表
---

## 前言

之前写了一篇长列表实现的分享 -- [「前端长列表」开源库解析及最佳实践](https://juejin.im/post/5dea86f7f265da33a8758820)

然后被问到的最多的问题就是：有没有做节流

本文就来说说为什么长列表不需要做节流，以及什么情况下滚动需要做节流

<!-- more -->

## 交互任务源

移动鼠标触发回调，该回调属于交互任务源在事件循环中被执行

在该任务执行过程中，鼠标可以继续滑动，并产生新的交互任务，？？

每次 mousemove ，会将事件回调放入任务队列，这个事件回调是不受刷新率影响的，所以 1s 产生的

举个例子，监听 mousemove 事件，移动鼠标，1s 内回调的次数可能多于60次

这个过程由其他线程处理这个交互事件，并把回调放到交互任务源中

如果是空回调，那么为了保持 60fps ，可能是几次回调执行后才执行 UI Render

可以发现，ui render 的执行间隔在 16ms 左右
```js
document.addEventListener("mousemove",function(){
  let start = performance.now()
  console.log("mousemove:",start)
  requestAnimationFrame(function(t){console.log("ui render:",start,t)})
})
// 结果就是可能输出几轮 mousemove 然后执行一次 ui render -- 清空 rAF 回调队列(输出多次 ui render)
/*
mousemove: 4091.025000088848
ui render: 4091.025000088848 4077.594
mousemove: 4098.845000029542
ui render: 4098.845000029542 4094.278
mousemove: 4110.160000040196
mousemove: 4115.5349999899045
ui render: 4110.160000040196 4110.962
ui render: 4115.5349999899045 4110.962
mousemove: 4123.810000019148
mousemove: 4130.160000058822
ui render: 4123.810000019148 4127.719
ui render: 4130.160000058822 4127.719
*/
```

如果回调中有耗时任务呢？比如 20ms 的耗时

```js
document.addEventListener("mousemove",function(e){
  let start = performance.now()
  console.log("mousemove:",start,e)
  document.body.style.backgroundColor = "red"
  while(performance.now()-start<100){}
  requestAnimationFrame(function(t){console.log("ui render:",start,t)})
})
```

可能会滑动很多次，执行了多次回调后才执行一次 ui render（背景变红）

原因在于宏任务队列还有事件

## 节流

节流就是用来减少回调的执行次数，固定时间周期内只执行一次


如果回调执行耗时为20ms

## requestAnimationFrame

回调是在 UI Render 阶段执行的，不过 UI Render 的执行时机不确定

## 结论

onScroll 回调处理自带节流

## 拓展阅读

1. [scroll events: requestAnimationFrame VS requestIdleCallback VS passive event listeners](https://stackoverflow.com/questions/41740082/scroll-events-requestanimationframe-vs-requestidlecallback-vs-passive-event-lis)