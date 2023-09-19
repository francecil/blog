---
title: JS 学习笔记
date: 2017-02-14 17:11:23
permalink: /pages/8b553a/
categories:
  - 大前端
  - 前端基础
  - 编程语言
  - JavaScript
tags:
  -
titleTag: 笔记
---

# 基础

## `<script>` 标签基础

- `async="async"`: 异步下载，尽快执行；
  - 支持 module script ，将变成尽快执行
  - 故会堵塞 dom 解析，建议异步的脚本不要进行 DOM 修改，不能确定谁先谁后
- `defer="defer"`: 异步下载，DOMContentLoaded 触发前执行； - module script 默认就是 defer
  > 以上 2 个属性只适合外部脚本
- `type="module"`: 模块加载
  - 多个 module 则按序执行
  - module 引用的模块，会在执行时再进行请求加载

详见：https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/script

浏览器在遇到 `<body>` 才开始呈现页面内容，故一些判断是手机还是 pc 然后跳转的就可以把 js 放到 `<head>` 中

https://segmentfault.com/a/1190000006778717

## 一元+

```js
var a="12";
a=+a;  a=12 有转换为数字的功效
== != 会先转型 再比较
=== !== 不转型 先比较类型
for(var property in 对象){
	console.log(property);输出对象的所有属性
}
```

## labelName:statement

break 和 continue 后面+上 label 名即可跳转到该处运行
最好不要用 label。。
一般使用场景
thisIsLable:

```js
for(){
	for(){
		if(){
			continue thisIsLable;//退出内部循环，继续外部循环
			//or
			break thisIsLable;//退出内外部循环
		}
	}
}
```

## with(expression) statement

ex:

```js
var qs = location.a().c;
var url = localtion.b;
var vf = localtion.d;

with (location) {
  var qs = a().c;
  var url = b;
  var vf = d;
}
```

注：`a().c,b,d` 以上变量在 with 中首先会被认为是局部变量，如果找不到定义，在看 location 有没有同名属性。
qs,url,vf 可以被 `with(){}` 外访问到(作用链延长)..
注 2：严格模式不允许使用 with

## switch 中比较用的是===

## function

### 参数的数量不一定要和指定的一致

若 function()无指定参数名,通过 `arguments[i]` 来获取
也可以与 `function(name1,name2){}中的name1,name2` 一起用
name1 与 `arguments[0]` 值一样，可以同时用，并保持单向同步
注 0：修改 `arguments[0]` 的值会同步 name1 的值，但修改 name1 的值不会同步 `arguments[0]` 的值
也就是说并非引用同一内存地址，内存空间是独立的，只是通过某种手段去同步
没有被传递值的命名参数默认为 undefined

### 非严格模式下，传入一个参数，改变 `arguments[1]` 的值，name2 不会改变还是 undefined

### 严格模式下，也是 undefined,并且传入 2 个参数的情况，对 `arguments[1]` 的修改不会影响 name2,即 无单向同步

## 没有重载

定义多个 function 即使参数个数不一致，也只会调用最后一个定义的，所以重载只能通过在 function 中判断参数个数和类型来做了

## 常量

### 字符串

js 中的字符串是一个常量，是不可变的

意味着无法直接修改索引下标去改变字符串的值

## 变量

可以给对象动态的增加属性
基本类型 a=b 是值复制，对象是引用复制(同一堆内存地址)
参数传递也是值和引用两种，和 Java 类似

## instanceof 判断是什么类型的引用

## 作用域

一般只有全局和局部

### 没有块级作用域(注：es6 有)

```js
if (1) {
  var a = "h";
}
alert(a); //"h"
```

### 在局部里初始化的变量 没有声明，则 将其作用域变成全局 严格模式下不声明就初始化将报错

## GC

#引用类型

## Object

定义对象时最后一个属性不加逗号
创建对象基本方式

```js
1.var obj=new Object();
obj.name1=value1;
2.var obj = {
	name1:value1,
	name2:value2
};
```

赋值可以混合使用， 初始化也可以这样：var obj={};

## Array

var array1=new Array([num]);//num 可选 为初始化长度，可以直接初始化值 = new Array("a",1,true);
方式 2 var array2=["b",2,false];
注意 length 不是只读 增大 访问项为 undefined 减小 length 没掉的访问项为 undefined
检测数组，为了让其在多个可能存在的全局对象中统一，不用 instanceof
而是用 Array.isArray(xxx)
array1.join(";")将 array1 的分隔符改为；并返回
newLength=array1.push(value) newLength=array1.pop()
firstValue=array1.shift():取出第一项
newLength=array1.unshift(value)插入到第一项 之前元素后推
sort(compare)和 reverse(compare) 正逆序排序
function compare(value1,value2){
...ex: v1<v2 return -1
}
var a2=array1.concat("a","b");//array1 复制后再加上 a,b
var a3=array1.slice(1,2);//剪裁
这两个函数都不会影响原数组

### splice 返回值为被删除的项数组

删除：splice(要删除的起始项，要删除的项数)
插入：splice(要插入的起始项，0，"a","b"...插入的项)
替换：splice(要替换的起始项，要删除的项数，"a","b"...)
```js
indexOf(要查找的项，查找起始项的索引);
lastIndexOf(xx,xx); ###迭代
every(function(item,index,array){
//每一项都运行给定函数，如果都返回 true 则返回 true;
...（给定函数）
});
filter()//每一项都运行给定函数，返回该函数会返回 true 的项数组
forEach()//每一项都会运行给定函数，无返回值
map()//每一项都会运行给定函数 返回 每次函数返回结果 构成的数组
some//存在一项运行函数返回 true 则返回 true
reduce//项从左往右执行 function 第一个参数值在第一次运行时为第一项的值
reduceRight(function(上一个函数运行的结果，当前项的值，index,array){
...
});
```

## Date

var a=new Date();
Date.now() 获得毫秒数

## RegExp 用来支持正则
```js
var expreesion=/ pattern / flags
var ex2=new RegExp{"[cc]at",i};
/**
flags:
g:全局匹配，而非发现第一个匹配就停止
i:不区分大小写模式，只找第一个匹配
gi:全局匹配且不区分大小写
m:多行模式，到达一行文本末尾会继续查找下一行中的匹配 也就是说不用特地去管换行符，所有行组成一行的概念
*/
ex2.test("adasdasdaskdjlqd"); // true or false
var matches=ex2.exec(匹配串)//返回第一个匹配项信息的数组 注意：即使设置为 g 也只会返回第一个但是多次调用会返回下一个
```
该数组第一项 `matches[0]` 为与整个模式匹配的字符串,其他项为 `matches[0]` 匹配模式的字符串?

### 一些长短属性名 使用时查即可

### 局限性

## Function

JS 引擎会把函数声明提升到顶部，所以函数调用可以在函数声明之前，但是把函数声明改为函数表达式将报错
```js
// ex:
sum(10,10)
function sum(a,b){return a+b;}
// 改为
sum(10,10)
var sum=function(a,b){return a+b;};将报错
```

### 函数内部属性

arguments.callee 等价于拥有 arguments 该对象的函数
用来解决函数名耦合的问题，后面用其他变量名引用函数也方便使用

### this

a.call(作用域比如 window,argument1,argument2,...);
Function a(){
this.xxx ;//通过 call 调用 a 函数 this 即 call 传过来的作用域
}
apply()用法类似，只是第二个参数是 arguments，或者[a,b]数组
//num.toPrecision(num) 指数表示法 num:小数位数

## 单体内置对象

encodeURI 只转空格.
enCodeURLComponent 任何非标准字符（: / $npsb 等 ）都会进行编码 :**用于发送给服务器的数据编码**

### eval 注意非严格模式下的注意点

### Math

    ceil()上界
    floor()下界
    round()四舍五入
    random() 0~1间的随机数不包括0,1

得到[2,32]间的随机数

    Math.floor(Math.random()*31+2)

# 面向对象

```js
var person = {
  age: 17,
  name: "ss",
  say: function () {
    xx;
  },
};
```

### 数据属性
```js
Object.defineProperty(person,"name",{
configurable:false, //默认 true,不能通过 delete 删除属性从而重新定义属性,不能通过访问器属性修改属性
value:"zjx", //默认 undefine,该属性的值
wriable:false, //默认 true,数据只读不可写
Enimerable:true //默认 true,可以通过 for-in 循环返回属性
});
```
在调用该方法时，如果不指定，configurable，wriable，Enimerable 特性的默认值都是 false
配置

### 访问器属性

```js
var book={
	_year:2011, //‘_’一种常用标志，用于表示只能通过对象方法访问的属性
	edition:1
}
Configurable 同上，能否把属性修改为数据属性
enumerable
get:function(){}
set:function(newValue){}
访问器属性不能直接定义，只能通过下面方法
Object.defineProperty(book,"year"{ //访问器属性year
	get:function(){
		return this._year;
	},
	set:function(newValue){
		this._year=newValue;
		this.edition+=newValue-2011;
	}
});
```

通过

```js
book.year = 2010; //可以正确的设置book._year和edition
```

只指定 getter 意味着不能写，只指定 setter 的属性不可读，严格模式下读写未指定的会报错

### define muiti properties

```js
Object.definePropertites(book,{
	_year:{
		value:2011
	},
	year:{
		get..set..
	}
});
```

### 读取属性特性

```js
var descriptor = Object.getOwnpropertyDescriptor(book, "_year");
console.log(descriptor.value); //2011
descriptor.configurable; //false 默认false？
```

## 创建对象

### 工厂模式

```js
function CreatePerson(a,b,c){
	var o=new Object();
	o.a=a;
	...
	return o;
}
var person=Create(..);
```

### 实例模式

```js
//function person(a,b,c){
//	this.a=a;
//  ...
//	this.sayName=function(){}
//};
var person1=new Person(..)
```

### 原型模式 prototype

每个函数都有一个 prototype 属性，指向一个对象

```js
function Person() {}
Person.prototype.name = "abc";
var person1 = new Person();
```

...
初步了解，后续待研究
注意原型和构造的区别

## 继承

略 待上部分研究完毕

# 函数表达式

```js
var func = function () {}; //匿名函数

var func;
if (condition) {
  func = function () {};
} else {
  func = function () {};
}
```

否则用函数声明时

```js
if (condition) {
  function func() {}
} else {
  function func() {}
}
```

会报错

## 递归

```js
function factorial(num) {
  if (num <= 1) {
    return 1;
  } else {
    return num * factorial(num - 1);
  }
}
var abc = factorial; //用另外一个变量指示该函数
factorial = null; //原函数引用只剩abc
console.log(abc(5)); //error 找不到factorial
```

之前说过可以用 arguments.calllee
return num*factorial(num-1); => return num*arguments.calllee(num-1);
但是严格模式下不能调用 arguments.calllee,访问该属性会出错
通过函数命名表达式来解决

```js
var factorial={function f(num){
	...
	return num*f(num-1);
}}
```

即使 factorial 赋值给其他对象，f 仍然有效

## 闭包

# BOM

## window 对象

setTimeout and setInterval

(fun/string,time)

将在指定 time 后把任务发给任务队列，队列空则开始执行，也就是说，上一任务还未结束则等待

(js 单线程，共用同一个任务队列

```html
<script>
  for (var i = 1; i <= 3; i++) {
    setTimeout(function () {
      console.log(i);
    }, 0);
  }
</script>
```

setTimeout 把任务添加进任务队列，但是需要等先进任务队列的 for 循环。故最后输出三个 4.

## location 对象

假设初始是 `http://www.abc.com:8080/hello`

将 url 修改为`http://www.abc.com:8080/hello#section1`

location.hash="@section1";

将 url 修改为`http://www.abc.com:8080/hello?q=111`

location.search="?q=111"

其他的 hostname,pathname,port 的修改方法类似

除 hash 外 其他调用都会以新 url 加载

location.reload(bool) 重新加载，是否从本地缓存获取数据

## navigator 对象

### 检测插件

IE 不可用

```html
<script>
  for (var i = 0; i < navigator.plugins.length; i++) {
    console.log(navigator.plugins[i].name);
  }
</script>
```

# 事件

尽量只用冒泡事件流

事件流程：捕获（document->dom 对象->具体元素) -> 冒泡(具体元素->dom 对象->document)

## DOM2 级事件处理

`dom元素.addEventListener("事件名如click",处理函数,boolean值：冒泡处理false还是捕获阶段处理true[一般是使用冒泡])`;

如果处理函数是匿名函数，则无法通过`removeEventListener(,,)[参数一致]`移除

`stopPropagation` 停止继续冒泡 or 捕获

封装 EventUtil 来处理 IE 和其他浏览器，见 pdf 13 章

`preventDefault(event)` 屏蔽默认方法

```html
<div class="test1"></div>
<script>
  document.querySelector(".test1").addEventListener("click", function () {
    console.log(1);
  });
  document.querySelector(".test1").addEventListener(
    "click",
    function () {
      console.log(2);
    },
    true
  );
</script>
```

Q：点击 div.test1 后，数字 1 和 2 的出现顺序是什么样的？

A: 1,2 此时该元素处于目标元素，不存在什么冒泡或捕获阶段

注意：点击 label 时，默认处理会 focus 对应的控件并执行点击操作（可以用 preventDefault 取消）

所以对于`<label>Click me<input type="text"></label> ` 这类的，事件绑定在 label 时要额外注意

## 事件类型

### HTML5 事件类型

> contextmenu 上下文菜单

win 为浏览器时鼠标右键填出的窗口

可捕获该事件并屏蔽默认事件，然后弹出自定义窗口

> beforeunload 页面被关闭前触发

一般用于询问用户是否真的要关闭页面

## 内存和性能

1.多次注册监听事件影响性能，可以利用事件委托，在尽量高层添加事件处理程序

2.在不需要的时候移除事件处理程序

在卸载页面前，先通过`onunload`事件处理移除所有事件处理程序。

所以多用事件委托，移除就更容易

## 模拟事件

### 模拟鼠标事件

```js
	var event = document.createEvent("MouseEvents");

	event.initMouseEvent(..)

	btn.dispatchEvent(event);
```

变动事件和 HTML 事件较少用到

# 表单

submit 存在时，有焦点按回车会提交，想在此之前先做判断再提交可以`preventDefault`

## 文本选择 Range.

具体样例见 diigo 调研

## 过滤输入

检测 keypress 过滤后 preventDefault

一些浏览器非字符键也会触发[编码为 0 or 8]，故还要判断是否 charCode >=9

还要考虑 Ctrl+C 等的组合键 ，确保不屏蔽 Ctrl 键

## 剪切板

操作剪切板的几个方法能在复制、剪切、粘贴 前/时 调用

访问剪切板数据 通过 clipboardDta.getData()

## H5 约束验证

    formnovalidate = true :禁用验证

输入模式 pattern 不能阻止用户输入无效文本

配合 checkValidity 检测有效性方法来处理 or validity 告诉你为什么有效或者无效

## 选择框脚本

## 富文本

略 用的时候再看。

# Canvas

## 上下文 Context

```js
	var drawing=document.getElementById("test");
			if(drawing.getContext){
				var context=drawing.getContext("2d");
				context.fillStyle="#ff0000";
				context.fillRect(10,10,20,20); 点(10,10)开始的边长为20 的红色矩形

			}
```

strokeStyle =color 描边颜色 矩形可以直接指定，路径需要在绘制完成后再调用 stroke 方法

fillStyle 填充 矩形可以直接指定，路径需要在绘制完成后再调用 fill 方法

closePath 将路径的起点终点用直线连接起来

蓝边红底半圆效果

```js
context.strokeStyle = "blue";
context.fillStyle = "red";
context.beginPath();
context.arc(100, 100, 99, 0, Math.PI, false);
context.closePath();
context.stroke();
context.fill();
```

**注**：要画另外一条路径，先 moveTo 到新路径起点，否则将与前面的连起来，路径起点还是原路径的起点

要绘制路径要先调用 beginPath()方法：作为一种标识，closePath/stroke/fill 等方法调用时只处理两者之间的代码

如这样只会绘制内圆

```js
context.beginPath();
context.arc(100, 100, 99, 0, 2 * Math.PI, false);

context.beginPath();
context.arc(100, 100, 60, 0, 2 * Math.PI, false);
context.stroke();
```

简单的说 两者之间的代码只是作为状态的设置，最后才会绘制.

###文本绘制

比较简单 参看 API

### 变换

参见 API，可以做个时钟动画来学习下。

save restore 栈结构用于保存和恢复 fillStyle 和 strokeStyle 属性

### 绘制图像

```js
context.drawImage(<img>元素 / <canvas>元素,起点x,起点y,绘制图像宽，绘制图像高)
canvas.toDataURL 输出canvas结果
```

s

### 阴影

### 渐变

### 模式

同 background-repeat

### 使用图像数据

imageData=context.getImageData(起点坐标 宽高) 去获取原始图像数据

data=imageData.data

image.data=修改后的 data

利用 context.putImageData(imageData,0,0)回写图像数据并显示

注意 要做上面处理的时候 context.drawImage 时传入的 image 不能是其他域的

### 合成

两个图像重叠时以什么效果去做，与 android 用法相似

## WebGL

Canvas 的 3d 上下文 与 es2 用法类似，需要用的时候再去看看。做个 demo 啥的

# H5 脚本编程

## 跨文档消息传递

向当前页面的`<iframe>`传递数据 `postMessage(消息,域)`

## 拖放(重点)

做一个类似 qq 邮箱的可拖放图片并显示的效果来掌握

## 媒体元素

video audio

api 齐全 用时看下

想知道是否支持编解码器

利用

```js
if (audio.canPlayType("audio/mpeg")) {
}
```

返回值 maybe / probably 表示 true

空字符串表示 false

## 历史状态管理

> pushState("初始化页面所需信息","新标题，目前无浏览器实现","相对 URL")

创建新的历史状态 按后退会促发 popState，其事件有一个 state 属性(当初 pushState 传入的第一个参数)

```js
var state = event.state;
if (state) {
  //第一个页面加载时state为null
  processState(state); //把页面重置为状态对象中的数据表示的状态,自己实现
}
```

> replaceState("初始化页面所需信息","新标题")

不会创建新状态 只会更新当前状态

# error and debug

## 错误处理

```js
try {
  return 1;
} catch (error) {
  alert(error.message);
} finally {
  return 0;
}
```

最终`return 0;`

`throw + 任意类型` 抛出自定义错误

代码会立即停止运行，除非被 catch 到

若错误未被处理(catch)，会触发 window 对象的 error 事件

```js
window.onerror = function (message, url, line) {
  alert(message);
  return false; //false 阻止浏览器报告错误的默认行为
};
```

一般不使用它而是在代码中去 catch

**常见错误：**

1.流控制语句使用非布尔值去判断

> 要求：str 值非空就可以继续处理

```js
if (str) {
  console.log("继续处理");
}
```

    然而当str=0 的时候也不会处理

```js
if (str != null) {
  console.log("str非null");
}
```

2.判断是否为数组应该 用 `values instanceof Array`

而不是用特性执行检测，如判断 `typeof values.sort == "function"`

3.通信错误

未进行 URI 编码 发送给服务器之前 数据需要先进行 encodeURLComponent

将 js 错误回写服务器

```js
//sev:严重程度 msg:错误消息
function logError(sev, msg) {
  var img = new Image();
  img.src =
    "log.php?sev=" + encodeURIComponent(sev) + "&msg=" + encodeURLCompoent(msg);
}
```

    所有浏览器支持image对象
    可避免跨域
    独立，不同于第三方ajax包装库可能出问题

## 调试技术

没有一种跨浏览器的调试机制，需要封装成如下

```js
function log(msg) {
  if (typeof console == "object") {
    console.log(message); //主流版本
  } else if (typeof opera == "object") {
    opera.postError(message); //opera 10.5前版本可用此方法输出任何信息
  } else if (typeof java == "object" && typeof java.lang == "object") {
    java.lang.System.out.println(message);
  }
}
```

### 抛出错误

```js
    throw new Error(msg)

    assert(true条件，条件为false要抛出的错误msg)
```

# JS & XML

XPath XSLT E4X

略 使用时看文档

# JSON

## stringify

js 对象转 json 字符串 默认不包括空格和缩进，函数 原型成员 undefined 都被忽略

有两个额外参数：

> 1.过滤器(数组 or 函数)，结果只包含数组中的属性，或者根据函数的 key value 返回自定义的值 2.保留缩进，传入一个数值 or 字符串：数值表示每个级别 缩进的空格数 最大数值为 10；字符串将代替空格，最大字符串长度为 10

有时 stringify 不能满足需求的时候，可以通过对象上调用 toJSON 方法
`toJSON()`:若存在该方法且能得到有效的值，则

`parse`: json 字符串转 js 对象

有一个额外参数：

是一个还原函数(key,value)，若还原函数返回 undefined,则返回的 js 对象中不包括该键值

可以基于键返回新的值，如属性中 value 含有的非常规值而是对象的时候就可通过此法返回对象

# AJAX & 跨域

## 用法 XHR-1 级

IE7 之前 XHR 需要用 ActiveX

XHR 只能向同域中使用同端口和同协议的的 URL 发送请求

```js
    var xhr = new XMLHTTPRequest(); //IE7以下需要用ActiveXObject 见pdf
    xhr.open("get"/"post",url,true/false);//待发送请求 true异步

    xhr.setRequestHeader("ZJXHeader","TEST");//设置自定义请求头部信息，代码需放两个方法之间

    xhr.send("search=abc&key=2" or null);//发null不是必须只是为了兼容某些浏览器需要参数

    xhr.getResponseHeader("ZJXHeader");//可以取得相对应的响应信息
```

**同步**：

responseText：响应文本，无论是什么类型

responseXML: 若响应内容类型是`“text/xml”`or`application/xml` 返回 XML DOM 文档，否则为 null

status: 响应的 HTTP 状态

statusText: HTTP 状态说明，一般不用

**异步**：

```js
xhr.onreadystatechange = function () {
  if (xhr.readyState == 4) {
    //接受到全部数据
    //根据xhr.status来判断此次请求是否成功
  } else {
    //3:接受到部分数据
    //2:已经调用send方法，但未接受到响应
    //1:已经调用open方法，尚未调用send方法
    //0:尚未调用open方法
  }
};
```

    xhr.abort()取消异步请求

## XHR2 级规范

**1.FormData**

表单的序列号，存 k-v 对，所有浏览器都有实现

    var data = new FormData(form);

    xhr.send(data)

**2.超时设定**

    xhr.timeout = 1000;//仅适用于ie8+

**3.overrideMimeType()方法**

重写 MIME 类型

如服务器返回的是`text/plain`但实际数据是 XML

responseXML 值为 null 此时可以调用该方法

该方法需要在 send 之前调用

主流浏览器都支持

## 进度事件

以`loadstart`开始，中间若干`progress`，然后触发`abort/error/load`中的一个，最后以`loadend`结尾。

`abort`:调用 abort()方法而终止

`load`:接收到完整响应

`error`:请求发送错误

`progress`：function(event){} event 中包含进度信息是否可用(lengthComputable)，已接收字节数(position)和 Content-Length 响应头确定的预期字节数(totalSize)

## 跨源资源共享 CORS

```js
//XHR 的一个限制就是跨域安全策略
//
//在请求中添加一个额外的 Origin 头部
//
//eq:
//
// Origin： http://www.gahing.tech
//
//服务器会在`Access-Control-Allow-Origin`回发相同的源信息
// eq:
//
// Access-Control-Allow-Origin: http://www.gahing.tech
//
```

## 其他跨域技术

### 1.图像 Ping

之前有提到过，`img.src="http://xxx.com?search=abc";` 即可发起调用。

常用于跟踪用户点击页面行为 及广告曝光次数

缺点：只能发 Get 请求，不能获得响应文本

### 2.JSONP

...............

# 离线存储

见 Diigo 技术调研一文

- sessionStorage 无法跨标签页传输，且在标签页关闭时销毁数据
- localStorage 支持跨标签页传输，且持久化存储

# 最佳实践

## 可维护

CSS 与 JS 的解耦合：

修改元素的 css 类(需要创建更多类) 而不是修改 css 类中的属性，看情况采取该法。

应用逻辑和事件处理的解耦：

勿将 event 对象传给其他方法，只传 event 对象的部分值

避免全局量，多个全局量可以用一个单一的全局量对象去封装

然后其他的命名空间在该对象上创建.一般项目每个人维护自己的命名空间

js 中的 if 判断，一般是让其与应该值比，而不是与不符值比，

如判断 一个对象是不是数组，不能判断`if(value!=null)`而是判断`if(value instanceof Array)`

## 性能

### 1.作用域

1.全局变量多次引用应该用一个局部变量代替

2.避免 with

### 2.避免双重解释

如`setTimeout("alert('Hello world')",500)`

### 3.最小化语句数

1.多变量声明

```js
var a = 5;
var b = "blue";
var c = [1, 2, 3];
```

应该改为

```js
var a = 5,
  b = "blue",
  c = [1, 2, 3];
```

2.使用数组和对象字面量

```js
var person = new Object();
person.name = "gahing";
person.age = 14;
```

改为

```js
    var person={
    	name:"gahing",
    	age:14;
    };
```

语句从 3 条变为 1 条

### 4.优化 DOM 交互

1.使用 fragment

`var fragment=document.createDocumentFragment()`

先将 item 添加到 fragment

最后 fragment 被添加`list.appendChild(fragment)`

代替每次直接`list.appendChild(item);`

2.大 DOM 修改采取 innerHTML

3.使用事件代理，前面事件一章已提到

## 部署

压缩 调试 构建工具的选择

# 新兴的 API
