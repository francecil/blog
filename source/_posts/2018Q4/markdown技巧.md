---
title: markdown技巧
date: 2018-10-16 12:18:32
categories: 随笔
tags:
  - markdown
---

## 1. 文本删除线效果

在需要删除线效果的单行文本两侧加`~~`，例如

<!--more-->

```
~~test~~
```
效果如下：

~~test~~

但对于多行文本，使用

~~test1

test2~~


我们发现没有效果，此时有两种方法，

1. 每行都用`~~`包起来，即
```
~~test1~~

~~test2~~
```
2. 利用html的`<s>`删除线标签
```
<s>test1

test2~~</s>
```
效果如下：

<s>test1

test2</s>

## 2. 区块引用的换行

我们可以在文明前使用`>` 来对文本样式进行特殊的展示，常用于引用、说明、标注，例如
```
> test
```
效果如下：

> test

对于多行文本，使用
```
> test1
> test2
```
效果如下：

> test1
> test2

我们发现 test1 test2处于同一行，解决方法有两种
1. 加入空的`>`行
```
> test1
>
> test2
```
效果如下,会多一个空行：

> test1
>
> test2

2. 行末加入`\`
```
> test1\
> test2
```
效果如下：
> test1\
> test2

ps: 有些md解析器没有效果

## 3. 点击展开效果

```
<details>
<summary>title</summary>
content
</details>
```
效果如下:

<details>
<summary>点击展开</summary>
我是内容详情
</details>

## 4. 页内跳转

1. 先定义一个锚

```html
<span id="anchor"></span>
```

2. 使用链接跳转语法

```
[点击跳转](#anchor)
or
<a href="#anchor">点击跳转</a>
```

**注意：**

使用 `#` 语法定义的各级标题，若标题为纯文本（没有使用md样式）且不带空格，该标题就是一个锚

```
## 前言

## **内容** 1


// 有效
[点击跳转](#前言)
// 无效
[点击跳转](#**内容** 1)
```