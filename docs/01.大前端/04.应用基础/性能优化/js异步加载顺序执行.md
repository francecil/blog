---
title: 如何实现 script 并行异步加载顺序执行
date: 2018-08-10 10:18:32
tags: 
  - 前端优化
permalink: /pages/b599db/
categories: 
  - 大前端
  - 应用基础
  - 性能优化
---

# 前言

前端优化有个原则，叫资源懒加载。

对于某些js资源，我们在页面load前并不需要用到，加载反而会影响到首屏速度。

把这些js放到 load 后进行加载，我们称之为js异步加载。

<!--more-->

# 异步加载的手段

## 1. 最简单的做法：Script Dom


```js
var script = document.createElement("script")
script.src="xxx.js"
document.head.appendChild(script)
```
多个js我们进行循环即可

### 存在的问题：
1. 大部分浏览器不会顺序执行script,(firefox、opera某些版本可以)，对于有依赖的脚本会出现各种未定义错误和逻辑错误

## 2. script onload后再发起请求，按序下载-执行
```js
// 顺序下载和执行
AsyncLoad.sync = (function () {
  /**
   * 加载js并放入执行队列中
   * 
   * @param {string} url 
   * @param {string} [type="normal"] script类型，normal为普通js此外还有async、defer
   * @param {function} callback 
   */
  var normalQueue = []
  var deferQueue = []
  var processedNum = 0
  function loadScript(url, type, callback) {
    type = type || 'normal'
    switch (type) {
      case 'defer':
        var dqId = deferQueue.length
        //cached: <object>缓存成功 done: 是否执行script成功
        deferQueue[dqId] = { url: url, cached: false, done: false, onload: callback }
        break;
      case 'async':
        var script = document.createElement('script')
        script.onload = function () {
          if (callback) {
            callback();
          }
        }
        script.src = url
        document.head.appendChild(script)
        break;
      default:
        var nqId = normalQueue.length
        normalQueue[nqId] = { url: url, cached: false, done: false, onload: callback }
        break;
    }

  }
  //顺序执行
  function processScripts() {
    if (deferQueue.length > 0) {
      normalQueue = normalQueue.concat(deferQueue)
      deferQueue = []
    }
    // 遇到有src的就中断执行
    if (processedNum < normalQueue.length) {
      var head = document.head;
      var newScript = document.createElement('script');
      newScript.type = 'text/javascript';
      newScript.src = normalQueue[processedNum].url;
      newScript.onload = function () {
        processScripts();
      }
      newScript.onerror=newScript.onload
      processedNum++;
      head.appendChild(newScript);
    }
  };
  return {
    loadScript: loadScript,
    processScripts: processScripts
  }
})()
```

用法(后面的方法就把 sync 换成各自方法名)：
```js
   var AL = AsyncLoad.sync
   AL.loadScript('./js/d.js', 'defer', () => console.log("defer 1 加载完毕"))
   AL.loadScript('./js/a.js', 'normal', () => console.log("a.js加载完毕"))
   AL.loadScript('./js/b.js', '', () => console.log("async 1 加载完毕")) 
```
### 存在的问题：
1. 与浏览器页面解析时的并发下载顺序执行逻辑不同，不能充分利用IO/CPU的并行操作，耗时会较久。且当出现某个资源请求较久时会影响会更严重。

## 3. XHR+eval

利用ajax请求js数据，保存响应内容，并按序eval。可以做到并行下载，按序执行

```js
AsyncLoad.xhr = (function () {

  var queuedScripts = []
  function loadScript(url, type, onload) {
    type = type || 'normal'
    var iQ = queuedScripts.length;

    //如果需要按顺序执行，并将脚本对象放入数组
    if (type !== 'async') {
      var qScript = { response: null, onload: onload, done: false };
      queuedScripts[iQ] = qScript;
    }

    //调用AJAX
    var xhrObj = getXHRObject();
    xhrObj.onreadystatechange = function () {
      if (xhrObj.readyState == 4) {


        if (type !== 'async') {
          queuedScripts[iQ].response = xhrObj.responseText;
          injectScripts();

          //如果不需要按顺序执行，即立即加载脚本
        } else {
          eval(xhrObj.responseText);
          if (onload) {
            onload();
          }
        }
      }
    };
    xhrObj.open('GET', url, true);
    xhrObj.send('');
  }
  function injectScripts() {
    var len = queuedScripts.length;
    for (var i = 0; i < len; i++) {
      var qScript = queuedScripts[i];

      //已加载的脚本
      if (!qScript.done) {

        //如果响应未返回 立即停止
        if (!qScript.response) {
          break;

          //执行脚本
        } else {
          eval(qScript.response);
          if (qScript.onload) {
            qScript.onload();
          }
          qScript.done = true;
        }
      }
    }
  }
  //AJAX对象
  function getXHRObject() {
    var xhrObj = false;
    try {
      xhrObj = new XMLHttpRequest();
    }
    catch (e) {
      var aTypes = ["Msxm12.XMLHTTP6.0",
        "Msxm12.XMLHTTP3.0",
        "Msxm12.XMLHTTP",
        "Microsoft.XMLHTTP"];
      var len = aTypes.length;
      for (var i = 0; i < len; i++) {
        try {
          xhrObj = new ActiveXObject(aTypes[i]);
        }
        catch (e) {
          continue;
        }
        break;
      }
    }
    finally {
      return xhrObj;
    }
  }
  return {
    loadScript: loadScript,
    processScripts:()=>{}
  }
})()
```


### 存在的问题：
1. 跨域问题

## 4. object tag 预加载资源，script onload 按序下载(命中缓存)-执行

<a href="https://github.com/stevesouders/controljs/blob/master/control.js">contorl.js二次命中缓存实现并行下载顺序执行，但是它通过setTimeout查询是否执行完毕，比我的实现差点</a>

```js
AsyncLoad.object = (function () {
  /**
   * 加载js并放入执行队列中
   * 
   * @param {string} url 
   * @param {string} [type="normal"] script类型，normal为普通js此外还有async、defer
   * @param {function} callback 
   */
  var normalQueue = []
  var deferQueue = []
  var isExecuting = false //dom插入script到script执行完毕这段过程 取值为true
  var waitNum = 0 // 待执行injectScripts的个数
  function loadScript(url, type, callback) {
    type = type || 'normal'
    switch (type) {
      case 'defer':
        var dqId = deferQueue.length
        //cached: <object>缓存成功 done: 是否执行script成功
        deferQueue[dqId] = { url: url, cached: false, done: false, onload: callback }
        preload(deferQueue[dqId])
        break;
      case 'async':
        var script = document.createElement('script')
        script.onload = function () {
          if (callback) {
            callback();
          }
        }
        script.src = url
        document.head.appendChild(script)
        break;
      default:
        var nqId = normalQueue.length
        normalQueue[nqId] = { url: url, cached: false, done: false, onload: callback }
        preload(normalQueue[nqId])
        break;
    }

  }
  /**
   * 
   * 
   * 
   * @param {any} item 队列元素
   */
  function preload(item) {
    //chrome会出现Resource interpreted as Document but transferred with MIME type application/javascript警告
    var obj = document.createElement('object');
    // console.log(item.url, 'preload...')
    obj.onload = function () {
      // console.log(item.url, 'object cached...', isExecuting, waitNum)
      //触发script标签插入
      item.cached = true
      obj.onload = null
      if (isExecuting) {
        waitNum++
      } else {
        waitNum += injectScripts()
      }

    }
    obj.onerrot = obj.onload
    obj.data = item.url
    obj.width = 1;
    obj.height = 1;
    obj.style.visibility = "hidden";
    obj.type = "text/plain";
    document.body.appendChild(obj)
  }
  function injectScripts() {
    if (deferQueue.length > 0) {
      normalQueue = normalQueue.concat(deferQueue)
      deferQueue = []
    }
    var num = 1
    for (var i = 0; i < normalQueue.length; i++) {
      var normal = normalQueue[i];
      if (!normal.done) {
        if (normal.cached) {
          num = 0
          syncExcuteScript(normal)
        }
        break;
      }
    }
    return num
  }
  function syncExcuteScript(item) {
    // console.log(item.url, 'pre insertScript...', isExecuting, waitNum)
    isExecuting = true
    var script = document.createElement("script")
    script.onload = function () {
      isExecuting = false
      // console.log(item.url, 'completed', isExecuting, waitNum)
      script.onload = null
      item.done = true
      if (item.onload) {
        item.onload();
      }
      if (waitNum) {
        waitNum--
        waitNum += injectScripts()
      }
    }
    script.onerror = script.onload
    script.src = item.url
    document.head.appendChild(script)
  }
  return {
    loadScript: loadScript,
    processScripts:()=>{}
  }
})()
```
### 存在的问题：
1. 创建`<object/>`后，需要插入文档才会发起请求（dom操作耗时），浏览器还会构建一个blob对象（挺耗时的），且即使命中本地缓存也有些许耗时，总体并没有方法2 顺序下载执行来的快
2. 不论是否有缓存，都会发起两次请求，当js全被缓存的时候，该做法比方法2慢的多

## 5. new Image().src 预加载资源，script onload 按序下载(命中缓存)-执行

相比object tag的一个好处是不需要进行dom操作，不用构建blob对象，总体速度比前几种方法都快

```js
AsyncLoad.img = (function () {
  /**
   * 加载js并放入执行队列中
   * 
   * @param {string} url 
   * @param {string} [type="normal"] script类型，normal为普通js此外还有async、defer
   * @param {function} callback 
   */
  var normalQueue = []
  var deferQueue = []
  var isExecuting = false //dom插入script到script执行完毕这段过程 取值为true
  var waitNum = 0 // 待执行injectScripts的个数
  function loadScript(url, type, callback) {
    type = type || 'normal'
    switch (type) {
      case 'defer':
        var dqId = deferQueue.length
        //cached: <object>缓存成功 done: 是否执行script成功
        deferQueue[dqId] = { url: url, cached: false, done: false, onload: callback }
        preload(deferQueue[dqId])
        break;
      case 'async':
        var script = document.createElement('script')
        script.onload = function () {
          if (callback) {
            callback();
          }
        }
        script.src = url
        document.head.appendChild(script)
        break;
      default:
        var nqId = normalQueue.length
        normalQueue[nqId] = { url: url, cached: false, done: false, onload: callback }
        preload(normalQueue[nqId])
        break;
    }

  }
  /**
   * 
   * 
   * 
   * @param {any} item 队列元素
   */
  function preload(item) {
    //chrome会出现Resource interpreted as Document but transferred with MIME type application/javascript警告
    var img = new Image();
    console.log(item.url, '预加载')
    img.onload = function () {
      console.log(item.url, 'img cached 结束', isExecuting, waitNum)
      //触发script标签插入
      item.cached = true
      img.onload = null
      if (isExecuting) {
        waitNum++
      } else {
        waitNum += injectScripts()
      }

    }
    img.onerror = img.onload
    img.src = item.url
  }
  function injectScripts() {
    
    if (deferQueue.length > 0) {
      console.log('normalQueue.concat(deferQueue)',JSON.stringify(deferQueue))
      normalQueue = normalQueue.concat(deferQueue)
      deferQueue = []
    }
    var num = 1
    for (var i = 0; i < normalQueue.length; i++) {
      var normal = normalQueue[i];
      if (!normal.done) {
        if (normal.cached) {
          num = 0
          syncExcuteScript(normal)
        }
        break;
      }
    }
    return num
  }
  function syncExcuteScript(item) {
    console.log(item.url, '预插入<script>', isExecuting, waitNum)
    isExecuting = true
    var script = document.createElement("script")
    script.onload = function () {
      isExecuting = false
      console.log(item.url, 'js 执行完毕', isExecuting, waitNum)
      script.onload = null
      item.done = true
      if (item.onload) {
        item.onload();
      }
      if (waitNum) {
        waitNum--
        waitNum += injectScripts()
      }
    }
    script.onerror = script.onload
    script.src = item.url
    document.head.appendChild(script)
  }
  return {
    loadScript: loadScript,
    processScripts:()=>{console.log(normalQueue)}
  }
})()
```
### 存在的问题：
1. 不论是否有缓存，都会发起两次请求（尽管第二次是命中本地缓存），当js全被缓存的时候，该做法比方法2稍慢；
2. 浏览器设置禁用缓存时该方案更慢
3. ~~出现过img请求某些js时响应不完整，导致第二次请求不走缓存仍是完整请求 （留个坑，具体原因待分析）~~ 
  > 第二次其实不是完整请求，响应码为206表示返回部分内容，应该是和第一次请求进行合并处理。具体技术细节还不清楚，但目前来看走的流量并不会多。

#### **补充：**
> 浏览器开发者工具开启 **Disable cache**后，任何请求都不会走本地强缓存，但是会走304协商缓存（强制刷新除外）\
> 未开启**Disable cache**的状态下，ctrl+F5强制刷新，对于`page load`前的请求，都是不走缓存(强缓存和协商缓存`cache-control:no-cache`)的，但是`page load`后的请求不受限制可以走缓存

## 6. 最终方案

### **LABjs v3.0**的方案：

1. 对于支持`<link rel="preload" href="xxx.js" as="script">`的浏览器【chrome50+、safari 11+】，则用preload进行预加载（请求会复用，不用担心与script.src同时发起会发两个请求），只要支持就加上
2. 对于支持async的，即`document.createElement("script").async === true`【IE>=10 ,其他浏览器大部分版本】,在方案1的基础上设置一个`script.async=false`即可
3. 对于其他浏览器，采用方案2做法

PS: preload 和 prefetch 的区别可以参考：<a href="https://www.w3cplus.com/performance/reloading/preload-prefetch-and-priorities-in-chrome.html">Preload，Prefetch 和它们在 Chrome 之中的优先级</a>

PS2: **preload预加载后，插入script节点不会发起请求，不是命中本地缓存的方式（200 from cache）。也就是说即使禁用缓存，后续也不会进行重复请求！**

### 优化
正常来说，`async=false`即可解决大部分浏览器，剩下的就是IE9版本及以下，以及其他浏览器的某些版本

本方案会利用IE的特性优化方案2做法，实现并行下载按序执行：IE系列 设置script.src 后即发起请求，插入dom才执行

对于不支持`async属性`、`async=false`不会按序执行的(如Safari 5.0)，则利用方案5做法。

从产品层面考虑，若担心方案5用户禁用缓存导致的双倍流量，则采用xhr预加载同域js eval+方案2。




# 参考文档

1. <a href="https://www.cnblogs.com/Darlietoothpaste/p/6518631.html">异步加载脚本保持执行顺序</a>
2. <a href="https://www.html5rocks.com/en/tutorials/speed/script-loading/">Deep dive into the murky waters of script loading</a>
3. <a href="https://github.com/getify/LABjs/tree/v3.0">github LABjs3.0源码</a>