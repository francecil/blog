/**
 * 异步下载，同步执行
 */
var AsyncLoad = {}
//利用xhr异步加载资源，下载资源有跨域问题
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
//利用 <object/>or <embed/> 异步加载资源 获取其中内容并eval
// 获取没问题，读取内容有跨域问题 
AsyncLoad.evalObj = (function () {
  /**
   * 加载js并放入执行队列中
   * 
   * @param {string} url 
   * @param {string} [type="normal"] script类型，normal为普通js此外还有async、defer
   * @param {function} callback 
   */
  var normalQueue = []
  var deferQueue = []
  function loadScript(url, type, callback) {
    type = type || 'normal'
    switch (type) {
      case 'defer':
        var dqId = deferQueue.length
        deferQueue[dqId] = { response: null, onload: callback, done: false }
        preload(deferQueue[dqId], url)
        break;
      case 'async':
        var script = document.createElement('script')
        script.src = url
        document.head.appendChild(script)
        break;
      default:
        var nqId = normalQueue.length
        normalQueue[nqId] = { response: null, onload: callback, done: false }
        preload(normalQueue[nqId], url)
        break;
    }

  }
  /**
   * 
   * 
   * 
   * @param {any} item 队列元素
   * @param {any} url script url
   */
  function preload(item, url) {
    //chrome会出现Resource interpreted as Document but transferred with MIME type application/javascript警告
    var obj = document.createElement('object');
    // obj.onload=function(){
    //   console.log(url,"加载完毕，其内容为：",document.getElementsByTagName('object')[0].contentDocument.getElementsByTagName('pre')[0].innerText)

    // }
    obj.data = url
    obj.width = 1;
    obj.height = 1;
    obj.style.visibility = "hidden";
    obj.type = "text/plain";
    document.body.appendChild(obj)
  }
  function IIFEEval(str) {

  }

  return {
    loadScript: loadScript,
    processScripts:()=>{}
  }
})()
//先用 <object/> 异步加载资源，然后再用<script/>命中缓存执行,对比流量和执行速度
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
//采用embed tag,结果与object tag类似，为h5标签 兼容性更差点
AsyncLoad.embed = (function () {
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
    var obj = document.createElement('embed');
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
    obj.src=item.url
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
//先用 <object/> 异步加载资源，然后再用<script/>命中缓存执行,对比流量和执行速度
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
//并行下载并不一定能利用带宽，能利用好js执行时的耗时用去下载才是加快速度
//或者检测到某条请求耗时较长，可以开启下一条请求？