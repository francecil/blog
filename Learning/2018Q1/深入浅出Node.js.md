# 模块机制

## CommonJS规范

js文件会被包装，作用域隔离

```js
(function(exports,require,module,__filename,__dirname){
  //原始js文件内容
  var math = require('math') //尝试先从缓存中寻找
  //exports指向module.exports
  exports.area = function(radius){
    return Math.PI*radius*radius
  }
});
// 代码在第一次require时被执行
```

执行后的代码放入缓存，以文件所在的绝对路径作为key


建议查看node源码，require细节


# 异步IO

## Node的异步IO



## 非IO的异步API

参考链接：https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/

http://www.ruanyifeng.com/blog/2018/02/node-event-loop.html 结合评论

异步任务分为

1. 追加在本轮循环的异步任务

process.nextTick和Promise的回调函数，追加在本轮循环

2. 追加在次轮循环的异步任务

setTimeout、setInterval、setImmediate的回调函数，追加在次轮循环

PS:上面说法不够准确，是否追加到次轮是看对应的阶段是否进行过，没有进行过的会放入本轮。比如这个例子
```js
setTimeout(() => {
console.log(1) //1
setTimeout(() => console.log(4),0) //4
setImmediate(() => console.log(2)) //2
},0);
setImmediate(() => console.log(3)); //3
// 1 3 2 4
```
在timer1的回调执行中，（4）就不会再追加到本轮循环的timer队列中了。而（2），由于check阶段（执行setImmediate()的回调函数）还没执行，会在本轮循环进行



一轮事件循环的6个阶段,每个阶段都是把当前阶段的函数队列清空，才会执行下个阶段。

```
timers
I/O callbacks
idle, prepare
poll
check
close callbacks
```

每个阶段的结束，都会执行`nextTickQueue（process.nextTick）`和`microTaskQueue（Promise）`，6个阶段结束后，继续下轮循环。

