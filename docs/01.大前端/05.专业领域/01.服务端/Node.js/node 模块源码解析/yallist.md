---
title: yallist
date: 2018-02-24 15:55:46
permalink: /pages/2d739a/
titleTag: 专题
tags: 
  - 
categories: 
  - 大前端
  - 专业领域
  - 服务端
  - js
  - node 模块源码解析
---
## 介绍

双向链表

PS:其实es5 Array就可以模拟了。

removeNode 方法可以采用 arr.splice(arr.indexOf(obj),1)

unshiftNode 方法可以采用 arr.splice(arr.indexOf(obj),1);arr.unshift(obj)

PS2:。。当数组足够大时，指针操作比数组操作快。

## 使用

npm install yallist

```javascript
var yallist = require('yallist')
var myList = yallist.create([1, 2, 3])
myList.push('foo')
myList.unshift('bar')
// of course pop() and shift() are there, too
console.log(myList.toArray()) // ['bar', 1, 2, 3, 'foo']
myList.forEach(function (k) {
  // walk the list head to tail
})
myList.forEachReverse(function (k, index, list) {
  // walk the list tail to head
})
var myDoubledList = myList.map(function (k) {
  return k + k
})
// now myDoubledList contains ['barbar', 2, 4, 6, 'foofoo']
// mapReverse is also a thing
var myDoubledListReverse = myList.mapReverse(function (k) {
  return k + k
}) // ['foofoo', 6, 4, 2, 'barbar']

var reduced = myList.reduce(function (set, entry) {
  set += entry
  return set
}, 'start')
console.log(reduced) // 'startfoo123bar'
```

## 源码解析

每个节点Node的数据结构为

```js
{
  value:
  prev:
  next:
  list://指向yallist对象
}

function Node (value, prev, next, list) {
  if (!(this instanceof Node)) {
    return new Node(value, prev, next, list)
  }

  this.list = list
  this.value = value

  if (prev) {
    prev.next = this
    this.prev = prev
  } else {
    this.prev = null
  }

  if (next) {
    next.prev = this
    this.next = next
  } else {
    this.next = null
  }
}
```

链表list维护的数据结构为：
```js
{
  head:
  tail:
  length:
}
//通过访问头指针head和尾指针去操作Node
```

主要就是增删的时候记得指针的指向就好了。