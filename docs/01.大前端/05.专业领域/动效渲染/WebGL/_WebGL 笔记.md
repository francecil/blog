---
title: WebGL 笔记
date: 2020-03-11 20:43:59
permalink: /pages/e4246c/
categories: 
  - 大前端
  - 专业领域
  - 动效渲染
  - WebGL
tags: 
  - 
titleTag: 草稿
---
## gl.drawArrays 与 gl.drawElements 区别

传入顶点索引

## gl.STATIC_DRAW、gl.STREAM_DRAW、gl.DYNAMIC_DRAW

## webgl canvas 图片下载时纯黑

## 判断点击的物体

### 读取像素法

片段着色器中增加一个全局变量 flag

当 flag 为 true 时，绘制为某个特殊颜色 c ;否则正常绘制

点击物体时，设置 flag 为 true 

读取点击坐标处的像素颜色，判断是否为 c ，若为 c 说明点中物体

最后对颜色进行还原

此外，配合顶点着色器还可以实现点击在物体的哪一面

## 绘制其他图形

比如圆

gl_PointCoord 

...

