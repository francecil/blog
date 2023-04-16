---
title: 浅谈 Web 动画
date: 2020-02-05 14:10:47
categories: 大前端
tags: 
  - 动画
  - 前端基础
permalink: /pages/746d52/
titleTag: 草稿
---

## 前言

CSS 动画和 JS 动画的区别是什么？

动效设置的经验法则有哪些？

如何提高动画性能？

在阅读过谷歌开发者文档中 [Animations](https://developers.google.com/web/fundamentals/design-and-ux/animations?hl=zh-cn) 一系列文章后，找到了答案

<!-- more -->

## CSS vs JavaScript 

css 变化，css 过渡, css 动画，js 动画

我们常说的 JS 动画指的是什么？



核心区别是什么？由什么线程去控制元素状态变更



Web ainmations api 是通过主线程去控制状态还是？

我们这里讨论的是动画本身，通过 js 去控制状态，但动画本身由 css 控制，那也是属于 css 动画。比如
```html
<style>
  .box {
    transform: translate(0, 0);
    transition: transform 500ms;
  }
  .box.move {
    transform: translate(100px, 100px);
  }
</style>
<script>
  box.classList.add('move')
</script>
```

[在线demo](https://googlesamples.github.io/web-fundamentals/fundamentals/design-and-ux/animations/box-move-simple.html)


css3 增加了 animations 和 

css 动画关键帧之间的加速度采用 animation-timing-function 属性

这样都是统一的，那如果有不同帧加速度的需求呢？

### 实现平抛动画

css2 的变换动画如何实现？

### 纯 css 也可以实现动画播放暂停

所以这不是 js vs css 之间的区别

js 用的 web animations api 实现

css 用 `animation-play-state: paused, running, running;` 实现

## 动画效果的经验法则

### 视图切换添加动画

以列表页到详情页为例

图

如果是大屏设备考虑列表页右置，增加变更详情页的动画

### 选择合适的缓动(Easing)

一般选择缓出(ease-out)
> 快速响应，缓慢

其他的如弹性缓动仅适合特定项目

缓动效果应该设置一个对应的时间

缓出

缓入

弹

对应的图和推荐时长

### 使用不对称的动画定时来增加个性和对比效果

遵循的原则是：始终快速响应用户交互

根据点击主体来判断


100 300

点击指的是直观直觉的操作，如果再测试代码运算啥的就不属于点击

比如点击关闭按钮的动画属于点击，点击提交出现的弹框属于代码

以模态框为例

![dont-press.gif](https://upload-images.jianshu.io/upload_images/9277731-d947ca20637ea577.gif?imageMogr2/auto-orient/strip)

当用户关闭模态视图时，应迅速将其清除。但是，应让模态视图以较慢的速度进入屏幕，以防使用户感到突然。

## 提高动画性能

### will-change 作用与原理

将应用该属性的元素单独提取为一个合成层，提到合成层有什么优缺点呢？

减少绘制区域，该层单独绘制，不造成其他元素的绘制

> 定期重绘的或通过变形在屏幕上移动的元素，可以在不影响其他元素的情况下进行处理

在一开始，会告诉浏览器提前创建合成器层

但是创建层需要额外的内存和管理，每层的纹理都需要上传到GPU

请勿在不分析的情况下提升元素。

怎么分析优化效果？

###
线程处理各种擅长的事

减少合成器线程加载新位图的情况

某些操作看是否能够由 变换，透明度，过滤器代替

## 实例分析

观察 antd 控件的动画源码

## 拓展阅读

http://zencode.in/18.CSS-animation%E5%92%8Ctransition%E7%9A%84%E6%80%A7%E8%83%BD%E6%8E%A2%E7%A9%B6.html

[JavaScript 动画](https://zh.javascript.info/js-animation)