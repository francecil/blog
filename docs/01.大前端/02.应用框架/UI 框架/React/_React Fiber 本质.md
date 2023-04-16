---
title: React Fiber 本质
date: 2022-08-23 15:42:37
permalink: /pages/09e85d/
categories: 
  - 大前端
  - 应用框架
  - UI 框架
  - React
tags: 
  - 
titleTag: 草稿
---


什么场景

单线程

# 讲个故事

常态化核酸




- DOM：每个人
- DOM 属性：每个人的特征
- 移动：走动
- 新增：出生
- 移除：死亡

- V-DOM：电子信息

更改 dom => 上门验核酸

引入 vdom => 查到哪些人

每一帧渲染 => 每一天统计核酸结果

如果核酸查的比较久，可能就会超过一天，即出现卡顿，工作人员也难受

vdom 比对


任务挂起、恢复、终止


做核酸到 9点，
从上往下

# React Fiber 

递归渲染 vdom，增删改 dom 就行。

setState 会渲染整个 vdom，而一个应用的所有 vdom 可能是很庞大的，计算量就可能很大。

优化的目标是打断计算，分多次进行，但现在递归的渲染是不能打断的，有两个方面的原因导致的：

- 渲染的时候直接就操作了 dom 了，这时候打断了，那已经更新到 dom 的那部分怎么办？
- 现在是直接渲染的 vdom，而 vdom 里只有 children 的信息，如果打断了，怎么找到它的父节点呢？

# 和 concurrent 的关系

修改了 vdom ，一定要立即响应么？

react Fiber 一定会立即响应么？

fiber 必定会响应每一次