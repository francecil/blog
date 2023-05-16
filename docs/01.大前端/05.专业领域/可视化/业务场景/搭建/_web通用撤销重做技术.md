---
title: web通用撤销重做技术
date: 2018-10-07 11:12:40
categories: 大前端
permalink: /pages/f07b5e/
titleTag: 草稿
tags: 
  - 
---

## 前言

撤销重做功能，我们经常在富文本编辑器中用到。正好最近接了一个思维导图组件，里面有用到这个功能，分享一波实现原理。

> PM："不就是按CTRL+Z CTRL+Y的事情吗，还需要开发？"


<!--more-->


## 原理

**操作定义：**

不同的应用场景，撤回重做针对的内容都是不一样的，所有我们要先定义好什么是有效操作。

比如我们进行组件标题的编辑，这个编辑过程可能很久，先输入了`hello`,隔了一会再输入`world`，那这算是几次操作？

> 答案没有固定，这就靠实现的人想怎么做。
>
> 可以说整个标题编辑过程中都属于同一操作，也可以通过debounce策略一定时间没有输入就算是一次操作

一般这些操作，要参考同类产品设计，用户使用习惯等等。

比如组件拖动，有效操作就只有最终拖动的位置，而不记录拖动过程。


**接下来对撤销重做进行定义**

- 用户的每次操作记为P,操作叠加后的状态记为A. 比如：用户分别进行了4次操作，此时状态叠加为A4
  ```
  P1->P2->P3->P4
  A1->A2->A3->A4 
  ```
- 用户在当前状态(A2)进行某个操作后到达新的状态(A3)，可以通过撤销（undo）回到上个操作状态(A2)
  ```
  A1->A2->[A3]->A4 
       ↖__↙
  ```
- 当前状态(A2)是用户由后面状态(A3)通过撤销到达的，那么用户可以通过重做（redo）回到撤销前的状态(A3)
  ```
  A1->[A2]->A3->A4 
        ↘__↗
  ```
- 当前状态(A2)是用户由后面状态(A3)通过撤销到达的，用户进行新的操作后到达新的状态(A5)，原先状态(A2)后面的状态(A3、A4)都要被舍弃，新操作(A5)作为最后一个状态
  ```
  A1->[A2]->A3->A4 
        ↘ A5
  ```

**这些操作状态的保存和还原，有两种实现方式：**

### 1.命令式
记录每次进行的操作，不关心当前的数据状态。

利用两个数组来保存撤销和重做的操作记录，初始均为空。

```js
function CommandHistory(){
  var undoArr = [];
  var redoArr = [];
  //最大撤销次数
  var MAX_HISTORY = 100;
}
```

定义操作记录。每个记录均有正操作和逆操作

每个正操作对应着其逆操作

```js
  var record = {
    do: function(){

    },
    inverse: function(){

    }
  }
```

新操作执行时，运行do方法，并清空redo数组

```js
function CommandHistory(){
  function execute(record){
    record.do()
    undoArr.push(record)
    redoArr=[]
    while(undoArr.length>MAX_HISTORY){
      undoArr.shift()
    }
  }
}
```

撤销重做方法实现如下：
```js
function CommandHistory(){
  function undo(){
    if(undoArr.length===0){
      console.log("nothing undo")
      return false
    }
    var record = undoArr.pop()
    record.inverse()
    redoArr.push(record)
  }
  function redo(){
    if(redoArr.length===0){
      console.log("nothing redo")
      return false
    }
    var record = redoArr.pop()
    record.do()
    undoArr.push(record)
  }
}
```

**命令式的问题**
1. 逆操作有时候难以实现
2. 要将状态S5到达S1需要经过A5,A4,A3,A2等操作的逆操作，无法一步实现


### 2.快照式
记录每次操作后的状态,无需关注具体的操作

利用一个状态记录数组和一个索引实现
```js
function SnapshotHistory(){
  var snapshots=[]
  var cursor=-1
  var MAX_HISTORY = 100
}
```



每次操作后返回数据结果，并以JSON的形式保存到snapshots中
```js
function SnapshotHistory(){
  function execute(record){
    var snapshot = JSON.stringify(record.do())
    // 比如当前索引为3 进行新操作后 就需要把 snapshots 数组中索引>3的数据删掉
    snapshots = snapshots.slice(0,cursor)
    cursor++;
    snapshots.push(snapshot)
    while(snapshots.length>MAX_HISTORY){
      snapshot.shift()
      cursor--;
    }
  }
}
```

撤销重做方法实现如下：
```js
function SnapshotHistory(){
  function undo(){
    return cursor===0?false:snapshots[--cursor]
  }
  function redo(){
    return cursor===snapshots.length-1?false:snapshots[++cursor]
  }
}
```

**快照的问题**
1. 较占内存，每次操作要全量深拷贝，有一定时间消耗
## 相关开源项目
### 百度脑图中的实现
> 源自kityminder-editor的history.js文件，为了利于理解有部分修改
```js
/**
百度脑图撤销重做功能接口
*/
function HistoryRuntime() {
    /**
      minder：脑图编辑器
      .exportJson() :获取当前画板操作状态的json数据
      .applyPatches(diff) : 执行diff数据对应的操作
    */
    var minder = this.minder;
    //最大撤销次数
    var MAX_HISTORY = 100;
    //上一步的状态--操作叠加的最终状态
    var lastSnap;
    // 互斥锁，保证状态的唯一性，必须等待上一步操作完毕才能进行下一步操作
    var patchLock;
    //存放 undo redo 操作的队列
    // 比如s4是当前操作状态
    // undo中保存的数据顺序是:[a1,a2,a3]
    // redo中保存的数据顺序是:[a7,a6,a5] 
    var undoDiffs;
    var redoDiffs;
    //重置
    function reset() {
      undoDiffs = [];
      redoDiffs = [];
      lastSnap = minder.exportJson();
    }
    //将两个状态不一致的数据加入undo队列
    function makeUndoDiff() { 
      var headSnap = minder.exportJson();
      //jsonDiff 已一定算法获取两个json串的差异
      var diff = jsonDiff(headSnap, lastSnap);
      if (diff.length) {
        undoDiffs.push(diff);
        //若undo队列超过最大次数，则移除队首
        while (undoDiffs.length > MAX_HISTORY) {
          undoDiffs.shift();
        }
        lastSnap = headSnap;
        return true;
      }
    }
    //将撤销前后状态中不一致的数据加入redo队列
    function makeRedoDiff() {
      var revertSnap = minder.exportJson();
      //revertSnap 撤销后的状态；lastSnap 撤销前的状态
      redoDiffs.push(jsonDiff(revertSnap, lastSnap));
      lastSnap = revertSnap;
    }
    //执行撤销操作
    function undo() {
      patchLock = true;
      //undo队列尾 操作数据
      var undoDiff = undoDiffs.pop();
      if (undoDiff) {
        //执行数据对应操作
        minder.applyPatches(undoDiff);
        //将撤销前状态加入redo队列
        makeRedoDiff();
      }
      patchLock = false;
    }
    //执行重做操作
    function redo() {
      patchLock = true;
      //redo队尾数据
      var redoDiff = redoDiffs.pop();
      if (redoDiff) {
        minder.applyPatches(redoDiff);
        //将重做前前状态加入undo队列
        makeUndoDiff();
      }
      patchLock = false;
    }
    // 内容变化处理函数
    function changed() {
      //上一步操作还未完成，本次变化不计入history
      if (patchLock)
        return;
      //若内容确实有变化，变化加入undo队列，并清空redo队列  
      if (makeUndoDiff())
        redoDiffs = [];
      }
    // 判断当前状态是否可以撤销
    function hasUndo() {
      return !!undoDiffs.length;
    }
    // 判断当前状态是否可以重做
    function hasRedo() {
      return !!redoDiffs.length;
    }
    //对外提供的接口
    this.minder.history = {
      reset: reset,
      undo: undo,
      redo: redo,
      hasUndo: hasUndo,
      hasRedo: hasRedo
    };
    //监听数据变化，触发changed操作，这里我们不深入这个内容变化监听过程
    minder.on('contentchange', changed);
  }
```

上述做法的关键在于每次比对的时候需要用jsonDiff算法去比对前后两个状态的差异。

**问题：**
1. 为什么撤销操作时，将diff取出并执行后，不直接将diff传入makeRedoDiff，而是用jsondiff去比对差异？
   > 个人感觉确实有问题 可以改进
2. 对于单线程操作，为什么要还要引入patchLock互斥锁？
   > 对于js这种单线程的来说确实没必要，譬如在redo过程中触发了contentchange，changed操作也会得到redo做完才执行
   >
   > 可能这边是考虑了拓展性

总的来说，该实现兼顾了快照式和命令式的缺点

##　拓展： 基于 Immutable.js 的思想 实现快照式

### Immutable 简介

https://facebook.github.io/immutable-js/

```js
const { Map } = require('immutable');
const map1 = Map({ a: 1, b: 2, c: 3 });
const map2 = map1.set('b', 50);
map1.get('b') + " vs. " + map2.get('b'); // 2 vs. 50
```

### Immutable 原理解析

<img src="http://img.alicdn.com/tps/i2/TB1zzi_KXXXXXctXFXXbrb8OVXX-613-575.gif"/>

### 实践

## 举例

我们把例子举的简单点，即一个数组，我们对其进行如下操作

1. 添加元素
2. 修改元素
3. 删除元素

这些操作都是可以进行撤销重做的。

**代码如下，有注释：**
 
### 命令式
```

```

### 快照式
```

```

### Immutable
```
```

## 参考
<a href="https://zhuanlan.zhihu.com/p/43743782">Web 应用中的撤销与重做</a>