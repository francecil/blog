---
title: 重学 JS 原型链
date: 2019/12/31 00:00:00
tags: 
  - ECMAScript
permalink: /pages/cc7c92/
---

## 前言

不考虑箭头函数等特异函数，本文所说的函数都是指的构造函数

之前对原型，原型链，构造函数等都是零零散散的知识碎片，这次写个文章记录一下

<!-- more -->

## 原型对象 prototype

创建一个函数 F 时，会自动为该函数 F 创建一个 prototype 属性，指向一个原型对象 F.prototype

默认情况下，函数 F 的原型对象 F.prototype 会自动获得一个 constructor （构造函数）属性，并指向 F 
```js
F.prototype.constructor === F // true
```

而原型对象也是对象，可以对其添加属性和方法

## \_\_proto__

每个对象都有一个 `__proto__` 属性，**指向生成该对象的构造函数的原型对象**

如 F.prototype 原型对象是 Object 的一个实例， `__proto__` 指向 `Object.prototype`

```js
F.prototype.__proto__ === Object.prototype // true
```

Object.prototype 这个原型对象也是对象，那么其 `__proto__` 指向哪？其实指向的是 null

Object.prototype 为万物起源
```js
Object.prototype.__proto__ === null // true
```

当实例化 F 得到对象 f 时,f 的 `__proto__` 属性指向 F 的原型对象 F.prototype
```js
const f = new F()
f.__proto__ === F.prototype // true
```

这个指向再创建后就确定了，后续修改 F 的原型对象指向也没有影响

```js
function F(){}
const f1 = new F
F.prototype = {}
const f2 = new F
// 指向不一致
f1.__proto__ !== f2.__proto__ // true
// 新的原型对象 {} 没有构造函数，可以为其赋值
F.prototype.constructor !== F // true
```
## 原型链

上述的关系，通过原型串接起来，可以得到下面这个图

![image](https://upload-images.jianshu.io/upload_images/9277731-efe713a1eb340c2d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

如果问什么是原型，就这么回答：
```
每个构造函数有个原型对象
每个实例对象有个 __proto__ 属性，指向该实例的构造函数的原型对象
```

对对象属性或方法的访问，采用的是原型链搜索，先搜索对象实例 f 自身，没找到的话，搜索原型对象，再没找到，搜素该原型对象的原型对象，直到不存在原型对象

比如访问 `f.name` 将按以下顺序搜索值
```js
f.name
f.__proto__.name / F.prototype.name
f.__proto__.__proto__.name / Object.prototype.name
```

判断实例 f 中是否含有 name 属性，可以通过以下方法
```js
f.hasOwnProperty("name")
```
判断原型中是否含有 name 属性，可以通过以下方法
```js
!f.hasOwnProperty("name") && "name" in f
```

## 继承

### class

在 es6 中，我们是这样做的
```js
class Engineer {
  constructor(name){
    this.name = name
    this.skills = ['linux','network','os']
  }
  coding(){
    console.log(`${this.name} 正在编码`)
  }
}

class FeEngineer extends Engineer{
  constructor(name){
    super(name)
    this.skills.push('web')
  }
  croping(){
    console.log(`${this.name} 正在切图`)
  }
}
```
每个 Engineer 都有一套基础技能 skills 和一个编码方法 coding

FeEngineer 继承了 Engineer 的基础技能和编码方法，并添加了自己的技能

实例化一个 FeEngineer 看下效果
```js
const fe = new FeEngineer("gahing")
console.log(fe)
/**
{
  name: "gahing",
  skills: ["linux", "network", "os", "web"],
  __proto__: Engineer {
    constructor: class FeEngineer,
    croping: ƒ croping(),
    __proto__: Object {
      coding: ƒ coding()
      constructor: class Engineer
      __proto__: Object
    }
  }
}
*/
Engineer.prototype.constructor === Engineer // true
fe.__proto__ === FeEngineer.prototype // true
```



然后说说实例化 FeEngineer 执行的过程

子类中的构造函数必须调用 super ，原因在于 js 是这样处理的：

- 实例化一个普通的构造函数时，会创建一个空对象作为 this ，然后继续运行
- 而实例化一个派生（子类）的构造函数时，需要利用父构造函数来完成上面这件事 -- 执行 `super(...)`。于是，父构造函数创建了一个空对象作为 this，然后继续运行父构造函数的代码。而后利用该 this 对象继续执行子类的构造函数中的代码

注意创建 this 的位置，所以下面代码是会报错的。
```js
class Super{}
class Sub extends Super{
  constructor(){
    this.name = "1"
    super()
  }
}
new Sub() // Uncaught ReferenceError: Must call super constructor in derived class before accessing 'this' or returning from derived constructor
```
提示 this 的访问必须在执行 super 之后，所以和等等要谈到的*借用构造函数法*还是有点不一样的，这里先简单的上个组合继承的代码

```js
function Super(){
  this.age = 1
}
function Sub(){
  this.name = "test"
  Super.call(this)
}
new Sub() // {age:1,name:"test"}
```



下面我们看看用 es5 怎么实现上面的效果

### 原型链继承法

创建构造函数时，原型对象会自动创建，也可以将其指向其他对象，实现原型链继承

```js
function Engineer (name){
  this.name = name
  this.skills = ['linux','network','os']
}
Engineer.prototype.coding = function(){
  console.log(`${this.name} 正在编码`)
}

function FeEngineer(){

}
var engineer = new Engineer("gahing")
FeEngineer.prototype = engineer
FeEngineer.prototype.croping = function(){
  console.log(`${this.name} 正在切图`)
}
```
这样实例化 FeEngineer 后，该对象就能访问父类对象的所有属性和方法了
```js
var fe = new FeEngineer('gahing')
console.log(fe)
/**
FeEngineer {
  __proto__: Engineer
    croping: ƒ ()
    name: "gahing"
    skills: (3) ["linux", "network", "os"]
    __proto__: Object
}
*/
```
但是看到没有， `__proto__` 把 fe 实例和原型对象 engineer 连接起来了，

修改 fe 的属性和方法可能会改动到 engineer

如上面的例子，本来 engineer 是没有 croping 方法的，后面却因为要给 fe 添加原型方法，导致 engineer 也有这个方法

### 借用构造函数法

由于不用原型继承，需要把父类的原型方法转到实例方法

```js
function Engineer (name){
  this.name = name
  this.skills = ['linux','network','os']
  this.coding = function() {
    console.log(`${this.name} 正在编码`)
  }
}

function FeEngineer(name){
  Engineer.call(this,name)
  this.skills.push('web')
}
FeEngineer.prototype.croping = function(){
  console.log(`${this.name} 正在切图`)
}
```
这样实例化 FeEngineer 后，该对象就拥有了父类对象的所有属性和方法了
```js
var fe = new FeEngineer('gahing')
console.log(fe)
/**
FeEngineer {
  coding: ƒ ()
  name: "gahing"
  skills: (4) ["linux", "network", "os", "web"]
  __proto__:
    croping: ƒ ()
    constructor: ƒ FeEngineer(name)
    __proto__: Object
}
*/
```

但是这样会产生一个问题， FeEngineer 实例的 coding 方法和 Engineer 实例的 coding 方法不一样，并且每个 FeEngineer 实例的 coding 方法也不一样

因为该方法是每次实例化的时候生成的，所以也非常占内存
```js
var engineer = new Engineer()
var fe = new FeEngineer()
fe.coding === engineer.coding //false
```



### 组合继承法

借助*原型链继承法*实现原型方法的继承，借助*借用构造函数法* 实现父类实例属性和方法的继承

```js
function Engineer (name){
  this.name = name
  this.skills = ['linux','network','os']
}
Engineer.prototype.coding = function(){
  console.log(`${this.name} 正在编码`)
}

function FeEngineer(name){
  Engineer.call(this,name)
  this.skills.push('web')
}
var engineer = new Engineer("gahing")
FeEngineer.prototype = engineer
FeEngineer.prototype.croping = function(){
  console.log(`${this.name} 正在切图`)
}
```

这样实例化 FeEngineer 后，该对象就拥有了父类对象的所有属性和方法了
```js
var fe = new FeEngineer('gahing')
console.log(fe)
/**
FeEngineer {
  name: "gahing"
  skills: (4) ["linux", "network", "os", "web"]
  __proto__: Engineer
    croping: ƒ ()
    name: "gahing"
    skills: (3) ["linux", "network", "os"]
    __proto__: Object
      coding: ƒ ()
      constructor: ƒ Engineer(name)
      __proto__: Object
}
*/
```
父类实例属性和方法被 fe 继承了，且父类的的方法还是挂在父类的原型对象上

但是由于父类实例 engineer 被挂载到 fe 的原型对象上，修改 fe 的属性和方法可能会改动到 engineer

同时，父类构造函数被调用了两次，fe 的原型对象 engineer 多了一些不必要的实例属性和方法

### 寄生组合式继承

其实只要父类构造函数 Engineer 中的东西不被挂载到子类实例对象 fe 的原型对象上，就可以实现我们要的效果

再上一次 es6 执行后的效果
```js
/**
{
  name: "gahing",
  skills: ["linux", "network", "os", "web"],
  __proto__: Engineer {
    constructor: class FeEngineer,
    croping: ƒ croping(),
    __proto__: Object {
      coding: ƒ coding()
      constructor: class Engineer
      __proto__: Object
    }
  }
}
*/
```

思路就是将子类实例对象 fe 的原型对象指向一个空对象，该空对象的构造函数的原型对象指向父类构造函数 Engineer 的原型对象


然后调整下组合继承的代码，变成如下
```js
// 创建 Engineer 的一个副本，区别在于没有任何实例属性
function Temp(){}
Temp.prototype = Engineer.prototype
const temp = new Temp() 

function Engineer (name){
  this.name = name
  this.skills = ['linux','network','os']
}
Engineer.prototype.coding = function(){
  console.log(`${this.name} 正在编码`)
}

function FeEngineer(name){
  Engineer.call(this,name)
  this.skills.push('web')
}
// 指向 temp
FeEngineer.prototype = temp
FeEngineer.prototype.croping = function(){
  console.log(`${this.name} 正在切图`)
}
```

实例化 FeEngineer 看下效果
```js
var fe = new FeEngineer('gahing')
fe.__proto__.constructor === FeEngineer // false
console.log(fe)
/**
FeEngineer {
  name: "gahing"
  skills: (4) ["linux", "network", "os", "web"]
  __proto__: Engineer {
    croping: ƒ ()
    __proto__: {
      coding: ƒ ()
      constructor: ƒ Engineer(name)
      __proto__: Object
    }
  }
}
*/
```
由于实例化 Temp 时不会产生多余的属性和方法，因此这种做法基本能达到效果

剩下的就是一些构造器方法的调整

```js
// fe 的原型对象的构造器方法应该指向 FeEngineer ，并且是不可修改的
Object.defineProperty(temp,'constructor',{
  enumerable: false,
  value: FeEngineer
})
```

综合一下，得到如下的寄生组合式继承的代码
```js
function Temp(){}
Temp.prototype = Engineer.prototype
const temp = new Temp() 
Object.defineProperty(temp,'constructor',{
  enumerable: false,
  value: FeEngineer
})

function Engineer (name){
  this.name = name
  this.skills = ['linux','network','os']
}
Engineer.prototype.coding = function(){
  console.log(`${this.name} 正在编码`)
}

function FeEngineer(name){
  Engineer.call(this,name)
  this.skills.push('web')
}
// 指向 temp
FeEngineer.prototype = temp
FeEngineer.prototype.croping = function(){
  console.log(`${this.name} 正在切图`)
}
```

再看下效果
```js
var fe = new FeEngineer('gahing')
fe.__proto__.constructor === FeEngineer // true
console.log(fe)
/**
FeEngineer 
  name: "gahing"
  skills: (4) ["linux", "network", "os", "web"]
  __proto__: Engineer
    croping: ƒ ()
    constructor: ƒ FeEngineer(name)
    __proto__:
      coding: ƒ ()
      constructor: ƒ Engineer(name)
      __proto__: Object
*/
```

最后，我们希望把 Temp 相关的代码做个封装,实现 SubClass 和 SuperClass 之间的寄生组合式继承

```js
function createTemp(SuperClass){
  function Temp(){}
  Temp.prototype = SuperClass.prototype
  return new Temp() 
}
function createTemp2(SuperClass){
  let obj = {}
  obj.__proto__ = SuperClass.prototype
  return obj
}
function inheritPrototype (SubClass, SuperClass){
  // 也可以直接用 Object.create(SuperClass.prototype)
  // 即 SuperClass.prototype 指向创建 temp 的构造函数的原型对象
  // temp.__proto__ === SuperClass.prototype
  // 这里也可以采用 createTemp2
  const temp = createTemp(SuperClass)
  Object.defineProperty(temp,'constructor',{
    enumerable: false,
    value: SubClass
  })
  SubClass.prototype = temp
}
```

所以上面的代码又可以写成
```js
function Engineer (name){
  this.name = name
  this.skills = ['linux','network','os']
}
Engineer.prototype.coding = function(){
  console.log(`${this.name} 正在编码`)
}

function FeEngineer(name){
  Engineer.call(this,name)
  this.skills.push('web')
}
inheritPrototype(FeEngineer,Engineer)
FeEngineer.prototype.croping = function(){
  console.log(`${this.name} 正在切图`)
}
```

## 参考

1. [ES6 Class 继承与 super](https://segmentfault.com/a/1190000015565616)
2. [回忆杀：JavaScript的继承](https://chuchencheng.com/2019/05/27/%E5%9B%9E%E5%BF%86%E6%9D%80%EF%BC%9AJavaScript%E7%9A%84%E7%BB%A7%E6%89%BF/)