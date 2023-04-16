---
title: 浅谈DOM DIFF
date: 2022-05-06 20:40:35
permalink: /pages/bd467e/
categories: 
  - 大前端
  - 应用框架
  - UI 框架
tags: 
  - 
titleTag: 草稿
---
## 前置说明

- 操作 dom 的成本比纯计算的成本高很多

## 传统 diff 算法为什么是 O(n^3)


字符串最短编辑距离的计算是 O(n^2) 时间复杂度；采用动态规划，详细可看这个题：https://leetcode-cn.com/problems/edit-distance/

而树的 diff ，也定义了三种操作

增加：增加节点
修改：修改节点值
删除：删除节点，若节点存在子节点，？

```
  a             c
 / \    =>     / \
b   c         d   b
```

## vue2 的 diff 策略

新旧的前后节点共四个，看是否相等，相等则移动指针，按需移动节点

都不存在相同的，利用预先计算好的索引，快速获知新节点在旧节点的位置。采用原生的增（appendChild）删（removeChild）移（insertBefore）对 dom 进行操作



## vue3 的 diff 策略

```
a b c d e
=>
a c e b d

```

### 最长递增子串优化

减少移动次数





