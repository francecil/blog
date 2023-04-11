## 前言

这两个函数网上已经有很多实现了， 一般项目中直接用 lodash 或 underscore 的实现

因此，写出一个完善的 debounce 和 throttle 不是本篇的目的

理解这两个方法的实现思路，清楚使用场景才是重点


## debounce

### 概念

防抖：你尽管触发（通知我要执行该函数），<s>我执行算我输（误，</s>，等你累了（离最后一次触发过了 wait 时间），我再执行

这里的 **执行** 表示函数的实际调用， 而 **触发** 仅仅是通知执行

以坐电梯为例，电梯运行表示函数`执行`，有人进电梯表示一次`触发`：通知电梯运行。一段时间内没人进电梯，那么电梯就开始运行。

PS: 没人进电梯那么电梯也不会运行

### 实现

还是以坐电梯为例，我们创建以下实体类
```js
class Elevator {
  /**
   * @param {number} no 电梯编号
   */
  constructor(no) {
    this.no = no
  }
  run () {
    console.log(`${this.no}号电梯开始运行`)
  }
}
class People {
  constructor(no) {
    this.name = "员工" + no
  }
  into (elevator) {
    console.log(`${this.name} 进入${elevator.no}号电梯`)
    elevator.run()
  }
}
```
运行
```js
let elevator = new Elevator(0)
let index = 0
new People(index++).into(elevator)
// 员工0 进入0号电梯
// 0号电梯开始运行
new People(index++).into(elevator)
// 员工1 进入0号电梯
// 0号电梯开始运行
```
有人进就马上运行电梯，但现实 run 执行函数（电梯运行）成本是巨大的，员工1也不可能进入电梯。

因此我们不能轻易的运行电梯。并且上面的实现，用户应该是不能直接让电梯运行的，只能通知电梯有人进电梯了。

我们进行如下改造：


编写防抖函数

```js
function debounce (func, wait) {
  let timer = null
  return function () {
    clearTimeout(timer)
    timer = setTimeout(()=>{
      console.log('防抖完毕..开始执行')
      func()
    }, wait);
  }
}
```
改造 Elevator 和 People
```js
class Elevator {
  /**
   * @param {number} no 电梯编号
   */
  constructor(no) {
    this.no = no
    // 对外提供的接口，用户告知电梯该运行了
    this.notify = debounce(this._run, 3000)
  }
  // 假装是私有方法，只能我自己调用
  _run () {
    console.log(`${this.no}号电梯开始运行`)
  }
}
class People {
  constructor(no) {
    this.name = "员工" + no
  }
  into (elevator) {
    console.log(`${this.name} 进入${elevator.no}号电梯`)
    elevator.notify()
  }
}
```

刚刚的例子再重新运行一次.
```js
let elevator = new Elevator(0)
let index = 0
new People(index++).into(elevator)
new People(index++).into(elevator)
```

不出意外，报了 `Uncaught TypeError: Cannot read property 'no' of undefined`

很明显，_run 方法执行的时候里面的 this 值为 undefined

原因在于 setTimeout 中 func 的调用方为全局作用域，在严格模式 (class 中的代码处于严格模式)下函数的 this 为 undefined

解法有多种：

1. `this.notify = debounce(this._run.bind(this), 3000)`
  > 这样相当于对外部使用者进行了要求：必须进行 bind ，其实不太好
2. `func.call(this)`
  > 此处的 this 指向为 notify 的调用方 \
  > 注意 setTimeout 用的是箭头函数，否则 setTimeout 内函数的 this 是 window

与此同时，如果对 `elevator.notify` 进行传参的话，func 调用时忽略掉了！

因此对 debounce 进行如下改造：

```js
function debounce (func, wait) {
  let timer = null
  return function () {
    clearTimeout(timer)
    timer = setTimeout(()=>{
      console.log('防抖完毕..开始执行')
      func.apply(this,arguments)
    }, wait);
  }
}
```

其他代码调整了下输出：

```js
class Elevator {
  /**
   * @param {number} no 电梯编号
   */
  constructor(no) {
    this.no = no
    // 对外提供的接口，用户告知电梯该运行了
    this.notify = debounce(this._run, 3000)
  }
  // 假装是私有方法，只能我自己调用
  _run (...args) {
    console.log("最后一次调用传入的参数为：",args)
    console.log(`${this.no}号电梯开始运行`)
  }

}
class People {
  constructor(no) {
    this.name = "员工" + no
  }
  into (elevator) {
    console.log(`${this.name} 进入${elevator.no}号电梯`)
    elevator.notify(this.name)
  }
}
```
测试输出
```js
let elevator = new Elevator(0)
let index = 0
new People(index++).into(elevator)

new People(index++).into(elevator)

setTimeout(() => {
  new People(index++).into(elevator)
}, 1000);
new People(index++).into(elevator)

// 员工0 进入0号电梯
// 员工1 进入0号电梯
// 员工2 进入0号电梯

// ... 等待1s

// 员工3 进入0号电梯

// ... 等待3s

// 防抖完毕..开始执行
// 最后一次调用传入的参数为： ["员工3"]
// 0号电梯开始运行
```

至此，我们的实现就能达到基本需求了。 如果看了 underscore 等开源库的话，会发现它还实现了其他需求
1. 立刻执行（leading=true）：立即执行 func 方法，随后进行的每一次调用，只有超过 wait 时间没有再次调用，才会执行。
  > 常用场景：初次点击搜索框控件，进行一次查询
2. 禁用结束后的回调（trailing=false）：超过 wait 时间没有再次调用，不进行执行，但允许下次立即执行（配置 leading=true 的话）。
3. 返回值：当采用立即执行模式时，需要获取函数执行的返回值
  > 初次查询获取到完整列表
4. 取消防抖: 为了立刻执行模式时快速执行，避免还需要等待 wait 时间；非立刻执行模式下相当于清空原来的状态

还是以上电梯为例，这里为了方便理解，我们所说的电梯执行，是快速把人送到又回来等待别人进入。

- leading=false;trailing=true【lodash 默认设置】: 上文的例子，第一个人进不会马上运行，超过 wait 时间都没人进电梯，那电梯就开始运行
- leading=true;trailing=true: 第一个人进电梯后，电梯马上运行。如果第二个人在 wait 时间内进入电梯，那么开始防抖处理，超过 wait 时间都没人进电梯，那电梯才开始运行；如果第二个人距离第一个人进电梯的时间大于 wait (比如比较晚来，比如电梯执行比较慢等因素) 那么他和第一人一样，直接进入电梯并让电梯执行。
- leading=true;trailing=false: 第一个人进电梯后，电梯马上运行。如果第二个人在 wait 时间内进入电梯，那么开始防抖处理，超过 wait 时间都没人进电梯，电梯会做个判断，下次再有一个人进，电梯马上开走，之后进电梯的人就和当前的第二个人同样处理；如果如果第二个人距离第一个人进电梯的时间大于 wait ，那么他和第一人一样，直接进入电梯并让电梯执行。
- leading=false;trailing=false: 电梯永远不运行。。。

取消防抖：电梯运行前要等 wait 时间，这时候电梯有个功能，按了某个按钮后，不用等 wait 时间，只要有新的人进电梯电梯立马运行（leading=true），或者重新开始防抖处理（leading=false）
  
根据需求进行配置，可以看出来，我们比较常用的是第一种，这也是 lodash 的默认设置


当然，上面这些需求的实现不是本文的重点，感兴趣的话可以直接看开源库源码和文章底部的拓展阅读，其实不会很难~

1. [lodash-debounce 使用文档](https://lodash.com/docs/4.17.15#debounce)
2. [underscore-debounce github](https://github.com/jashkenas/underscore/blob/master/underscore.js#L887)
3. [lodash-debounce github](https://github.com/lodash/lodash/blob/master/debounce.js)


## throttle

### 概念

节流：顾名思义，用来减少函数的执行次数的，固定过一段时间后才会执行。

以和产品撕逼为例，做需求表示函数`执行`，提需求表示一次`触发`：通知你做需求。产品初次给你提了一个需求，可是你很忙（你觉得有坑），你让TA理清了再来，过段时间你再做（你是有原则的，从第一次提需求开始固定时间后你一定去做），这段时间产品可以对需求进行变更优化 ~ 。 然后产品又给你提了一个需求……

PS: 如果产品没提需求，那自然也不用做了

试想一下，这里如果用防抖的场景会如何？

是不是就像产品时不时的给你改需求，你每次都得重新设计方案- -。直到很久没改需求了，你才开始处理需求。

### 实现

还是以做需求为例，我们创建以下实体类

```js
/**
 * 研发
 */
class RD {
  /**
   * @param {number} no 研发编号
   */
  constructor(no) {
    this.name = `研发` + no
    // 用于需求方通知开发处理需求
    this.notify = this._processing
  }
  // 假装是私有方法，只能研发自己调用
  _processing (...args) {
    console.log("需求文档：", args)
    console.log(`${this.name}开始处理需求`)
  }

}
/**
 * 产品经理
 */
class PM {
  constructor(no) {
    this.name = "产品经理" + no
  }
  request (rd, requirement) {
    console.log(`${this.name} 请求 ${rd.name} 实现 ${requirement}`)
    rd.notify(requirement)
  }
}
```
在不进行节流的情况下，场景如下
```js
let rd = new RD(0)
let pm = new PM(0)

pm.request(rd,"微信APP")
pm.request(rd,"抖音APP")

// 产品经理0 请求 研发0 实现 微信APP
// 需求文档： ["微信APP"]
// 研发0开始处理需求
// 产品经理0 请求 研发0 实现 抖音APP
// 需求文档： ["抖音APP"]
// 研发0开始处理需求
```
研发估计得累死...

进行防抖的话呢？
```js
// RD 中进行如下修改
this.notify = debounce(this._processing,5000)

function debounce (func, wait) {
  let timer = null
  return function () {
    console.log('研发收到需求：',arguments)
    clearTimeout(timer)
    timer = setTimeout(()=>{
      func.apply(this,arguments)
    }, wait);
  }
}
```
效果如下：
```js
let rd = new RD(0)
let pm = new PM(0)

pm.request(rd,"微信APP")
pm.request(rd,"抖音APP")

// 产品经理0 请求 研发0 实现 微信APP
// 研发收到需求： ["微信APP"]
// 产品经理0 请求 研发0 实现 抖音APP
// 研发收到需求： ["抖音APP"]

// 过了5s...

// 需求文档： ["抖音APP"]
// 研发0开始处理需求
```

虽然还没开始处理，但不断被告知修改需求，也累的够呛

那换成节流呢？


```js
// RD 中进行如下修改
// 表示初次接收到需求后，5s后开发一定会去做
this.notify = throttle(this._processing,5000)

function throttle (func, wait) {
  let timer = null
  return function () {
    if (!timer) {
      console.log('研发收到需求：', arguments)
      timer = setTimeout(() => {
        func.apply(this, arguments)
        timer = null
      }, wait);
    }

  }
}
```
操作如下
```js
let rd = new RD(0)
let pm = new PM(0)

pm.request(rd, "微信APP")
pm.request(rd, "抖音APP")

/*** 第0s ***/

// 产品经理0 请求 研发0 实现 微信APP
// 研发收到需求：["微信APP"]
// 产品经理0 请求 研发0 实现 抖音APP

/*** 第5s ***/

// 需求文档： ["微信APP"]
// 研发0开始处理需求
```

好像有哪里不对？研发做的怎么是 `微信APP` 的需求，说明 `func.apply(this, arguments)` 传递的参数 `arguments` 不对

原因在于箭头函数没有自己的 this 和 arguments ，所以该函数内这两个的值是拿的上层作用域 function 函数中的值，最关键的是，这个值是声明时确定而不是执行时确定的。

由于该箭头函数只在第一次 timer 为空的时候被声明，因此箭头函数里面的 arguments 的值就没有再改过了

我们做个改造，将 arguments 提到上层作用域中

```js
function throttle (func, wait) {
  let timer = null
  let args = []
  return function () {
    args = arguments
    if (!timer) {
      console.log('研发收到需求：', args)
      timer = setTimeout(() => {
        func.apply(this, args)
        timer = null
      }, wait);
    }
  }
}
```



```js
let rd = new RD(0)
let pm = new PM(0)

pm.request(rd, "微信APP")
pm.request(rd, "抖音APP")
setTimeout(()=>{
  pm.request(rd, "今日头条APP")
},2000)
setTimeout(()=>{
  pm.request(rd, "chrome app")
},6000)

/*** 第0s ***/

// 产品经理0 请求 研发0 实现 微信APP
// 研发收到需求：["微信APP"]
// 产品经理0 请求 研发0 实现 抖音APP

/*** 第2s ***/

// 产品经理0 请求 研发0 实现 今日头条APP

/*** 第5s ***/

// 需求文档： ["今日头条APP"]
// 研发0开始处理需求

/*** 第6s ***/

// 产品经理0 请求 研发0 实现 chrome app
// 研发收到需求： ["chrome app"]

/*** 第11s ***/

// 需求文档： ["chrome app"]
// 研发0开始处理需求
```

至此，节流的基本功能就开发完成了。对比下开源实现，我们还缺的功能有：

1. 立即执行 `options.leading=true`: 我们上面的实现就是 `options.leading=false` 的效果
2. 禁用结束后的回调 `options.trailing=false`: 我们上面的实现就是 `options.trailing=true` 的效果，即时间一到就会进行函数的执行。禁用后时间一到不会再执行一次
3. 返回结果：立即执行模式时可以获取到结果
4. 取消节流：当采用立即执行模式时，要过一段时间才能重新触发函数执行，取消节流后就函数触发就会马上执行

以做需求为例，
- leading=false,trailing=true: 上文的例子，研发固定过段时间才开始做需求
- leading=true,trailing=false: 你只做第一版的需求，在一段时间内产品改需求你都不理会TA
- leading=true,trailing=true【lodash 默认设置】: 你先做了第一版的需求，在一段时间内产品不断改需求，你最后会再做一次需求
- leading=false,trailing=false: 你啥也不做~嘻嘻

所以，一般情况下我们不能同时设置 `leading` 和 `trailing` 为 false。 

**返回结果** 的意思就是：产品要求你做的第一版需求马上出效果

**取消节流** 的意思就是：产品告诉你领导你在偷懒，下次你马上就收到产品的需求了，如果 leading=true ，那下一次需求马上解决，否则还是等待 wait 再做

相关的开源库源码可以参考：

1. [underscore-throttle github](https://github.com/jashkenas/underscore/blob/master/underscore.js#L842)
2. [lodash-throttle github](https://github.com/lodash/lodash/blob/master/throttle.js)


## 区别


接下来说下两者的区别吧，其实可以用一句话概括，最终何时执行取决于发起方还是执行方

取决于发起方那么是 debounce ，取决于执行方那么是 throttle

还是用做需求为例，debounce 的情况，研发偏向产品一段时间后不改需求才开始做需求，如果产品不断的改需求，那研发做需求的时间是不能控制的

而 throttle 的情况，研发偏向固定时间段后才做需求，这个时间段中，产品该不该需求都不影响我什么时候做需求

## 常用的使用场景

以下几个场景，使用哪种策略更好，以及对应的配置项

1. 搜索框的筛选
2. 抢票按钮
3. 发送短信验证码
4. 元素拖拽
5. 窗口 resize，调整布局

这里就不给出答案了，欢迎评论~

## 拓展阅读

1. [JavaScript专题之跟着 underscore 学防抖](https://github.com/mqyqingfeng/Blog/issues/22)
2. [JavaScript专题之跟着 underscore 学节流](https://github.com/mqyqingfeng/Blog/issues/26)