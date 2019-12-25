! function () {
  var svgNameSpace = "http://www.w3.org/2000/svg";

  var attr = "data-mark";

  var scriptTypes = {
      "application/ecmascript": true,
      "application/javascript": true,
      "application/x-ecmascript": true,
      "application/x-javascript": true,
      "text/ecmascript": true,
      "text/javascript": true,
      "text/javascript1.0": true,
      "text/javascript1.1": true,
      "text/javascript1.2": true,
      "text/javascript1.3": true,
      "text/javascript1.4": true,
      "text/javascript1.5": true,
      "text/jscript": true,
      "text/livescript": true,
      "text/x-ecmascript": true,
      "text/x-javascript": true,
      module: true
  };

  var docwrite = document.write;
  var docwriteln = document.writeln;

  function proxyScriptEvent(event, callback) {
      return function (n) {
          callback();
          //触发回调事件
          if (event) return event.call(this, n);
      };
  }

  function runExternalScript(script, callback) {
      //重载方法
      script.onload = proxyScriptEvent(script.onload, callback);
      script.onerror = proxyScriptEvent(script.onerror, callback);
  }

  var setPrototypeOf =
      Object.setPrototypeOf ||
      ({
              __proto__: []
          }
          instanceof Array && function (t, e) {
              t.__proto__ = e;
          }) ||
      function (t, e) {
          for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
      };

  var hasNoMoule = document.createElement("script").noModule !== undefined;

  //删除节点函数
  function deleteNode(node) {
      //获取加速脚本父节点
      var parentNode = node.parentNode;
      //删除加速脚本
      if (parentNode) {
          parentNode.removeChild(node);
      }
  }

  function isExecutable(script) {
      return (!(script.type && !scriptTypes[script.type]) &&
          ((!hasNoMoule || !script.hasAttribute("nomodule")) &&
              !(!hasNoMoule && "module" === script.type))
      );
  }

  function createScript(t) {
      var e = document.createElementNS(t.namespaceURI, "script");
      e.textContent = t.textContent;
      for (var n = 0; n < t.attributes.length; n++) {
          var r = t.attributes[n];
          r.namespaceURI ?
              e.setAttributeNS(r.namespaceURI, r.name, r.value) :
              e.setAttribute(r.name, r.value);
      }
      return e;
  }

  function inherit(t, e) {
      function f() {
          this.constructor = t;
      }
      setPrototypeOf(t, e);
      t.prototype = null === e ? Object.create(e) : ((f.prototype = e.prototype), new f());
  }

  function isExternal(script) {
      var attribute = script.namespaceURI === svgNameSpace ? "xlink:href" : "src";
      return script.hasAttribute(attribute);
  }
  //日志打印函数
  function log() {
      for (var arr = [], i = 0; i < arguments.length; i++) {
          arr[i] = arguments[i];
      }
      var output = console.warn || console.log;
      output.apply(output, ["COMET LOADER:"].concat(arr));
  }

  function dispatchEvent(obj, e) {
      var event = new Event(e);
      obj.dispatchEvent(event);
  }

  function appendNodes(childNodes, parentNode, pointMaker) {
      var insertFunc;
      if (pointMaker) {
          insertFunc = function (node) {
              return parentNode.insertBefore(node, pointMaker)
          }
      } else {
          insertFunc = function (node) {
              return parentNode.appendChild(node)
          }
      }
      Array.prototype.slice.call(childNodes).forEach(insertFunc);
  }

  function appendByParentNode(childNodes, parentNode) {
      appendNodes(childNodes, parentNode, parentNode.childNodes[0])
  }

  function appendByPointMaker(childNodes, pointMaker) {
      var parentNode = pointMaker.parentNode;
      if (parentNode) {
          appendNodes(childNodes, parentNode, pointMaker);
      }
  }

  var Simulator = (function () {
      function Simulator() {
          var t = this;
          //模拟document文档执行状态
          this.simulatedReadyState = "loading";
          //是否需要在代理处理事件
          this.runEventsInComet = false;
          this.nativeWindowAddEventListener = window.addEventListener;
          try {
              Object.defineProperty(document, "readyState", {
                  get: function () {
                      return t.simulatedReadyState;
                  }
              });
          } catch (e) {}
          //重载document.addEventListener
          this.createConditionalEventListenerProxy(document, [
              "DOMContentLoaded",
              "readystatechange"
          ]);
          //重载window.addEventListener
          this.createConditionalEventListenerProxy(window, ["load"]);
          //重载内联事件重载
          this.updateInlineEvents();
      }

      Simulator.prototype.runOnLoad = function (callback) {
          var s = this;
          this.nativeWindowAddEventListener.call(window, "load", function (event) {
              if (!s.runEventsInComet) {
                  callback();
                  return null;
              }
          });
      };
      //代理页面加载完成函数，以便进行调度
      Simulator.prototype.updateInlineEvents = function () {
          this.proxyInlineEvent(document, "onreadystatechange");
          this.proxyInlineEvent(window, "onload");
          document.body && this.proxyInlineEvent(document.body, "onload");
      };

      Simulator.prototype.createConditionalEventListenerProxy = function (dom, events) {
          var s = this,
              nativeAddEventListener = dom.addEventListener;
          //重载addEventListener方法
          dom.addEventListener = function (event, callback) {
              var params = [];
              var index = 2;
              for (params = [], index = 2; index < arguments.length; index++)
                  params[index - 2] = arguments[index];
              var cb = callback;
              if (
                  (callback && "handleEvent" in callback && (callback = callback.handleEvent),
                      "function" == typeof callback)
              ) {
                  var u = s;
                  cb = function (t) {
                      //增加拦截器，防止自动触发
                      if (u.runEventsInComet || events.indexOf(event) < 0)
                          return callback.call(this, t);
                  };
              }
              nativeAddEventListener.call.apply(nativeAddEventListener, [dom, event, cb].concat(params));
          };
      };
      Simulator.prototype.proxyInlineEvent = function (node, event) {
          var func = node[event];
          if (func) {
              var r = this;
              //延迟执行
              node[event] = function (node) {
                  if (r.runEventsInComet) return func.call(this, node);
              };
          }
      };

      Simulator.prototype.simulateStateBeforeDeferScriptsActivation = function () {
          this.runEventsInComet = true;
          this.simulatedReadyState = "interactive";
          dispatchEvent(document, "readystatechange");
          this.runEventsInComet = false;
      };
      Simulator.prototype.simulateStateAfterDeferScriptsActivation = function () {
          var t = this;
          this.runEventsInComet = true;
          dispatchEvent(document, "DOMContentLoaded");
          this.simulatedReadyState = "complete";
          dispatchEvent(document, "readystatechange");
          dispatchEvent(window, "load");
          this.runEventsInComet = false;
          window.setTimeout(function () {
              return (t.runEventsInComet = true);
          }, 0);
      };
      return Simulator;
  })();

  var Scripts = (function () {
      function Scripts(t) {
          this.nonce = t;
          this.items = [];
      }
      Object.defineProperty(Scripts.prototype, "hasItems", {
          get: function () {
              return this.items.length > 0;
          },
          enumerable: true,
          configurable: true
      });
      Scripts.prototype.pop = function () {
          return this.items.pop();
      };
      Scripts.prototype.findScripts = function (dom, setting) {
          var stack = this,
              filter = setting.filter,
              mutate = setting.mutate;
          var scriptArr = Array.prototype.slice.call(dom.querySelectorAll("script"));
          //筛选含有标记的脚本，有的脚本客户不需要异步执行
          var filterArr = scriptArr.filter(filter);
          var reverseArr = filterArr.reverse();
          reverseArr.forEach(function (script) {
              //删除data-mark标记
              mutate(script);
              stack.pushScriptOnStack(script);
          });
      };
      Scripts.prototype.pushScriptOnStack = function (script) {
          var parentNode = script.parentNode,
              placeholder = this.createPlaceholder(script),
              external = isExternal(script);
          parentNode.replaceChild(placeholder, script);
          this.items.push({
              script: script,
              placeholder: placeholder,
              external: external,
              async: script.hasAttribute("async"),
              executable: isExecutable(script)
          });
      };
      Scripts.prototype.hasMark = function (t) {
          return 0 === t.type.indexOf(this.nonce);
      };
      Scripts.prototype.removeMark = function (t) {
          t.type = t.type.substr(this.nonce.length);
      };
      Scripts.prototype.makeNonExecutable = function (t) {
          t.type = this.nonce + t.type;
      };
      Scripts.prototype.isDeferScript = function (t) {
          return (
              t.hasAttribute("defer") ||
              (t.type === this.nonce + "module" && !t.hasAttribute("async"))
          );
      };
      return Scripts;
  })();

  var NormalScripts = (function (t) {
      function NormalScripts() {
          //继承Scripts方法
          if (t !== null) {
              t.apply(this, arguments);
          }
          return this;
      }
      inherit(NormalScripts, t);
      NormalScripts.prototype.findScriptsInDocument = function () {
          var t = this;
          this.findScripts(document, {
              filter: function (script) {
                  return t.hasMark(script);
              },
              mutate: function (script) {
                  if (!t.isDeferScript(script)) {
                      t.removeMark(script);
                  }
              }
          });
      };
      NormalScripts.prototype.findScriptsAfterDocWrite = function (t) {
          var e = this;
          this.findScripts(t, {
              filter: isExecutable,
              mutate: function (t) {
                  e.isDeferScript(t) && e.makeNonExecutable(t);
              }
          });
      };
      NormalScripts.prototype.createPlaceholder = function (t) {
          return document.createComment(t.outerHTML);
      };
      return NormalScripts;
  })(Scripts);

  var DeferScripts = (function (t) {
      //继承Scripts方法
      function DeferScripts() {
          if (t !== null) {
              t.apply(this, arguments);
          }
          return this;
      }
      inherit(DeferScripts, t);
      DeferScripts.prototype.findDeferScriptsInDocument = function () {
          var t = this;
          this.findScripts(document, {
              filter: function (e) {
                  return t.hasMark(e) && t.isDeferScript(e);
              },
              mutate: function (e) {
                  return t.removeMark(e);
              }
          });
      };
      DeferScripts.prototype.createPlaceholder = function (t) {
          var e = createScript(t);
          this.makeNonExecutable(e);
          return e;
      };
      return DeferScripts;
  })(Scripts);

  var Runner = (function () {
      function Runner(scriptStack, settings) {
          this.scriptStack = scriptStack;
          this.settings = settings;
      }
      Runner.prototype.run = function () {
          for (var runner = this, e = this; this.scriptStack.hasItems;) {
              var result = (function () {
                  var docWriter = e.settings.docWriter;
                  var script = e.scriptStack.pop();
                  // 每次进行异步脚本执行时 都会设置，重置document.write
                  // 每段脚本执行后，会进行docWriter.flushWrittenContentAndDisable
                  if (docWriter && !script.async) {
                      docWriter.enable(script.placeholder);
                  }
                  //激活脚本
                  var newScript = e.activateScript(script);
                  if (newScript) {
                      if (script.external && script.executable && !script.async) {
                          //外链脚本
                          runExternalScript(newScript, function () {
                              runner.finalizeActivation(script);
                              runner.run();
                          });
                          return {
                              value: void 0
                          };
                      } else {
                          e.finalizeActivation(script);
                          return void 0;
                      }
                  } else {
                      if (docWriter) {
                          docWriter.flushWrittenContentAndDisable();
                      }
                      return "continue";
                  }
              })();
              //如果是外链则不执行直接返回等待下载回调
              if ("object" == typeof result) return result.value;
          }
          this.scriptStack.hasItems || this.settings.callback();
      };
      //收尾工作
      Runner.prototype.finalizeActivation = function (t) {
          if (this.settings.docWriter && !t.async) {
              this.settings.docWriter.flushWrittenContentAndDisable();
          }
          if (!t.async) {
              simulator.updateInlineEvents();
              deleteNode(t.placeholder);
          }
      };
      Runner.prototype.activateScript = function (t) {
          var script = t.script,
              placeholder = t.placeholder,
              external = t.external,
              async = t.async,
              parentNode = placeholder.parentNode;
          if (!document.contains(placeholder)) {
              log("Placeholder can't find");
              return null;
          }
          var scriptNew = createScript(script);
          if (scriptNew) {
              parentNode.insertBefore(scriptNew, placeholder);
              return scriptNew;
          } else {
              log("Create script failed.");
              return null;
          }
      };
      return Runner;
  })();

  var DocWriter = (function () {
      function DocWriter(t) {
          this.scriptStack = t;
          this.buffer = "";
      }

      DocWriter.prototype.enable = function (pointMaker) {
          var docwriter = this;
          this.insertionPointMarker = pointMaker;
          this.buffer = "";
          //重载方法
          document.write = function () {
              for (var t = [], n = 0; n < arguments.length; n++)
                  t[n] = arguments[n];
              return docwriter.write(t, false);
          };
          document.writeln = function () {
              for (var t = [], n = 0; n < arguments.length; n++)
                  t[n] = arguments[n];
              return docwriter.write(t, true);
          };
      };
      DocWriter.prototype.flushWrittenContentAndDisable = function () {
          //还原
          document.write = docwrite;
          document.writeln = docwriteln;
          if (this.buffer.length && this.buffer.length !== 0) {
              if (document.contains(this.insertionPointMarker)) {
                  if (this.insertionPointMarker.parentNode === document.head) {
                      this.insertContentInHead();
                  } else {
                      this.insertContentInBody();
                  }
              } else {
                  log("can't find insert point.");
              }
          }
      };
      DocWriter.prototype.insertContentInHead = function () {
          var domParser = new DOMParser();
          var domStr = "<!DOCTYPE html><head>" + this.buffer + "</head>";
          var dom = domParser.parseFromString(domStr, "text/html");
          //扫描是否含有可执行脚本
          this.scriptStack.findScriptsAfterDocWrite(dom);
          appendByPointMaker(dom.head.childNodes, this.insertionPointMarker);
          if (dom.body.childNodes.length) {
              var nodesArr = Array.prototype.slice.call(dom.body.childNodes);
              for (var node = this.insertionPointMarker.nextSibling; node;) {
                  nodesArr.push(node);
                  node = node.nextSibling;
              }
              if (!document.body) {
                  docwrite.call(document, "<body>");
              }
              appendByParentNode(nodesArr, document.body);
          }
      };
      DocWriter.prototype.insertContentInBody = function () {
          var parentElement = this.insertionPointMarker.parentElement;
          var element = document.createElement(parentElement.tagName);
          element.innerHTML = this.buffer;
          this.scriptStack.findScriptsAfterDocWrite(element);
          appendByPointMaker(element.childNodes, this.insertionPointMarker);
      };
      DocWriter.prototype.write = function (params, hasEnter) {
          var script = document.currentScript;
          var r;
          //async 外链脚本 不走异步加载，故直接进行原生方法执行
          if (script && isExternal(script) && script.hasAttribute("async")) {
              (r = hasEnter ? docwriteln : docwrite).call.apply(r, [document].concat(params));
          } else {
              //将数组转化为字符串
              var paramsStr = params.map(String);
              //加入缓存
              this.buffer += paramsStr.join(hasEnter ? "\n" : "");
          }
      };
      return DocWriter;
  })();

  function excuteScriptsFromBeginning(tag) {
      var scriptStack = new NormalScripts(tag);
      var docWriter = new DocWriter(scriptStack);
      //扫描文档脚本
      scriptStack.findScriptsInDocument();
      //开始执行脚本
      var runner = new Runner(scriptStack, {
          docWriter: docWriter,
          callback: function () {
              excuteScriptsFromInteractive(tag);
          }
      });
      runner.run();
  }

  function excuteScriptsFromInteractive(tag) {
      var deferScripts = new DeferScripts(tag);
      //首先触发interactive状态
      simulator.simulateStateBeforeDeferScriptsActivation();
      deferScripts.findDeferScriptsInDocument();
      var runner = new Runner(deferScripts, {
          callback: function () {
              simulator.simulateStateAfterDeferScriptsActivation();
          }
      });
      runner.run();
  }

  var simulator = new Simulator();

  !(function () {
      //获取当前正在执行脚本
      var script = document.currentScript;
      if (script) {
          //获取标记属性
          var tag = script.getAttribute(attr);
          if (tag) {
              //删除调度脚本
              deleteNode(script);
              //闭包
              simulator.updateInlineEvents();
              simulator.runOnLoad(function () {
                  return excuteScriptsFromBeginning(tag);
              });
          } else {
              log("Can't find data mark.");
          }
      } else {
          log("Can't find comet script.")
      };
  })();
}();