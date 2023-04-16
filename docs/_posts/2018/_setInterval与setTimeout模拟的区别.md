---
title: setInterval与setTimeout模拟的区别
date: 2019-09-02 19:36:21
permalink: /pages/7dab3a/
sidebar: auto
categories: 
  - 随笔
  - 2018
tags: 
  - 
titleTag: 草稿
---
## 前言

本文先通过 setTimeout 模拟 setInterval ，分析两者的效果差异，
再黑盒测试 setInterval 并进行特性分析，最终通过 rfc和源码了解原理。

其中会涉及到浏览器和 nodejs.

- 浏览器: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36
- nodejs: v10.15.1

## 预备知识

在浏览器中，[setInterval的方法](https://www.w3.org/TR/2011/WD-html5-20110525/timers.html#dom-windowtimers-setinterval)定义为：
```ts
long setInterval(in any handler, in optional any timeout, in any... args);
```
可以看出，该方法返回的句柄是不变的 long 值，我们需要通过该句柄去取消定时器

另一个要注意的点是：该方法的[执行上下文](https://www.w3.org/TR/2011/WD-html5-20110525/timers.html#method-context)必须为 window，WorkerUtils ，或者 实现 `WindowTimers interface`的对象（这个目前不知道怎么实现）
```ts
interface WindowTimers {
  long setTimeout(in any handler, in optional any timeout, in any... args);
  void clearTimeout(in long handle);
  long setInterval(in any handler, in optional any timeout, in any... args);
  void clearInterval(in long handle);
};
Window implements WindowTimers;
```
**注意**：`clearInterval(lone handler)` 会对 handler 做隐式类型转换，下文有用到该特性

而在node环境中， setInterval 返回的是一个 [Timeout](https://nodejs.org/api/timers.html#timers_class_timeout) 对象，
```js

```

`clearInterval(object timer)`， 故 clearInterval 不会对其中的参数做隐式类型转换(https://github.com/nodejs/node/blob/master/lib/timers.js#L194)

## setTimeout 模拟

setTimeout 模拟 `setInterval(handler,?timeout,...args)` ，有两种实现：
> 注意这里我们要返回一个 timer的引用，但是timer又只能是Int，只能采取重写 valueOf 的方式实现
1. 先执行 fn 再 重新设置 setTimeout
```js
function setInterval1 (handler,timeout,...args) {
  let isBrowser = typeof window !=='undefined'
  if(isBrowser && this!==window){
    throw 'TypeError: Illegal invocation'
  }
  let timer = {}
  if(isBrowser){
    // 浏览器上处理
    timer = {
      value:-1,
      valueOf: function (){
        return this.value
      }
    }
    let callback = ()=>{
      handler.apply(this,args)
      timer.value = setTimeout(callback,timeout)
    }
    timer.value = setTimeout(callback,timeout)
  } else {
    // nodejs的处理
    let callback = ()=>{
      handler.apply(this,args)
      Object.assign(timer,setTimeout(callback,timeout))
    }
    Object.assign(timer,setTimeout(callback,timeout))
  }
  return timer
}
```
**测试用例：**
```js
// 基础功能：不断的打印3
setInterval1 ((a,b)=>console.log(a+b),1000,1,2) 
// 清除定时器: 打印10次3后停止
let t = setInterval1 ((a,b)=>console.log(a+b),1000,1,2)
setTimeout(()=>{
  window.clearInterval(t)
},10.5*1000)
// this：前两个均提示非法调用错误，最后一个可以成功调用 定时输出 undefined
// node 下都可以调用
let tmp = {
  a:1,
  test:setInterval
}
let tmp1 = {
  a:1,
  test:setInterval1
}
tmp.test(function(){
  console.log(this.a)
},1000)
tmp1.test(function(){
  console.log(this.a)
},1000)
tmp1.test.call(window,() =>{
  console.log(this.a)
},1000)
```
2. 先设置 setTimeout 再执行 fn
```js
function setInterval2 (handler,timeout,...args) {
  let isBrowser = typeof window !=='undefined'
  if(isBrowser && this!==window){
    throw 'TypeError: Illegal invocation'
  }
  let timer = {}
  if(isBrowser){
    // 浏览器上处理
    timer = {
      value:-1,
      valueOf: function (){
        return this.value
      }
    }
    let callback = ()=>{
      // 区别在这
      timer.value = setTimeout(callback,timeout)
      handler.apply(this,args)
    }
    timer.value = setTimeout(callback,timeout)
  } else {
    // nodejs的处理
    let callback = ()=>{
      // 区别在这
      Object.assign(timer,setTimeout(callback,timeout))
      handler.apply(this,args)
    }
    Object.assign(timer,setTimeout(callback,timeout))
  }
  return timer
}
```

## setInterval 、 setInterval1 、 setInterva2 三者差异对比

**先编写预处理函数**
```js
function setInterval1 (handler,timeout,...args) {
  let isBrowser = typeof window !=='undefined'
  if(isBrowser && this!==window){
    throw 'TypeError: Illegal invocation'
  }
  let timer = {}
  if(isBrowser){
    // 浏览器上处理
    timer = {
      value:-1,
      valueOf: function (){
        return this.value
      }
    }
    let callback = ()=>{
      handler.apply(this,args)
      timer.value = setTimeout(callback,timeout)
    }
    timer.value = setTimeout(callback,timeout)
  } else {
    // nodejs的处理
    let callback = ()=>{
      handler.apply(this,args)
      Object.assign(timer,setTimeout(callback,timeout))
    }
    Object.assign(timer,setTimeout(callback,timeout))
  }
  return timer
}
function setInterval2 (handler,timeout,...args) {
  let isBrowser = typeof window !=='undefined'
  if(isBrowser && this!==window){
    throw 'TypeError: Illegal invocation'
  }
  let timer = {}
  if(isBrowser){
    // 浏览器上处理
    timer = {
      value:-1,
      valueOf: function (){
        return this.value
      }
    }
    let callback = ()=>{
      // 区别在这
      timer.value = setTimeout(callback,timeout)
      handler.apply(this,args)
    }
    timer.value = setTimeout(callback,timeout)
  } else {
    // nodejs的处理
    let callback = ()=>{
      // 区别在这
      Object.assign(timer,setTimeout(callback,timeout))
      handler.apply(this,args)
    }
    Object.assign(timer,setTimeout(callback,timeout))
  }
  return timer
}
// 同步处理函数
function syncHandler(ms) {
  let d = Date.now()
  while (Date.now() - d < ms) { }
}
// 异步处理函数
function asyncHandler(callback,ms){
  setTimeout(callback,ms)
}
let scope = typeof window !=='undefined'?window:global
// 主测试函数
function test(setInterval,count){
  return (handler,timeout,...args) => {
    let t = setInterval (handler,timeout,...args)
    setTimeout(()=>{
      scope.clearInterval(t)
    },(count+0.5)*timeout)
  }
}
```

### 1. handler 为同步处理函数
- setInterval
```js
var start = Date.now()
var icounter = 0
test(setInterval,5)(function(){
  var time = (Date.now() - start) / 1000
  console.log('setInterval=>次数：' + (++icounter) + '    所用时间：' + time.toFixed(3))
  syncHandler(100)
},1000)
/*
# chrome76
setInterval=>次数：1    所用时间：1.002
setInterval=>次数：2    所用时间：2.001
setInterval=>次数：3    所用时间：3.000
setInterval=>次数：4    所用时间：4.002
setInterval=>次数：5    所用时间：5.002
# node v10
setInterval=>次数：1    所用时间：1.003
setInterval=>次数：2    所用时间：2.004
setInterval=>次数：3    所用时间：3.005
setInterval=>次数：4    所用时间：4.005
setInterval=>次数：5    所用时间：5.005
*/
```
- setInterval1
```js
var start = Date.now()
var icounter = 0
test(setInterval1,5)(function(){
  var time = (Date.now() - start) / 1000
  console.log('setInterval1=>次数：' + (++icounter) + '    所用时间：' + time.toFixed(3))
  syncHandler(100)
},1000)
/*
# chrome76
setInterval1=>次数：1    所用时间：1.001
setInterval1=>次数：2    所用时间：2.103
setInterval1=>次数：3    所用时间：3.204
setInterval1=>次数：4    所用时间：4.305
setInterval1=>次数：5    所用时间：5.406
# node v10
setInterval1=>次数：1    所用时间：1.005
setInterval1=>次数：2    所用时间：2.121
setInterval1=>次数：3    所用时间：3.224
setInterval1=>次数：4    所用时间：4.324
setInterval1=>次数：5    所用时间：5.428
*/
```
- setInterval2
```js
var start = Date.now()
var icounter = 0
test(setInterval2,5)(function(){
  var time = (Date.now() - start) / 1000
  console.log('setInterval2=>次数：' + (++icounter) + '    所用时间：' + time.toFixed(3))
  syncHandler(100)
},1000)
/*
# chrome76
setInterval2=>次数：1    所用时间：1.001
setInterval2=>次数：2    所用时间：2.004
setInterval2=>次数：3    所用时间：3.005
setInterval2=>次数：4    所用时间：4.007
setInterval2=>次数：5    所用时间：5.008
# node v10
setInterval2=>次数：1    所用时间：1.006
setInterval2=>次数：2    所用时间：2.005
setInterval2=>次数：3    所用时间：3.005
setInterval2=>次数：4    所用时间：4.005
setInterval2=>次数：5    所用时间：5.005
*/
```

当 handler 为同步处理函数且执行时间小于 timeout，我们可以得到以下结论：
1. 浏览器执行结果与 nodejs 没有差异
2. setInterval 与 setInterval2 效果相近，说明 setInterval 是先将自身 handle 放入timer堆，再执行回调函数
3. 先执行回调函数再设置 settimeout 会导致下次执行实现等待时间大于 timeout+同步代码执行时间

通过 [node-libuv](https://github.com/nodejs/node/blob/master/deps/uv/src/timer.c#L159) 源码可以证明

```js
void uv__run_timers(uv_loop_t* loop) {
  struct heap_node* heap_node;
  uv_timer_t* handle;

  for (;;) {
    heap_node = heap_min(timer_heap(loop));//取出timer堆上超时时间最小的元素
    if (heap_node == NULL)
      break;
    //根据上面的元素，计算出handle的地址，head_node结构体和container_of的结合非常巧妙，值得学习
    handle = container_of(heap_node, uv_timer_t, heap_node);
    if (handle->timeout > loop->time)//如果最小的超时时间比循环运行的时间还要小，则表示没有到期的callback需要执行，此时退出timer阶段
      break;

    uv_timer_stop(handle);//将这个handle移除
    uv_timer_again(handle);//如果handle是repeat类型的，重新插入堆里
    handle->timer_cb(handle);//执行handle上的callback
  }
}
```

### 2. handler 为异步处理函数
- setInterval
```js
var start = Date.now()
var icounter = 0
test(setInterval,5)(function(){
  asyncHandler(function (){
    var time = (Date.now() - start) / 1000
    console.log('setInterval=>次数：' + (++icounter) + '    所用时间：' + time.toFixed(3))
  },3000)
},1000)
/*
# chrome76
setInterval=>次数：1    所用时间：1.002
setInterval=>次数：2    所用时间：2.001
setInterval=>次数：3    所用时间：3.000
setInterval=>次数：4    所用时间：4.002
setInterval=>次数：5    所用时间：5.002
# node v10
setInterval=>次数：1    所用时间：1.003
setInterval=>次数：2    所用时间：2.004
setInterval=>次数：3    所用时间：3.005
setInterval=>次数：4    所用时间：4.005
setInterval=>次数：5    所用时间：5.005
*/
```

**突然发现 node 和 浏览器并没有说明差异，浏览器的优化是什么？？**

以下为以前的结论，有误
================

## setInterval 的特性





### 场景3：fn异步代码，代码执行时间小于timeout

PS:这边说是异步，其实不准确，详细见补充。

代码：
```js
var speed = 1000
var start = Date.now()
var icounter = 0
var tcounter = 0
let fn1 = () => setInterval(function () {
    Promise.resolve().then(() => setTimeout(function () {
        var time = (Date.now() - start) / 1000
        var avg = ++icounter / time
        console.log('setInterval=>次数：' + icounter + '   所用时间：' + time.toFixed(3))
    }, 100))
}, speed)
function e() {
    Promise.resolve().then(() => setTimeout(function () {
        var time = (Date.now() - start) / 1000
        var avg = ++tcounter / time
        console.log('setTimeout=>次数：' + tcounter + '   所用时间：' + time.toFixed(3))
        setTimeout(e, speed)
    }, 100))
}
let fn2 = () => setTimeout(e, speed)
fn2()
```



### 场景4：fn异步代码，代码执行时间大于timeout

异步时间代码设为3000

#### node环境下运行效果
```
执行fn1:
setInterval=>次数：1   所用时间：4.005
setInterval=>次数：2   所用时间：5.005
setInterval=>次数：3   所用时间：6.006
setInterval=>次数：4   所用时间：7.014
setInterval=>次数：5   所用时间：8.010
执行fn2:
setTimeout=>次数：1   所用时间：4.116
setTimeout=>次数：2   所用时间：8.122
setTimeout=>次数：3   所用时间：12.124
setTimeout=>次数：4   所用时间：16.203
setTimeout=>次数：5   所用时间：20.211
```

>结论：setInterval正常定时，会同时执行多次异步代码。对于ajax类似的请求来说是不合理的，反而用setTimeout模拟合理
>setTimeout模拟周期≈异步代码执行时间+timeout

#### 浏览器下运行效果

```
执行fn1
setInterval=>次数：1   所用时间：4.003
setInterval=>次数：2   所用时间：5.004
setInterval=>次数：3   所用时间：6.002
setInterval=>次数：4   所用时间：7.003
setInterval=>次数：5   所用时间：8.004

执行fn2
setTimeout=>次数：1   所用时间：4.002
setTimeout=>次数：2   所用时间：8.002
setTimeout=>次数：3   所用时间：12.006
setTimeout=>次数：4   所用时间：16.025
setTimeout=>次数：5   所用时间：20.027
```

>**结论**：setInterval正常定时，会同时执行多次异步代码。对于ajax类似的请求来说是不合理的，反而用setTimeout模拟合理
>setTimeout模拟周期≈异步代码执行时间+timeout结论：setInterval正常定时，会同时执行多次异步代码。对于ajax类似的请求来说是不合理的，反而用setTimeout模拟合理


### 补充

《js高级程序设计第三版》一书里22.3节就已经提到了这个问题，可以直接看那边会清楚些。



上面用Promise+timeout实现的代码说是异步代码并不合理，上面的实现并不会存在一个实例其实是直接执行完毕并设置timer到堆，而不是像ajax这中IO请求挂在那边等待返回。

浏览器对于setInterval有做优化，如果在下次setInterval时，上次fn还没执行完成(还在等待结果返回)，就不再加入。

如果换成ajax请求的话，假设操作返回结果需要2.5s。

setInterval 在 chrome这边效果是这样的：

>1s 把定时器代码放入2s的time堆，定时器代码添加到事件队列

>1s+ 事件队列执行定时器代码-ajax1

>2s ajax1未完成，拿到2s的定时器代码，此时事件队列没有同一份定时器代码-ajax请求，成功放入事件队列，把定时器代码放入3s的time堆

>3s 由于ajax请求未完成,且事件队列拥有同一份定时器代码，故此时该代码不放入事件队列，把定时器代码放入4s的time堆

>3.5s ajax操作完成并成功执行回调，此时会执行事件队列的下一份定时器代码-ajax2，此时事件队列为空

>4s ajax2未完成，拿到4s的定时器代码，此时事件队列没有同一份定时器代码-ajax请求，成功放入事件队列，把定时器代码放入5s的time堆

>5s 同4s

>6s ajax2完成。此时关闭定时器，仍存在一个ajax在事件队列中，此时它会执行，并在8.5s的时候进行输出

这样 就发现3s的时候定时器被跳过了。

最终输出结果时间戳为： 3.5s 6s 8.5s



### 总结：

秒表这类的定时器（同步代码较快运行），采用setInterval,node的话两者都不合适需要采用其他方式实现（补充：setTimeout+延迟补充）

ajax请求重试次数，采用setTimeout模拟，用setInterval无法准确的控制次数（见补充，即使关闭定时器，仍可能存在请求在事件队列中），建议用settimeout

setInterval 先放timer再执行，可以用 先 setTimeout 再执行的方式模拟

2018/12/27 补充：setTimeout模拟比setInterval 更安全的原因在于：定时器执行的方法因为各种原因（比如切换了上下文）报错后，就不会再执行定时，而 setInterval 如果没有手动取消的 是会继续执行的

参考：

1. https://cnodejs.org/topic/5a9108d78d6e16e56bb80882