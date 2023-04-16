---
title: echarts实现title与grid之间固定间距设置
date: 2019-08-05 14:19:37
permalink: /pages/310bcb/
categories: 
  - 大前端
  - 专业领域
  - 可视化
  - 图表
  - Echarts
tags: 
  - 
titleTag: 草稿
---
## 前言

今天在使用某平台图表控件可视化配置时，看到有个参数是：标题与绘图区距离

echarts中 title和grid的定位都是绝对定位的，如果要 设置 title 和 grid 间的距离，无非就是将 grid.top 设置为 title.top + 标题高度+ 两者间距

测试了一下，默认 grid.top 为60 y坐标轴文字为 60做了矩阵变换，所以top会略低于60

## 实践

关键在于标题高度，其他的都是配置项

标题高度与 lineHeight 无关。那要怎么取呢，

不太准确的一个取法
```js
grid = {
  top: title.font.size + 两者间距 + 12
}
```

发现还是有问题，最后不采用 title 字段，对 echarts 组件进行封装， title 提取到同级
```html
<div>
  <Title />
  <Echarts/>
</div>
```