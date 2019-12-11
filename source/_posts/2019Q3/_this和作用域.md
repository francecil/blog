## 前言

js的特殊性，和其他语言在 this 上有些区别，作为一个从java转过来的前端，有必要补补这些基础知识

关于 this 的文章，网上也有很多，比如

1. [MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/this)

本文仅记录一些犯过的错误

## this

## 作用域

```js
var a = 1;
(function a(){
  a=2
  console.log(a)
})()
```