## 前言

这两个函数网上已经有很多实现了， 一般项目中直接用 loadsh 或 underscore 的实现

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
1. 立刻执行：立即执行 func 方法，并且在 wait 时间后才允许再次执行。同样再次执行后下次执行需要在 wait 时间后，以此类推... 在等待的过程中进行的函数调用不会执行
  > 常用场景：获取短信验证码功能
2. 返回值：当采用立即执行模式时，需要获取函数执行的返回值
  > 获取到短信验证码 :)
3. 取消防抖: 当采用立即执行模式时，再次执行需要在 wait 之后
  > 输错手机号，等待重新获取短信验证码需要1分钟之后。如果能提供个按钮：`重置验证码获取状态` 就好了

当然，这些的实现不是本文的重点，感兴趣的话可以直接看开源库源码和文章底部的拓展阅读，其实不会很难~

1. [lodash-debounce 使用文档](https://lodash.com/docs/4.17.15#debounce)
2. [underscore-debounce github](https://github.com/jashkenas/underscore/blob/master/underscore.js#L887)
3. [lodash-debounce github](https://github.com/lodash/lodash/blob/master/debounce.js)


## throttle

### 概念

节流：顾名思义，用来减少函数的执行次数的，固定过一段时间后才会执行。

以和产品撕逼为例，做需求表示函数`执行`，提需求表示一次`触发`：通知你做需求。产品初次给你提了一个需求，可是你很忙，你让TA理清了再来，过段时间你再做（你是有原则的，从第一次提需求开始固定时间后你一定去做），这段时间产品可以对需求进行变更优化 ~ 。 然后产品又给你提了一个需求……

PS: 如果产品没提需求，那自然也不用做了

### 实现


## 两者的使用场景

注意区分防抖的立即执行模式和节流

## 拓展阅读

1. [JavaScript专题之跟着 underscore 学防抖](https://github.com/mqyqingfeng/Blog/issues/22)
2. [JavaScript专题之跟着 underscore 学节流](https://github.com/mqyqingfeng/Blog/issues/26)