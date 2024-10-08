---
title: 喝酒没骰子？手摸手教你实现基于 WebGL 的掷骰子游戏
date: 2020/03/11 11:00:00
categories: 
  - 大前端
  - 专业领域
  - 动效渲染
  - WebGL
tags: 
  - WebGL
permalink: /pages/586637/
titleTag: 草稿
---

## 前言

逢年过节，和老家的小伙伴们出去喝酒，老是被问做什么行业的。

修电脑的？做网站的？不如扔出这个掷骰子前端小游戏吧~

注意：本文不是一个 WebGL 科普向教程，需要你对着色器工作原理有大概的了解。
> 不了解的话可以先看下这篇文章 [WebGL 理论基础](https://webglfundamentals.org/webgl/lessons/zh_cn/webgl-fundamentals.html) or [WebGL 初探](https://francecil.github.io/2020/03/05/WebGL/WebGL%20%E5%88%9D%E6%8E%A2/)

本文将按以下的顺序讲解

- 项目组织与初始化
- 绘制 3d 骰子
- 利用矩阵实现投影、视图、变换
- 平滑骰子边缘
- 增加光影效果
- 绘制多个骰子
- 增加自由落体和碰撞动画效果
- 增加房间和pk功能
- 使用陀螺仪获取摇骰子效果

希望通过这个项目，让 WebGL 初学者加深对三维、纹理、光照、动画、场景的理解


最终效果如下

![]()

源码地址：

在线体验地址：

<!--more-->

## 项目组织与初始化

首先是 html 内容
```html
```

点击 button 将开始投掷骰子，具体在后面动画效果一节会讲到

在其中引入了一些工具类，用于提取公共处理代码

```yml
- mat #ss
- util #ss
```

最后引入一个执行脚本，通过切换该文件路径，对应不同执行阶段得到不同效果
> 这里不采用版本控制的原因主要有两点：1. 整个项目仅是 webgl-examples 项目的某个模块；2. 减少阅读者分支切换查看代码带来的时间损耗

## 绘制 3d 骰子

其实就是一个绘制一个立方体，并利用纹理绘制每一面的点数

这里我们需要创建一个骰子类，记录每一面对应的点数

代码如下

```js
```

效果


我们只能看到背面，下面我们将利用矩阵变换得到更好的视觉效果

## 利用矩阵实现投影、视图、变换