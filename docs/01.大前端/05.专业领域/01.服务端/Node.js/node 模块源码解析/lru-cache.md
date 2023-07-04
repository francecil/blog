---
title: lru-cache
date: 2018-02-24 15:55:46
permalink: /pages/b64fdf/
titleTag: 专题
tags: 
  - 
categories: 
  - 大前端
  - 专业领域
  - 服务端
  - Node.js
  - node 模块源码解析
---
## 介绍

least-recently-used items

最近最少使用策略的缓存框架

1. 新数据插入到链表头部；

2. 每当缓存命中（即缓存数据被访问），则将数据移到链表头部；

3. 当链表满的时候，将链表尾部的数据丢弃。

采用两个数据结构：Map({key,Node(value:Entry{value:value,maxAge:...})}) 和 List （Node->Node->Node）

往cache存入 k,v时，v先包装成Entry,然后再包装成Node存入List,从List头部取到Node和一开始key 一起放入map

## 使用

```javascript
var LRU = require("lru-cache")
  , options = { max: 500
              , length: function (n, key) { return n * 2 + key.length }
              , dispose: function (key, n) { n.close() }
              , maxAge: 1000 * 60 * 60 }
  , cache = LRU(options)
  , otherCache = LRU(50) // sets just the max size

cache.set("key", "value")
cache.get("key") // "value"

// non-string keys ARE fully supported
var someObject = {}
cache.set(someObject, 'a value')
cache.set('[object Object]', 'a different value')
assert.equal(cache.get(someObject), 'a value')

cache.reset()    // empty the cache
```

## 源码

set 方法

```js
LRUCache.prototype.set = function (key, value, maxAge) {
  maxAge = maxAge || this[MAX_AGE]

  var now = maxAge ? Date.now() : 0
  //计算欲存储元素的长度
  var len = this[LENGTH_CALCULATOR](value, key)
  // map中存在该元素
  if (this[CACHE].has(key)) {
    //本次添加元素大小大于MAX
    if (len > this[MAX]) {
      //删除原来map中k-v对和list中存的value对应的元素, 并返回false表示添加失败
      del(this, this[CACHE].get(key))
      return false
    }

    var node = this[CACHE].get(key)
    //拿到Node节点中的Entry元素
    var item = node.value

    // dispose of the old one before overwriting
    // split out into 2 ifs for better coverage tracking
    if (this[DISPOSE]) {
      //设置NO_DISPOSE_ON_SET选项后，仅在清除元素时调用dispose方法，不会在重写原始时进行。
      if (!this[NO_DISPOSE_ON_SET]) {
        //该方法主要是用于 元素从cache中删除时的前置操作，比如存了一个文件描述符就需要进行关闭。
        //该方法是前置删除操作，所以如果想在删除时将元素重新放回去，需要配合使用`nextTick` or `setTimeout` ,否则使用不当可能会栈溢出
        this[DISPOSE](key, item.value)
      }
    }
    //更新Entry元素
    item.now = now
    item.maxAge = maxAge
    item.value = value
    this[LENGTH] += len - item.length
    item.length = len
    // get操作会将对应的Node元素移到list头
    this.get(key)
    //控制cache大小
    trim(this)
    return true
  }
  //构建Entry实例
  var hit = new Entry(key, value, len, now, maxAge)

  // 本次添加元素大小大于MAX
  // 不添加，并返回false表示添加失败
  if (hit.length > this[MAX]) {
    if (this[DISPOSE]) {
      this[DISPOSE](key, value)
    }
    return false
  }

  this[LENGTH] += hit.length
  //list中存入Entry
  this[LRU_LIST].unshift(hit)
  //设置cache 注意cache中存的Node和list中的Node是同一个对象
  this[CACHE].set(key, this[LRU_LIST].head)
  //先存再删
  trim(this)
  return true
}
```

将元素控制在MAX大小内

```js
function trim (self) {
  if (self[LENGTH] > self[MAX]) {
    //从尾部不断向前删除
    for (var walker = self[LRU_LIST].tail;
         self[LENGTH] > self[MAX] && walker !== null;) {
      // We know that we're about to delete this one, and also
      // what the next least recently used key will be, so just
      // go ahead and set it now.
      var prev = walker.prev
      del(self, walker)
      walker = prev
    }
  }
}
```

get 函数

```js
function get (self, key, doUse) {
  var node = self[CACHE].get(key)
  if (node) {
    var hit = node.value
    //判断是否过期
    if (isStale(self, hit)) {
      del(self, node)
      //设置ALLOW_STALE=true参数后 仍会返回元素
      if (!self[ALLOW_STALE]) hit = undefined
    } else {
      //peek函数 doUse为false 不更新node节点位置
      if (doUse) {
        self[LRU_LIST].unshiftNode(node)
      }
    }
    if (hit) hit = hit.value
  }
  return hit
}
```

判断是否过期

```js
function isStale (self, hit) {
  //Entry元素为空 或 Entry和map都没有设置最大超时
  if (!hit || (!hit.maxAge && !self[MAX_AGE])) {
    return false
  }
  var stale = false
  var diff = Date.now() - hit.now
  if (hit.maxAge) {
    stale = diff > hit.maxAge
  } else {
    //都未进行超时时间设置 目前感觉都是返回false
    stale = self[MAX_AGE] && (diff > self[MAX_AGE])
  }
  return stale
}
```