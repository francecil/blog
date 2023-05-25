---
title: 深入 Immutable 原理
date: 2020/03/16 15:00:00
tags: 
  - 随笔
  - 精读
permalink: /pages/651653/
sidebar: auto
categories: 
  - 随笔
  - 2020
---

## 前言

推荐文章。。[深入探究immutable.js的实现机制（二）](https://juejin.im/post/5ba4a6b75188255ca1537b19)

写的很明白了，本文简单做个记录

<!--more-->

## 基本数据结构

### [Trie](https://en.wikipedia.org/wiki/Trie)

前缀树，又称字典树

可以共用节点

### Vector trie

Trie 没有修改能力，引入 Vector Head 进行结构共享

![](https://user-gold-cdn.xitu.io/2018/9/14/165d635ebb85e04d?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

每次修改操作的时候， 我们复制从根到叶子节点的路径而不是直接修改它们，这样从两个根我们就可以访问到对数据不同时刻的两个快照。

![](https://pic4.zhimg.com/v2-2b4c801a7b40eefcd4ee6767fb984fdf_b.webp)

### [Hash array mapped trie](https://en.wikipedia.org/wiki/Hash_array_mapped_trie)

取 2^5 作为树宽。 更新和查询的考量

Vector trie 会出现空值，将占用空间，我们需要采用新的数据机构

#### 1. 压缩树宽

4 bit 的 mask 子节点长度为4

例 mask 1001 ,表示 01 11 有值

利用 mask 进行位运算 [Hamming weight](https://en.wikipedia.org/wiki/Hamming_weight)
> n 表示第几个前缀 ， 统计 mask 上从最低位 至第 n 位 1 出现的次数，即前缀在压缩数组中的索引

不采用高位还有一个原因是 mask 的位数不固定

增加属性的话，会调整数组的节点顺序，并重新计算 mask （或操作）

#### 2. 压缩树高

单链的话，去除中间节点。

如果新增节点，需要增加中间节点，其实就是还原之前被去除的中间节点

最终保持单链只有一级即可

#### 3. trie 优化


记录当前 trie 的高度

针对 List push 的优化 -- tail 节点

## 要点




### hash 冲突

保持在一个线性数组中，由于冲突概率不高，不再引入复杂的数据结构

### 为何比 Object.assign 好

后者还会再次做个引用连接，对于大数据对象，引用连接也是有耗时的

如果是基本类型，还会重新赋值，也有耗时

而 immutable 也会对未变动节点做引用链接，但是由于设置了 32 的宽度，可以减少很多引用

## 展望

### 利用 proxy 重写 immutable

在看过 seamless-immutable 的用法，是否可以用 Proxy 让用法更接近原生？

多个属性赋值的话可以先开启某个标记

## 拓展阅读

1. [Immutable 结构共享是如何实现的？](https://github.com/dt-fe/weekly/issues/14)
2. [精读 Immutable 结构共享](https://zhuanlan.zhihu.com/p/27133830)
3. [Functional Go: 持久化数据结构简介](https://io-meter.com/2016/09/03/Functional-Go-persist-datastructure-intro/)
4. [Immutable.js, persistent data structures and structural sharing](https://medium.com/@dtinth/immutable-js-persistent-data-structures-and-structural-sharing-6d163fbd73d2)
5. [PPT: A deep dive into Clojure's data structures - EuroClojure 2015](https://www.slideshare.net/mohitthatte/a-deep-dive-into-clojures-data-structures-euroclojure-2015)
6. [Immutable 详解及 React 中实践](https://zhuanlan.zhihu.com/p/20295971)
7. [Introduction to HAMT](https://idea.popcount.org/2012-07-25-introduction-to-hamt/)
8. 【荐】[深入探究immutable.js的实现机制（二）](https://juejin.im/post/5ba4a6b75188255ca1537b19)