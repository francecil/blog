js 小技巧
========= 

# 文件清空

参考 http://blog.csdn.net/cuixiping/article/details/37526871

由于是vue项目（浏览器要求本身就比较高），直接用`value=null`解决

# ajax 发送json数据给服务端解析 

带上
```
data: JSON.stringify(data),
contentType: "application/json",
```

不然的话 用默认的配置，post一个对象后，其他类型的数据都转为字符串了。


# jsonp获取ip所在地

```js
//百度的，比较不准

// var url = 'http://api.map.baidu.com/location/ip?ak=F454f8a5efe5e577997931cc01de3974&ip=' + remoteAddress + '&callback=?'
// $.getJSON(url, function (data) {
// // 定位的地址信息 根据需要写入对象属性
// console.log('showLocation', data)
// })

//新浪的
var url = 'http://int.dpool.sina.com.cn/iplookup/iplookup.php?format=js&ip=' + remoteAddress
$.getScript(url, function (_result) {
if (remote_ip_info.ret === 1) {
// alert('IP 详细信息：IP：'+ip+'国家：'+remote_ip_info.country+'省份：'+remote_ip_info.province+'城市：'+remote_ip_info.city+'区：'+remote_ip_info.district+'ISP：'+remote_ip_info.isp+'类型：'+remote_ip_info.type+'其他：'+remote_ip_info.desc);
resolve(remote_ip_info.province + ' ' + remote_ip_info.city)
} else {
throw new Error('没有找到匹配的 IP 地址信息！')
}
})
```

# 箭头函数 

> this穿透：函数体中作用域与上文一致，故不再需要用var that = this
> 没有arguments 但是可以通过 (...args)=>args[0] 这样去获取

# 数据有换行 `JSON.parse`时失败

可以 stringify 的加上一句

`replace(/\n/g,"\\n").replace(/\r/g,"\\r")`

# 模板解析

利用`Function`
```js
this.data = {a:111,b:222}
exp = 'a+b'
new Function(...Object.keys(this.data), `return ${exp}`)(...Object.values(this.data))
//输出 333
```

# 判断+0 -0

根据
```
1/-0 = -Infinity
1/+0 = Infinity
```
可知 1/-0 !== 1/+0 === 1/0

可以用es6的 `Object.is(+0,-0) =false`

# 返回一个随机不重复数字,范围在[2-32]的数组，长度为n

```
const uniqueNums = (n) => 
  [...(new Array(31)).keys()]
    .map((i) => i + 2)
    .sort(() => Math.random() - Math.random())
    .slice(0, n)
```

# js 获取Object实际数据类型

例：null 得到 null 而不是 object


法1
```js
const type = (obj) =>{
  /* TODO */
  return Object.prototype.toString.call(obj).slice(8,-1).toLowerCase();
}
```
法2
```js
const type = (obj)=> {
  /* TODO */
  if(typeof obj!=='object')return typeof obj
  if(obj===null)return 'null'
  return Object.getPrototypeOf(obj).constructor.name.toLowerCase()
}
```

# 正则 零宽断言 zero-width prediction，只拿想要的值

```
let reg = /(?<=<tag>).*(?=<\/tag>)/

let str= '<tag>ss</tag>'

str.match(reg)[0] = 'ss'
```

node8不支持`?<=`

(?=exp)零宽度正预测先行断言，它断言自身出现的位置的后面能匹配表达式exp

(?!exp)零宽度负预测先行断言，断言此位置的后面不能匹配表达式exp

(?<=exp)零宽度正回顾后发断言，它断言自身出现的位置的前面能匹配表达式exp

(?<!exp)零宽度负回顾后发断言.它断言此位置的前面不能匹配表达式exp

# 兼容es5利用symbol创建全局静态标识符

```js
var hasSymbol = typeof Symbol === 'function'
var makeSymbol
if (hasSymbol) {
  makeSymbol = function (key) {
    return Symbol.for(key)
  }
} else {
  makeSymbol = function (key) {
    return '_' + key
  }
}
var MAX = makeSymbol('max')
```

# 对外接口用户实例化返回具体对象

提供一个对外接口 Dog，用户实例化可能是 `let dog = Dog()` 也可能是 `let dog = new Dog()`

对于前者，在Dog中访问的this是顶层上下文如window,要初始化属性的时候就不能通过this.name=xx设置

所以一般我们都会做一次判断

```js
function Dog(){
  if(!(this instanceof Dog)){
    return new Dog()
  }
  this.name = 'xiaohei'
}
```

# 正则判断前置操作

`/[a-z]+/.test(null)`操作时会将 null 转为 'null',导致出现错误的结果 true 

故在判断前需要进行判空操作


# 仅一次使用的方法，做到不命名
```js
(funciton(){})
```

# 高精度计时

```js
var start = performance.now()
...
var end = performance.now()
console.log("耗时：",end-start,'ms')//带浮点数，有比ms更高的精度
```

```js
console.time("test")
...
console.timeEnd("test")
//系统自动打印  test: xxx.xxx ms
```

# 正则 匹配素数个x

`^(?!(xx+)\1+$)`

# 数组转对象 `[{id:1,name:1},{id:2,name:2}] 变成 {1:{name:1},2:{name:2}}`

```js
let root = {
  name:'root',
  children:[{id:1,name:1},{id:2,name:2}]
}
let temp = root.children
root.children = {}
temp.forEach((v)=>{root.children[v.id]=v;delete v.id})
```
目前没找到什么比较好看的写法

# chrome执行性能分析,要分析load处理，利用record即可（refresh是重刷页面并记录）

# 箭头函数返回对象

```js
(v)=>{
  return {
    name : v
  }
}
```
=>
```js
(v)=>(
  {
    name : v
  }
)
```
修改原对象值并返回
```js
(arr)=>(arr[0]=1,arr)
```

# JavaScript如何简单快速生成包含前N个自然数的数组？

`Array.from({length}, (v, k) => k)`

`let f = length => [...Array.from({length}).keys()]`

# 函数解构赋值，传null的时候

```js
let f=({a}={a:1})=>a
f() //1
f({}) //undefined
f(undefined) //1
f(null) //Uncaught TypeError: Cannot destructure property `a` of 'undefined' or 'null'.
```

传 null 的时候 不会使用默认值，arguments 是有值的，可以用 babel 编译下看其实现

# 将数组扁平化去并除其中重复部分数据，最终得到一个升序且不重复的数组

```js
var arr = [ [1, 2, 2], [3, 4, 5, 5], [6, 7, 8, 9, [11, 12, [12, 13, [14] ] ] ], 10];
[...new Set(arr.flat(Infinity))].sort((a,b)=>+(a>b)||+(a===b)-1)
```

# 获取 class 静态属性和方法 列表

```js
class Foo{
    static one() {}
    static num1 = 'Num 1';
    notStatic = "I'm not static";
    three() {}
    static four() {}
}
// 获取静态属性列表
Object.keys(Foo)
// ["num1"]


// 获取静态方法列表
Object.getOwnPropertyNames(Foo)
// ["length", "prototype", "one", "four", "name", "num1"]
Object.getOwnPropertyNames(Foo).filter(prop => typeof Foo[prop] === "function");
// ["one", "four"]

// 获取静态属性和方法
Object.keys(Foo).concat(Object.getOwnPropertyNames(Foo).filter(prop => typeof Foo[prop] === "function"))
//  ["num1", "one", "four"]
```

# 实现 函数重载
```js
function addMethod(object, name, fn) {
    var old = object[name];
    object[name] = function(){
        // console.log('fn',fn)
        if (fn.length == arguments.length)
           return fn.apply(this, arguments)
        else if (typeof old == 'function')
           return old.apply(this, arguments);
    };
}
let obj = {}
addMethod(obj,'say',(a)=>a)
addMethod(obj,'say',(a,b,c)=>a+b+c)
addMethod(obj,'say',(a,b)=>a-b)
``` 
每次重载后，都有属于自己的闭包

old 为 上一次重载的方法，故当`fn.length == arguments.length` 不匹配时，会往上次的重载方法找

from 《JavaScript 忍者秘籍》

# 从一个数组N中随机抽取不重复的M(N>>M)个元素

讲下标作为元素的key,

1. Set while(true) 直到个数达到 N
2. 洗牌算法 O(n)
```js
/* 洗牌算法：
    1.生成一个0 - arr.length 的随机数
    2.交换该随机数位置元素和数组的最后一个元素，并把该随机位置的元素放入结果数组
    3.生成一个0 - arr.length - 1 的随机数
    4.交换该随机数位置元素和数组的倒数第二个元素，并把该随机位置的元素放入结果数组
    依次类推，直至取完所需的10k个元素
*/

function shuffle(arr, size) {
    let result = []
    for (let i = 0; i < size; i++) {
        const randomIndex = Math.floor(Math.random() * (arr.length - i))
        const item = arr[randomIndex]
        result.push(item)
        arr[randomIndex] = arr[arr.length - 1 - i]
        arr[arr.length - 1 - i] = item
    }
    return result
}
```
[洗牌算法](https://blog.csdn.net/qq_26399665/article/details/79831490)

3. 蓄水池抽样算法
当A足够大时，不能用数组存储

[蓄水池抽样算法](https://blog.csdn.net/bitcarmanlee/article/details/52719202)

```js
function reservoir(n,m){
  // 假设数据为0~n-1,抽 m 个元素
  // 初始化池中数据为 0~m-1
  let ret = Array.from({length: m}, (v, i) => i);
  for(let i=m;i<n;i++){
    // 第i个元素有 m/i 概率替换ret中任一元素
   // 即 Math.random()*(i+1) <=m 表示命中
    if(Math.random()*(i+1)<=m){
      // 命中，选择ret一个元素进行替换
      let index = Math.floor(Math.random()*m)
      ret[index] = i
    }
  }
  return ret
}
```