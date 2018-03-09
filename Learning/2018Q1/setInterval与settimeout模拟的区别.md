首先先说明下，node里面的事件循环和浏览器中的是不一致的。

这边浏览器用的是`chrome 64`

问题1：setInterval(fn,ms)过程，是先把fn放入timer堆，还是先执行？

问题2：setInterval 和 settimeout模拟定时 的使用场景都有哪些？



## A1

看了[一篇文章][1]，里面讲到node中timers阶段的源码为

```js
void uv__run_timers(uv_loop_t* loop) {
  struct heap_node* heap_node;
  uv_timer_t* handle;

  for (;;) {
    heap_node = heap_min((struct heap*) &loop->timer_heap);//取出timer堆上超时时间最小的元素
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

里面说到对于repeat类型的handle（setInterval设置的），是先重新插入再执行callback

( 我这边测试发现chrome 64是这样的，node相反。可能node修改过实现？

测试代码

```js
var speed = 1000
var start = Date.now()
var icounter = 0
var tcounter = 0
//t:ms
function sleep(t) {
    let d = Date.now()
    while (Date.now() - d < t) { }
}
setInterval(function () {
    var time = (Date.now() - start) / 1000
    var avg = ++icounter / time
    console.log('<td>setInterval</td><td>' + icounter + '</td><td>' + time.toFixed(3) + '</td><td>' + avg.toFixed(6) + '</td>')
    sleep(50)
}, speed)
```

浏览器运行效果：
```
setInterval=>次数：1   所用时间：1.002
setInterval=>次数：2   所用时间：2.001
setInterval=>次数：3   所用时间：3.000
setInterval=>次数：4   所用时间：4.002
setInterval=>次数：5   所用时间：5.002
```

node运行效果：
```
setInterval=>次数：1   所用时间：1.003
setInterval=>次数：2   所用时间：2.060
setInterval=>次数：3   所用时间：3.114
setInterval=>次数：4   所用时间：4.164
setInterval=>次数：5   所用时间：5.215
```

结果分析：

1. 浏览器先把fn放入timer堆，再执行

2. node先执行，再把fn放入timer堆

<!--more-->


## A2

settimeout模拟定时调用

```js
function e () {
   
  var time = (Date.now() - start) / 1000
  var avg  = ++tcounter / time
   console.log('<td>setTimout</td><td>' + tcounter + '</td><td>' + time.toFixed(3) + '</td><td>' + avg.toFixed(6) + '</td>')
  setTimeout(e, speed)
}
setTimeout(e, speed)
```


问题1的结论，当fn中是同步代码时，对于node来说，先执行fn再放入timer堆 和timer模拟的效果是一样的。

所以我们设定了如下场景，编码并分析结论（感觉都是废话，可以直接看最后的总结。

### 场景1：fn同步代码，代码执行时间小于timeout

编码：

```js
var speed = 1000
var start = Date.now()
var icounter = 0
var tcounter = 0
//t:ms
function sleep(t) {
    let d = Date.now()
    while (Date.now() - d < t) { }
}
let fn1 = ()=>setInterval(function () {
    var time = (Date.now() - start) / 1000
    var avg = ++icounter / time
    console.log('setInterval=>次数：' + icounter + '   所用时间：' + time.toFixed(3))
    sleep(50)
}, speed)
function e () {
   
  var time = (Date.now() - start) / 1000
  var avg  = ++tcounter / time
  console.log('setTimeout=>次数：' + tcounter + '   所用时间：' + time.toFixed(3))
  sleep(50)
  setTimeout(e, speed)
}
let fn2 = ()=>setTimeout(e, speed)
```


#### node环境下运行效果

```
执行fn1():
setInterval=>次数：1   所用时间：1.009
setInterval=>次数：2   所用时间：2.064
setInterval=>次数：3   所用时间：3.117
setInterval=>次数：4   所用时间：4.169
setInterval=>次数：5   所用时间：5.221

执行fn2():
setTimeout=>次数：1   所用时间：1.003
setTimeout=>次数：2   所用时间：2.058
setTimeout=>次数：3   所用时间：3.110
setTimeout=>次数：4   所用时间：4.160
setTimeout=>次数：5   所用时间：5.210
```

结论：setInterval先执行fn再放入timer堆，和setTimeout模拟是差不多效果的，故该场景下node无法做定时器

PS:上面说差不多效果，但实际是setTimeout会更快点，因为在fn执行的时候就插入timer堆，而setInterval是执行完再插入。

#### 浏览器环境下运行效果

```
执行fn1():
setInterval=>次数：1   所用时间：1.001
setInterval=>次数：2   所用时间：2.001
setInterval=>次数：3   所用时间：3.002
setInterval=>次数：4   所用时间：4.002
setInterval=>次数：5   所用时间：5.002

执行fn2():
setTimeout=>次数：1   所用时间：1.003
setTimeout=>次数：2   所用时间：2.068
setTimeout=>次数：3   所用时间：3.119
setTimeout=>次数：4   所用时间：4.170
setTimeout=>次数：5   所用时间：5.222
```
结论：浏览器下setInterval是先放入timer堆再执行。故setInterval可以很好的执行定时器，而setTimeout与node效果一致

### 场景2：fn同步代码，代码执行时间大于timeout

`sleep(2000)`

#### node环境下运行效果

```
执行fn1():
setInterval=>次数：1   所用时间：1.003
setInterval=>次数：2   所用时间：4.141
setInterval=>次数：3   所用时间：7.146
setInterval=>次数：4   所用时间：10.165
setInterval=>次数：5   所用时间：13.167

执行fn2():
setTimeout=>次数：1   所用时间：1.023
setTimeout=>次数：2   所用时间：4.053
setTimeout=>次数：3   所用时间：7.113
setTimeout=>次数：4   所用时间：10.137
setTimeout=>次数：5   所用时间：13.140
```

结论：实际花费时间≈代码执行时间+timeout

#### 浏览器下运行效果

```
执行fn1:
setInterval=>次数：1   所用时间：1.001
setInterval=>次数：2   所用时间：3.010
setInterval=>次数：3   所用时间：5.016
setInterval=>次数：4   所用时间：7.057
setInterval=>次数：5   所用时间：9.070

执行fn2:
setTimeout=>次数：1   所用时间：1.000
setTimeout=>次数：2   所用时间：4.002
setTimeout=>次数：3   所用时间：7.005
setTimeout=>次数：4   所用时间：10.006
setTimeout=>次数：5   所用时间：13.007

```

结论：

setInterval 周期变为max(timeout,代码执行时间)

setTimeout模拟周期≈代码执行时间+timeout

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

#### node环境下运行效果
```
执行fn1:
setInterval=>次数：1   所用时间：1.118
setInterval=>次数：2   所用时间：2.109
setInterval=>次数：3   所用时间：3.110
setInterval=>次数：4   所用时间：4.126
setInterval=>次数：5   所用时间：5.122

执行fn2:
setTimeout=>次数：1   所用时间：1.104
setTimeout=>次数：2   所用时间：2.214
setTimeout=>次数：3   所用时间：3.320
setTimeout=>次数：4   所用时间：4.420
setTimeout=>次数：5   所用时间：5.524
```

结论：setInterval正常定时，setTimeout模拟周期≈异步代码执行时间+timeout

#### 浏览器下运行效果
```
执行fn1:
setInterval=>次数：1   所用时间：1.102
setInterval=>次数：2   所用时间：2.124
setInterval=>次数：3   所用时间：3.101
setInterval=>次数：4   所用时间：4.102
setInterval=>次数：5   所用时间：5.102

执行fn2:
setTimeout=>次数：1   所用时间：1.107
setTimeout=>次数：2   所用时间：2.212
setTimeout=>次数：3   所用时间：3.326
setTimeout=>次数：4   所用时间：4.432
setTimeout=>次数：5   所用时间：5.535
```

结论：setInterval正常定时，setTimeout模拟周期≈异步代码执行时间+timeout

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

结论：setInterval正常定时，会同时执行多次异步代码。对于ajax类似的请求来说是不合理的，反而用setTimeout模拟合理
setTimeout模拟周期≈异步代码执行时间+timeout

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

秒表这类的定时器（同步代码较快运行），采用setInterval,node的话两者都不合适需要采用其他方式实现

ajax请求重试次数，采用setTimeout模拟，用setInterval无法准确的控制次数（见补充，即使关闭定时器，仍可能存在请求在事件队列中），建议用settimeout






[1]: https://cnodejs.org/topic/5a9108d78d6e16e56bb80882