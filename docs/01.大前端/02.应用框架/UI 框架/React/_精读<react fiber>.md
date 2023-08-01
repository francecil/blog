---
title: 精读<react fiber>
date: 2021-09-21 21:02:37
permalink: /pages/ce01d6/
categories: 
  - 大前端
  - 应用框架
  - UI 框架
  - React
tags: 
  - 精读
titleTag: 草稿
---
中断的执行单元? 不是单元内暂停，而是已经执行完了，准备执行下一个执行单元时中断。

每个虚拟dom是一个fiber单元，构成链表

fiber 遍历，为啥采用迭代代替递归？
需从头恢复，不能随意中断

componentWillMount 这些方法为什么不能用？
如果执行了副作用，会调用多次，

setState 执行 fiber 链后，

高优任务，放弃原链。

## 两个阶段



## 简单说明

协调(diff,非连续)，提交

## 总结

1. 双缓冲机制：2 个 Fiber 树，其中一个为 WIP ，用于处理进行中的 DIFF，并保持和原始 Fiber 树的差异。后续提交阶段直接应用差异更新真实 DOM
2. 中断和恢复：待研究。。