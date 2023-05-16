---
title: 实现 instanceOf
date: 2019-12-31 13:04:10
permalink: /pages/e7241a/
titleTag: 专题
categories: 
  - 大前端
  - 前端基础
  - 编程语言
  - JavaScript
  - JS 手写题
tags: 
  - 
---

## 背景

```js
object instanceof constructor
```
instanceof 运算符用于检测构造函数 constructor 的 prototype 属性是否出现在某个实例对象 object 的原型链上。

不用 instanceof 操作符，模拟实现一个 `myInstanceof (object,constructor)` 方法，得到相同的效果

## 实现

这里就不做类型检测了

核心就是查找 object 的原型链，不断的与 constructor 的原型比对，如果一致则返回 true

```js
function myInstanceof (object, constructor){
  const targetPrototype = constructor.prototype
  while(object){
    object = Object.getPrototypeOf(object); // 相当于 object.__proto__
    if(targetPrototype === object){
      return true
    }
  }
  return false
}
```

注意以下这些情况
```js
"test" instanceof String // false
Number instanceof Object // true
```

`Object.getPrototypeOf('test') === String.prototype` 

但其实是因为对 `'test'` 执行了 `ToObject` 生成了一个临时包装对象 `new String("test")`，导致判断错误

所以当 object 不是纯对象(非 null 对象和方法)时，直接返回 false

而 Number 不止是一个方法，其实是一个 Function 构造函数的实例对象，故

```js
Number.__proto__ === Function.prototype // true
// Function.prototype 输出 ƒ () { [native code] } ，且不会被重写
Object.getOwnPropertyDescriptor(Function,'prototype') // {value: ƒ, writable: false, enumerable: false, configurable: false}
Function.prototype.__proto__ === Object.prototype // true
// so
Number instanceof Object // true
```

```js
function myInstanceof (object, constructor){
  const isESObject = (typeof object === 'object' && object !== null) || typeof object === 'function'
  if(!isESObject){
    return false
  }
  const targetPrototype = constructor.prototype
  while(object){
    object = Object.getPrototypeOf(object); // 相当于 object.__proto__
    if(targetPrototype === object){
      return true
    }
  }
  return false
}
```
测试用例
```js
console.log(myInstanceof({},Object)) // true
console.log(myInstanceof("test",String)) // false
console.log(myInstanceof(Number,Object)) // true
```