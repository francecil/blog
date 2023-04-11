---
title: 面试官问：如何利用 random 计算 π
date: 2020/05/07 20:00:00
tags: 
  - HTML
permalink: /pages/e19a57/
sidebar: auto
categories: 
  - 随笔
  - 2020
---

## 前言

这是基友面试 RingCenter 时被问到的一个题目

表面上考察的是概率论等基础知识，实际可能还会问到事件循环等底层知识，以及 React Fiber

<!--more-->

## 蒙特卡洛法求 π

说蒙特卡洛可能不太理解，换个说法 -- 随机抽样

构造一个单位正方形和 1/4 单位圆，往单位正方形中投入点，根据点与原点间的距离判断点是落在圆内还是圆外，分别统计落在两个区域的点的个数 n1,n2 ，`n1/(n1+n2)` 即 1/4 圆的面积估计值，从而求得 π

![引自 CSDN/Daniel960601](https://img-blog.csdn.net/20180121211732625?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvRGFuaWVsOTYwNjAx/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

以下是 js 代码

```js
function inCicle() {
  var x = Math.random();
  var y = Math.random();
  return Math.pow(x, 2) + Math.pow(y, 2) < 1
}
function calcPi() {
  const N = 1e+6
  let pointsInside = 0
  for(let i=0;i<N;i++){
    if(inCicle()){
      pointsInside++;
    }
  }
  return 4 * pointsInside / N
}
calcPi()
```

直接在控制台运行，会发现有卡顿和掉帧发生，下面我们来谈谈如何解决

## 如何避免主线程阻塞

calcPi 是个耗时任务，会阻塞主线程，甚至导致掉帧，有什么解决方法？

提供几个思路

1. Web Worker
2. requestIdleCallback
3. requestAnimationFrame + MessageChannel

### Web Worker

Web Worker 是啥就不再介绍了，不懂的自行 MDN 搜索

我们新建一个 Worker 线程进行耗时任务计算，而后再把结果发送给主线程

```js
function createWorker () {
  let text = `
  function inCicle() {
    var x = Math.random();
    var y = Math.random();
    return Math.pow(x, 2) + Math.pow(y, 2) < 1
  }
  function calcPi() {
    const N = 1e+6
    let pointsInside = 0
    for(let i=0;i<N;i++){
      if(inCicle()){
        pointsInside++;
      }
    }
    return 4 * pointsInside / N
  }
  this.addEventListener('message', (msg) => {
    let pi = calcPi()
    this.postMessage(pi);
  }, false);
  `
  let blob = new Blob([text]);
  let url = window.URL.createObjectURL(blob);
  return new Worker(url)
}

let worker = createWorker()
worker.onmessage = (evt) => {
  console.log('PI: ', evt.data)
};
worker.postMessage("calc");
```

缺点就是计算次数是固定的，同时不能看到实时计算的结果

### requestIdleCallback

利用 [requestIdleCallback](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback) 在帧空余时间执行任务的特点进行耗时任务的计算

```js
<!DOCTYPE html>
<html>

<head>
  <title>Scheduling background tasks using requestIdleCallback</title>
</head>

<body>
  <script>
    var requestId = 0;
    var pointsTotal = 0;
    var pointsInside = 0;

    function piStep() {
      var r = 1;
      var x = Math.random() * r;
      var y = Math.random() * r;
      return (Math.pow(x, 2) + Math.pow(y, 2) < Math.pow(r, 2))
    }
    function refinePi(deadline) {
      while (deadline.timeRemaining() > 0) {
        if (piStep())
          pointsInside++;
        pointsTotal++;
      }
      currentEstimate = (4 * pointsInside / pointsTotal);
      textElement = document.getElementById("piEstimate");
      textElement.innerHTML = "Pi Estimate: " + currentEstimate;
      requestId = window.requestIdleCallback(refinePi);
    }
    function start() {
      textElement = document.getElementById("piEstimate");
      textElement.innerHTML = "Pi Estimate: " + "loading";
      requestId = window.requestIdleCallback(refinePi);
    }
    function stop() {
      // alert(1)
      if (requestId)
        window.cancelIdleCallback(requestId);
      requestId = 0;
    }
  </script>

  <button onclick="start()">Click me to start!</button>
  <button onclick="stop()">Click me to stop!</button>
  <div id="piEstimate">Not started</div>
</body>

</html>
```


几个要点
1. requestIdleCallback 中进行的 dom 变更，只能在下一帧的 Update Rendering 阶段进行渲染
  > stop 时 piEstimate innerHTML 帧渲染前后不一致
2. requestIdleCallback 有兼容性问题，常用 requestAnimationFrame 和 MessageChannel 去 fallback

### requestAnimationFrame + MessageChannel

requestAnimationFrame 将在事件循环中 [UI Render 阶段](https://html.spec.whatwg.org/multipage/webappapis.html#update-the-rendering)的实际渲染前执行，可以简单理解为帧渲染初期

MessageChannel 用来收发消息开启一个宏任务，相比 setTimeout 可以更快执行（4ms的原因）

我们在 requestAnimationFrame 设置一个标记时间点 markPoint ，并通过 MessageChannel 发起一个宏任务，设置该宏任务的过期时间为 markPoint + timeout(16ms) ，超过这个时间，任务不再执行

这样可以保证宏任务不会因为执行太久导致卡顿和掉帧

```js
<!DOCTYPE html>
<html>

<head>
  <title>Scheduling background tasks using requestIdleCallback</title>
</head>

<body>
  <script>
    const timeout = 16 // 默认一帧为16ms
    var requestId = 0;
    var pointsTotal = 0;
    var pointsInside = 0;
    let currentTask = {
      startTime: 0,
      endTime: 0,
    }
    var channel = new MessageChannel();
    var sender = channel.port2; // port2 用来发消息
    channel.port1.onmessage = function (event) {
      if (performance.now() > currentTask.endTime) {
        // 可能是插入了其他宏任务导致该任务过期，直接 rAF
        requestId = requestAnimationFrame(markPoint)
        return
      }
      refinePi(currentTask.endTime)
      requestId = requestAnimationFrame(markPoint)
    }
    function piStep() {
      var r = 1;
      var x = Math.random() * r;
      var y = Math.random() * r;
      return (Math.pow(x, 2) + Math.pow(y, 2) < Math.pow(r, 2))
    }
    function refinePi(deadline) {
      while (performance.now() < deadline) {
        if (piStep()) {
          pointsInside++;
        }
        pointsTotal++;
      }
      currentEstimate = (4 * pointsInside / pointsTotal);
      textElement = document.getElementById("piEstimate");
      textElement.innerHTML = "Pi Estimate: " + currentEstimate;
    }
    function markPoint(timestamp) {
      currentTask.startTime = timestamp
      currentTask.endTime = timestamp + timeout
      // 下轮宏任务
      sender.postMessage("")
    }
    function start() {
      requestId = requestAnimationFrame(markPoint)
    }
    function stop() {
      // alert(1)
      if (requestId)
        window.cancelAnimationFrame(requestId);
      requestId = 0;
    }
    function handle() {
      let start = performance.now()
      while (performance.now() - start < 100) { }
    }
  </script>

  <button onclick="start()">Click me to start!</button>
  <button onclick="stop()">Click me to stop!</button>
  <button onclick="handle()">执行耗时任务，观察 PI 的计算情况</button>
  <div id="piEstimate">Not started</div>
</body>

</html>
```

[在线测试](https://jsfiddle.net/bdsyf50c/)

## 拓展阅读

1. [Cooperative Scheduling of Background Tasks](https://www.w3.org/TR/requestidlecallback/)
2. [react-scheduler](https://github.com/facebook/react/tree/master/packages/scheduler)