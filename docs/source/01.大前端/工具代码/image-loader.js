// !function (window) {
// 最高质量的数字标识
var MAX_QUALITY = 80
var ORIGIN = 'origin'
var WSQ = 'wsq'
// 后台可配置项
var settings = {
  // 支持background-image查询的css域名列表
  // cssHostList: [window.location.host],
  //是否开启懒加载
  isLazyLoad: true,
  // 懒加载策略
  lazyLoadStrategy: {
    // 当图像加载时相对于视口进行调整。正值会使图像更快加载，负值会使图像稍后加载 取值与CSS的vh一致，100表示一个视窗高度
    threshold: 0,
    // 载入动画效果：show(直接显示),fadeIn(淡入),slideDown(下拉)
    effect: "show",
    //用户无滚动操作timeout(ms)后，加载剩余图片, -1表示不操作
    timeout: 10000,
    // 懒加载时机，可选DOMContentLoaded、load
    occasion: "load"
  },
  // 支持分层加载的图片url域名列表
  // imgHostList: [window.location.host, 'img-blog.csdn.net', 'avatar.csdn.net', 'csdnimg.cn'],//blog.csdn
  imgHostList: [window.location.host],
  // 进行图片url替换的散列域名列表
  // hashHostList: ['example.com'],
  // bandwidth-quality-ttl
  bandwidthQualityTtlList: [{ bandwidth: 1024, quality: 20, ttl: 3600 }, { bandwidth: 4096, quality: 60, ttl: 36000 }, { bandwidth: 10240, quality: 80, ttl: 360000 }],
  // 首屏图片策略
  firstScreenStrategy: {
    //图片质量 high表示最高，navigation表示需要计算 performance navigation得到对应带宽
    quality: "navigation"
  }
}
//默认 write 方法
var docwrite = document.write;
var docwriteln = document.writeln;
// 初始化配置
function init() {
  //默认10M带宽
  var defaultBandwidth = 10240
  try {
    Object.defineProperty(BandwidthQuality, "bandwidth", {
      enumerable: true,
      configurable: true,
      set: function (newValue) {
        this._bandwidth = newValue
        var bqt = settings.bandwidthQualityTtlList
        if (bqt.length > 0) {
          var i = 1
          for (; i < bqt.length; i++) {
            if (newValue < bqt[i].bandwidth) {
              this.quality = bqt[i - 1].quality
              break;
            }
          }
          if (i === bqt.length) {
            this.quality = bqt[bqt.length - 1].quality
          }
        }
      },
      get: function () {
        return this._bandwidth || defaultBandwidth
      }
    })
  } catch (error) {
    //ie8 fixed
    BandwidthQuality.bandwidth = defaultBandwidth
  }


  var dataHeader = "data-image-settings"
  var scriptEle = Util.getCurrentScript()
  var result = scriptEle.getAttribute(dataHeader)
    // settings设置
    ; (function (result) {
      if (result) {
        try {
          result = JSON.parse(result)
        } catch (error) {
          console.warn(error)
          return
        }
        // 合并配置
        for (key in result) {
          if (typeof result[key] === "object" && settings[key]) {
            for (var ckey in result[key]) {
              settings[key][ckey] = result[key][ckey]
            }
          } else {
            settings[key] = result[key]
          }
        }
        // 设置默认带宽
        var bqt = settings.bandwidthQualityTtlList
        bqt.sort(function (a, b) {
          return a.bandwidth - b.bandwidth
        })
        if (bqt.length > 0) {
          //在defineProperty之后
          BandwidthQuality.bandwidth = bqt[bqt.length - 1].bandwidth
        }
      }
    })(result)
  //QualityTtl设置
  var sbqt = settings.bandwidthQualityTtlList
  for (var i = 0; i < sbqt.length; i++) {
    QualityTtl[sbqt[i].quality] = sbqt[i].ttl
  }
  wrapWindow(window)
}
//对原生方法和属性进行重写
function wrapWindow(window) {
  var gBrowser = Util.getBrowser();
  var wrapSetSrc = function (val) {
    if (val.indexOf("data:image") === -1 && Util.inlist(val, settings.imgHostList)) {
      return Util.getNewUrlFromCache(val, MAX_QUALITY).url
    }
    return val
  }
  var wrapSetSrcSet = function (val) {
    var urlList = Util.getUrlListInSrcset(val)
    var newUrlList = []
    for (var j = 0; j < urlList.length; j++) {
      if (!Util.inlist(urlList[j], settings.imgHostList)) {
        newUrlList.push(urlList[j])
      } else {
        var res = Util.getNewUrlFromCache(urlList[j], BandwidthQuality.quality)
        newUrlList.push(res.url)
        //srcset中url进行更新
        Util.updateStorage(res.nqurl, res.q, res.url)
      }
    }
    return Util.replaceSrcSet(srcset, newUrlList)
  }

  var wrapSetOrigin = function (val) {
    return val
  }
  var wrapSetAttribute = function (args) {
    if ((args[0] === "src" || args[0] === "href" || args[0] === "data") && typeof args[1] === "string" && args[1].indexOf("data:image") === -1 && Util.inlist(args[1], settings.imgHostList)) {
      args[1] = Util.getNewUrlFromCache(args[1], MAX_QUALITY).url
    }
  }
  var callback = function (node, useParent) {
    setTimeout(function () {
      nodeList = nodeList.concat(Util.queryImgNodeList(useParent ? node.parentNode : node))
      LazyLoad.check()
    }, 5);
  }
  try {
    NodeWriter.wraptSet(window.HTMLImageElement.prototype, 'src', wrapSetSrc);

    window.HTMLSourceElement && NodeWriter.wraptSet(window.HTMLSourceElement.prototype, 'src', wrapSetSrc);
    // ie8 设置srcset会报错：属性不能同时具有取值函数和值
    if (!((gBrowser.name === "IE" || gBrowser.name === 'MSIE') && gBrowser.version === "8")) {
      NodeWriter.wraptSet(window.HTMLImageElement.prototype, 'srcset', wrapSetSrcSet);
      NodeWriter.wraptSet(window.HTMLSourceElement.prototype, 'srcset', wrapSetSrcSet);
    }
    window.HTMLVideoElement && NodeWriter.wraptSet(window.HTMLVideoElement.prototype, 'poster', wrapSetSrc);

    var EleProto = ((gBrowser.name === "IE" || gBrowser.name === 'MSIE') && window.HTMLElement) ? window.HTMLElement.prototype : window.Element.prototype

    NodeWriter.wrapInvoke(EleProto, 'insertAdjacentHTML', null, callback, true);
    NodeWriter.wrapInvoke(window.Element.prototype, 'setAttribute', wrapSetAttribute, null);
    NodeWriter.wraptSet(EleProto, 'innerHTML', wrapSetOrigin, callback);
    NodeWriter.wraptSet(EleProto, 'outerHTML', wrapSetOrigin, callback, true);
    NodeWriter.wraptSet(EleProto, 'className', wrapSetOrigin, callback);
    //classList 的处理,可以监听，但是无法关联到具体Element
    // NodeWriter.wrapInvoke(window.DOMTokenList.prototype, 'toggle', callback);
    // NodeWriter.wrapInvoke(window.DOMTokenList.prototype, 'replace', callback);
    // NodeWriter.wrapInvoke(window.DOMTokenList.prototype, 'add', callback);
    //document.write处理
    NodeWriter.enable(true)
  } catch (error) {
    console.error('原生属性方法重写出错：', error)
  }

}

function DOMContentLoadedEvent() {
  if (settings.firstScreenStrategy.quality === "navigation") {
    try {
      BandwidthQuality.bandwidth = Util.getNavigationBandwidth()
    } catch (error) {
      console.warn("gahing:", error)
    }

  }
  nodeList = nodeList.concat(Util.queryImgNodeList())
  nodeList.sort(function (a, b) { return a.top - b.top })
  if (settings.isLazyLoad && settings.lazyLoadStrategy.occasion === "DOMContentLoaded") {
    LazyLoad.handlers(true)
  } else {
    //无懒加载或不在这个阶段懒加载，则仅显示首屏原图
    LazyLoad.check()
  }

}

function LoadEvent() {
  try {
    BandwidthQuality.bandwidth = Util.getMeasureBandwidth()
  } catch (error) {
    console.warn("gahing:", error)
  }
  if (settings.isLazyLoad) {
    if (settings.lazyLoadStrategy.occasion === "load") {
      LazyLoad.handlers(true)
    }
  } else {
    //无懒加载 剩余handled=false节点原图
    LazyLoad.check(true)
  }
}

// 定义节点
function WsNode(type, node, top, url) {
  //节点类型：picture、img、video、style、css
  this.type = type
  //具体节点
  this.node = node
  //节点到文档顶部距离，用于排序，首屏优先加载
  this.top = top
  // for background-image
  this.url = url
  //是否已处理过
  this.handled = false
  this.events = {}
  var that = this
  this.on('appear', function temp() {
    that.handled = true
    LazyLoad.setSource(that)
    that.off('appear', temp)
  })
}
WsNode.prototype.on = function (eventName, callback) {
  this.events[eventName] = this.events[eventName] || []
  this.events[eventName].push(callback)
}
WsNode.prototype.off = function (eventName, callback) {
  for (var i = 0, len = this.events[eventName].length; i < len; i++) {
    if (this.events[eventName][i] === callback) {
      this.events[eventName].splice(i, 1);
    }
  }
}
// 触发事件函数
WsNode.prototype.emit = function (eventName, _) {
  var events = this.events[eventName]
  var args = Array.prototype.slice.call(arguments, 1)

  if (!events) {
    return
  }
  for (var i = 0, m = events.length; i < m; i++) {
    events[i].apply(null, args)
  }
}
var nodeList = []
// 当前带宽与原图质量
var BandwidthQuality = {
  quality: 100
}
var QualityTtl = {}
// 工具类
var Util = (function () {
  //资源加载相关数据过滤
  function filterPerformanceTiming(v) {
    // 过滤200 from cache,204 3xx,小资源
    return v.transferSize > 200 && (v.encodedBodySize > 0 || v.transferSize > 1000) && (v.responseEnd - v.responseStart) > 2
  }
  function existParamFormUrl(url, param) {
    var mu = parseUrl(url)
    return mu.params[param] !== undefined
  }
  //判断url数组是否存在某个url的host满足正则list
  function inlist(url, list, isReg) {
    if (!url || list.length === 0) {
      return false
    }
    if (Object.prototype.toString.call(url) !== "[object Array]") {
      url = [url]
    }
    for (var i = 0; i < url.length; i++) {
      var mu = parseUrl(url[i])
      if (!isJpgImgUrl(url[i]) || existParamFormUrl(url[i], ORIGIN)) continue;
      var host = parseUrl(url[i]).hostname
      for (var j = 0; j < list.length; j++) {
        if ((isReg ? new RegExp(list[j]).test(host) : host === list[j])) {
          return true
        }
      }
    }
    return false
  }
  //获取background-image中的url地址
  var getBackgroundImageUrl = function (str) {
    var url = null;
    if (str && str.indexOf("url(") >= 0 && str.indexOf("data:image") === -1) {
      if (str.indexOf('"') >= 0) {
        url = str.substring(5, str.length - 2)
      } else {
        //ie fixed
        url = str.substring(4, str.length - 1)
      }
    }
    return url
  }
  //获取srcset中的url列表
  var getUrlListInSrcset = function (srcset) {
    var list = []
    var srcsetList = srcset.split(",")
    for (var j = 0; j < srcsetList.length; j++) {
      list.push(srcsetList[j].split(" ")[0])
    }
    return list
  }
  //所有字符的ascii码之和
  function getAsciiSum(str) {
    var sum = 0
    for (var i = 0; i < str.length; i++) {
      sum += str[i].charCodeAt(0)
    }
    return sum
  }
  // 返回一个更高质量图片缓存记录的对象 
  function getHQImgFromStorage(url, quality) {
    var res = {
      url: url,
      q: quality,
      nqurl: url
    }
    var storage = window.localStorage
    if (typeof storage !== "object") return res;
    if (storage[url]) {
      var list = JSON.parse(storage[url])
      //寻找quality更大且未过期的
      var nowTime = new Date().getTime()
      var maxQ = quality
      for (var i = 0; i < list.length; i++) {
        if (list[i].q >= maxQ && list[i].expired > nowTime) {
          console.log("寻找到更高质量图片：", list[i].q, url)
          maxQ = list[i].q
        }
      }
      res.q = maxQ
    }
    var mu = parseUrl(url)
    res.url = addToUrl(mu.source, WSQ, res.q).href
    return res
  }
  // url带上新的参数
  function addToUrl(a, key, value) {
    var query = a.search
    if (query) {
      a.search = query + "&" + key + "=" + value
    } else {
      a.search = key + "=" + value
    }
    return a
  }
  // url替换，返回值为{url:新的url,nqurl:不带图片质量的url,q:图片质量}
  function getNewUrlFromCache(url, quality) {
    if (!url) return {}
    var mu = parseUrl(url)
    var a = addToUrl(mu.source, ORIGIN, 1)
    var res = getHQImgFromStorage(a.href, quality)
    // console.log(res)
    return res
  }
  ////去除两端空格 兼容ie8 
  function trim(str) {
    return str.replace(/(^\s*)|(\s*$)/g, "")
  }
  function parseUrl(url) {
    var a = document.createElement("a")
    a.href = url
    //fixed ie8 href为相对路径时获取数据会出错的问题
    a.href = a.href
    var arr = a.pathname.split("/")
    var filename = arr[arr.length - 1]
    var sufList = filename.split(".")
    return {
      port: a.port,
      //带端口
      host: a.host,
      //ie8 port=80时会返回 hostname:80 而不是hostname
      hostname: a.port === "80" ? a.hostname : a.host,
      pathname: a.pathname,
      source: a,
      filename: filename,
      //文件名后缀
      suffix: sufList[sufList.length - 1],
      params: (function () {
        var ret = {}
        var seg = a.search.replace(/^\?/, '').split('&')
        var len = seg.length
        var s
        for (var i = 0; i < len; i++) {
          if (!seg[i]) { continue; }
          s = seg[i].split('=');
          ret[s[0]] = s[1];
        }
        return ret;
      })()
    }
  }
  // 将srcset的字符串中的url替换为新的url
  function replaceSrcSet(srcset, urlList) {
    var newSrcset = ""
    var arr = srcset.split(',')
    for (var i = 0; i < arr.length; i++) {
      newSrcset += urlList[i]

      var tmp = trim(arr[i])
      var tmparr = tmp.split(" ")
      if (tmparr.length > 1) {
        newSrcset += " " + tmparr[tmparr.length - 1]
      }
      if (i != arr.length - 1) {
        newSrcset += ','
      }
    }
    return newSrcset
  }
  //更新storage,url非空说明是img onload后的处理
  function updateStorage(nqurl, quality, url) {
    var storage = window.localStorage
    if (typeof storage !== "object") return;
    var list
    var nowTime = new Date().getTime()
    var expired = (QualityTtl[quality] || 3600) * 1000 + nowTime
    if (storage[nqurl]) {
      list = JSON.parse(storage[nqurl])
      //寻找quality更大且未过期的
      var fq = false
      for (var i = 0; i < list.length; i++) {
        if (list[i].q === quality) {
          fq = true
          //无缓存加载 或 未命中缓存
          if ((url && !Util.isCacheLoad(url)) || list[i].expired < nowTime) {
            list[i].expired = expired
          }
          break;
        }
      }
      if (!fq) {
        list.push({
          q: quality,
          expired: expired
        })
      }
    } else {
      list = [{
        q: quality,
        expired: expired
      }]
    }
    storage[nqurl] = JSON.stringify(list)

  }
  // 判断是否为缓存加载
  function isCacheLoad(url) {
    if (!window.performance || !window.performance.getEntriesByName) {
      return true
    }
    var list = window.performance.getEntriesByName(url)
    if (!list || list.length === 0) {
      //未找到相关资源
      return true
    }
    return !filterPerformanceTiming(list[0])


  }
  // requestAnimationFrame 兼容写法
  function requestAnimFrame(fn) {
    var raf = window.requestAnimationFrame ||
      // for old chrome ff
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      //for ie8
      function (callback) {
        window.setTimeout(callback, 6000 / 60);
      };
    return raf(fn)
  }
  //判断是否为jpg的链接
  function isJpgImgUrl(url) {
    // return true
    var mu = parseUrl(url)
    return mu.suffix === "jpg" || mu.suffix === "jpeg"
  }
  //获取元素上最终应用的backgroundImage属性，兼容ie8
  function getStyleBackgroundImage(element) {
    if (window.getComputedStyle) {
      return window.getComputedStyle(element).backgroundImage;
    } else {
      return element.currentStyle.backgroundImage;
    }
  }
  //获取浏览器信息
  function getBrowser() {
    var ua = navigator.userAgent, tem,
      M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if (/trident/i.test(M[1])) {
      tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
      return {
        name: 'IE',
        version: (tem[1] || '')
      };
    }
    if (M[1] === 'Chrome') {
      tem = ua.match(/\bOPR|Edge\/(\d+)/)
      if (tem != null) {
        return {
          name: 'Opera',
          version: tem[1]
        };
      }
    }
    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
    if ((tem = ua.match(/version\/(\d+)/i)) != null) {
      M.splice(1, 1, tem[1]);
    }
    return {
      name: M[0],
      version: M[1]
    };
  }
  var getScriptFromURL = function (url, scripts) {
    for (var i = 0; i < scripts.length; i++) {
      if (scripts[i].src === url) {
        return scripts[i];
      }
    }
    return undefined;
  }
  return {

    //获取当前脚本节点
    getCurrentScript: function () {
      if (document.currentScript) {
        return document.currentScript
      }
      var nodes = document.querySelectorAll("script")
      for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].readyState === "interactive") {
          return nodes[i]
        }
      }
      //for ie11外链src
      var stack;
      try {
        //强制报错,以便捕获e.stack
        wsundefined
      } catch (e) {
        stack = e.stack;
        console.log("stack", stack)
        if (!stack && window.opera) {
          //opera 9没有e.stack,但有e.Backtrace,但不能直接取得,需要对e对象转字符串进行抽取
          stack = (String(e).match(/of linked script \S+/g) || []).join(" ");
        }
        console.log("stack", stack)
      }
      var scripts = document.querySelectorAll("script")
      if (stack) {
        stack = stack.split(/[@ ]/g).pop();//取得最后一行,最后一个空格或@之后的部分
        stack = stack[0] == "(" ? stack.slice(1, -1) : stack;
        stack = stack.replace(/(:\d+)?:\d+$/i, "");//去掉行号与或许存在的出错字符起始位置
        console.log("stack", stack)
        var srcScript = getScriptFromURL(stack, scripts)
        if (srcScript) return srcScript
      }
      // 从后向前找，第一个无src属性的script，尽管他可能是错的。。。
      for (i = scripts.length - 1; i >= 0; i--) {
        if (!scripts[i].hasAttribute("src")) {
          return scripts[i]
        }
      }
      return scripts[scripts.length - 1]
    },
    // DOMContentloaded事件监听器兼容写法
    ready: function (fn) {
      if (document.addEventListener) {
        document.addEventListener('DOMContentLoaded', fn, false);
      } else if (document.attachEvent) {
        // 确保当页面是在iframe中加载时，事件依旧会被安全触发
        document.attachEvent('onreadystatechange', function () {
          if (document.readyState == 'complete') {
            fn();
          }
        });
      }
    },
    // 事件绑定 兼容写法
    compatibleAddEventListener: function (evt, fn, target) {
      target = target || window
      if (target.addEventListener) {
        target.addEventListener(evt, fn, false)
      } else if (target.attachEvent) {
        target.attachEvent("on" + evt, fn)
      } else {
        target["on" + evt] = fn;
      }
    },
    compatibleRemoveEventListener: function (evt, fn, target) {
      target = target || window
      if (target.removeEventListener) {
        target.removeEventListener(evt, fn, false)
      } else if (target.attachEvent) {
        target.detachEvent("on" + evt, fn)
      } else {
        target["on" + evt] = null;
      }
    },
    //获取文档下载带宽
    getNavigationBandwidth: function () {
      if (!window.performance || !window.performance.getEntriesByType) {
        throw new Error("不支持performance")
      } else {
        var timing = performance.getEntriesByType("navigation")[0]
        if (filterPerformanceTiming(timing)) {
          return timing.transferSize / (timing.responseEnd - timing.responseStart)
        } else {
          throw new Error("无满足的performanceNavigation对象")
        }
      }
    },
    // 扫描记录图像节点
    queryImgNodeList: function (doc) {
      doc = doc || document
      var setAttr = function (ele) {
        ele.setAttribute("wsload", "true")
      }
      var hasWsloadAttr = function (ele) {
        return ele.getAttribute("wsload") === "true"
      }
      var list = []
        //获取picture节点
        ; (function () {
          var pictureList = doc.querySelectorAll("picture");
          for (var i = 0; i < pictureList.length; i++) {
            //仅img子节点存在时进行下一步判断，一般都会有img子节点
            if (!hasWsloadAttr(pictureList[i]) && pictureList[i].querySelectorAll("img").length) {
              var urlList = []
              var childList = pictureList[i].querySelectorAll("source,img")
              for (var j = 0; j < childList.length; j++) {
                var srcset = childList[j].getAttribute("srcset")
                var src = childList[j].getAttribute("src")
                if (srcset) {
                  urlList = urlList.concat(getUrlListInSrcset(srcset))
                } else if (src && src.indexOf("data:image") === -1) {
                  urlList.push(src)
                }
              }
              if (urlList.length > 0 && inlist(urlList, settings.imgHostList)) {
                setAttr(pictureList[i])
                list.push(new WsNode('picture', pictureList[i], pictureList[i].querySelectorAll("img")[0].getBoundingClientRect().top))
              }
            }
          }
        })()
        // 获取video节点
        ; (function () {
          var videoList = doc.querySelectorAll("video");
          for (var i = 0; i < videoList.length; i++) {
            var poster = videoList[i].getAttribute("poster")
            if (!hasWsloadAttr(videoList[i]) && poster && poster.indexOf("data:image") === -1 && inlist(poster, settings.imgHostList)) {
              setAttr(videoList[i])
              list.push(new WsNode('video', videoList[i], videoList[i].getBoundingClientRect().top))
            }
          }
        })()
        // 获取img节点
        ; (function () {
          var imgList = doc.querySelectorAll("img");
          var addFunc = function (node) {
            if (!hasWsloadAttr(node) && node.parentNode.nodeName !== "PICTURE") {
              var urlList = []
              var srcset = node.getAttribute("srcset")
              var src = node.getAttribute("src")
              if (srcset) {
                urlList = getUrlListInSrcset(srcset)
              } else if (src && src.indexOf("data:image") === -1) {
                urlList.push(src)
              }
              if (urlList.length > 0 && inlist(urlList, settings.imgHostList)) {
                setAttr(node)
                list.push(new WsNode('img', node, node.getBoundingClientRect().top))
              }

            }
          }
          for (var i = 0; i < imgList.length; i++) {
            addFunc(imgList[i])
          }
        })()
        //获取background-image的节点
        ; (function () {
          var bglist = doc.querySelectorAll("*")
          var addFunc = function (node) {
            // 由于图片可能会改class 不做 hasWsloadAttr(node)判断
            if (node.nodeType === 1) {
              var url = getBackgroundImageUrl(getStyleBackgroundImage(node))
              if (url && inlist(url, settings.imgHostList)) {
                setAttr(node)
                list.push(new WsNode('bg', node, node.getBoundingClientRect().top, url))
              }
            }
          }
          addFunc(doc)
          for (var i = 0; i < bglist.length; i++) {
            addFunc(bglist[i])
          }

        })()
      return list
    },
    //算法测量带宽
    getMeasureBandwidth: function () {
      if (!window.performance || !window.performance.getEntries) {
        throw new Error("不支持performance")
      }
      // 初始化数据，过滤并排序
      function init() {
        var list = []
        list = performance.getEntries().filter(filterPerformanceTiming).map(function (v) {
          return {
            name: v.name,
            start: v.responseStart,
            end: v.responseEnd,
            size: v.transferSize,
            //KB/S
            speed: v.transferSize / (v.responseEnd - v.responseStart || 1)
          }
        })
        //按start升序
        list.sort(function (a, b) { return a.start - b.start })
        return list
      }
      //将响应分割为无关联的几组
      function splitTree() {
        //记录end的最大值，与当前start比较，若当前start>endMax 说明要分组
        var tree = []
        var curArr = [entryArr[0]]
        var curMax = entryArr[0].end
        var len = entryArr.length
        for (var i = 1; i < len; i++) {
          if (entryArr[i].start < curMax) {
            curArr.push(entryArr[i])
            curMax = curMax > entryArr[i].end ? curMax : entryArr[i].end
          } else {
            tree.push(curArr)
            curArr = [entryArr[i]]
            curMax = entryArr[i].end
          }
        }
        if (curArr.length > 0) {
          tree.push(curArr)
        }
        return tree
      }
      //获得某个时间点有多少并发
      function getCon(arr, t) {
        var con = 0
        for (var i = 0; i < arr.length; i++) {
          if (arr[i].start > t) break;
          if (arr[i].start < t && arr[i].end >= t) con++;
        }
        return con
      }
      //获取每组的均值
      function getArrAvg(arr) {
        // 将start,end放入并排序
        var set = new Set()
        var loss = 0.05 //并行下载的损耗率
        arr.forEach(function (v) {
          set.add(v.start)
          set.add(v.end)
        })
        var numArr = Array.from(set)
        numArr.sort(function (a, b) { return a - b })
        var conf = [0]
        //预处理得到每段的并发连接数
        for (var k = 1; k < numArr.length; k++) {
          conf.push(getCon(arr, numArr[k]))
        }
        //计算每条请求的速度
        var speedArr = []
        for (var i = 0; i < arr.length; i++) {
          var t = 0
          for (var j = 1; j < numArr.length; j++) {
            if (numArr[j] <= arr[i].start) continue;
            if (numArr[j] > arr[i].end) break;
            var con = conf[j]//getCon(arr, numArr[j])
            t += (numArr[j] - numArr[j - 1]) / (1 + (con - 1) * (1 - loss))
          }
          speedArr.push(arr[i].size / t)
        }
        // console.log(speedArr)
        // 每组总响应内容大小
        var sum = arr.reduce(function (sum, cur) { return sum + cur.size }, 0)
        var avg = 0
        //加权平均
        for (var u = 0; u < arr.length; u++) {
          avg += speedArr[u] * arr[u].size / sum
        }
        return avg
      }
      var entryArr = init()
      if (entryArr.length === 0) {
        throw new Error("没有资源")
      }
      var tree = splitTree(entryArr)
      var max = 0
      for (var g = 0; g < tree.length; g++) {
        var temp = getArrAvg(tree[g])
        max = max > temp ? max : temp
      }
      return max * 8
    },
    //是否以缓存模式加载（非强刷页面和disable cache），用于判断本地缓存是否需要更新
    isCacheLoad: isCacheLoad,
    getNewUrlFromCache: getNewUrlFromCache,
    getUrlListInSrcset: getUrlListInSrcset,
    replaceSrcSet: replaceSrcSet,
    updateStorage: updateStorage,
    inlist: inlist,
    getBackgroundImageUrl: getBackgroundImageUrl,
    requestAnimFrame: requestAnimFrame,
    isJpgImgUrl: isJpgImgUrl,
    getBrowser: getBrowser
  }
})()
// 资源加载相关
var LazyLoad = (function () {
  // 滚动条竖直滚动距离
  var prevLoc = getScrollY()
  //节流控制事件触发频率,上一个check执行完毕才会将下个check放进事件队列
  var ticking = false
  //视窗高度
  var windowHeight
  var debounceTimer = null
  // 懒加载是否结束
  var lazyStop = true
  //获取垂直方向已滚动的像素值
  function getScrollY() {
    var supportPageOffset = window.pageYOffset !== undefined;
    //ie有个文本模式
    var isCSS1Compat = ((document.compatMode || "") === "CSS1Compat");
    return supportPageOffset ? window.pageYOffset : isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop;
  }
  // 获取视口高度
  function getWindowInnerHeight() {
    var supportInnerHeight = window.innerHeight !== undefined
    var isCSS1Compat = ((document.compatMode || "") === "CSS1Compat");
    return supportInnerHeight ? window.innerHeight : isCSS1Compat ? document.documentElement.clientHeight : document.body.clientHeight
  }
  // 高频事件，节流触发
  function requestScroll() {
    prevLoc = getScrollY()
    requestFrame()
  }

  function requestFrame() {
    if (!ticking) {
      Util.requestAnimFrame(function () {
        if (settings.lazyLoadStrategy.timeout > 0) {
          updateDebounceTimer()
        }
        check()
      })
      ticking = true
    }
  }
  //元素距离文档顶部的距离，
  function getNodeTop(wsnode) {
    var top = 0
    switch (wsnode.type) {
      case 'picture': {
        top = wsnode.node.querySelectorAll("img")[0].getBoundingClientRect().top
        break;
      }
      default: {
        top = wsnode.node.getBoundingClientRect().top
        break;
      }
    }
    return top + prevLoc
  }
  //获取元素高度
  function getNodeOffsetHeight(wsnode) {
    var height
    switch (wsnode.type) {
      case 'picture': {
        height = wsnode.node.querySelectorAll("img")[0].offsetHeight
        break;
      }
      default: {
        height = wsnode.node.offsetHeight
        break;
      }
    }
    return height
  }
  // 结合懒加载策略判断元素是否在视窗上下threshold之间
  function inViewport(wsnode) {
    var viewTop = prevLoc
    var viewBot = viewTop + windowHeight

    var nodeTop = getNodeTop(wsnode)
    var nodeBot = nodeTop + getNodeOffsetHeight(wsnode)

    var offset = (settings.lazyLoadStrategy.threshold / 100) * windowHeight

    return (nodeBot >= viewTop - offset) && (nodeTop <= viewBot + offset)
  }
  // 新增Image并进行回调
  function newImageLoad(res, srcset, wsnode) {
    console.log("newImageLoad")
    var largeImg = new Image()
    largeImg.onload = function () {
      largeImg.onload = null
      if (wsnode.type === "img") {
        res.url && wsnode.node.setAttribute('src', res.url)
        if (srcset) {
          wsnode.node.setAttribute('srcset', srcset)
        }
      } else if (wsnode.type === "video") {
        wsnode.node.setAttribute('poster', res.url)
      } else {
        wsnode.node.style.backgroundImage = "url('" + res.url + "')"
      }
      Util.updateStorage(res.nqurl, res.q, res.url)
    }
    // just test
    largeImg.onerror = function () {
      largeImg.onerror = null
      if (wsnode.type === "img") {
        wsnode.node.setAttribute('src', res.url)
        if (srcset) {
          wsnode.node.setAttribute('srcset', srcset)
        }
      } else if (wsnode.type === "video") {
        wsnode.node.setAttribute('poster', res.url)
      } else {
        wsnode.node.style.backgroundImage = "url('" + res.url + "')"
      }
      Util.updateStorage(res.nqurl, res.q, res.url)
    }
    res.url && largeImg.setAttribute('src', res.url)
    srcset && largeImg.setAttribute('srcset', srcset)
  }
  // 原图加载
  function setSource(wsnode) {
    console.log('setSource')
    //避免element元素被其他操作删除时还会再次判断
    if (!wsnode.node) return
    if (wsnode.type === "picture") {
      var elementList = wsnode.node.querySelectorAll("source,img")
      for (var i = 0; i < elementList.length; i++) {
        var srcset = elementList[i].getAttribute("srcset")
        var src = elementList[i].getAttribute("src")
        if (srcset) {
          var urlList = Util.getUrlListInSrcset(srcset)
          var newUrlList = []
          for (var j = 0; j < urlList.length; j++) {
            if (!Util.inlist(urlList[j], settings.imgHostList)) {
              newUrlList.push(urlList[j])
            } else {
              var res = Util.getNewUrlFromCache(urlList[j], BandwidthQuality.quality)
              newUrlList.push(res.url)
              Util.updateStorage(res.nqurl, res.q)
            }
          }
          var newSrcset = Util.replaceSrcSet(srcset, newUrlList)
          elementList[i].setAttribute('srcset', newSrcset)
        } else if (src && src.indexOf("data:image") === -1 && Util.inlist(src, settings.imgHostList)) {
          var res = Util.getNewUrlFromCache(src, BandwidthQuality.quality)
          elementList[i].setAttribute('src', res.url)
          Util.updateStorage(res.nqurl, res.q)
        }
      }
    } else {
      var newSrcset
      var url
      if (wsnode.type === "img") {
        var srcset = wsnode.node.getAttribute("srcset")
        url = wsnode.node.getAttribute("src")
        if (srcset) {
          var urlList = Util.getUrlListInSrcset(srcset)
          var newUrlList = []
          for (var j = 0; j < urlList.length; j++) {
            if (!Util.inlist(urlList[j], settings.imgHostList)) {
              newUrlList.push(urlList[j])
            } else {
              var res = Util.getNewUrlFromCache(urlList[j], BandwidthQuality.quality)
              newUrlList.push(res.url)
              //srcset中url进行更新
              Util.updateStorage(res.nqurl, res.q, res.url)
            }
          }
          newSrcset = Util.replaceSrcSet(srcset, newUrlList)
        }
      } else if (wsnode.type === "video") {
        url = wsnode.node.getAttribute("poster")
      } else {
        url = wsnode.url
      }
      newImageLoad(Util.getNewUrlFromCache(url, BandwidthQuality.quality), newSrcset, wsnode)
    }
  }
  //滚动超时，全部图片加载
  function updateDebounceTimer() {
    console.log("启动/更新超时机制", new Date())
    window.clearTimeout(debounceTimer)
    debounceTimer = window.setTimeout(function () {
      check(true)
    }, settings.lazyLoadStrategy.timeout)
  }
  //启动/关闭懒加载
  function handlers(flag) {
    var action = flag ? 'addEventListener' : 'removeEventListener'
    var debounce
    if (flag) {
      lazyStop = false
      Util.compatibleAddEventListener('scroll', requestScroll)
      Util.compatibleAddEventListener('resize', requestScroll)
      if (settings.lazyLoadStrategy.timeout > 0) {
        updateDebounceTimer()
      }
    } else if (!lazyStop) {
      lazyStop = true
      console.log("懒加载结束")
      Util.compatibleRemoveEventListener('scroll', requestScroll)
      Util.compatibleRemoveEventListener('resize', requestScroll)
      // //注销所有节点的监听
      // for (var i = 0; i < nodeList.length; i++) {
      //   nodeList[i].events = {}
      // }
    }
  }
  //手动检查未触发过节点，all表示不进行inViewport判断
  function check(all) {
    windowHeight = getWindowInnerHeight()
    var allHandled = true
    for (var i = 0; i < nodeList.length; i++) {
      var node = nodeList[i]
      if (!node.handled) {
        if (all || inViewport(node)) {
          node.emit('appear')
        } else {
          allHandled = false
        }
      }
    }
    //所有节点都已处理完毕,由于可能动态增加节点，很难判断是否全部处理完毕，故这边只取消了懒加载的滚动监听
    if (allHandled) {
      handlers(false)
    }
    ticking = false
  }
  return {
    handlers: handlers,
    check: check,
    setSource: setSource
  }
})()
var NodeWriter = (function () {
  // write 重写/重置
  function enable(flag) {
    if (flag) {
      document.write = function () {
        for (var t = [], i = 0; i < arguments.length; i++)
          t[i] = String(arguments[i]);
        return write(t, false);
      };
      document.writeln = function () {
        for (var t = [], i = 0; i < arguments.length; i++)
          t[i] = String(arguments[i]);
        return write(t, true);
      };
    } else {
      document.write = docwrite
      document.writeln = docwriteln
    }

  }
  function write(params, hasEnter) {
    var script = Util.getCurrentScript()
    var paramsStr = params.join(hasEnter ? "\n" : "");
    script.insertAdjacentHTML("afterend", paramsStr)

  }
  function wraptSet(obj, attr, interceptor, callback, useParent) {
    var desc = Object.getOwnPropertyDescriptor(obj, attr);
    var original = desc.set;
    desc.set = function (value) {
      try {
        console.log("inject to attr:", obj, attr)
        var new_value = interceptor(value);
      } catch (err) {
        console.warn(err);
      } finally {
        if (callback) {
          callback(this, useParent)
        } else {
          //说明是元素的图片地址属性设置
          this.setAttribute("wsload", "true")
        }
        return original.call(this, new_value);
      }
    }
    Object.defineProperty(obj, attr, desc);
  }
  function wrapInvoke(obj, method, interceptor, callback, useParent) {
    var original = obj[method];
    obj[method] = function () {
      try {
        console.log("inject to method:", obj, method)
        interceptor && interceptor(arguments)
        callback && callback(this, useParent)
        return original.apply(this, arguments)
      } catch (err) {
        console.warn(err);
      }
    }
  }
  return {
    enable: enable,
    wraptSet: wraptSet,
    wrapInvoke: wrapInvoke
  }
})();
!(function () {
  init()
  Util.ready(DOMContentLoadedEvent)
  Util.compatibleAddEventListener("load", LoadEvent)
})()
// }(window)