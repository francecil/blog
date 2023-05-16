---
title: Devtools Console 面板输入了 1+1 ，浏览器内部发生了什么？
date: 2022-09-19 10:29:58
permalink: /pages/9d2a81/
categories:
  - 大前端
  - 前端基础
  - 执行引擎
  - V8
tags:
  - 

---

# 背景

新来的实习生妹子问了一个问题：「你看 Chrome 的 Devtools 调试工具，代码写一半还没运行下面就会提示输出结果，这个咋做到的？」

<!-- more -->

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5451e0a8a07e459baa85330e57224caf~tplv-k3u1fbpfcp-watermark.image?)


咋做的？对于 Devtools 的内部执行逻辑，咱不了解，但咱也不能直说，**先上一套方法论（5W1H）：**

---
「

对于这个问题，我没了解过，但我会从以下几个方面进行思考：
1. 这个输出提示功能是什么（What）？
   1. 我会关注是否所有代码都会提示？比如异常代码、产生副作用的代码、执行死循环的代码等等，内部该如何处理
   2. 我会关注这个功能是否会带来较大的性能损坏，稳定性如何，以及是否可以手动关闭。
2. 这个功能是在哪执行的（Where）？
   1. 我们的操作是在 Devtools 上，但是显然 js 代码的解析和执行需要运行在 v8 上，因此必定由一个代码传到 v8 的过程。然后 v8 产生结果再返回给 Devtools
3. 什么时机会触发此功能（When）？
   1. 可以和「搜索框输入文案获取列表数据」这个例子进行类比，一般来说我们会做防抖，避免无效请求频繁触发浪费资源。在此处也一样，如果每次输入都会进行提示那么则会损坏性能。
   2. 但防抖也会带来一个延迟结果的缺点，这块得看 devtools 怎么进行衡量。
   3. 以我对 Chrome 的了解和日常该功能的使用，我认为是实时触发的。
4. 这个功能是提供给谁的（Who）？显然是开发者
5. 为什么有这个功能（Why）？显然，为了方便调试。我们可以快速的查看当前输入对象的属性，以及查看纯函数的输出结果等等
6. 这个功能是怎么做的（How）？我主要会关注三点：
   1. 数据是怎么传输的：据我所知，Devtools 的操作是通过 [CDP 协议](https://chromedevtools.github.io/devtools-protocol/tot/Runtime/#method-evaluate) 传递给底层服务，底层服务运行完毕再返回 Devtools ，然后 Devtools 去做结果的渲染。
   2. 怎么避免死循环：如果死循环代码跑在同一个事件渲染，必然导致页面挂掉。而单线程又无法控制某段代码的执行时长，那么我猜测只能另起一个线程，然后做了作用域和上下文的共享了。
   3. 怎么检测副作用：这个不了解，不清楚 V8 的编译器能不能直接分析出来。

」

----

「你说的都是套话，所以内部具体是咋执行的？？」，妹子轻语。


![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e9cf3f233f3e48d89bd336201af8f44c~tplv-k3u1fbpfcp-watermark.image?)

看来妹子不吃这套，不服气的我赶紧 Google 了起来，找到了这篇文章，并分享给了妹子。

**先上结论：**

1. 每次输入或者回车运行代码，都会发送一个名为 `Runtime.evaluate` 的 CDP 请求，可能会带上 timeout、throwOnSideEffect、expression 等参数。expression 表示控制台当前输入的代码段；timeout 则在预览结果阶段发送，其值为 500ms；throwOnSideEffect 则表示需要考虑副作用影响，也是在预览结果阶段发送。
2. V8 收到此 CDP 请求后，根据不同参数进行相应处理。
3. 若传递了 timeout ，则表明需要在指定时间内返回执行结果。这个功能是通过另外启动一个工作线程并共享运行时环境和上下文实现的。
4. 若传递了 throwOnSideEffect ，则表明需要检查代码中是否存在副作用。检查时机在解释器生成字节码之后以及运行时。采用黑白名单的机制可以快速分析出哪些字节码存在副作用，但是部分操作仍不能检测出来，于是需要在运行时检查。此时需要创建一个内存追踪器，追踪本次执行创建的变量内容，字节码运行时若使用的变量无法被此追踪器找到，说明变量是之前创建的，可能存在副作用。


![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c68d8d677e4d4230aa72da9b899725b0~tplv-k3u1fbpfcp-watermark.image?)

> PS：故事纯属虚构，如有雷同，纯属巧合

接下来，我们开始分析~

# 第一层：功能溯源

记得这个功能是某个版本的 Chrome 才加入的，那么我们先去找当时的功能说明

google 上键入 `chrome devtools console evaluate preview`

搜索的第一篇博客就是介绍此功能（**Eager Evaluation，预执行**）的

[https://developer.chrome.com/blog/new-in-devtools-68/#eagerevaluation](https://developer.chrome.com/blog/new-in-devtools-68/#eagerevaluation)

Live demo: https://youtu.be/mfuE53x4b3k?t=1564

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fdc44e1fd2ed453a83ab410aa40a811d~tplv-k3u1fbpfcp-watermark.image?)


在 console 面板上键入代码时，底下会进行结果的预览提示，也可以选择关闭此功能

文章最后还提到了一个副作用的概念，如果输入的代码会产生副作用，就不会预执行。

## 何为副作用

可以看这个[解释](https://stackoverflow.com/questions/8129105/javascript-closures-and-side-effects-in-plain-english-separately)

“纯函数” 是将其输入值映射到输出值的函数，例如 `plus(x, y) { return x + y; }`。 “副作用”是返回值以外的任何影响。

比如下面代码具有引发警报对话框（并需要用户交互）的副作用

```js
function plusWithSideEffects(x, y) {
  alert('This is a side effect'); 
  return x + y;
} 
```


因此如果当输入的代码会产生副作用，应该避免预执行。




## 其他不会执行的情况

使用人工测试，我们还发现了以下这些情况也不会生成预览结果
- 语法解析错误
- 运行时错误
- 执行超时


# 第二层：原理初探

我们知道，devtools 上的绝大部分操作，都是通过 cdp 协议来控制的。

因此我们可以打开 `Protocol monitor` 来看下 devtools 都发了什么数据。


## Protocol monitor

为避免有些同学不知道 `Protocol monitor` ，本节做下简单介绍，了解的可以跳过。


`Protocol monitor` 是一个 cdp 协议监控器，会记录当前用户在这个 devtool 面板上产生的所有 CDP 的请求和响应。


![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/83fa1316f73a404caaf153905262c535~tplv-k3u1fbpfcp-watermark.image?)

如果没找到这个选项，需要先到 Devtools setting 里开启


![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7e69c420e5d64ca49741b07d8e86a3d5~tplv-k3u1fbpfcp-watermark.image?)

之后 reload devtools 就可以看到了

## `Runtime.evaluate` 协议

> PS: 找一个无痕环境的空白页，方便观察结果（避免受到 Chrome 拓展的影响）

在 console 面板键入 `1+1` ，会发现发了三次 `Runtime.evaluate` CDP 


![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a79fc509ab7f4b27bfd78ea55414a626~tplv-k3u1fbpfcp-watermark.image?)
```
// 第一次
// request
{
    "expression": "1",
    "includeCommandLineAPI": true,
    "generatePreview": true,
    "userGesture": false,
    "awaitPromise": false,
    "throwOnSideEffect": true,
    "timeout": 500,
    "disableBreaks": true,
    "replMode": true,
    "uniqueContextId": "1952859779443296532.-6400643113353669212"
}
// response
{
    "result": {
        "type": "number",
        "value": 1,
        "description": "1"
    }
}


// 第二次
// request
{
    "expression": "1+",
    "includeCommandLineAPI": true,
    "generatePreview": true,
    "userGesture": false,
    "awaitPromise": false,
    "throwOnSideEffect": true,
    "timeout": 500,
    "disableBreaks": true,
    "replMode": true,
    "uniqueContextId": "1952859779443296532.-6400643113353669212"
}
// response
{
    "result": {
        "type": "object",
        "subtype": "error",
        "className": "SyntaxError",
        "description": "SyntaxError: Unexpected end of input",
        "objectId": "952682363357450140.1.1972"
    },
    "exceptionDetails": {
        "exceptionId": 50,
        "text": "Uncaught",
        "lineNumber": 0,
        "columnNumber": 2,
        "scriptId": "136",
        "exception": {
            "type": "object",
            "subtype": "error",
            "className": "SyntaxError",
            "description": "SyntaxError: Unexpected end of input",
            "objectId": "952682363357450140.1.1973"
        }
    }
}

// 第三次
// request
{
    "expression": "1+1",
    "includeCommandLineAPI": true,
    "generatePreview": true,
    "userGesture": false,
    "awaitPromise": false,
    "throwOnSideEffect": true,
    "timeout": 500,
    "disableBreaks": true,
    "replMode": true,
    "uniqueContextId": "1952859779443296532.-6400643113353669212"
}
// response
{
    "type": "number",
    "value": 2,
    "description": "2"
}
```

按回车时也会发送一次

```
{
    "expression": "1+1",
    "objectGroup": "console",
    "includeCommandLineAPI": true,
    "silent": false,
    "returnByValue": false,
    "generatePreview": true,
    "userGesture": true,
    "awaitPromise": false,
    "replMode": true,
    "allowUnsafeEvalBlockedByCSP": false,
    "uniqueContextId": "1952859779443296532.-6400643113353669212"
}
{
    "type": "number",
    "value": 2,
    "description": "2"
}
```

对比下差异，主要是 timeout 和 throwOnSideEffect 参数不同。

预执行的情况下 timeout 为 500 ，throwOnSideEffect 为 true

找到对应的[协议定义](https://chromedevtools.github.io/devtools-protocol/tot/Runtime/#method-evaluate)

-   throwOnSideEffect: Whether to throw an exception if side effect cannot be ruled out during evaluation. This implies `disableBreaks` below.    
-   timeout: Terminate execution after timing out (number of milliseconds).




## 基于参数进行黑盒测试

使用不同的参数调试方法，并猜测实现原理

### 调试 CDP 

> 了解的同学可以跳过本小节

如果是 node 端，可以使用 `puppeteer` 、 `chrome-remote-interface` 等工具。

在浏览器上，可以使用 devtools 页面对外暴露的对象执行 CDP 操作。

如何使用 devtools 页面的对象？我们可以打开该 devtools 页面（A）的 devtools 页面(B)。

- 打开 devtools 页面可以使用快捷键 Ctrl+Shift+I（Windows）或 Cmd+Opt+I（Mac）
- devtools 使用独立窗口模式

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2b2c764f759740a093c3e59d389fe81d~tplv-k3u1fbpfcp-watermark.image?)
- 在调试窗口 A 上，使用快捷键打开调试窗口 B

至此，在调试窗口 B 上就可以调试 A 的代码，使用 devtools 导出的一些模块来进行 cdp 交互

接下来可以在 console 面板运行如下代码：

```js
let Main = await import('./devtools-frontend/front_end/entrypoints/main/main.js');

await Main.MainImpl.sendOverProtocol('Runtime.evaluate', {expression: 'alert(111)'});
```

可以发现在原始页面出现了一个 alert 弹窗

> devtools 的目录结构随时可能调整，但是 MainImpl 这个对象不太会调整。
> 
> 因此如果用上面的方式没有找到 Main 这个对象，大概率是目录调整过了。
> 
> 可以先用 search 工具搜一下 MainImpl 导出的文件位置，然后在 source 面板看整个 devtools-frontend 项目的目录结构



### timeout

执行死循环代码并配置不同的 timeout

```
await Main.MainImpl.sendOverProtocol('Runtime.evaluate', {
    "expression": " while(true){}",
    "timeout": 500,
});
```
结果：在 500ms 后返回异常 `Uncaught {code: -32000, message: 'Execution was terminated'}`

---
```
await Main.MainImpl.sendOverProtocol('Runtime.evaluate', {
    "expression": " while(true){}",
});
```
结果：页面卡住

**初步断定，如果配置了 timeout 参数，会使用不同的线程执行代码**

### throwOnSideEffect 

判定副作用是在编译阶段发现还是在运行阶段发现。

可以通过一个死循环卡住执行来测试

```
await Main.MainImpl.sendOverProtocol('Runtime.evaluate', {
    "expression": "while(true){}; var a = 1;",
    "timeout": 1000,
    "throwOnSideEffect": true,
});
```

提示 `EvalError: Possible side-effect in debug-evaluate`

------

```
await Main.MainImpl.sendOverProtocol('Runtime.evaluate', {
    "expression": "while(true){}; window.a = 1;",
    "timeout": 1000,
    "throwOnSideEffect": true,
});
```

抛出异常：`Uncaught {code: -32000, message: 'Execution was terminated'}`

------


```
await Main.MainImpl.sendOverProtocol('Runtime.evaluate', {
    "expression": "while(true){}; var a = 1;",
    "timeout": 1000,
    "throwOnSideEffect": false,
});
```

抛出异常：`Uncaught {code: -32000, message: 'Execution was terminated'}`

-----

初步分析，定义全局变量会导致副作用，这个可以在编译时发现；而对 window 对象赋值，不一定会导出副作用，需要实际执行才知道。

因此这个副作用检测可能有多种手段

## 初探小结

- 预执行阶段会传递 timeout 参数，不会导致死循环，猜测是采用另开线程实现
- 预执行阶段会检查副作用，这个检测可能是编译时检测，也可能是运行时检测


# 第三层：源码解析

本节将深入分析 V8 源码，对初探小结的猜测进行验证

## V8 基础概念

- **Isolate**: 一个独立的 v8 运行时环境（runtime），包括堆栈、堆管理器（heap）、垃圾回收器（gc）等。同一时刻，只有一个线程能使用 isolate ，多个线程可以通过线程切换来共享同一个 isolate 。
- **Context**: 上下文对象。单独的 `Isolate` 不足以运行脚本，需要 `Context` 来提供全局变量。Context 在其所处的 `Isolate` 管理的 `Heap` 中建立一个对象，并以此为全局变量构建出一个完整的执行环境供 js 脚本使用。
- **Handle**: 对一个特定 JS 对象的索引。它指向此 JS对象 在 V8 所管理的 Heap 中的位置。需要注意的是，Handle 不存于 Heap 中，而是存在于 stack 中。只有一个 Handle 被释放后，此 Handle 才会从 stack 中推出。这就带来一个问题，在执行特定操作时，我们可能需要声明很多 Handle。如果要一个个手动释放，未免太麻烦。为此，我们使用 `Handle Scope` 来集中释放这些 Handle 。
- **Handle Scope**: 一个包含很多 handle 的集合，用于对 handle 进行统一管理。当这个工作区 Handle Scope 被移出堆栈时，其所包含的所有 Handle 都会被移出堆栈，并且被垃圾管理器标注，从而在后续的垃圾回收过程快速的定位到这些可能需要被销毁的 Handle 。
- **Context Scope**: 用来管理 `Context` 的句柄容器
- **Session**: 一次 cdp 会话
- **SharedFunction**: 编译 Javascript 源码得到的字节码流，不能直接执行
- **JSFunction**: 将 SharedFunction 绑定上执行入口和 Context ，此时该字节码流才能被解释器（Ignition）执行
- **Builtin（Built-in function）**：编译好的内置代码块（chunk），存储在 `snapshot_blob.bin` 文件中，V8 启动时以反序列化方式加载，运行时可以直接调用。其功能包括 Ignition 实现、字节码实现、以及 ECMA 规范实现等，可以从 `BUILTIN_LIST` 定义中查阅。从实现角度上分为七种类型，比如 BUILD_CPP、BUILD_ASM 等子类型。

---

V8 编译一段 JS 代码（字符串）的流程如下：


![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4f24b5a81e144c67970058c2eeaa9a05~tplv-k3u1fbpfcp-watermark.image?)

1. 将源码进行解析（词法分析、语法分析）得到抽象语法树（AST）。AST 是 JavaScript 代码的句法结构的树形表示形式
2. 使用 Ignition 解释器将 AST 解释为字节码（共100+种），并负责执行，输入是一个字节码序列，输出是执行结果。
3. Ignition 是带有累加器的寄存器，每个字节码指定其输入和输出做成寄存器操作数。
4. 对于热点代码还会进行优化，使用 TurboFan 编译器将字节码编译为机器码
5. 在某些情况下（比如调试源码），可以选择退优化，将机器码再度变成字节码，方便分析和调试。

更具体的可以参考这篇[文章](https://zhuanlan.zhihu.com/p/28590489)。 

## 源码分析

根据搜索关键字 throwOnSideEffect ，我们找到了 `V8RuntimeAgentImpl::evaluate` 方法，此方法为调用的主要入口。



```c++
void V8RuntimeAgentImpl::evaluate(
  // 参数定义，差不多同 CDP 协议定义，重点关注 throwOnSideEffect 和 timeout
  const String16& expression, Maybe<String16> objectGroup,
  Maybe<bool> includeCommandLineAPI, Maybe<bool> silent,
  Maybe<int> executionContextId, Maybe<bool> returnByValue,
  Maybe<bool> generatePreview, Maybe<bool> userGesture,
  Maybe<bool> maybeAwaitPromise, Maybe<bool> throwOnSideEffect,
  Maybe<double> timeout, Maybe<bool> disableBreaks, Maybe<bool> maybeReplMode,
  Maybe<bool> allowUnsafeEvalBlockedByCSP, Maybe<String16> uniqueContextId,
  Maybe<bool> generateWebDriverValue,
  std::unique_ptr<EvaluateCallback> callback) {
TRACE_EVENT0(TRACE_DISABLED_BY_DEFAULT("devtools.timeline"),
             "EvaluateScript");
int contextId = 0;

// ... 上下文检查

// 基于当前会话 session 和 context 创建一个作用域
InjectedScript::ContextScope scope(m_session, contextId);
response = scope.initialize();


...

// 注入 devtools 命令行 api 到该作用域，比如 $,$0 ,copy 等
if (includeCommandLineAPI) scope.installCommandLineAPI();

...

v8::MaybeLocal<v8::Value> maybeResultValue;
{
  // 在配置执行超时时间时，会额外再创建一个执行作用域
  V8InspectorImpl::EvaluateScope evaluateScope(scope);
  if (timeout.isJust()) {
    // 设置指定时间内返回结果。稍后分析
    response = evaluateScope.setTimeout(timeout.fromJust() / 1000.0);
    if (!response.IsSuccess()) {
      callback->sendFailure(response);
      return;
    }
  }
  
  // 姑且简单理解为，启动一个微任务来执行 js 脚本
  v8::MicrotasksScope microtasksScope(m_inspector->isolate(),
                                      v8::MicrotasksScope::kRunMicrotasks);
  
  // 执行模式，比如是否检测副作用，是否有断点等等
  v8::debug::EvaluateGlobalMode mode =
      v8::debug::EvaluateGlobalMode::kDefault;
  if (throwOnSideEffect.fromMaybe(false)) {
    mode = v8::debug::EvaluateGlobalMode::kDisableBreaksAndThrowOnSideEffect;
  } else if (disableBreaks.fromMaybe(false)) {
    mode = v8::debug::EvaluateGlobalMode::kDisableBreaks;
  }
  // 将普通字符串转换为 v8 string 对象
  const v8::Local<v8::String> source =
      toV8String(m_inspector->isolate(), expression);
  // 往下继续运行，会走解析->编译->运行流程，并返回结果。稍后分析
  maybeResultValue = v8::debug::EvaluateGlobal(m_inspector->isolate(), source,
                                               mode, replMode);
}  // Run microtasks before returning result.

// 重置作用域
response = scope.initialize();

// ... 将返回结果或异常值进行包装并返回
  
}
```

本段代码描述了整个执行流程，如何控制超时以及如何解析代码需要进一步分析

### 分析超时中断

进入 [setTimeout](https://source.chromium.org/chromium/chromium/src/+/main:v8/src/inspector/v8-inspector-impl.cc;drc=87f8e0a4658d1835302a09ec19b2594b835ddb31;bpv=0;bpt=1;l=464)，可以观察到实际是另外开启了一个工作线程。

```c++
protocol::Response V8InspectorImpl::EvaluateScope::setTimeout(double timeout) {
  if (m_isolate->IsExecutionTerminating()) {
    return protocol::Response::ServerError("Execution was terminated");
  }
  m_cancelToken.reset(new CancelToken());
  // 在对应平台（比如 d8）上的工作线程中创建一个可中止的执行任务
  v8::debug::GetCurrentPlatform()->CallDelayedOnWorkerThread(
      // 创建一个执行任务
      std::make_unique<TerminateTask>(m_isolate, m_cancelToken), timeout);
  return protocol::Response::Success();
}
```

创建工作线程是和具体的运行时相关的，比如 Chrome 上是 d8，同时还传递了 isolate 对象，保证运行时环境一致。


超过指定时间之后，若还没有返回结果，那么就会返回「执行中断」的错误。


### EvaluateGlobal 具体流程

上面说到，EvaluateGlobal 方法做了「编译到运行」的整个过程

内部实际调用 [DebugEvaluate::Global](https://source.chromium.org/chromium/chromium/src/+/main:v8/src/debug/debug-evaluate.cc;drc=87f8e0a4658d1835302a09ec19b2594b835ddb31;bpv=1;bpt=1;l=43) 得到的运行结果


1. 进入 `DebugEvaluate::Global` 进一步分析 
```c++
MaybeHandle<Object> DebugEvaluate::Global(Isolate* isolate,
  Handle<String> source,
  debug::EvaluateGlobalMode mode,
  REPLMode repl_mode) {
// 生成 SharedFunction：直接编译 Javascript 源码得到的字节码流 shared_info
Handle<SharedFunctionInfo> shared_info;
if (!GetFunctionInfo(isolate, source, repl_mode).ToHandle(&shared_info)) {
return MaybeHandle<Object>();
}

Handle<NativeContext> context = isolate->native_context();

// 生成 JSFunction：将 shared_info 绑定上 isolate 和 context 得到 JSFunction
Handle<JSFunction> fun =
Factory::JSFunctionBuilder{isolate, shared_info, context}.Build();
// 往下调用
return Global(isolate, fun, mode, repl_mode);
}
```

该步骤主要做了字节码生成的工作并绑定了执行环境。后面再单独分析编译流程，先往下

2. 进入 `Global(isolate, fun, mode, repl_mode) `

```c++
MaybeHandle<Object> DebugEvaluate::Global(Isolate* isolate,
  Handle<JSFunction> function,
  debug::EvaluateGlobalMode mode,
  REPLMode repl_mode) {

...

// 如果是副作用异常模式，执行 StartSideEffectCheckMode
if (mode == debug::EvaluateGlobalMode::kDisableBreaksAndThrowOnSideEffect) {
isolate->debug()->StartSideEffectCheckMode();
}
// TODO(cbruni, 1244145): Use host-defined options from script context.
Handle<FixedArray> host_defined_options(
Script::cast(function->shared().script()).host_defined_options(),
isolate);

// 执行脚本
MaybeHandle<Object> result = Execution::CallScript(
isolate, function, Handle<JSObject>(context->global_proxy(), isolate),
host_defined_options);

// 关闭
if (mode == debug::EvaluateGlobalMode::kDisableBreaksAndThrowOnSideEffect) {
isolate->debug()->StopSideEffectCheckMode();
}
return result;
}
```

该步骤针对副作用异常模式做了处理，在脚本执行前后做了特殊处理（后面分析，先往下）

3. 进入执行脚本流程 `Execution::CallScript`

```c++
MaybeHandle<Object> Execution::CallScript(Isolate* isolate,
                                          Handle<JSFunction> script_function,
                                          Handle<Object> receiver,
                                          Handle<Object> host_defined_options) {
  DCHECK(script_function->shared().is_script());
  DCHECK(receiver->IsJSGlobalProxy() || receiver->IsJSGlobalObject());
  return Invoke(
      isolate, InvokeParams::SetUpForCall(isolate, script_function, receiver, 1,
                                          &host_defined_options));
}
```

使用 SetUpForCall 设置调用参数，然后执行 Invoke 方法

Invoke 内部做了字节码运行前的准备，然后开始执行字节码，更具体的可以看这篇文章 - [连载《Chrome V8 原理讲解》第十篇 V8 Execution源码分析](https://zhuanlan.zhihu.com/p/428414777) 

接下来我们来分析 Ignition 解释器如何执行字节码

### Ignition 解释器
步骤步骤步骤
Ignition 解释器执行字节码的步骤如下：
1. 预处理：包括构建堆栈，参数入压等等，具体工作由 `InterpreterEntryTrampoline` 负责
2. 进入第一条字节码，执行完毕之后调用 `Dispatch()`，这个函数负责获取下一条字节码。
3. 执行字节码时，会使用该字节码对应的处理器（bytecode handler），该处理器是一种 Builtin（编译好的内置代码块）
4. 不断重复这个过程，直到字节码序列遍历完毕

以 `JSFunction 调用` 的内置代码块为例 `Generate_CallFunction`

内部执行过程如下：
```
// 不断向下执行，直到 RUNTIME_FUNCTION(Runtime_DebugOnFunctionCall)

void Builtins::Generate_CallFunction(MacroAssembler* masm,
                                     ConvertReceiverMode mode) {
  ...
  __ InvokeFunctionCode(rdi, no_reg, rbx, rax, InvokeType::kJump);
}

//=====

void MacroAssembler::InvokeFunctionCode(Register function, Register new_target,
                                        Register expected_parameter_count,
                                        Register actual_parameter_count,
                                        InvokeType type) {
  // ...

  // Deferred debug hook.
  bind(&debug_hook);
  CallDebugOnFunctionCall(function, new_target, expected_parameter_count,
                          actual_parameter_count);
  b(&continue_after_hook);

  // Continue here if InvokePrologue does handle the invocation due to
  // mismatched parameter counts.
  bind(&done);
}

// ======

void MacroAssembler::CallDebugOnFunctionCall(Register fun, Register new_target,
                                             Register expected_parameter_count,
                                             Register actual_parameter_count) {
  // ...
  
  CallRuntime(Runtime::kDebugOnFunctionCall);
  
  // ...
}

// ==== RUNTIME_FUNCTION 是一些全局的宏模板，由 FOR_EACH_INTRINSIC_DEBUG 定义（runtime-debug.h）

// 在 JSFunction 调用时，根据情况，准备介入或执行副作用检查
RUNTIME_FUNCTION(Runtime_DebugOnFunctionCall) {
  HandleScope scope(isolate);
  DCHECK_EQ(2, args.length());
  Handle<JSFunction> fun = args.at<JSFunction>(0);
  Handle<Object> receiver = args.at(1);
  
  // 函数调用时需要需要执行检查
  if (isolate->debug()->needs_check_on_function_call()) {
    // Ensure that the callee will perform debug check on function call too.
    Handle<SharedFunctionInfo> shared(fun->shared(), isolate);
    isolate->debug()->DeoptimizeFunction(shared);
    // ...
    
    // 检查副作用
    if (isolate->debug_execution_mode() == DebugInfo::kSideEffects &&
        !isolate->debug()->PerformSideEffectCheck(fun, receiver)) {
      return ReadOnlyRoots(isolate).exception();
    }
  }
  return ReadOnlyRoots(isolate).undefined_value();
}

```

如果为 SideEffects 模式，则进行副作用检查。


```c++
bool Debug::PerformSideEffectCheck(Handle<JSFunction> function,
                                   Handle<Object> receiver) {
  // ...
  
  // 获取副作用状态，并根据不同状态进行不同处理
  DebugInfo::SideEffectState side_effect_state =
      debug_info->GetSideEffectState(isolate_);
  switch (side_effect_state) {
    case DebugInfo::kHasSideEffects:
      if (FLAG_trace_side_effect_free_debug_evaluate) {
        PrintF("[debug-evaluate] Function %s failed side effect check.\n",
               function->shared().DebugNameCStr().get());
      }
      side_effect_check_failed_ = true;
      // Throw an uncatchable termination exception.
      isolate_->TerminateExecution();
      return false;
    case DebugInfo::kRequiresRuntimeChecks: {
      if (!shared->HasBytecodeArray()) {
        return PerformSideEffectCheckForObject(receiver);
      }
      // If function has bytecode array then prepare function for debug
      // execution to perform runtime side effect checks.
      DCHECK(shared->is_compiled());
      PrepareFunctionForDebugExecution(shared);
      ApplySideEffectChecks(debug_info);
      return true;
    }
    case DebugInfo::kHasNoSideEffect:
      return true;
    case DebugInfo::kNotComputed:
    default:
      UNREACHABLE();
  }
}
```

### 副作用检测

副作用被定义在 `v8/src/objects/debug-objects.h` ，一共有 4 种类型：

```
 enum SideEffectState {
    kNotComputed = 0,
    kHasSideEffects = 1,
    kRequiresRuntimeChecks = 2,
    kHasNoSideEffect = 3,
  };
```

那么如何判定副作用状态？

```c++
DebugInfo::SideEffectState DebugEvaluate::FunctionGetSideEffectState(
    Isolate* isolate, Handle<SharedFunctionInfo> info) {
  
  // ...
  
  // 如果是字节码列表
  if (info->HasBytecodeArray()) {
    // Check bytecodes against allowlist.
    Handle<BytecodeArray> bytecode_array(info->GetBytecodeArray(isolate),
                                         isolate);
    
    // 遍历字节码列表，根据三种情况判定
    bool requires_runtime_checks = false;
    for (interpreter::BytecodeArrayIterator it(bytecode_array); !it.done();
         it.Advance()) {
      interpreter::Bytecode bytecode = it.current_bytecode();
      if (BytecodeHasNoSideEffect(bytecode)) continue;
      if (BytecodeRequiresRuntimeCheck(bytecode)) {
        requires_runtime_checks = true;
        continue;
      }

      if (FLAG_trace_side_effect_free_debug_evaluate) {
        PrintF("[debug-evaluate] bytecode %s may cause side effect.\n",
               interpreter::Bytecodes::ToString(bytecode));
      }

      // Did not match allowlist.
      return DebugInfo::kHasSideEffects;
    }
    return requires_runtime_checks ? DebugInfo::kRequiresRuntimeChecks
                                   : DebugInfo::kHasNoSideEffect;
  } 
  // 如果是内置 api ，可以直接判定是否有副作用
  else if (info->IsApiFunction()) {
    if (info->GetCode().is_builtin()) {
      return info->GetCode().builtin_id() == Builtin::kHandleApiCall
                 ? DebugInfo::kHasNoSideEffect
                 : DebugInfo::kHasSideEffects;
    }
  } else {
    // Check built-ins against allowlist.
    Builtin builtin =
        info->HasBuiltinId() ? info->builtin_id() : Builtin::kNoBuiltinId;
    if (!Builtins::IsBuiltinId(builtin)) return DebugInfo::kHasSideEffects;
    DebugInfo::SideEffectState state = BuiltinGetSideEffectState(builtin);
    return state;
  }

  return DebugInfo::kHasSideEffects;
}
```

实现原理也比较简单，就是对 V8 涉及的基本操作（Bytecode / Builtin / Runtime function）和 Chrome Web APIs 进行标记，标记是否存在副作用，然后在 FunctionGetSideEffectState 中对操作进行遍历即可获知整体是否存在副作用。

无副作用的操作列表可以在 [debug/debug-evaluate.cc](https://source.chromium.org/chromium/chromium/src/+/main:v8/src/debug/debug-evaluate.cc;l=534) 文件的 allowlist 中找到。

字节码定义见：[bytecodes.h](https://source.chromium.org/chromium/chromium/src/+/main:v8/src/interpreter/bytecodes.h;l=26;drc=7cad264ede07ea787f4b81e7dc591a693869b194;bpv=0;bpt=1)




### 副作用处理

根据上方 PerformSideEffectCheck 的执行，若检测出来了副作用则抛出异常；若检测出来为 `kRequiresRuntimeChecks` ，则代表该「操作」是否拥有副作用需要在代码运行时进行判断，V8 会将原本的字节码进行替换为 DebugBreak

```
ApplySideEffectChecks(debug_info);

// ===

// static
void DebugEvaluate::ApplySideEffectChecks(
    Handle<BytecodeArray> bytecode_array) {
  for (interpreter::BytecodeArrayIterator it(bytecode_array); !it.done();
       it.Advance()) {
    interpreter::Bytecode bytecode = it.current_bytecode();
    if (BytecodeRequiresRuntimeCheck(bytecode)) it.ApplyDebugBreak();
  }
}
```


之后解释器在执行到 DebugBreak 的字节码时，会通过 [Debug::PerformSideEffectCheckForObject](https://source.chromium.org/chromium/chromium/src/+/main:v8/src/debug/debug.cc;l=2404;drc=4ff3e029555ff28d776c8ee9ba1d29de1d635ce7;bpv=1;bpt=1?originalUrl=https:%2F%2Fcs.chromium.org%2F) 检测参数是否存在于 temporary_objects_ 对象

```c++
// 标记临时对象，用于副作用检查。
class TemporaryObjectsTracker;
std::unique_ptr<TemporaryObjectsTracker> temporary_objects_;
```

temporary_objects_ 是一个 TemporaryObjectsTracker 实例，在预加载时创建，用于记录之后的变量分配和 gc 移动。

因此若引用的变量不在 temporary_objects_ ，说明该变量早于预加载前创建，若执行「修改操作的字节码」会有副作用。

**简单来说，就是创建了一个内存追踪器，若使用的变量不被此追踪器找到，则说明是之前创建的变量，对其赋值操作等会导致副作用**



### StartSideEffectCheckMode 做了什么？ 

前面提到，在执行脚本之前会执行 StartSideEffectCheckMode 操作。

根据上面的一些分析，我们也可以很容易猜到 StartSideEffectCheckMode 做了啥。

主要做的就是初始化 [temporary_objects](https://source.chromium.org/chromium/chromium/src/+/main:v8/src/debug/debug.h;drc=872e5881a4646e5b257d28ac44dfb4c2f9b54c73;l=543) ，注册了一个内存追踪器。

并在 StopSideEffectCheckMode 时进行重置


## 整体流程


![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/24f63826cc4d4aba81e7f2120a2cd903~tplv-k3u1fbpfcp-watermark.image?)



# 总结

本文对 devtools 执行 js 脚本的整个流程进行了分析。

从使用到黑盒测试，再到源码分析，层层深入，希望能对你有所帮助。

对于一开始的问题，结论也已在文章开头给出，可以做下回顾。

水平不足，如有错误，烦请指正

# 参考文档

- [连载《Chrome V8源码》技术文章](https://zhuanlan.zhihu.com/p/441130756)
- [理解 V8 的字节码「译」](https://zhuanlan.zhihu.com/p/28590489)
- [为什么在浏览器环境上调用函数，可以提前看到调用结果?](https://www.zhihu.com/question/406157937)
- [DevTools 实现原理与性能分析实战](https://segmentfault.com/a/1190000041184017)
- [Chrome DevTools Frontend 运行原理浅析](https://zhaomenghuan.js.org/blog/chrome-devtools-frontend-analysis-of-principle.html)
- [V8 concept](https://yjhjstz.gitbooks.io/deep-into-node/content/chapter2/chapter2-0.html)
- [谷歌V8引擎探秘：基础概念](https://blog.dingkewz.com/post/tech/google_v8_core_concepts_01/)








