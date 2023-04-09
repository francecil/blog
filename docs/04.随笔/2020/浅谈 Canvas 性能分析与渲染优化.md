---
title: 浅谈 Canvas 性能分析与渲染优化
date: 2020/03/16 10:00:00
tags: 
  - Canvas
permalink: /pages/878e10/
categories: 
  - 随笔
---

# 前言

接上文 [面试官问：什么是 canvas 污染](https://juejin.im/post/5e64f811e51d4526e807fefa)

本文仅讨论 Canvas 2D

<!--more-->

网上这类的文章已经很多了，本文仅仅是一个记录与总结。

推荐文末的拓展阅读

# 性能分析

[Canvas 规范](https://html.spec.whatwg.org/multipage/canvas.html#the-canvas-element)

渲染也是在 UI Render 中进行

context 是一个状态栈

状态包括

- 当前应用的变形
- strokeStyle, fillStyle, globalAlpha, lineWidth, lineCap, lineJoin, miterLimit, shadowOffsetX, shadowOffsetY, shadowBlur, shadowColor, globalCompositeOperation 的值
- 当前的裁切路径（clipping path）

# 优化策略

## 分层绘制

单一清除策略，适合同层物体矩形框不重叠的情况

如果同层2个物体重叠，上一策略在清除时会清掉另一物体的部分像素。

此时应该判断两者是否重叠，若重叠两者合并得到一个脏矩形，清空脏矩形，并重绘两个物体

更具体的细节可以查看 [利用分层优化 HTML5 画布渲染](https://www.ibm.com/developerworks/cn/web/wa-canvashtml5layering/index.html)

## 通过计算避免无效绘制

通过计算判断所绘制元素可见与否，是否需要绘制

计算性能与渲染性能的平衡

## 离屏绘制

将常用图像绘制在另一个 canvas 中

```js
// 在离屏 canvas 上绘制
var canvasOffscreen = document.createElement('canvas');
canvasOffscreen.width = dw;
canvasOffscreen.height = dh;
canvasOffscreen.getContext('2d').drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);

// 在绘制每一帧的时候，绘制这个图形
context.drawImage(canvasOffscreen, x, y);
```
> 摘自 《Canvas 最佳实践（性能篇）》

还可以借助 worker 进行优化
```js
// main.js
const offscreenCanvas = document.getElementById("c").transferControlToOffscreen();
worker.postMessage(offscreenCanvas, [offscreenCanvas]);


// worker.js 
let ctx, pos = 0;
function draw(dt) {
  ctx.clearRect(0, 0, 100, 100);
  ctx.fillRect(pos, 0, 10, 10);
  pos += 10 * dt;
  requestAnimationFrame(draw);
}

self.onmessage = function(ev) {
  const transferredCanvas = ev.data;
  ctx = transferredCanvas.getContext("2d");
  draw();
};
```

> 引自 https://html.spec.whatwg.org/multipage/imagebitmap-and-animations.html#animation-frames

## 合理使用 API

减少耗时 api 的使用

减少改变 context 的状态

避免非法赋值


## 可交互画布

### 判断点的位置

`ctx.isPointInPath`

使用 isPointinPath 方法检查某点是否在当前路径 path (Path2D) 内

但很多情况下我们没有保存这个 path ，此时自己采用射线法计算判断

### 获取点击区域

addHitRegion

有兼容性问题， Safari 等不支持

### 避免使用 canvas 实现文本编辑控件

这个不用说了， canvas 难以实现

参照 [Best practices](https://html.spec.whatwg.org/multipage/canvas.html#best-practices)

# 总结

1. 将渲染开销转嫁到计算开销
2. 利用分层渲染复杂场景
3. 固定内容采用离屏渲染
4. 合理使用 API 并管理状态


# 拓展阅读


- [利用分层优化 HTML5 画布渲染](https://www.ibm.com/developerworks/cn/web/wa-canvashtml5layering/index.html)
- [Canvas 最佳实践（性能篇）](https://fed.taobao.org/blog/taofed/do71ct/canvas-performance/)
- [canvas的优化](https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas)