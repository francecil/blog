首先先说明下，node里面的事件循环和浏览器中的是不一致的。

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
    sleep(20)
}, speed)
```

浏览器运行效果：
```
<td>setInterval</td><td>1</td><td>1.000</td><td>1.000000</td>
<td>setInterval</td><td>2</td><td>2.000</td><td>1.000000</td>
<td>setInterval</td><td>3</td><td>3.001</td><td>0.999667</td>
<td>setInterval</td><td>4</td><td>4.001</td><td>0.999750</td>
<td>setInterval</td><td>5</td><td>5.001</td><td>0.999800</td>
```
node运行效果：
```
<td>setInterval</td><td>1</td><td>1.003</td><td>0.997009</td>
<td>setInterval</td><td>2</td><td>2.027</td><td>0.986680</td>
<td>setInterval</td><td>3</td><td>3.048</td><td>0.984252</td>
<td>setInterval</td><td>4</td><td>4.068</td><td>0.983284</td>
<td>setInterval</td><td>5</td><td>5.088</td><td>0.982704</td>
```

结果分析：

1. 浏览器先把fn放入timer堆，再执行

2. node先执行，再把fn放入timer堆

## A2





[1]: https://cnodejs.org/topic/5a9108d78d6e16e56bb80882