---
title: Promise then 原理分析
date: 2019/12/10 00:00:00
tags: 
  - ECMAScript
permalink: /pages/abd3d0/
categories: 
  - 随笔
---

## 前言

先谈规范，再分析 polyfill 源码，最后实例解析。

<!-- more -->

## 规范

规范直接参考这边：<a href="http://www.ituring.com.cn/article/66566">【翻译】Promises/A+规范</a>

**返回值这部分重要且易错，这里单独提出来分析下**

首先，then 方法必须返回一个 promise 对象

```js
  promise2 = promise1.then(onFulfilled, onRejected);
```
- 如果 onFulfilled 或者 onRejected 返回一个值 x ，则运行下面的 [**Promise 解决过程：`[[Resolve]](promise2, x)`**](#promise-solution-process)
- 如果 onFulfilled 或者 onRejected 抛出一个异常 e ，则 promise2 必须拒绝执行，并返回拒因 e
- 如果 onFulfilled 不是函数且 promise1 成功执行， promise2 必须成功执行并返回相同的值
  > e.g.: `promise1 = Promise.resolve(1);onFulfilled = 2;` \
  > 则 `promise2 = Promise {<resolved>: 1}`
- 如果 onRejected 不是函数且 promise1 拒绝执行， promise2 必须拒绝执行并返回相同的据因
  > e.g.: `promise1 = Promise.reject(1);onRejected = 2;` \
  > 则 `promise2 = Promise {<rejected>: 1}`
- 不论 promise1 被 reject 还是被 resolve 时 promise2 都会被 resolve，只有出现异常时才会被 rejected。
  > e.g.: `promise1 = Promise.reject(1);onFulfilled =()=>1; onRejected=()=>2;`\
  > 则 `promise2 = Promise {<resolved>: 2}`;
  >
  > e.g.: `promise1 = Promise.resolve(1);onFulfilled =()=>{throw new Error('test')}; onRejected=(e)=>console.log(e);`\
  > 则 `promise2 = Promise {<rejected>: Error: test`

### <span id="promise-solution-process">**Promise 解决过程 `[[Resolve]](promise, x)`**</span>

promise 为 then 回调的返回值，运行 `[[Resolve]](promise, x)` 需遵循以下步骤：

- x 与 promise 相等
  > 如果 promise 和 x 指向同一对象，以 TypeError 为据因拒绝执行 promise \
  > e.g.: `test = {};test = Promise.resolve().then(()=>test)` \
  > `//Promise {<rejected>: TypeError: Chaining cycle detected for promise #<Promise>}`
- x 为 Promise
  > promise 接受x的状态 \
  > e.g.: `promise2 = Promise.resolve().then(()=>Promise.reject(1))` \
  > `//Promise {<rejected>: 1}`
- **x 为对象或函数**
  - 把 x.then 赋值给 then。用引用保持，防止其他地方又更改了then的值
  - 如果取 x.then 的值时抛出错误 e ，则以 e 为据因拒绝 promise
  - 如果 then 是函数，将 x 作为函数的作用域 this 调用之。传递两个回调函数作为参数，第一个参数叫做 resolvePromise ，第二个参数叫做 rejectPromise:
    - 如果 resolvePromise 以值 y 为参数被调用，则运行 [[Resolve]](promise, y)
    > `Promise.resolve().then(()=>({a:1,then:function (res,rej){res(this.a)}}))`
    > 
    > `//Promise {<resolved>: 1}`
    - 如果 rejectPromise 以据因 r 为参数被调用，则以据因 r 拒绝 promise
    > `Promise.resolve().then(()=>({a:1,then:function (res,rej){rej(this.a)}}))`
    > 
    > `//Promise {<rejected>: 1}`
    - 如果 resolvePromise 和 rejectPromise 均被调用，或者被同一参数调用了多次，则优先采用首次调用并忽略剩下的调用
    - 如果调用 then 方法抛出了异常 e：
      - 如果 resolvePromise 或 rejectPromise 已经被调用，则忽略之
      - 否则以 e 为据因拒绝 promise
- x 不为对象或函数
  > 以 x 为参数执行 promise 

```js
如果一个 promise 被一个循环的 thenable 链中的对象解决，而 [[Resolve]](promise, thenable) 的递归性质又使得其被再次调用，根据上述的算法将会陷入无限递归之中。算法虽不强制要求，但也鼓励施者检测这样的递归是否存在，若检测到存在则以一个可识别的 TypeError 为据因来拒绝 promise
```

这个目前还不知道怎么写才能产生循环的 thenable 链 - -

## 原理

### then 操作解析

全局维护一个 microTask Queue ，每个 promise 自身维护一个 queue

当 promise 执行 then 方法时：
1. 令 then 方法中的回调为 resolver，令 promise 的内部值为 outcome
2. 创建一个 PENDING 状态的 Promise 对象 promise2
3. 如果 promise 处于 PENDING 状态，将 “执行 resolver ，改变 promise2 状态” 作为队列项放入该 promise 对象自身维护的 queue
4. 否则将 “执行 resolver ，改变 promise2 状态” 作为 microTask 放入 microTask Queue
5. 返回 promise2

当同步代码执行完毕，开始执行 microTask Queue 中的任务

执行 microTask ：
1. 以 promise 的内部值 outcome 作为参数执行 resolver 并得到返回值 returnValue
2. 若出现异常，将异常赋值给 returnValue 
3. 若未出现异常，对 returnValue 做些处理，这里不细讲
4. 修改 promise2 的状态为 FULFILLED/REJECTED ，并修改 promise2 的内部值 outcome 为 returnValue
5. 该 promise2 维护的 queue 中的队列项放入 microTask Queue 

不断的执行 microTask 直到 microTask Queue 为空，一轮 event loop 结束

## 源码

对 [lie.js](https://github.com/calvinmetcalf/lie) (一个 Promise polyfill 库) 的代码做个精简，仅考虑普通的 then 回调和 resolve 方法

然后 microTask 任务执行接口我们直接用的 setTimeout ，不搞 Mutation 那些幺蛾子，代码如下
```js
// immediate.js

var scheduleDrain = function () {
  setTimeout(nextTick, 0);
};

var draining;
var queue = [];

// 在同步代码 task 执行之后，模拟清空 microTask queue
// 由于执行过程中可能有新的 microTask 所以用了双层循环
function nextTick() {
  draining = true;
  var i, oldQueue;
  var len = queue.length;
  while (len) {
    oldQueue = queue;
    queue = [];
    i = -1;
    while (++i < len) {
      oldQueue[i]();
    }
    len = queue.length;
  }
  draining = false;
}

function immediate(task) {
  if (queue.push(task) === 1 && !draining) {
    scheduleDrain();
  }
}

```
Promise 代码如下
```js
// promise.js

// then 方法执行时作为参数 resolver 实例化 Promise
function INTERNAL () { }

const REJECTED = 'REJECTED';
const FULFILLED = 'FULFILLED';
const PENDING = 'PENDING';


function Promise (resolver) {
  if (typeof resolver !== 'function') {
    throw new TypeError('resolver must be a function');
  }
  this.state = PENDING;
  this.queue = [];
  this.outcome = void 0;
  // 外部通过 new 实例化时执行
  if (resolver !== INTERNAL) {
    safelyResolveThenable(this, resolver);
  }
}


Promise.prototype.then = function (onFulfilled, onRejected) {
  // 特殊参数的处理
  if (typeof onFulfilled !== 'function' && this.state === FULFILLED ||
    typeof onRejected !== 'function' && this.state === REJECTED) {
    return this;
  }
  // 创建一个 PENDING 状态的 promise
  var promise = new this.constructor(INTERNAL);
  // 根据原 promise 状态进行不同处理
  if (this.state !== PENDING) {
    var resolver = this.state === FULFILLED ? onFulfilled : onRejected;
    makeMicroTask(promise, resolver, this.outcome);
  } else {
    this.queue.push(new QueueItem(promise, onFulfilled, onRejected));
  }

  return promise;
};

Promise.resolve = function (value) {
  if (value instanceof this) {
    return value;
  }
  return handleResolve(new this(INTERNAL), value);
}

// promsie 内部队列项
function QueueItem (promise, onFulfilled, onRejected) {
  this.promise = promise;
  // 仅考虑 function类型的 onFulfilled
  this.onFulfilled = onFulfilled;
  this.callFulfilled = function(value) {
    makeMicroTask(this.promise, this.onFulfilled, value);
  };
  // 暂不处理 onRejected
}

// 将 handleResolve 操作放入 microtask
function makeMicroTask (promise, func, value) {
  immediate(function () {
    handleResolve(promise, func(value));
  });
}

// 改变 promise 状态，并通知 queue 中的 promise 执行 makeMicroTask
function handleResolve (self, value) {
  self.state = FULFILLED;
  self.outcome = value;
  var i = -1;
  var len = self.queue.length;
  while (++i < len) {
    self.queue[i].callFulfilled(value);
  }
  return self;
}

// 对 resolver 方法的两个参数（resolve,reject）进行包装
function safelyResolveThenable (self, thenable) {
  var called = false;
  function onError (value) {
    if (called) {
      return;
    }
    called = true;
    // 暂不处理 reject
    // handlers.reject(self, value);
  }
  function onSuccess (value) {
    if (called) {
      return;
    }
    called = true;
    handleResolve(self, value);
  }
  thenable(onSuccess, onError);
}

```

## 实例分析

```js
new Promise(resolve => {
    console.log(1);
    resolve(3);
    Promise.resolve().then(()=> console.log(4))
}).then(num => {
    console.log(num)
});
console.log(2)
```

<details>
<summary>答案</summary>

1243 

</details>

```js
Promise.resolve().then(() => {
  console.log(1);
  Promise.resolve().then(()=> console.log(4))
}).then(() => {
    console.log(3)
});
console.log(2)
```

<details>
<summary>答案</summary>

2143 
</details>

```js
new Promise((r) => {
  r()
  console.log(1);
}).then(() => {
    console.log(11)
}).then(() => {
    console.log(12)
}).then(() => {
    console.log(13)
})
var promise = new Promise((r) => {
  r()
  console.log(2);
  let promise = Promise.resolve().then(()=> console.log(21)).then(()=> console.log(22)).then(()=> console.log(23))
  promise.then(()=>console.log(29))
  Promise.resolve().then(()=> console.log(24)).then(()=> console.log(25)).then(()=> console.log(26))
})
promise.then(() => {
    console.log(27)
})
promise.then(() => {
    console.log(28)
})

```
<details>
<summary>答案</summary>

【1,2,11,21,24,27,28,12,22,25,13,23,26,29】
</details>

## 如何测试

当我们的 polyfill 写完后，需要测试下是否符合规范，我们自己写测试用例肯定是不可能的，这里有一个测试库
[promises-tests](https://github.com/promises-aplus/promises-tests)

```js
const tests = require("promises-aplus-tests");
const Promise = require("./index");

const deferred = function() {
    let resolve, reject;
    const promise = new Promise(function(_resolve, _reject) {
        resolve = _resolve;
        reject = _reject;
    });
    return {
        promise: promise,
        resolve: resolve,
        reject: reject
    };
};
const adapter = {
    deferred
};
tests.mocha(adapter);
```

这样就可以做测试了

## 参考

1. [从一道Promise执行顺序的题目看Promise实现](https://juejin.im/post/5aa3f7b9f265da23766ae5ae)
2. [手写一个符合A+规范的Promise](https://segmentfault.com/a/1190000020037919)