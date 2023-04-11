---
title: vuepress踩坑记录
date: 2023-04-12 02:19:49
permalink: /pages/9e54dd/
article: false
tags: 
  - null
---

# 踩坑记录

## 1. 双大括号中的代码会被编译成模板取值

示例，文档中写了如下的代码引用，会导致 vuepress 解析并报错
```
`{{options}}`
```

## 2. `<details>` 代码块无法正常使用

需要改用 `::: details xxx`

## 3. `<s>` 多行无法正常使用

示例，如下代码将导致文档无法正常解析
```html
<s> 是是

是是</s>
```