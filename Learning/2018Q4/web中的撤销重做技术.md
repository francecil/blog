## 前言

撤销重做功能，我们经常在富文本编辑器中用到。正好最近接了一个思维导图组件，里面有用到这个功能，分享一波实现原理。

> PM："不就是按CTRL+Z CTRL+Y的事情吗，还需要开发？"

## 原理

**操作定义：**

不同的应用场景，撤回重做针对的内容都是不一样的，所有我们要先定义好什么是有效操作。

比如我们进行组件标题的编辑，这个编辑过程可能很久，先输入了`hello`,隔了一会再输入`world`，那这算是几次操作？

> 答案没有固定，这就靠实现的人想怎么做。\
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
记录每次进行的操作
### 2.快照式
记录每次操作后的状态


### 百度脑图中的实现
> 源自kityminder-editor的history.js文件，为了利于理解有部分修改
```js
/**
百度脑图撤销重做功能接口
*/
function HistoryRuntime() {
    /**
      minder：脑图编辑器
    */
    var minder = this.minder;
    //最大撤销次数
    var MAX_HISTORY = 100;

    var lastSnap;
    // 互斥锁，保证状态的唯一性，必须等待上一步操作完毕才能进行下一步操作
    var patchLock;
    //存放
    var undoDiffs;
    var redoDiffs;
    /**
      重置
    */
    function reset() {
      undoDiffs = [];
      redoDiffs = [];
      lastSnap = minder.exportJson();
    }

    function makeUndoDiff() {
      var headSnap = minder.exportJson();
      var diff = jsonDiff(headSnap, lastSnap);
      if (diff.length) {
        undoDiffs.push(diff);
        while (undoDiffs.length > MAX_HISTORY) {
          undoDiffs.shift();
        }
        lastSnap = headSnap;
        return true;
      }
    }

    function makeRedoDiff() {
      var revertSnap = minder.exportJson();
      redoDiffs.push(jsonDiff(revertSnap, lastSnap));
      lastSnap = revertSnap;
    }

    function undo() {
      patchLock = true;
      var undoDiff = undoDiffs.pop();
      if (undoDiff) {
        minder.applyPatches(undoDiff);
        makeRedoDiff();
      }
      patchLock = false;
    }

    function redo() {
      patchLock = true;
      var redoDiff = redoDiffs.pop();
      if (redoDiff) {
        minder.applyPatches(redoDiff);
        makeUndoDiff();
      }
      patchLock = false;
    }
    // 内容变化，
    function changed() {
      if (patchLock)
        return;
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

    function updateSelection(e) {
      if (!patchLock)
        return;
      var patch = e.patch;
      switch (patch.express) {
        case 'node.add':
          minder.select(patch.node.getChild(patch.index), true);
          break;
        case 'node.remove':
        case 'data.replace':
        case 'data.remove':
        case 'data.add':
          minder.select(patch.node, true);
          break;
      }
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
### 一个纯js的简单例子

我们把例子举的简单点，即一个数组，我们对其进行如下操作

1. 添加元素
2. 修改元素
3. 删除元素

这些操作都是可以进行撤销重做的。

代码如下，有注释：
```
```