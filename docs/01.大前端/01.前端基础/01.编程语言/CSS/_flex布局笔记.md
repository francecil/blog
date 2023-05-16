---
title: flex布局笔记
date: 2018-05-16 20:25:31
permalink: /pages/382218/
categories: 
  - 大前端
  - 前端基础
  - 编程语言
  - CSS
tags: 
  - 
titleTag: 草稿
---
flex 容器布局:
flex-flow:[flex-direction] [flex-wrap]
justify-content:左右居中两端：水平对齐
align-items:垂直方向上对齐
align-content:多行整体对齐方式

flex 项元素布局：
order
flex:[flex-grow(0)] [flex-shrink(1)] [flex-basis]

相对flex:flex-basis=auto 将基于内容大小分配宽度，并随窗口大小进行伸展
绝对flex:设置flex-basis具体值，将其值设置最小宽度，并根据flex属性伸展，不基于内容
在flex项上使用margin(left/right/both): auto，会占据左/右/两者所有剩余空间 。多项一起使用的话均分剩余空间

每个作用于横向轴（即Main-Axis）上的 flex 属性，现在都会作用于纵向上的新Main-Axis。它只是在方向上的一个切换。