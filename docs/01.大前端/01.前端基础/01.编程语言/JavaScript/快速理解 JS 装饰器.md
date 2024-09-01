---
title: 快速理解 JS 装饰器
date: 2024-08-26 19:27:51
permalink: /pages/9ee287/
categories: 
  - 大前端
  - 前端基础
  - 编程语言
  - JavaScript
tags: 
  - 
---

装饰器用于增强 JavaScript 类的功能，包括类本身、类属性、类方法、类属性存取器、类方法参数以及类属性前缀（accessor，装饰私有属性）等
> 为什么不能装饰普通函数，可以看下文

参见示例，感受下写法
```ts
// 装饰类
@frozen class Foo {

  // 装饰属性
  @readonly x = 1;

  // 装饰类方法
  @throttle(500)
  @log(true)
  expensiveMethod(@withParam() name: string) {} // 装饰类方法参数

  // 装饰属性存取器
  @foo
  get x() {}
  @foo2
  set x(val) {}

  /**
   * 装饰类属性前缀，相当于声明属性 y 是私有属性 #y 的存取接口
   * 等价于
   * #y = 1;
   * get y() { return this.#y; }
   * set y(val) { this.#y = val; }
   */
  accessor y = 1;
}
```

<!-- more -->

## 理解装饰器

装饰器是一种设计模式，旨在扩展代码功能而不修改它。

在 JS 的装饰器语法出现之前，我们采取的是高阶函数/高阶组件的方案来实现代码功能的包装。

示例：在方法执行前后打印日志
```js
function log({ namespace }){
    return (func) => {
        // 传入原函数并返回另一个包装过的函数
        return (...args) => {
            console.log(`${namespace}: 开始执行`)
            func.apply(this, args)
            console.log(`${namespace}: 执行结束`)
        }
    }
}

let myMethod = function (params) {
    console.log('执行 myMethod', params)
}
myMethod = log({ namespace: 'home' })(myMethod)
myMethod('hello')
```
输出结果
```
home: 开始执行
执行 myMethod hello
home: 执行结束
```

用 js 装饰器语法来写，代码如下：
```js
function log({ namepace }) {
    // ...
}
// PS: 此处仅做示例，装饰器规范是不支持普通函数的
@log({ namespace: 'home' })
function myMethod(params) {
    // ...
}
```

可以看到，我们在不更改 myMethod 内部函数逻辑的情况下，增加了日志打印功能。

这种编程范式有个名字叫：**面向切面编程**

## 装饰类型

装饰器的定义分为两种模式：
- 普通装饰器（无法传参）
- 装饰器工厂（可以传参）


普通装饰器（无法传参）
```js
@decorator
class A {}
// 等同于
class A {}
A = decorator(A)
```

装饰器工厂（可传参）
```js
@decorator(true)
class A {}
// 等同于
class A {}
A = decorator(true)(A)
```

无论哪种模式，最后的执行结果是一个装饰器函数，用于包装原始代码逻辑

## 装饰器语法

目前 JS Decorator 提案还在 stage3 阶段（202408），其语法定义与 TS 有些差别。

TypeScript 5.0+ 同时支持两种装饰器语法。标准语法可以直接使用，传统语法（legency）需要打开 `--experimentalDecorators` 编译参数。

> 关于 TS 中如何使用装饰器，可以查看[官方文档](https://www.tslang.cn/docs/handbook/decorators.html)

目前生产环境中我们大多使用的是 TS + 传统语法，下面也只会讲TS 传统语法，待标准语法提案完全定案再调整这篇文章内容。

### 装饰器类型定义

装饰器类型定义遵循以下规则，很容易记忆：
- 第一个参数是 `target`, 表示类构造函数(`CustomClass.prototype.constructor`, 对于类装饰器或者类静态方法)，或者类的原型（`CustomClass.prototype` ，对于类实例方法）；类装饰器只有此参数
- 第二个参数是 `propertyKey`，表示被装饰的类成员名称，比如方法名或属性名
- 第三个参数是 `descriptor`，表示被装饰方法的描述对象（参数装饰器另说，其参数 `parameterIndex` 表示其所在参数列表的索引）

类装饰器定义
```ts
/**
 * @Return 处理后的原始构造函数或者新的构造函数
 */
type ClassDecorator = <TFunction extends Function> (
    /** 类构造函数，唯一入参 */
    target: TFunction
) => TFunction | void;
```

方法装饰器定义
```ts
/**
 * @Return 修改后的该方法的描述对象，可以覆盖原始方法的描述对象。
 */
type MethodDecorator = <T>(
  /** 类构造函数（对于类的静态方法），或者类的原型（对于类的实例方法）*/
  target: Object,
  /** 所装饰方法的方法名 */
  propertyKey: string|symbol,
  /** 所装饰方法的描述对象 */
  descriptor: TypedPropertyDescriptor<T>
) => TypedPropertyDescriptor<T> | void;
```

属性装饰器定义
```ts
type PropertyDecorator = (
    /** 类构造函数（对于类的静态方法），或者类的原型（对于类的实例方法）*/
    target: Object,
    /** 所装饰属性的属性名 */
    propertyKey: string|symbol
) => void;
```

存取器装饰器的类型定义，与方法装饰器一致
```ts
type AccessorDecorator = MethodDecorator
```

参数装饰器定义
```ts
type ParameterDecorator = (
  /** 类构造函数（对于类的静态方法），或者类的原型（对于类的实例方法）*/
  target: Object,
  /** 所装饰方法的方法名 */
  propertyKey: string|symbol,
  /** 当前参数在方法的参数序列的位置 */
  parameterIndex: number
) => void;
```

## 装饰器执行顺序

装饰器的执行分为两个阶段。
1. 加载：计算 @ 符号后面的表达式的值，得到包装函数。
2. 执行：将得到的函数应用于所装饰对象。

同时装饰器可分为三种类型：
- 实例相关装饰器，包括实例方法、实例属性以及实例方法参数等的装饰器
- 静态相关装饰器，包括静态方法、静态属性以及静态方法参数等的装饰器
- 类相关装饰器，包括类装饰器和构造函数参数装饰器
> PS：标准语法当前还不支持参数装饰器（202408）

注意：Decorator 标准语法和 legency 语法的执行顺序差异非常大。

先说**标准语法**执行顺序：
1. 先加载全部，再执行全部
2. 加载阶段：先加载类装饰器，再按照代码定义顺序逐个加载类成员装饰器
3. 执行阶段：按照静态方法=>实例方法=>静态属性=>实例类型=>类装饰器的顺序，每种类型存在多个类成员时按代码定义顺序执行
4. 如果同一个方法或属性有多个装饰器，则顺序加载（从外向里）、逆序执行（由里向外）
> 附上[标准语法在线测试](https://www.typescriptlang.org/play/?ts=5.5.4#code/GYVwdgxgLglg9mABMAFAawKYE8BcBnKAJxjAHMBKHAQzC0QG8AoRRCBPOAGwwDpO5SKAAaACpUC+8YCx-gCT1MWAL5DyAbmaJCGKCEJJQkWAkQooVQqU05ENLOQZqWbMB258BwwOZGgGQjps7IpVq8qryjAACqADkgN4+gKMRgA6ZgBZqEeSMEJxUeHiIAMJ2LOEoEYCa6YCABoCdpoCrNslqBFSwEIi19QCymgAWcAAmKLb0IWoFxSWAejqA5AbVLE0wDVMQAAqEcAAOGIRQdAC8iACMjAORpZUATBONJvVnddOtUB2dRz0M-fuFgHnagNHyldunALbtXSg1L1+vlIh8xqclosVmtcIgwCAfgAjVaILZHVQvCLAHAfY6nQbAI64z4VE4pFh-W5dB5Ap57eRAA)


legency 语法的执行顺序比较复杂

1. 整体过程按照：实例相关装饰器 => 静态相关装饰器 => 类相关装饰器的顺序加载和执行
2. 同一类装饰器，按照代码定义顺序加载和执行；同类中的每个类成员，逐个加载逐个执行再处理下一个类成员
3. 方法装饰器/类装饰器早于方法属性装饰器/构造函数属性装饰器加载，晚于执行。可以理解为顺序加载（从上到下）、逆序执行（从下到上）
4. 如果同一个方法或属性有多个装饰器，则顺序加载（从外向里）、逆序执行（由里向外）
5. 如果同一个方法有多个参数，那么参数装饰器也是顺序加载、逆序执行


legency 语法综合测试示例，[在线体验](https://www.typescriptlang.org/play/?experimentalDecorators=true&ts=5.5.4#code/GYVwdgxgLglg9mABMAFAawKYE8BcBnKAJxjAHMBKHAQzC0QG8AoRRCBPOAGwwDpO5SKAAaACpUC+8YCx-gCT1MWAL5DyAbmaJCGKCEJJQkWAkQooVQqU05ENLOQZqWbMB258BwwOZGgGQjps7IpVq8qryjAACqADkgN4+gKMRgA6ZgBZqEeSMEJxUeHiIAMJ2LOEoEYCa6YCABoCdpoCrNslqBFSwEIi19QCymgAWcAAmKLb0IWoFxSWAejqA5AbVLE0wDVMQAAqEcAAOGIRQdAC8iACMjAORpZUATBONJvVnddOtUB2dRz0M-fuFgHnagNHyldunALbtXSh7IhBh8voAh5UADqYAQWSVmotAANECQZ8KttIQAhWEAI3hWCRLF6-XykQ+Y1OS0WKzWuEQYBAP2xq0QWyOqheEWAOFBFROKRJhWAR25qL5aj+ty6D2RpNFkJhtioeIJiCJewc7CIIGgcEIKEGgBDzQAECZVIbDgHA4Hi1fIgA)

```ts
function f(key:string):any {
  console.log(`加载：${key}`);
  return function (target: any) {
    console.log(`执行：${key}`);
  };
}
@f('类装饰器')
class C {
  @f('静态方法')
  static staticMethod() {}

  @f('静态属性')
  static staticProperty = 1

  @f('静态方法2')
  static staticMethod2() {}


  @f('实例方法1')
  method(
    @f('实例方法1参数A') a:any,
    @f('实例方法1参数B') b:any,
  ) {}

  @f('实例属性')
  property: number = 2;

  @f('f:实例方法2')
  @f('f2:实例方法2')
  method2(
    @f('实例方法2参数A') a:any,
  ) {}

  constructor(@f('构造函数参数') foo:any) {}
}
```

执行顺序如下：
```js
// --- 实例 ---
// 按照代码定义顺序
"加载：实例方法1" 
"加载：实例方法1参数A" 
"加载：实例方法1参数B" 
"执行：实例方法1参数B" 
"执行：实例方法1参数A" 
"执行：实例方法1" 

"加载：实例属性" 
"执行：实例属性" 

// 顺序加载（从外向里）、逆序执行（由里向外）
"加载：f:实例方法2" 
"加载：f2:实例方法2" 
"加载：实例方法2参数A" 
"执行：实例方法2参数A" 
"执行：f2:实例方法2" 
"执行：f:实例方法2" 

// --- 静态 ---
"加载：静态方法" 
"执行：静态方法" 

"加载：静态属性" 
"执行：静态属性" 

"加载：静态方法2" 
"执行：静态方法2" 

// --- 类 ---
"加载：类装饰器" 
"加载：构造函数参数" 
"执行：构造函数参数" 
"执行：类装饰器" 
```





## 其他

### reflect-metadata

借助 [reflect-metadata](https://www.npmjs.com/package/reflect-metadata) 库，在设计阶段添加的类型信息可以在运行时使用。

一些比较高级的玩法可以参见 [Nest](https://docs.nestjs.com/custom-decorators)

### 为什么不能装饰普通函数

有个说法是，普通函数存在函数提升，导致装饰器函数执行时机晚于被装饰函数。当装饰器函数中存在副作用时（比如修改上层作用域的变量），会导致执行结果与预期不一致。

示例
```js
var counter = 0;

var add = function () {
  counter++;
};

@add
function foo() {
}
```
预期在初始化 foo 函数后，自动执行 add 装饰器函数，`counter` 值被修改为 1

实际执行效果为
```js

// 提升
@add
function foo() {
}
// 此时 add 还未初始化，装饰器函数如何执行？

var counter = 0;

var add = function () {
  counter++;
};
```

相关讨论：
- https://github.com/ruanyf/es6tutorial/issues/399
- https://github.com/wycats/javascript-decorators/issues/4

## 拓展阅读
- https://es6.ruanyifeng.com/#docs/decorator
- https://www.tslang.cn/docs/handbook/decorators.html
- https://wangdoc.com/typescript/decorator
- https://docs.nestjs.com/custom-decorators