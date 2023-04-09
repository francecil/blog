---
title: 通读「你不知道的 Chrome 调试技巧」
date: 2020-08-31 10:12:40
tags: 
  - Devtools
permalink: /pages/98ef3e/
categories: 
  - 随笔
---

# 前言

本文是对掘金小册 [「你不知道的 Chrome 调试技巧」](https://juejin.im/book/6844733783166418958/section/6844733783187390477) 的阅读笔记与思考。

该小册记录了一些可能少为人知却挺有用的技巧。在此基础上，我筛选出一些此前不知道的技巧，偏个人向，完整的可以阅读原小册。

当然，如果你完整的阅读过 chrome-devtools [系列文章](https://developers.google.com/web/tools/chrome-devtools) ，这些技巧应该都知道。

除了技巧罗列，本文会加入一些思考，比如这个技巧用来解决什么问题，其他浏览器如何模拟实现等等。

<!--more-->

# 通用篇

## 1. copy(value)

> 调用全局的 copy 方法，将 value 值复制到剪切板

在此之前，我们我们想复制一个对象的值，我们会怎么做？笨点的做法，可能会将其输出，然后层层展开，复制完再去掉一些无用or*重复文本*（懂的都懂）；或者再聪明一点，用 `JSON.stringify(val,null,2)` 带缩进输出后再复制

然而，现在仅需要用 copy 方法即可快速复制了。

借用原文的图

![](https://user-gold-cdn.xitu.io/2018/12/7/16787442a1444125?imageslim)

经过几组实验，发现 copy 值时内部调用的是 `JSON.stringify(val,null,2)` ，且在存在循环引用等调用 `stringify` 会报错的情况， 执行 copy 后剪切板复制到的值是 `[object Object]`

```js
let a = {say:()=>{},name:'gahing'}
copy(a) // {name:'gahing'}
a.toJSON = ()=>1
copy(a) // 1
a.c=a
copy(a) // [object Object]
```

所以，对于其他浏览器，也可以写一个全局的 copy 方法，以供使用：
```js
window.copy = (val) => {
    const getData = (val) => {
        if (val instanceof Element) {
            return val.innerHTML
        }
        try {
            return JSON.stringify(val, null, 2)
        } catch (error) {
            return '[object Object]'
        }
    }
    const writePasterVersion = (data) => {
        // 利用 textarea 可以保留换行等格式
        const textarea = document.createElement('textarea')
        document.body.appendChild(textarea)
        textarea.setAttribute("readonly", true)
        textarea.value = data
        textarea.select()
        if (document.execCommand('copy')) {
            document.execCommand('copy')
        }
        document.body.removeChild(textarea)
    }
    const data = getData(val)
    writePasterVersion(data)
}
```

注意这里还加入了复制 dom 元素内容的处理，原 copy 方法也是支持这个的。不过复制 dom 这个功能大部分浏览器也都支持就是了。

## 2. 快捷键

文中以及其他的一些文章都提到了快捷键技巧。

这个其实不用太去记，忘了就打开 Shortcuts 面板看看（打开控制台=>按 F1=>切到 Shortcuts 面板 ），用多了就熟了。

或者看 google dev 原文-> [键盘快捷键参考](https://developers.google.com/web/tools/chrome-devtools/shortcuts?utm_source=devtools)

小册中提到 Cmd + 数字可以用来切控制台的面板，不过需要先去设置那边开启 DevTools>>Settings >>Preferences>>*Appearance* 打开这个选项：

![](https://user-gold-cdn.xitu.io/2018/12/18/167c07cf4d56febf?imageslim)

这里额外发现，原先的  `Cmd + 数字` 快捷键更实用，可以用来切 tab ，很适合上班摸鱼（划掉）。

## 3. 使用 Command

用过 VS Code 的就知道， 我们可以通过 `Cmd + Shift + P` 吊起 Command 菜单，其实浏览器也有相同的操作（需要先打开开发者工具）

包括的功能有：

![](https://user-gold-cdn.xitu.io/2018/12/11/1679a2e13926d71b?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

> 上图引自小册

大部分指令就是通用设置和操作，其实可以在 `Settings` 里找到相应的设置和快捷键，所以大部分情况也没什么用，这里说下两个我个人觉得无可替代的 Command 功能

### (1) Debugger - disable JavaScript

相应的也可以在 `Settings - Preferences` 找到相应的配置，那为啥说无可替代呢？

我们应该经常遇到这样的需求：鼠标移动到某个区域时出现一个浮窗，移开时浮窗消失。浮窗的显隐是利用 js 的 mouse 事件来控制的。此时我们想调试浮窗的 dom 结构怎么办？

之前尝试过的操作有以下几种：
1. 右键-检查定位到 Elements 面板的 dom ，通过 Tab 和 方向键等调试样式，操作受限，且经常一不小心就消失浮窗导致白调试了。
2. 先打开 `Settings - Preferences` 面板，鼠标指向相应位置出现浮框的时候，快速切到 Preferences 面板设置 `disable JavaScript` ，不过这需要一个比较好的角度和手速，成功率不高。

今天发现可以通过提前切出 Command 面板，焦点处于输入框中，此时鼠标移动到相应区域显示浮窗。另一方面， Command 面板输入 `Disable JavaScript` 并回车禁用 js ，接下来就可以为所欲为了~

![](https://sf1-dycdn-tos.pstatp.com/obj/eden-cn/nupohneh7nupehpqnulog/img/disableJS2.gif)


**20200915 更新：** 这个方案处理不了需要点击的情况（比如点击选择框后展现下拉列表）。后经同事指点，提供了其他方案：
1. settimeout debugger
2. 父元素断点调试：Elements 面板 -> 父元素右键 Break on -> subtree modifications 


### (2) Screentshot 指令截图

输入 screentshot ，可以看到有以下指令：
- Capture area screentshot: 选择一个矩形区域并截图
- Capture full size screentshot: 整个网页截图
- Capture node screentshot: 单独截图某个节点区域，需要先去 Elements 面板选中节点再执行指令。
- Capture screentshot: 截图当前网页可视区域

这四个指令，基本能够满足我们对网页静态截图的种种需求，一些 Chrome 拓展可以选择卸载了~

## 4. 代码片段 Snippets 的使用

我们经常会在控制台写一些临时用的测试代码。但是可能隔很久之后又要用到它，再重写一遍有点浪费时间。

Chrome 给我们提供了一个编写代码片段，之后随时随地(任意页面)都可以执行这段代码的功能。

我们可以在 Sources 面板的 Snippets 栏中新建 snippet ，写完代码后通过右击菜单 run 或者快捷键 Cmd + Enter 来运行它

![](https://user-gold-cdn.xitu.io/2018/12/29/167f5b6997643be2?imageslim)

> 上图引自小册

甚至可以通过 `Cmd + P` 切出 `Open file` 功能后输入 `!` ，之后选择 snippet 并回车来运行代码片段

![](https://user-gold-cdn.xitu.io/2018/12/29/167f5b6999c09e59?imageslim)
> 上图引自小册

目前能想到的几个使用场景就是：
1. 编写单测 or 基于 fetch 的接口测试代码
2. 编写通用工具方法
3. 引入某些 npm 包（比如 moment/loadsh 等）的 umd cdn script 地址到页面，并测试该 npm 包的功能
4. 做断点测试（下文会提到）

不过对我来说，这个功能有点鸡肋。一方面很少用到，另一方面就算不用它我们也有各种替代品，比如输入几个关键字 console 就能跳出历史输入记录。

且实测 Snippets 数据不能进行 Chrome 间数据同步， 如果能同步的话更有用些，可以组装上自己的工具库了。



# console 篇

大部分技巧都可以在 [Chrome DevTools Console 原文](https://developers.google.com/web/tools/chrome-devtools/console/utilities) 中找到

## 1. console 中的 $

### $0~$4

`$0` 表示对当前选中节点的引用， `$1` 表示对上次选中节点的引入，以此类推直至 `$4`

所以我们可以很简单的进行 dom 节点移动
```html
<div class="list">
  <div class="item"></div>
  <div class="item"></div> <!--先选中这个节点 $1 -->
</div>
<div class="content"></div> <!--再选中这个节点 $0 -->
```
应用
```js
$1.appendChild($0) //即可实现 dom 节点移动
```

### $ 和 $$

$ 相当于 `document.querySelector` 的别名

$$ **类似**于 `document.querySelectorAll` ，但是返回的是节点数组，而不是 NodeList 类数组对象

`$` 和 `$$` 还支持第二个参数 `startNode` 即查询起点 document 改为 startNode

```js
$("div",$("div"))
```

其他浏览器的简单 mock （没做异常处理和特殊判断）
```js
window.$ = (selector, startNode) => (startNode || document).querySelector(selector)

window.$$ = (selector, startNode) => Array.from((startNode || document).querySelectorAll(selector))
```

### $_

上次执行结果的引用

![](https://user-gold-cdn.xitu.io/2018/12/7/16785d333e7c1d7f?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

> 上图引自小册

其他浏览器倒是不好 mock 这个功能。不过这个功能也挺鸡肋的就是

### $i

在此之前，控制台调试 npm 包是一个痛点，我们可能会：
- 新建项目->安装 npm 包->打包输入到 html 页面->devtools 测试，或者
- 找到 umd 包地址->script 引入->devtools 测试

现在，仅需要在控制台执行 `$i(npm_package_name)` 即可引入该 npm 包了

> 严格来说，这个是 Chrome 拓展 [Console Importer](https://chrome.google.com/webstore/detail/console-importer/hgajpakhafplebkdljleajgbpdmplhie/related) 的功能，并不是 devtools 自带的。也就意味着你需要先安装这个拓展，它会将 `$i` 方法插入到全局。

示例
![](https://user-gold-cdn.xitu.io/2018/12/7/16785da0dea963fb?imageslim)
> 上图引自小册

不过使用上有个体验稍微欠缺的点：引入后没有告知 window 上挂载的是哪个变量
> 因为有些包挂载的变量不一定是 npm 包名，比如 loadsh 的 `_` 。可能可以通过比对 window 前后挂载变量差异来实现

同时希望能支持上内网 npm 包引入，可能可以通过指定仓库源 or umd 地址来实现

该拓展的项目地址为 [console-importer](https://github.com/pd4d10/console-importer)，正好最近在研究浏览器插件，以上两个问题有空可以去提个 pr

> TODO: 后续实现会再写个文章

## 2. Ninja console.log

### Conditional breakpoints 条件断点

这个对我来说还是挺实用的，仅当满足某个表达式才进入断点，很适合在循环代码中按条件进行断点调试

操作：
1. 右击行号，选择 Add conditional breakpoint...(添加条件断点)
2. 填入表达式，返回结果为 [falsy](https://developer.mozilla.org/zh-CN/docs/Glossary/Falsy) 时不会暂停

![](https://user-gold-cdn.xitu.io/2018/12/17/167b94b8f36112b7?imageslim)
> 上图引自小册

如果只想体验这个功能的话，我们还需要新建一个 html 文档并引入 script 才能玩么？

并不用，还记得上文提到的代码片段 Snippets ，它同样支持调试，所以新建一个代码片段并开始体验吧

```js
// 代码片段
let res = 0
Array.from(Array(15))
.map(Math.random)
.forEach((v,i)=>{
    res += v*i
})
console.log(res)

// 断点表达式
v>0.8
```

### The ninja console.log

上面说到，表达式结果为 falsy 时不会暂停，这也就意味着我们可以使用 `console.time/log/group` 等代码作为表达式，它不会影响断点流程，但是却可以正常输出。

~~以后再也不需要在源代码里面输入 console 代码了~~

![](https://user-gold-cdn.xitu.io/2018/12/17/167b955a1f0311fc?imageslim)
> 上图引自小册

另外发现了一个 logpoint 操作，大概就是表达式里直接写参数，之后通过 `console.log` 帮你输出

所以上面的 console 相关操作通过 logpoint 也是可以的，且更符合语义

## 3. 方法代理

在方法被调用时，我们可以进行一些操作，包括触发调试，输出入参等等

编写方法
```js
function add(x,y){
  return x+y
}
```

### debug 调试方法

如何调试这个方法呢？

执行
```js
debug(add)
```

当调用方法时就会进入调试面板
```js
add(1,2)
```
> 可以通过 undebug 取消调用调试

因此调试方法，我们仅需要知道方法名就行了，不需要知道在代码中哪个位置再去设断点。

该方法的实现：

```js
window.debug = function (fnName, ctx = window) {
    let originFn = ctx[fnName]
    ctx[fnName] = function (...res) {
        debugger
        originFn.apply(ctx, res)
    }
}
```

测试用例

```js
class Animal {
  constructor(name){
    this.name = name
  }
  eat(food){

  }
}
let cat = new Animal("cat")
// debug(cat.eat)
debug('eat', cat)
cat.eat("fish")
```

不同于原本的 debug 方法，我们需要显式的传入上下文和方法名。同时进入 debugger 时还得操作几下才能进入 eat 方法

如果有更好的实现，欢迎分享~

后续有机会的看下 Command API 是怎么处理的，能否只使用 js 能力就能够实现

### monitor 监听方法调用

我们想知道我们编写的代码是否被调用，以及入参是什么，以往我们可能会写 `console.log`代码，但有了 monitor 我们将不再需要了

```js
monitor(add)
add(1,2)
// output: 
// function add called with arguments: 1, 2
// 3
```

该方法的实现：
```js
window.monitor = function (fnName, ctx = window) {
    let originFn = ctx[fnName]
    ctx[fnName] = function (...res) {
        console.log(`function add called with arguments: ${res.join(',')}`)
        return originFn.apply(ctx, res)
    }
}
```

缺点同上，有更好的做法欢迎分享~

### monitorEvents(object[, events]) 监听事件调用


```js
monitorEvents(window, "resize");
```

执行上述代码，当窗口大小变化时会输出以下内容
```
resize Event {isTrusted: true, type: "resize", target: Window, currentTarget: Window, eventPhase: 2, …}

resize Event {isTrusted: true, type: "resize", target: Window, currentTarget: Window, eventPhase: 2, …}

resize Event {isTrusted: true, type: "resize", target: Window, currentTarget: Window, eventPhase: 2, …}

resize Event {isTrusted: true, type: "resize", target: Window, currentTarget: Window, eventPhase: 2, …}
```


此外 event 还支持数组和映射，更多可查看 https://developers.google.com/web/tools/chrome-devtools/console/utilities#monitorevents


mock 的话，赶紧就直接用 addEventListener 即可

## 4. Live expression 功能

在 Console 面板的 "眼睛" 符号处开启。

类似 Vue 中的 computed ，书写一个表达式，当表达式中的成员变量变化时，结果会实时更新展示。

示例：
![](https://user-gold-cdn.xitu.io/2018/12/29/167f82b33009449f?imageslim)
> 上图引自小册

目前想到的使用场景有：
### (1) dom 节点个数统计

```js
document.querySelectorAll("*").length
```

### (2) 计算数学表达式

```js
Math.pow(2,n) + 1
```
### (3) 展示当前点击位置坐标
```js
// 控制台先输入
document.addEventListener("click",({clientX,clientY})=>myPosition=({clientX,clientY}))

// Live expression 为
myPosition // 效果类似上图示例，这里不再展示
```

## 其他

- console 面板中可以直接用 await ，无需包裹 async iife
- 测试回调参数时，直接在回调中使用 `console.log` 是更佳的做法： `getLocation(console.log)` ，不要 `getLocation((v)=>console.log(v))`


# Network 篇

## 1. 关闭 overview 扩大请求面板空间

overview 是一些时间轴信息，大部分情况下我们并不需要，还占面板空间

![](https://sf1-dycdn-tos.pstatp.com/obj/eden-cn/nupohneh7nupehpqnulog/img/network_overview.png)

可以在设置中关掉它（上图 show overview 处）

## 2. 禁用请求

> 想看看当某些脚本、样式文件缺少或者其他资源加载失败时，网页的样子吗？在 Network 面板对某条请求右击选择 **Block Request URL**。一个新的 **禁用请求** 面板会被呼出，在这里可以管理被禁用的请求。

![](https://sf1-dycdn-tos.pstatp.com/obj/eden-cn/nupohneh7nupehpqnulog/img/block-request-url.png)

（以上引自官方原文）

在 **禁用请求** 面板中设置 url 规则会更方便，还支持正则

## 3. XHR/fetch 断点

在 source 面板右侧 XHR/fetch Breakpoints 新建断点

示例如下：

![](https://user-gold-cdn.xitu.io/2019/1/22/16874662814db12c?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

> 上图引自小册

比如对表单提交请求做断点，查看提交数据是否正常（当然也可以在 network 面板中看数据）

目前没发现这个功能的必要使用场景

# Elements 面板篇

## 1. 通过 `h` 去隐藏元素

选中元素，按下 h ，此时会给元素加上一个 style 样式，用来隐藏元素
```css
visibility: hidden !important;
```

再按一次则显示元素

## 2. 颜色选择器的 Contrast ratio(对比度)

打开文本的调色选择器，可以看到 Contrast ratio 属性，其表示文字颜色和背景色的对比度

有三种情况：
1. 🚫：表示对比度太低
2. ✅：表示遵从 AA 声明，至少为 4.5
3. ✅✅：表示遵从  AAA 声明，至少为 7

![](https://user-gold-cdn.xitu.io/2018/12/12/167a1d2cc3b22cdd?imageslim)
> 上图引自小册

展开 Contrast ratio 后，颜色面板还会出现 2 条线，用来指导开发者选择满足相应标准的对比度

# Drawer 篇

通过 More Tools 打开

因为更少用到，所以入口会更深。这里说下一个新发现的比较实用的功能。

## 1. Changes 

我们经常在控制台上，对线上页面进行样式调试。

当调试结束时，怎么确定我改了哪些样式？人脑记？

这时候 Changes 功能就可以满足我们的需求

它会记录文件变化的情况，就像 git 一样，还支持撤回某些修改

![](https://user-gold-cdn.xitu.io/2018/12/29/167f829dadf27e11?imageslim)

> 上图引自小册

不过**需要注意**的是，对于压缩过的 css 来说，样式只有一行，这个 Changes 功能没啥用

# Workspace 篇

大部分情况下，我们是通过框架和打包工具进行开发的，这个功能不是很好用（也可能是我姿势不对），这里不再赘述。

对于纯 js/css 的小项目来说这个功能可能比较有用，感兴趣的可看小册[原文](https://juejin.im/book/6844733783166418958/section/6844733783225139214) 

总的来说一句话，改动是相互同步的

# 总结

Chrome Devtools 提供了很多强大的功能，解决了许多痛点，不过部分功能也很鸡肋

Devtools 的功能在不断更新，仅仅阅读他人的文章是当不了最潮的 debug boy 的，还是得多看看官方文档 😏
