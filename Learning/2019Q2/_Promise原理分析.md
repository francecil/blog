## 前言
不讲使用。先讲规范和原理，再分析源码，最后实例解析。

## 规范

规范直接参考这边：<a href="http://www.ituring.com.cn/article/66566">【翻译】Promises/A+规范</a>

**返回值这部分重要且易错，这里单独提出来分析下**

首先，then 方法必须返回一个 promise 对象

```js
  promise2 = promise1.then(onFulfilled, onRejected);
```
- 如果 onFulfilled 或者 onRejected 返回一个值 x ，则运行下面的**Promise 解决过程：`[[Resolve]](promise2, x)`**
- 如果 onFulfilled 或者 onRejected 抛出一个异常 e ，则 promise2 必须拒绝执行，并返回拒因 e
- 如果 onFulfilled 不是函数且 promise1 成功执行， promise2 必须成功执行并返回相同的值
  > e.g.: `promise1 = Promise.resolve(1);onFulfilled = 2;则 promise2 = Promise {<resolved>: 1}`
- 如果 onRejected 不是函数且 promise1 拒绝执行， promise2 必须拒绝执行并返回相同的据因
  > e.g.: `promise1 = Promise.reject(1);onRejected = 2;则 promise2 = Promise {<rejected>: 1}`
- 不论 promise1 被 reject 还是被 resolve 时 promise2 都会被 resolve，只有出现异常时才会被 rejected。
  > e.g.: `promise1 = Promise.reject(1);onFulfilled =()=>1; onRejected=()=>2;则 promise2 = Promise {<resolved>: 2}`;
  >
  > e.g.: `promise1 = Promise.resolve(1);onFulfilled =()=>{throw new Error('test')}; onRejected=(e)=>console.log(e);则 promise2 = Promise {<rejected>: Error: test`

### Promise 解决过程`[[Resolve]](返回值[promise2], x)`

运行 `[[Resolve]](promise2, x)` 需遵循以下步骤：

- x 与 promise 相等
  > 如果 promise 和 x 指向同一对象，以 TypeError 为据因拒绝执行 promise
  > `e.g.:promise2 = {};test = Promise.resolve().then(()=>test)`
  >
  > `//Promise {<rejected>: TypeError: Chaining cycle detected for promise #<Promise>}`
- x 为 Promise
  > promise2接受x的状态
  > e.g.: `promise2 = Promise.resolve().then(()=>Promise.reject(1))`
  >
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

xxx

## 源码

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
答案是 1243 不是1234 的原因在于 **`里面的promise的then要比外面的promise的then先执行，也就是说它的nextTick更先注册，所以4是在3之前输出。`**