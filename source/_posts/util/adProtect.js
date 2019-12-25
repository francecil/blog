(function () {
  if (window.letWebSitesCanShowAds !== undefined) {
      return;
  }
  // es6 兼容写法
  String.prototype.startsWith = String.prototype.startsWith || function (search, pos) {
      return this.substr(!pos || pos < 0 ? 0 : +pos, search.length) === search;
  };

  var prefix = window.__proto__.ws_prefix || '/wscdn/';
  var urlList = [
      "alicdn",
      "baidu",
      "behe",
      "biddingx",
      "mediav",
      "tanx",
      '&adnum=',
      '.html?ad_',
      '.html?clicktag=',
      '201802/somic99452hp100r2_0224',
      '300x150_',
      '300x250',
      '60mil',
      '?ad_ids=',
      'ad.gmw.cn',
      'ad/files',
      'adBottom',
      'adfront',
      'adm3.autoimg.cn/ad',
      'adpai.thepaper',
      'adservice',
      'adx.yiche.com/cityindex.ash',
      'adx.yiche.com/srv/getAdDataByDiv.ashx?insID',
      'ad_img',
      'affiliate',
      'alimama.com',
      'allyes',
      'api.zol.com',
      'autohome.com.cn/api/livepl',
      'autoimg.cn/engine/root',
      'beforelogin/beforelogin',
      'bitautoimg.com/ResourceFiles',
      'bjcathay.com/s?z=',
      'box_ad_',
      'cctv.com/Library',
      'cpro.zol.com.cn',
      'cpro.zol.com.cn/gaeici.js',
      'cpro/ui',
      'cr-nielsen.com',
      'csbew.com',
      'ctags.cn/9/',
      'd.yoyi.tv',
      'd0.xcar.com.cn',
      'd1.sina.com.cn',
      'd2.sina.com.cn',
      'd3.sina.com.cn',
      'd5.sina.com.cn',
      'da.mgtv.com',
      'deliver.ifeng.com',
      'df888.eastday.com',
      'dftoutiao.com/dfpcitv/pcitv?type',
      'eastday.com/assets/js/resources/detail/',
      'eastday.com/assets/js/resources/new_detail_',
      'eastmoney.com/js/news_fixed_',
      'farm-cn.plista.com',
      'fastapi.net',
      'firefang',
      'fj.sina.com.cn',
      'g.doubleclick',
      'games_ad_',
      'gdt.qq.com',
      'gg/gg_right_1',
      'guanggao.',
      'hao61.ne',
      'html?clicktag=',
      'http://ad',
      'idemin_noif',
      'ifeng.com/a_if',
      'ifeng.com/ssi-incs/',
      'ifengimg.com',
      'iframe/ad',
      'iframe_auto_264631512114397',
      'images.sohu.com/cs/',
      'images/ad',
      'img.adbox.sina.com.cn',
      'img2.126.net',
      'img2.autoimg.cn/admdfs',
      'img8.itiexue.net',
      'imgculture.gmw',
      'imglady.gmw.cn',
      'info.stockstar.com',
      'insightexpressai.com',
      'inte.sogou.com',
      'ithome.com/file/js/money/',
      'itiexue.net/2',
      'itiexue.net/domain-policy',
      'ivy.pcauto.com.cn',
      'ivy.pconline.com',
      'jd.com/exsites?spread_type=',
      'junph.cn',
      'kejet.net',
      'lianmeng.360.cn',
      'lm.jd.com/cpcunion',
      'miaozhen',
      'mini.eastday.com/iframe',
      'news.sina.com.cn/pfpnews/js',
      'nex.163.com/ssp/',
      'p.zol-img.com',
      'pagead2.',
      'pagechoice.net',
      'pcmx.autohome.com.cn/impress',
      'pconline.com.cn/_hux_/',
      'people.com.cn/adv',
      'pic.zol-img.com.cn',
      'pic.zol-img.com.cn/201510/thisad_1016',
      'pic.zol.com.cn',
      'picAd.',
      'pmm.people.com.cn',
      'pmm.people.com.cn/main',
      'popme.163',
      'proxy.htm?id',
      'pubads',
      // 'qhres.com/static/',
      'qhres.com/static/4b6ab193405b6ca3',
      'pos.baidu.com',
      'show-g.mediav.com',
      'material-ssl.mediav.com',
      'phs.tanx.com',
      'hao61.net',
      'qtmojo.cn',
      'qtmojo.com',
      'sax',
      'securepubads.',
      'sina.com.cn/litong',
      'sina.com.cn/litong/',
      'sinaimg.cn/unipro',
      'slog.sina.com.cn/',
      'static-CN.plista.com',
      'static-cn.plista.com',
      'stockstar.com/info/',
      't1.hoopchina.com.cn/topn-v2',
      'test15.',
      'textad',
      'tiexue.net/txgatj',
      'tt123.eastday.',
      'tt321.eastday.com',
      'txtAd1.',
      'valc.atm.youku.com',
      'x.autoimg.cn',
      'x.itiexue.net',
      'ydjs.zol.com.cn',
      'yingguang',
      'yt-adp.nosdn.127',
      'zol-img.com.cn/201802/sz99943hp760ttgm',
      'zol.com.cn/active/',
      'zol.com.cn/adrs/',
      '_960_90',
      '_ad.png?',
      '_box_ad_',
      'game.tiexue',
      '.wx359.cn/',
      // news.163
      'yt-adp.nosdn.127.net',
      'g.163.com',
      'cms-bucket.nosdn.127.net',
      'pg-ad-b1.nosdn.127.net',
      'mediav.com',
      // pcauto
      '.ivy-250',
      // news 163
      'nex.163.com/q',
      'img2.126.net',
      'img1.126.net',
      '/scripts/ad-',
      // eastmoney
      '.com/ad/',
      'eastmoney.com/banner/',
      'dfcfw.com/public/js/left.js',
      'cmsjs.eastmoney.com',
      'chinauma.net',
      'same.eastmoney.com',
      //hupu
      'hoopchina.com.cn/topn',
      'googlesyndication.com',
      'googlesyndication.com/safeframe/',
      'googlesyndication.com/pagead/',
      '_advertise.',
      'hoopchina.com.cn/common/lazyLoadAd.js',
      'pagead2.googlesyndication.com',
      'ad.doubleclick.net',
      '/imgad?',
      '2mdn.net',
      'googlesyndication.com/sodar/',
      'googlesyndication.com/ddm/'
  ];

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

  var gBrowser = getBrowser();

  //matches的兼容处理
  if (!Element.prototype.matches) {
      Element.prototype.matches = Element.prototype.mozMatchesSelector ||
          Element.prototype.msMatchesSelector ||
          Element.prototype.webkitMatchesSelector;
  }

  // Create Element.remove() function if not exist
  if (!('remove' in Element.prototype)) {
      Element.prototype.remove = function () {
          if (this.parentNode) {
              this.parentNode.removeChild(this);
          }
      };
  }
  /*
   * JavaScript base64 / base64url encoder and decoder
   */

  var b64c = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"   // base64 dictionary
  var b64u = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"   // base64url dictionary
  var b64pad = '='

  /* base64_encode_data
   * Internal helper to encode data to base64 using specified dictionary.
   */
  function base64_encode_data(data, len, b64x) {
      var dst = ""
      var i

      for (i = 0; i <= len - 3; i += 3) {
          dst += b64x.charAt(data.charCodeAt(i) >>> 2)
          dst += b64x.charAt(((data.charCodeAt(i) & 3) << 4) | (data.charCodeAt(i + 1) >>> 4))
          dst += b64x.charAt(((data.charCodeAt(i + 1) & 15) << 2) | (data.charCodeAt(i + 2) >>> 6))
          dst += b64x.charAt(data.charCodeAt(i + 2) & 63)
      }

      if (len % 3 == 2) {
          dst += b64x.charAt(data.charCodeAt(i) >>> 2)
          dst += b64x.charAt(((data.charCodeAt(i) & 3) << 4) | (data.charCodeAt(i + 1) >>> 4))
          dst += b64x.charAt(((data.charCodeAt(i + 1) & 15) << 2))
          dst += b64pad
      }
      else if (len % 3 == 1) {
          dst += b64x.charAt(data.charCodeAt(i) >>> 2)
          dst += b64x.charAt(((data.charCodeAt(i) & 3) << 4))
          dst += b64pad
          dst += b64pad
      }

      return dst
  }

  /* base64_encode
   * Encode a JavaScript string to base64.
   * Specified string is first converted from JavaScript UCS-2 to UTF-8.
   */
  function base64_encode(str) {
      var utf8str = unescape(encodeURIComponent(str))
      return base64_encode_data(utf8str, utf8str.length, b64c)
  }

  /* base64url_encode
   * Encode a JavaScript string to base64url.
   * Specified string is first converted from JavaScript UCS-2 to UTF-8.
   */
  function base64url_encode(str) {
      var utf8str = unescape(encodeURIComponent(str))
      return base64_encode_data(utf8str, utf8str.length, b64u)
  }

  /* base64_charIndex
   * Internal helper to translate a base64 character to its integer index.
   */
  function base64_charIndex(c) {
      if (c == "+") return 62
      if (c == "/") return 63
      return b64u.indexOf(c)
  }

  /* base64_decode
   * Decode a base64 or base64url string to a JavaScript string.
   * Input is assumed to be a base64/base64url encoded UTF-8 string.
   * Returned result is a JavaScript (UCS-2) string.
   */
  function base64_decode(data) {
      // 防止服务端没有=补全
      var mod = data.length % 4
      if (mod !== 0) {
          for (var i = mod; i < 4; i++) {
              data += b64pad
          }
      }
      var dst = ""
      var i, a, b, c, d, z

      for (i = 0; i < data.length - 3; i += 4) {
          a = base64_charIndex(data.charAt(i + 0))
          b = base64_charIndex(data.charAt(i + 1))
          c = base64_charIndex(data.charAt(i + 2))
          d = base64_charIndex(data.charAt(i + 3))

          dst += String.fromCharCode((a << 2) | (b >>> 4))
          if (data.charAt(i + 2) != b64pad)
              dst += String.fromCharCode(((b << 4) & 0xF0) | ((c >>> 2) & 0x0F))
          if (data.charAt(i + 3) != b64pad)
              dst += String.fromCharCode(((c << 6) & 0xC0) | d)
      }

      dst = decodeURIComponent(escape(dst))
      return dst
  }
  function getAbsoluteUrl(url) {
      url = url.replace(/&amp;|&#38;/g, "&");
      if (url.startsWith("http") || url.startsWith("javascript:") || url === "about:blank") return url;
      if (url.startsWith("//")) {
          return window.location.protocol + url
      }
      var stack = window.location.href.split("/");
      if (window.wsCorsFrame) {
          stack[2] = window.origin.split("//")[1]
      }
      stack.pop()
      var parts = url.split("/")
      for (var i = 0; i < parts.length; i++) {
          if (parts[i] == ".")
              continue;
          if (parts[i] == "..")
              stack.pop();
          else
              stack.push(parts[i]);
      }
      return stack.join("/");
  }

  function matchUrl(url) {
      // 类型判断避免报错  前缀检测避免重复运算
      if (typeof url !== "string" || url.indexOf(prefix) === 0) {
          return false
      }
      url = getAbsoluteUrl(url);
      for (var urlIdx = 0; urlIdx < urlList.length; urlIdx++) {
          if (url.indexOf(urlList[urlIdx]) !== -1) {
              // console.log("url hit: " + url);
              return urlList[urlIdx];
          }
      }
      // console.log("url miss: " + url);
      return false;
  }

  function encodeUrl(url) {
      return prefix + base64url_encode(getAbsoluteUrl(url));
  }

  function getPropertyFormStyle(element, property) {
      if (window.getComputedStyle) {
          return window.getComputedStyle(element).getPropertyValue(property);
      } else {
          return element.currentStyle[property];
      }
  }

  //修改元素的src属性
  function modifyElementSrc(element, replace) {
      if (!(element instanceof Element)) {
          return;
      }

      var selectorList = [
          'iframe[src]',
          'img[src]',
          'script[src]',
          'source[src]',
          'embed[src]',
          'video[poster]',
          'video[src]',
          'audio[src]',
          'audio[poster]',
          'picture[src]',
          'picture[poster]',
          'object[data]',
          'param[name=movie]',
          'param[name=source]',
          'param[name=src]',
          'param[name=FileName]',
          'a[href]',
          'link[href]'
      ];

      function modifySingleElementSrc(element, replace) {
          var attrs = [];
          var isMatch = false;
          if (element.src) {
              attrs.push('src');
          }
          if (element.poster) {
              attrs.push('poster');
          }
          if (element.data) {
              attrs.push('data');
          }
          if (element.href) {
              attrs.push('href');
          }
          if (element.localName == 'param' && element.value) {
              attrs.push('value');
          }
          for (var attrIdx = 0; attrIdx < attrs.length; attrIdx++) {
              if (matchUrl(element[attrs[attrIdx]])) {
                  isMatch = true;
                  element[attrs[attrIdx]] = encodeUrl(element[attrs[attrIdx]]);
              } else {
                  var val = element.getAttribute(attrs[attrIdx])
                  //更改过域名且链接为相对地址
                  if (window.wsCorsFrame && val && val[0] === '.' && element.nodeName !== "SCRIPT") {
                      element[attrs[attrIdx]] = encodeUrl(val);
                  }
              }
          }
          if (replace && isMatch) {
              if (element.localName == 'param') {
                  //clone Object Tag
                  element = element.parentNode;
              }
              // 元素替换，防止屏蔽插件监听原元素属性的更改
              var newNode = element.cloneNode(true);
              //restore el.style.setProperty('display', 'none', 'important');
              var displayVal = element.style.getPropertyValue('display');
              var displayPri = element.style.getPropertyPriority('display');
              if (displayPri == 'important' && displayVal == 'none') {
                  newNode.style.setProperty('display', '', '');
              }
              //restore el.style.setProperty('visibility', 'hidden', 'important');
              var visibilityVal = element.style.getPropertyValue('visibility');
              var visibilityPri = element.style.getPropertyPriority('visibility');
              if (visibilityVal == 'hidden' && visibilityPri == 'important') {
                  newNode.style.setProperty('visibility', '', '');
              }
              //restore el.style.setProperty('opacity', '0', 'important');
              var opacityVal = element.style.getPropertyValue('opacity');
              var opacityPri = element.style.getPropertyPriority('opacity');
              if (opacityVal == '0' && opacityPri == 'important') {
                  newNode.style.setProperty('opacity', '', '');
              }
              //restore
              //var w = (el.width === undefined ? -1 : el.width);
              //var h = (el.height === undefined ? -1 : el.height);
              //el.style.setProperty('background-position', w + 'px ' + h + 'px');
              //el.setAttribute('width', 0);
              //el.setAttribute('height', 0);
              if (element.width !== undefined && element.height !== undefined &&
                  element.width == 0 && element.height == 0) {
                  var widthVal = element.style.getPropertyValue('background-position-x');
                  var heightVal = element.style.getPropertyValue('background-position-y');
                  widthVal = parseInt(widthVal, 10);
                  heightVal = parseInt(heightVal, 10);
                  if (widthVal <= 0) {
                      newNode.removeAttribute('width');
                  } else if (!isNaN(widthVal)) {
                      newNode.width = widthVal;
                  }
                  if (heightVal <= 0) {
                      newNode.removeAttribute('height');
                  } else if (!isNaN(heightVal)) {
                      newNode.height = heightVal;
                  }
              }
              element.parentNode.replaceChild(newNode, element);
          }
      }

      for (var selectorIdx = 0; selectorIdx < selectorList.length; selectorIdx++) {
          if (element.matches(selectorList[selectorIdx])) {
              modifySingleElementSrc(element, replace);
          }
          var nodeList = element.querySelectorAll(selectorList[selectorIdx]);
          for (var nodeIdx = 0; nodeIdx < nodeList.length; nodeIdx++) {
              modifySingleElementSrc(nodeList[nodeIdx], replace);
          }
      }
  }

  //修改字符串中str关键字的内容
  function modifyStringSrc(string) {
      if (typeof (string) != 'string' || string.indexOf('interfaceAdData') >= 0) {
          return string;
      }
      
      string = string.replace(/((<\/script>)|^)[\s|\S]*?((<script[\s\S]*?>)|$)/gi,function(outerScript){
          if(outerScript.length>10){
              var regExp = /(src|href|poster|data|value|url)\s*=\s*(['"]?)(.*?)(['" >])/gmi;
              return outerScript.replace(regExp, function (match, arrt, pre, src, suf) {
                  if (!src.startsWith("<%=") && matchUrl(src)) {
                      if (match.slice(-1) == ">") {
                          return arrt + '=' + pre + encodeUrl(src) + suf + '>';
                      } else {
                          return arrt + '=' + pre + encodeUrl(src) + suf;
                      }
                  } else {
                      return match;
                  }
              });
          }
          return outerScript
      })
      return string;
  }

  //删除屏蔽插件加入的隐藏样式
  function removeHideStyle(document) {
      // console.time("removeHideStyle")
      var removeFlag = false;
      if (gBrowser.name == "Chrome") {
          var selector = "::shadow style";
      } else {
          var selector = "style";
      }
      var styleElements = document.querySelectorAll(selector);
      for (var i = 0; i < styleElements.length; i++) {
          if (styleElements[i].innerText === "") {
              styleElements[i].parentNode.removeChild(styleElements[i]);
              removeFlag = true;
          }
      }
      // console.timeEnd("removeHideStyle")
      return removeFlag;
  }

  //使用原型链，拦截函数调用
  function wrapInvoke(obj, method, interceptor, rearFn) {
      var original = obj[method];
      obj[method] = function () {
          try {
              interceptor(arguments);
          } catch (err) {
              console.warn(err);
          } finally {
              var node = original.apply(this, arguments)
              if (rearFn) {
                  rearFn(this, arguments)
              }
              return node
          }
      }
  }

  //使用defineProperty，拦截属性读写
  function wraptSet(obj, attr, interceptor) {
      var desc = Object.getOwnPropertyDescriptor(obj, attr);
      var original = desc.set;
      desc.set = function (value) {
          try {
              var newValue = interceptor(value);
          } catch (err) {
              console.warn(err);
          } finally {
              return original.call(this, newValue);
          }
      }
      Object.defineProperty(obj, attr, desc);
  }

  function wraptGet(obj, attr, interceptor) {
      var desc = Object.getOwnPropertyDescriptor(obj, attr);
      var original = desc.get;
      desc.get = function () {
          var value = original.apply(this, arguments);
          try {
              value = interceptor(value, this);
          } catch (err) {
              console.warn(err);
          } finally {
              return value;
          }
      }
      Object.defineProperty(obj, attr, desc);
  }

  function wrapWrite(args, hasEnter) {

      var str = args[0]
      var cha = hasEnter ? '\n' : ''
      for (var i = 1; i < args.length; i++) {
          str += cha + args[i]
      }
      // console.warn("wrapWrite:",str)
      args[0] = modifyStringSrc(str);
      args.length = 1
  }

  function wrapOpen(args) {
      if (matchUrl(args[1])) {
          args[1] = encodeUrl(args[1]);
      }
  }

  function wrapInserAdjacentHTML(args) {
      args[1] = modifyStringSrc(args[1]);
      return;
  }

  function wrapSetInnerHTML(value) {
      return modifyStringSrc(value);
  }

  function wrapSetSrc(value) {
      if (matchUrl(value)) {
          return encodeUrl(value);
      } else {
          return value;
      }
  }
  function wrapGetSrc(value) {
      if (typeof value === "string") {
          var start = value.indexOf(prefix)
          if (start >= 0) {
              start += prefix.length
              return base64_decode(value.slice(start)).replace(/&amp;|&#38;/g, "&");
          }
      }
      return value

  }

  function wrapSetAttribute(args) {
      if ((args[0] === "src" || args[0] === "href" || args[0] === "data") &&
          matchUrl(args[1])) {
          args[1] = encodeUrl(args[1]);
      }
  }

  function wrapWinOpen(args) {
      if (matchUrl(args[0])) {
          args[0] = encodeUrl(args[0]);
      }
  }

  function wrapAppendChild(parentNode, args) {
      var targetNode = args[0]
      if (targetNode instanceof window.HTMLIFrameElement) {
          if ((gBrowser.name == 'Chrome' && gBrowser.version >= 66) || gBrowser.name == 'Firefox') {
              // 对其父节点进行class删除操作
              var replaceClassName = function (pn) {
                  if (pn && pn.className) {
                      pn.className = pn.className.replace(new RegExp(classFilterRegExpString), '')
                      return true
                  }
                  return false
              }
              replaceClassName(parentNode) && replaceClassName(parentNode.parentNode) && replaceClassName(parentNode.parentNode.parentNode)
          }
      }
  }
  function wrapGetOrigin(v, self) {
      var origin = v
      try {
          origin = self.source.origin
      } catch (error) {
          // console.warn(error)
      } finally {
          return origin
      }
  }

  function wrapWindow(window) {
      try {
          if (window.wsWrap) {
              return window;
          }
          window.wsWrap = true;
      } catch (err) {
          return window;
      }

      if (gBrowser.name == "Firefox") {
          wrapInvoke(window.HTMLDocument.prototype, 'write', function (args) {
              return wrapWrite(args, false)
          });
          wrapInvoke(window.HTMLDocument.prototype, 'writeln', function (args) {
              return wrapWrite(args, true)
          });
      } else {
          wrapInvoke(window.Document.prototype, 'write', function (args) {
              return wrapWrite(args, false)
          });
          wrapInvoke(window.Document.prototype, 'writeln', function (args) {
              return wrapWrite(args, true)
          });
      }
      wrapInvoke(window, 'open', wrapWinOpen);
      wrapInvoke(window.XMLHttpRequest.prototype, 'open', wrapOpen);
      wrapInvoke(window.Element.prototype, 'setAttribute', wrapSetAttribute);
      wrapInvoke(window.Element.prototype, 'appendChild', function () { }, wrapAppendChild);
      if (gBrowser.name == "IE" || gBrowser.name === 'MSIE') {
          wrapInvoke(window.HTMLElement.prototype, 'insertAdjacentHTML', wrapInserAdjacentHTML);
      } else {
          wrapInvoke(window.Element.prototype, 'insertAdjacentHTML', wrapInserAdjacentHTML);
      }

      if (gBrowser.name === "IE" || gBrowser.name === 'MSIE') {
          wraptSet(window.HTMLElement.prototype, 'innerHTML', wrapSetInnerHTML);
      } else {
          wraptSet(window.Element.prototype, 'innerHTML', wrapSetInnerHTML);
      }

      wraptSet(window.HTMLImageElement.prototype, 'src', wrapSetSrc);
      wraptSet(window.HTMLScriptElement.prototype, 'src', wrapSetSrc);
      wraptGet(window.HTMLScriptElement.prototype, 'src', wrapGetSrc);
      wraptSet(window.HTMLIFrameElement.prototype, 'src', wrapSetSrc);
      wraptSet(window.HTMLMediaElement.prototype, 'src', wrapSetSrc);
      wraptSet(window.HTMLLinkElement.prototype, 'href', wrapSetSrc);
      wraptSet(window.HTMLAnchorElement.prototype, 'href', wrapSetSrc);
      wraptGet(window.HTMLIFrameElement.prototype, 'contentWindow', function (args, iframe) {
          // console.warn("adshow in iframe")
          // args.wsWrap 防止本身加载ws_show脚本的iframe又访问了contentWindow对象进行重复的防屏蔽操作
          if (!args.wsWrap && !args.wsLoad) {
              iframe.addEventListener("load", function () {
                  // 解决google apt技术document.open("text/html","replace")二次写入真实广告时需要再次load的问题
                  args.wsLoad = false
                  var c66ORff = (gBrowser.name == 'Chrome' && gBrowser.version >= 66) || gBrowser.name == 'Firefox'
                  if (c66ORff) {
                      //google apt生成广告问题
                      if (iframe.id && /google_ads_i?frame_/.test(iframe.id)) {
                          iframe.id = ''
                      }
                  } else {
                      removeHideStyle(args.document);
                  }
                  modifyElementSrc(args.document.body, true);
                  replaceElemStyle(args.document)
                  c66ORff && removeElemHideFilter(args.document);
              }, false)
              args.wsLoad = true
          }
          return wrapWindow(args)
      });
      wraptGet(window.MessageEvent.prototype, "origin", wrapGetOrigin)

      return window;
  }
  /**
   * 修改地址栏链接、origin
   * 
   * @returns 
   */
  function modifyLocation() {
      var oldLocation = window.location.pathname;
      if (!oldLocation.startsWith(prefix)) {
          return;
      }
      var encodeUrl = oldLocation.slice(prefix.length);
      var newUrlParams = base64_decode(encodeUrl).match(/^(https?:\/\/)(.*?)(\/.*)/);
      window.history.replaceState(null, null, newUrlParams[3]);
      // iframe原本域名与临时域名不一致
      if (window.location.origin.split("//")[1]!==newUrlParams[2]) {
          window.wsCorsFrame = true
          window.origin = newUrlParams[1] + newUrlParams[2]
      }
      var topWin = window.top
      if (topWin !== window) {
          var originDomain = window.document.domain
          try {
              topWin.document.domain
          } catch (error) {
              // console.warn('access topWin.document.domain error')
              // 后缀匹配
              var list = window.location.hostname.split('.')
              var listLen = list.length
              var cur = list[listLen - 1]
              for (var i = listLen - 2; i >= 0; i--) {
                  try {
                      cur = list[i] + '.' + cur
                      window.document.domain = cur
                      topWin.document.domain
                      // console.log(cur,'domain set success')
                      break;
                  } catch (error) {
                      // console.warn(cur,'access topWin.document.domain error')
                  }
              }
          }
      }
  }
  /**
   * 广告域名iframe下页面加载过程中相对地址js加载错误时改为绝对地址并重新请求
   */
  function resendRelativePathScript() {
      if (window.wsCorsFrame) {
          window.addEventListener('error', function (event) {
              if (event && document.readyState === "loading") {
                  var target = event.target || event.srcElement;
                  var isElementTarget = target instanceof HTMLScriptElement
                  if (!isElementTarget) return; // 其他error不处理
                  var val = target.getAttribute("src")
                  if (val && val[0] === '.') {
                      // console.warn("doc write script",val)
                      document.write('<script src="' + encodeUrl(val) + '"><\/script>')
                  }
              }
          }, true)
      }
  }

  function removeWhiteNode(document) {
      ['p', 'div'].forEach(function (e) {
          var el = document.querySelectorAll(e);
          for (var i = 0; i < el.length; i++) {
              if (el[i].innerText === "" && el[i].innerHTML === "" && el[i].outerHTML === "<" + e + "></" + e + ">") {
                  el[i].remove();
              }
          }
      })
  }
  var classFilterList = [
      'seed-item',
      'banner-ad',
      // 'qrcode',
      // news.163.com
      'at_item',
      'index_top_ad',
      'top_ad_column',
      'common_ad_item',
      'bottom_ad_column',
      'mod_ad_r',
      'mod_ad_toutu',
      'right_ad_item',
      'ad_hover_href',
      'channel_ad_2016',
      'gg300',
      //btime.com
      'business-item',
      'ad-item',
      //eastmoney
      'advert-right',
      'top-advert',
      'lyad',
      'advert',
      'adsame-banner-box',
      'footer-ads',
      //hupu
      'topPub',
      'leftad',
      // 'hp-ad250-250',//bbs.hupu.com chrome66+ 广告样式会出问题，依赖js 
      'img_ad',
      'ad720-90',
      'voteIndex',
      'ad361-240-240'
  ]

  var classFilterRegExpString = '\/\\b' + classFilterList.join("\\b|\\b") + '\\b\/gi'
  function replaceElemStyle(document) {
      var classReplaceFilterList = [
          //new.163.com 右侧
          '.mod_ad_toutu',
          '.mod_ad_toutu li',
          '#header .advert .left',
          '#header .advert .center',
          '#header .advert .right',
          'div[class*="ad980-60"]',
          '.topPub',
          '.row .adLeft',
          '.row .adCenter',
          '.row .adRight',
          'canvas.image.p9FadeIn',
          '.ad_reply',
          '.gg300'
      ]
      // 元素删了被屏蔽的class之后样式错乱
      // 在 class删除 之前进行
      // 不直接采用margin ff不能正常获取到值，绝对定位top对于有懒加载内容可能会出错
      var locationProperties = ['width', 'height', 'float', 'margin-top', 'margin-left', 'margin-bottom', 'margin-right', 'position', 'left', 'right', 'bottom']
      for (var i = 0; i < classReplaceFilterList.length; i++) {
          var classReplaceFilter = classReplaceFilterList[i];
          var eles = document.querySelectorAll(classReplaceFilter);
          for (var j = 0, len = eles.length; j < len; j++) {
              for (var k = 0; k < locationProperties.length; k++) {
                  var value = getPropertyFormStyle(eles[j], locationProperties[k])
                  if (value && value !== 'none') {
                      eles[j].style.setProperty(locationProperties[k], value, '');
                  }
              }
              var bgProperty = 'background-image'
              var bg = getPropertyFormStyle(eles[j], bgProperty)
              var bgm
              if (bgm = bg.match(/url\("?(.*)\)"?/)) {
                  if (matchUrl(bgm[1])) {
                      eles[j].style.setProperty(bgProperty, "url('" + encodeUrl(bgm[1]) + "')", '')
                  }
              }
          }
      }
  }
  function removeElemHideFilter(document) {

      var idFilterList = [
          'div[id^="g_d_"]',
          '#bd-hl-content',
          '[id*="junph"]',
          'div[id^="Baidu_"]',
          '#wrapper > div[style="padding:3px;"] > #pic',
          //btime
          '#container > #pic_container',
          '#img-txt-wrapper > #title_desc_div',
          '#rightAD',
          'div[id^="google_ads_iframe_"]',
          //将规则改为含src的iframe
          'iframe[id^="google_ads_iframe"][src]',
          'iframe[id^="google_ads_frame"][src]',
          'div[id^="div-gpt-ad"]',
          '#adunit'
      ]
      var urlFilterList = [
          {
              rule: '.promo-item > a[href^="http"]:not([href*=".b"])',
              attr: 'href'
          }, {
              rule: '.slider-pic > .list > li > a[href^="http://goto.hupu."]',
              attr: 'href'
          }
      ]

      var classRemoveFilterList = [
          {
              rule: '#container > a.block',
              className: 'block'
          }, {
              rule: '#container > .item.title_top',
              className: 'item'
          }, {
              rule: '#container > .item.title_normal',
              className: 'item'
          }, {
              rule: 'div[class*="ad980-60"]',
              className: ''
          }, {
              rule: 'div[class*="ad240-200"]',
              className: ''
          }, {
              rule: 'div[class*="ad200-200"]',
              className: ''
          }, {
              rule: 'div[class^="ad"]',
              className: ''
          }, {
              rule: 'div[class*="ad728-90"]',
              className: ''
          }
      ]





      // class 快速删除
      for (var i = 0; i < classFilterList.length; i++) {
          var classFilter = classFilterList[i];
          var eles = document.getElementsByClassName(classFilter);
          for (var j = 0, len = eles.length; j < len; j++) {
              eles[0].className = eles[0].className.replace(classFilter, '')
          }
      }
      // id 删除
      for (var i = 0; i < idFilterList.length; i++) {
          var eles = document.querySelectorAll(idFilterList[i])
          for (var j = 0; j < eles.length; j++) {
              eles[j].id = ''
          }
      }
      // url 替换
      for (var i = 0; i < urlFilterList.length; i++) {
          var eles = document.querySelectorAll(urlFilterList[i].rule)
          var attr = urlFilterList[i].attr
          for (var j = 0; j < eles.length; j++) {
              eles[j][attr] = encodeUrl(eles[j][attr])
          }
      }
      // class 按一定规则删除删除
      for (var i = 0; i < classRemoveFilterList.length; i++) {
          var eles = document.querySelectorAll(classRemoveFilterList[i].rule)
          var className = classRemoveFilterList[i].className
          for (var j = 0; j < eles.length; j++) {
              if (className) {
                  eles[j].className = eles[j].className.replace(className, '')
              } else {
                  eles[j].className = ''
              }
          }
      }
      // style+p+div[class]操作
      removeWhiteNode(document);
  }

  // 启动拦截代码
  modifyLocation();
  resendRelativePathScript();
  wrapWindow(window);
  var c66ORff = (gBrowser.name == 'Chrome' && gBrowser.version >= 66) || gBrowser.name == 'Firefox'
  if (!c66ORff) {
      removeHideStyle(window.document)
  }
  window.document.addEventListener("DOMContentLoaded", function () {
      //文档加载完成后，对已有元素进行替换和样式添加，主要处理静态元素
      modifyElementSrc(window.document.body, true);

      //删除屏蔽插件加入的隐藏样式
      if (!c66ORff) {
          removeHideStyle(window.document)
      }

  }, false);
  window.addEventListener("load", function () {
      if (!c66ORff) {
          removeHideStyle(window.document)
      } else {
          // 异步操作，防止客户代码load时插入广告节点未被我们找到
          setTimeout(function () {
              replaceElemStyle(window.document)
              removeElemHideFilter(window.document);
          }, 0);
      }
  }, false)
})();