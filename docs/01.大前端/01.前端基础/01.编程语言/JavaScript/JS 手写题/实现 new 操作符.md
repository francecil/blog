---
title: 实现 new 操作符
date: 2019-10-21 16:58:00
permalink: /pages/85c45e/
titleTag: 专题
categories: 
  - 大前端
  - 前端基础
  - 编程语言
  - JavaScript
  - JS 手写题
tags: 
  - 
---
实现 _new，达到如下效果
```js
function A(){ this.name = "test" }
var a = _new(A)
a.name //test
```


<!--more-->


## what is new

new 运算符是一个左值表达式，

```
NewExpression :
MemberExpression
new NewExpression

MemberExpression :
PrimaryExpression
FunctionExpression
MemberExpression [ Expression ]
MemberExpression . IdentifierName
new MemberExpression Arguments

Arguments :
( )
( ArgumentList )
```


我们以

```js
function A(){
  this.name = "test"
}
```
为例，

```js
new A() // new MemberExpression Arguments, MemberExpression =>FunctionExpression
new A // new NewExpression, NewExpression =>MemberExpression =>FunctionExpression
new new A // 按上面语法描述，这里是可以这么写的，且不会报语法错误，仅是报了 TypeError
new A.name // TypeError 错误。new NewExpression, NewExpression=> MemberExpression =>MemberExpression . IdentifierName 。
```
前两种写法均可，在有传参的时候只能使用第一种，同时注意语法解释过程，第四种写法语法解析完变成 new MemberExpression . IdentifierName，即 new "A", 导致异常

我们以无参数调用 `new NewExpression` ，分析 `new A` 的执行过程：
1. 令 ref 为解释执行 *NewExpression* 的结果 . 这里 ref = A
2. 令 constructor 为 [GetValue(ref)](https://www.ecma-international.org/ecma-262/5.1/index.html#sec-8.7.1). 这里 constructor  = A
3. 如果 [Type(constructor)](https://www.ecma-international.org/ecma-262/5.1/index.html#sec-8) 不是对象 ，抛出 TypeError 异常 . 这里 Type(constructor) 为 对象
4. 如果 constructor 没有实现 [[Construct]] 内置方法 ，抛出一个 TypeError 异常 .  该函数对象会设定 [[Construct]] 内部属性。
5. 返回调用 constructor 的 [[Construct]] 内置方法的结果 , 不传入任何参数 ( 就是一个空的 arguments 列表 ). 



先讲下规范，调用函数对象 F 的 [[Construct]] 内部方法时，执行过程如下：
1. 令 obj 为新创建的 ECMAScript 原生对象。// 本规范定义的对象为原生对象，宿主环境定义的( 如 window, document) 为宿主对象，两者互补形成对象集合。
2. 依照 [8.12](https://www.ecma-international.org/ecma-262/5.1/index.html#sec-8.12) 设定 obj 的所有内部方法。
3. 设定 obj 的 [[Class]] 内部方法为 "Object"。
4. 设定 obj 的 [[Extensible]] 内部方法为 true。
5. 令 proto 为以参数 "prototype" 调用 F 的 [[[Get]]](http://yanhaijing.com/es5/#332) 内部属性的值。
6. 如果 [Type](https://www.ecma-international.org/ecma-262/5.1/index.html#sec-8)(proto) 是 Object，设定 obj 的 [[Prototype]] 内部属性为 proto。
7. 如果 Type(proto) 不是 Object，设定 obj 的 [[Prototype]] 内部属性为 [15.2.4](https://www.ecma-international.org/ecma-262/5.1/index.html#sec-15.2.4) 描述的标准内置的 Object 的 prototype 对象。
8. 以 obj 为 this 值，[[Construct]] 的参数列表为 args，去调用 F 的 [[Call]] 内部属性，令 result 为调用结果。
9. 如果 Type(result) 是 Object，则返回 result。
10. 返回 obj

函数对象 A 按上面的规范执行，其执行过程如下：
1. obj = {}
2. 设定内部方法
3. 设定 [[Class]] = "Object"，使得 `Object.prototype.toString.call(obj) = "[object Object]"`
4. 设定 [[Extensible]] = true ，允许 obj 添加属性
5. 令 proto = A.prototype
6. Object.setPrototypeOf(obj, proto)
7. 过
8. 相当于 `result = F.call(obj,...args)`
9. Type(result) 为 undefined
10. 返回 obj

## 实现

### 快速实现
根据以上描述，我们可以很快的写出如下代码(不考虑异常情况)：
其中很多地方采用的新语法，当然你可以选择用 polyfill 代替
```js
function _new (F, ...args) {
  var obj = Object.create(F.prototype); // 相当于 ({}).__proto__ = F.prototype
  var result = F.call(obj, ...args)
  return typeof result === "object" ? result : obj
}
```
### Type(result) 判断
接着我们考虑 `如果 Type(result) 是 Object` 这个判断，

ECMAScript 语言类型包括 未定义 （Undefined）、 空值 （Null）、 布尔值（Boolean）、 字符串 （String）、 数值 （Number）、 对象 （Object）

注意1，这里 `Type(Null) 为 Null，不是 Object`。而 js 中 `typeof null ==="object"`
注意2，这里 `Type(function(){}) 为 Object`。而  js 中 `typeof function(){}==="function"`

因此 Type(result) 的实现应该为
```js
(typeof result === 'object' && result !== null ) || typeof result === 'function' 
```

即
```js
function _new (F, ...args) {
  var obj = Object.create(F.prototype); // 相当于 ({}).__proto__ = F.prototype
  var result = F.call(obj, ...args)
  var isESObject = (typeof result === 'object' && result !== null ) || typeof result === 'function' 
  return isESObject  ? result : obj
}
```
### 构造函数判断
接着考虑异常情况:
- 如果 Type(constructor) 不是 Object ，抛出一个 TypeError 异常 .
结合后面的要求  constructor 实现 [[Construct]] 内置方法，constructor 只能是 Type Object 中的 function
```js
var isFunction = typeof constructor === 'function' 
if(!isFunction){
  throw TypeError(`${constructor} is not a constructor`)
}
```
- 如果 constructor 没有实现 [[Construct]] 内置方法 ，抛出一个 TypeError 异常

我们在外部难以实现 [[Construct]] 构造与否的判断，因此只能根据规律来总结。

1. 特定函数不是构造方法
> [除非特别说明，es6+ 实现的特定函数都没有实现 [[Construct]] 内置方法](https://www.stefanjudis.com/today-i-learned/not-every-javascript-function-is-constructable/)
> 简单的说，特定函数设计之初肯定不是为了用来构造的
```js
var A  ={
  g:function* (){},
  arrow:()=>{},
  shorthand(){},
  cs:function(){}
}
new A.g // TypeError
new A.arrow // TypeError
new A.shorthand // TypeError
new A.cs // cs {}
```

对所有方法的 prototype 进行输出，发现
```js
A.g.prototype // Generator {}
A.arrow.prototype // undefined
A.shorthand.prototype // undefined
A.cs.prototype // {constructor: ƒ}
```
发现构造函数满足该条件
```js
function is_constructor(f){
  return !!f && f.hasOwnProperty("prototype") && f.prototype.hasOwnProperty("constructor")
}
```

2. 内置函数不是构造方法
```js
new Math.max //  TypeError
new String.prototype.indexOf	//  TypeError
```
内置函数无 prototype，因此共用上面的判断逻辑即可

值得注意的是还有一个 `Symbol`

其不能使用 new 实例化。但是 `Symbol.prototype.hasOwnProperty("constructor") is true`

综合判断如下：
```js
function is_constructor(f){
  if (f === Symbol) return false;
  return !!f && f.hasOwnProperty("prototype") && f.prototype.hasOwnProperty("constructor")
}

// true
is_constructor(function(){});
is_constructor(class A {});
is_constructor(Array);
is_constructor(Function);
is_constructor(new Function);

// false
is_constructor();
is_constructor(undefined);
is_constructor(null);
is_constructor(1);
is_constructor(new Number(1));
is_constructor(Array.prototype);
is_constructor(Function.prototype);
is_constructor(() => {})
is_constructor({method() {}}.method)
is_constructor(Symbol)
is_constructor(Math.max)
is_constructor(String.prototype.indexOf)
```
但是处理不了手动修改 constructor 值的做法
```js
var a = ()=>{}
a.prototype = {constructor:1}
new a() // TypeError
_new(a) // {}
```
属性都是可以随意设置的，因此判断属性存在与否是不靠谱的，网上继续搜索，
[stackoverflow](https://stackoverflow.com/a/46759625/6600717) 上看到有人用 `实例化-捕获异常`的方式判断一个函数是否为构造函数
```js
function is_constructor(f) {
  // 特殊判断，Symbol 能通过检测
  if (f === Symbol) return false;
  try {
    Reflect.construct(String, [], f);
  } catch (e) {
    return false;
  }
  return true;
}

// true
is_constructor(function(){});
is_constructor(class A {});
is_constructor(Array);
is_constructor(Function);
is_constructor(new Function);

// false
is_constructor();
is_constructor(undefined);
is_constructor(null);
is_constructor(1);
is_constructor(new Number(1));
is_constructor(Array.prototype);
is_constructor(Function.prototype);
is_constructor(() => {})
is_constructor({method() {}}.method)
is_constructor(Symbol)
is_constructor(Math.max)
is_constructor(String.prototype.indexOf)
```
看到这，你一定在想 `Reflect.construct(String, [], f);` 和直接 `new f` 捕获异常有什么差别

我们先拿个例子运行下
```js
function A(){
  console.log("hh")
}
new A() // 输出hh 返回 A {}
Reflect.construct(A,[]) // 输出hh 返回 A {}
var a = Reflect.construct(String, [], A) // 不输出，a =  A {""}
a instanceof A // true
a.toString() // [object String]
```
[MDN Reflect.construct](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Reflect/construct)
上面的的解释

> Reflect.construct(target, argumentsList[, newTarget])
用给定的 argumentsList 参数列表初始化 target 构造函数，返回一个 target 或 newTarget (如果存在) 的实例。如果 target 或 newTarget 不是构造函数，抛出 TypeError

因此，当 f 不是构造函数时，抛出错误；当 f 是构造函数时，也不会执行 f 构造函数导致造成影响

### 最终实现

```js
function _new (F, ...args) {
  function is_constructor (f) {
    // 特殊判断，Symbol 能通过检测
    if (f === Symbol) return false;
    try {
      Reflect.construct(String, [], f);
    } catch (e) {
      return false;
    }
    return true;
  }
  var isFunction = typeof F === 'function'
  if (!isFunction || !is_constructor(F)) {
    throw TypeError(`${F.name||F} is not a constructor`)
  }
  var obj = Object.create(F.prototype); // 相当于 ({}).__proto__ = F.prototype
  var result = F.call(obj, ...args)
  var isESObject = (typeof result === 'object' && result !== null) || typeof result === 'function'
  return isESObject ? result : obj
}
```

鄙人水平不足，有些知识点可能遗漏或理解错误，欢迎指正~

## 拓展阅读

1. [面试官问：能否模拟实现JS的new操作符](https://juejin.im/post/5bde7c926fb9a049f66b8b52)

## 测试用例
- 基础用例
```js
function A(name){
  this.name = name
}
new A("test") // A {name: "test"}
_new (A,"test") // A {name: "test"}
```
- 判断 null
```js
function A(name){
  this.name = name
  return null
}
new A("test") // {name: "test"}
_new (A,"test") // {name: "test"}
```
- 判断 function
```js
function A(name){
  this.name = name
  return ()=>{}
}
new A("test") // ()=>{}
_new (A,"test") // ()=>{}
```
- 判断异常
```js
var A = ()=>{}
new A() // Uncaught TypeError: A is not a constructor
_new (A) // Uncaught TypeError: A is not a constructor
```

## 拓展

在模拟 new 的基础上，模拟 es6 的 [new.target](http://es6.ruanyifeng.com/#docs/class#new-target-%E5%B1%9E%E6%80%A7) 属性

 这里模拟的 `new.target` 是用于构造函数中,举例：
```js
function Person(name) {
  if (_new.target !== undefined) {
    this.name = name;
  } else {
    throw new Error('必须使用 new 命令生成实例');
  }
}
// 预期输出
Person("test") // Uncaught Error: 必须使用 new 命令生成实例
_new(Persion,"test") // Person {name:'test'}
```
因此我们可以在 `F.call(obj, ...args)` 前给 _new.target 赋值,在调用完后删除该属性，即
```js
function _new (F, ...args) {
  function is_constructor (f) {
    // 特殊判断，Symbol 能通过检测
    if (f === Symbol) return false;
    try {
      Reflect.construct(String, [], f);
    } catch (e) {
      return false;
    }
    return true;
  }
  var isFunction = typeof F === 'function'
  if (!isFunction || !is_constructor(F)) {
    throw TypeError(`${F.name||F} is not a constructor`)
  }
  _new.target = F
  var obj = Object.create(F.prototype); // 相当于 ({}).__proto__ = F.prototype
  var result = F.call(obj, ...args)
  var isESObject = (typeof result === 'object' && result !== null) || typeof result === 'function'
  delete _new.target
  return isESObject ? result : obj
}
// 测试用例
Person("test") // Uncaught Error: 必须使用 new 命令生成实例
_new(Person,"test") // Person {name: "test"}
Person("test") // Uncaught Error: 必须使用 new 命令生成实例
```

继续对 **模拟 new.target** 进行优化。

考虑以下几点：
1. new.target 只能用在函数内部 
  > `var t = ()=>{ new.target }` 此外，箭头函数也会报语法错误
2. new.target 是只读的
3. 当前函数内的 new.target 值永远一致，即new 构造函数时再次 new 后不会变更当前函数中 new.target 的值 
4. class 子类实例化时，父类构造函数中 `new.target` 的值是子类

```js
class Rectangle {
  constructor(length, width) {
    console.log(new.target === Rectangle);
  }
}

class Square extends Rectangle {
  constructor(length) {
    super(length, width);
  }
}

var obj = new Square(3); // 输出 false
```

对于第 1 点，需要判断当前执行环境，不好处理

2、3 点我们采用 `Object.defineProperty` 的方式处理，并通过 `__stack` 栈保存构造函数

```js
if (!_new.hasOwnProperty('target')) {
  // 调用函数栈，假装他是私有属性
  _new.__stack = []
  Object.defineProperty(_new, 'target', {
    // 不可删除，不可修改配置
    configurable: false,
    enumerable: false,
    get: function () {
      return _new.__stack[_new.__stack.length - 1]
    },
    set: function () {
      // 修改时会抛出异常
      throw ReferenceError("Invalid left-hand side in assignment")
    }
  })
}
_new.__stack.push(F)
//...
_new.__stack.pop()
```

第 4 点暂不满足，因为 class 只能通过 new 实例化，我们上文的 `F.call(obj, ...args)` 会报错。后续再尝试解决


完善后的代码如下：

```js
function _new (F, ...args) {
  function is_constructor (f) {
    // 特殊判断，Symbol 能通过检测
    if (f === Symbol) return false;
    try {
      Reflect.construct(String, [], f);
    } catch (e) {
      return false;
    }
    return true;
  }
  var isFunction = typeof F === 'function'
  if (!isFunction || !is_constructor(F)) {
    throw TypeError(`${F.name || F} is not a constructor`)
  }
  if (!_new.hasOwnProperty('target')) {
    // 调用函数栈，假装他是私有属性
    _new.__stack = []
    Object.defineProperty(_new, 'target', {
      // 不可删除，不可修改配置
      configurable: false,
      enumerable: false,
      get: function () {
        return _new.__stack[_new.__stack.length - 1]
      },
      set: function () {
        // 修改时会抛出异常
        throw ReferenceError("Invalid left-hand side in assignment")
      }
    })
  }
  _new.__stack.push(F)
  var obj = Object.create(F.prototype); // 相当于 ({}).__proto__ = F.prototype
  var result = F.call(obj, ...args)
  var isESObject = (typeof result === 'object' && result !== null) || typeof result === 'function'
  _new.__stack.pop()
  return isESObject ? result : obj
}
```

测试用例

```js
function A () {
  console.log(_new.target)
}

function B () {
  console.log(_new.target); // B(){}
  _new(A); // A(){}
  A() // B(){} 注意这里， 用 new.target 的时候应该是
  console.log(_new.target); // B(){}
  try {
    _new.target = 1
  } catch (error) {
    console.log(error) // Uncaught ReferenceError: Invalid left-hand side in assignment
  }
  console.log(_new.target); // B(){}
}
_new(B)
```

基本符合要求，但是 `A()` 处的输出是 `B(){}` ,用 `new.target` 的时候应该是 `undefined` 才对


> 因为此时栈非空，说明用栈的方法不可靠

以下提供一个新思路 [e.stack](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Error/Stack) 


大概过程就是，利用 `throw catch e.stack` 获取访问 `_new.target` 的方法的 name ,与 _new 中的 F.name 进行比较

尝试这个例子
```js
function _new () {
  try {
    throw Error("test")
  } catch (e) {
    console.log(e.stack)
  }
}
function B(){
  _new()
}
B()
```
chrome 上输出
```
Error: test
    at _new (<anonymous>:3:11)
    at B (<anonymous>:9:3)
    at <anonymous>:11:1
```
ff 上输出
```
_new@debugger eval code:3:11
B@debugger eval code:9:3
@debugger eval code:11:1
```

我们可以根据正则获取 `B` 这个 func.name ，可以参考 [司徒正美-getCurrentScript的改进](https://www.cnblogs.com/rubylouvre/archive/2013/01/23/2872618.html) 上的操作。


**由于这些都是 hack 操作，并不能实现 100% 正确，这里也就简单提供个思路，读者可以自行尝试**

总的来说，完全模拟 `new.target` 是不可能的，在模拟的同时只是为了让自己熟知规范，切勿为了一些细节进行大量 hack, 除非你是 babel engineer ~

`new.target` 大概这样，有兴趣的可以看下 es6 规范，自己进行实现