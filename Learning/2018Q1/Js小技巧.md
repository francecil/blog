
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

```
百度的，比较不准

// var url = 'http://api.map.baidu.com/location/ip?ak=F454f8a5efe5e577997931cc01de3974&ip=' + remoteAddress + '&callback=?'
// $.getJSON(url, function (data) {
// // 定位的地址信息 根据需要写入对象属性
// console.log('showLocation', data)
// })

新浪的
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

# 数据有换行 `json.parse`时失败

可以 stringify 的加上一句

`replace(/\n/g,"\\n").replace(/\r/g,"\\r")`

# 模板解析

利用`Function`
```
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

# 返回一个随机不重复数字[2-32]的数组，长度为n

```
const uniqueNums = (n) => 
  [...(new Array(31)).keys()]
    .map((i) => i + 2)
    .sort(() => Math.random() - Math.random())
    .slice(0, n)
```

# js 数据类型判断

例：null 得到 null 而不是 object


法1
```
const type = (obj) =>{
  /* TODO */
  return Object.prototype.toString.call(obj).slice(8,-1).toLowerCase();
}
```
法2
```
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

# 利用symbol创建全局静态标识符

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