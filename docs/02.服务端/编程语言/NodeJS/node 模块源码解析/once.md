---
title: once
date: 2018-02-24 15:55:46
permalink: /pages/2426fe/
article: false
categories:
  - 服务端
  - 编程语言
  - NodeJS
  - node 模块源码解析
tags:
  - 

---
## 介绍

传入一个函数，返回一个包装过的函数，多次运行该函数只生效第一次

## 使用

npm i once

```js
let once = require('once')
let onc = once(()=>console.log(111))
onc()
onc()

//只打印一次111

```

## 源码

用一个闭包解决

```js
function once (fn) {
  var f = function () {
    if (f.called) return f.value
    f.called = true
    return f.value = fn.apply(this, arguments)
  }
  f.called = false
  return f
}
```