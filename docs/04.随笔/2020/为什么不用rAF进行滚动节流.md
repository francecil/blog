---
title: 为什么不用rAF进行滚动节流
date: 2020-01-07 11:12:40
tags: 
  - 长列表
permalink: /pages/e52f03/
categories: 
  - 随笔
---

## 前言

之前写了一篇长列表实现的分享 -- [「前端长列表」开源库解析及最佳实践](https://juejin.im/post/5dea86f7f265da33a8758820)

然后面试被问到的最多的问题就是：有没有做节流

当时的回答是没有，但是又说不出一个系统的回答

本文就来说说为什么长列表不需要做节流，以及什么情况下滚动需要做节流


<!-- more -->

## 背景知识之事件循环

详见[HTML规范](https://html.spec.whatwg.org/multipage/webappapis.html#event-loops)

这里只挑与本文相关的讲

在事件循环中定义了很多任务源，比如鼠标键盘等输入操作的用户交互任务源

一次点击操作，其实包含多个输入操作（mousedown,mouseup,click），都添加到相同的任务源队列中，进而产生多轮的事件循环，其表现就是执行相关元素的事件回调（宏任务）

宏任务执行后，后面就是微任务队列和更新渲染阶段

每轮事件循环可能是非常快的，每秒执行事件循环的次数可能大于60次

受硬件刷新率影响，我们只要保证 fps 达到最大硬件刷新率(比如60)即可，因此不需要每轮事件循环都更新渲染

## 输入事件与滚动事件的执行时机

对于输入事件，其执行时机为每轮事件循环的任务执行阶段，这个事件是不受刷新率影响的，每秒的执行次数可能多于60次

为什么谈这个呢，因为这个与滚动事件(scroll)回调的执行时机不一致

按照 HTML 规范，滚动事件回调在 UI Render 阶段的某个步骤中进行，而不是单独的一个任务源

也就是说，滚动事件回调受渲染时机影响，仅执行更新渲染时才执行该回调。

换句话说，该事件自带节流。

举个例子验证下输入事件和更新渲染的执行时机
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

说明更新渲染有一定的间隔，至少是 1/60 的间隔，而输入任务没有此限制

所以，以下代码是没有效果的，因为该回调已经自带节流了

```js
document.addEventListener("scroll",function(e){
  requestAnimationFrame(function(t){
    //执行scroll具体逻辑
  })
})
```

## 什么时候滚动需要做节流

利用节流可以减少回调的执行次数，使得固定时间周期内只执行一次

刚才提到，滚动事件自带节流，节流的时间周期是与渲染时机相关

判断是否需要额外的节流的关键是：当前的节流规则，是否大部分回调的执行都能让用户受益

如果是动画效果，实时绘制的界面等，则不需要额外的节流了。

以长列表为例，每次执行滚动回调，会计算新的渲染列表项及滚动偏移位置。如果应用更大时间周期的节流，会出现某一帧出现滚动但界面没有更新的情况，让用户感觉产生卡顿。

而其他比较复杂的业务逻辑，不能在短时间内得到反馈的，则需要额外进行节流

以滚动懒加载图片为例

由于每秒的滚动回调的执行次数可能达到60次，而每次执行都需要去获取当前处于视区的占位图并发起图片请求

而这大部分回调的执行，用户是不能受益的，所以我们可以提高节流的时间周期，比如 500ms 这样

## 结论

滚动事件已自带节流，只有一些特定的业务逻辑才需要额外进行更高时间周期的节流

## 拓展阅读

1. [scroll events: requestAnimationFrame VS requestIdleCallback VS passive event listeners](https://stackoverflow.com/questions/41740082/scroll-events-requestanimationframe-vs-requestidlecallback-vs-passive-event-lis)