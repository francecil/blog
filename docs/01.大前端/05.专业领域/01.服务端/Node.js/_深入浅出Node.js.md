---
title: 深入浅出Node.js
date: 2018-02-24 15:55:46
permalink: /pages/159088/
tags: 
  - 
titleTag: 草稿
categories: 
  - 大前端
  - 专业领域
  - 服务端
  - Node.js
---
# 2.模块机制

## CommonJS规范

js文件会被包装，作用域隔离

```js
(function(exports,require,module,__filename,__dirname){
  //原始js文件内容
  var math = require('math') //尝试先从缓存中寻找
  //exports指向module.exports
  exports.area = function(radius){
    return Math.PI*radius*radius
  }
});
// 代码在第一次require时被执行
```

执行后的代码放入缓存，以文件所在的绝对路径作为key


建议查看node源码，require细节


# 3.异步IO

操作系统内核对于`I/O`操作只有阻塞不阻塞两种方式。

阻塞调用是指调用结果返回之前，当前线程会被挂起。函数只有在得到结果之后才会返回。

非阻塞IO则立即返回调用的状态。为了获取完整结果，我们需要轮询去确认是否完成：

一张很经典的图<img src='http://dl2.iteye.com/upload/attachment/0072/2012/f3377fec-37bd-3db9-8dd2-91642e96e82d.jpg'></img> from http://jzhihui.iteye.com/blog/1629788

<a src="https://www.zhihu.com/question/20122137">epoll 或者 kqueue 的原理是什么？</a>

## Node的异步IO

io线程池

## 非IO的异步API

参考链接：

https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/

https://nodejs.org/zh-cn/docs/guides/event-loop-timers-and-nexttick/#what-is-the-event-loop 中文版

http://www.ruanyifeng.com/blog/2018/02/node-event-loop.html 结合评论

https://cnodejs.org/topic/5a9108d78d6e16e56bb80882

异步任务分为

1. 追加在本轮循环的异步任务

process.nextTick和Promise的回调函数，追加在本轮循环

2. 追加在次轮循环的异步任务

setTimeout、setInterval、setImmediate的回调函数，追加在次轮循环

PS:上面说法不够准确，是否追加到次轮是看对应的阶段是否进行过，没有进行过的会放入本轮。比如这个例子
```js
setTimeout(() => {
  console.log(1) //1
  setTimeout(() => console.log(4), 0) //4
  setImmediate(() => console.log(2)) //2
}, 0);
setImmediate(() => console.log(3)); //3
// 1 3 2 4
```
在timer1的回调执行中，（4）就不会再追加到本轮循环的timer队列中了。而（2），由于check阶段（执行setImmediate()的回调函数）还没执行，会在本轮循环进行

由于每个阶段的结束，都会执行`nextTickQueue（process.nextTick）`，我们进行验证
```js
setTimeout(() => {
  console.log(1) //1
  setTimeout(() => console.log(4), 0) //4
  setImmediate(() => console.log(2)) //2
  process.nextTick(()=>console.log('nextTick2'))
}, 0);
setImmediate(() => {console.log(3);process.nextTick(()=>console.log('nextTick1'))}); //3
```
Output:
```
1
nextTick2
3
2
nextTick1
4
```

一轮事件循环的6个阶段,每个阶段都是把当前阶段的函数队列清空，才会执行下个阶段。

```
timers:执行setTimeout() 和 setInterval()中到期的callback
I/O callbacks:上一轮循环中有少数的I/Ocallback会被延迟到这一轮的这一阶段执行?
idle, prepare
poll:执行I/O callback
check: setImmediate
close callbacks: 一些准备关闭的回调函数，如：socket.on('close', ...)
```

每个阶段的结束，都会执行`nextTickQueue（process.nextTick）`和`microTaskQueue（Promise）`（前者都执行完才执行后者），6个阶段结束后，继续下轮循环。

上面这句话是实践加上参考：https://jsblog.insiderattack.net/event-loop-and-the-big-picture-nodejs-event-loop-part-1-1cb67a182810

上面那句话在node v11以上不太对，见下面

20190510补充：

参考：https://jsblog.insiderattack.net/new-changes-to-timers-and-microtasks-from-node-v11-0-0-and-above-68d112743eb3

node v11后，setTimeout, setImmediate, process.nextTick and Promises 的行为发生改变
```js
setTimeout(() => console.log('timeout1'));
setTimeout(() => {
    console.log('timeout2')
    Promise.resolve().then(() => console.log('promise resolve'))
});
setTimeout(() => console.log('timeout3'));
setTimeout(() => console.log('timeout4'));
//setImmediate(() => console.log(3))
```
此时timer都到时间了，在timer阶段会执行所以到期的callback

node v11以下是输出：
```
timeout1
timeout2
timeout3
timeout4
promise resolve
```

表示整个timer阶段结束，执行 microTaskQueue，与上面的说法一致

在node.js v11以上，与浏览器保持一致，是输出
```
timeout1
timeout2
promise resolve
timeout3
timeout4
```
每个timer执行结束，都会去执行microTaskQueue，而不是等整个timer阶段结束





### 浏览器端的事件循环：

参考：https://juejin.im/post/5c337ae06fb9a049bc4cd218#heading-12

有多个任务队列，只有一个微任务队列

> macrotask(宏任务): script（整体代码）, setTimeout, setInterval, setImmediate, I/O, UI rendering等
>
>microtask(微任务): process.nextTick, Promises（这里指浏览器实现的原生 Promise）, Object.observe, MutationObserver等

- 从macrotask队列中(task queue)取一个宏任务执行, 执行完后, 取出所有的microtask执行.
- 重复回合

当某个宏任务执行完后,会查看是否有微任务队列。如果有，先执行微任务队列中的所有任务，如果没有，会读取宏任务队列中排在最前的任务，执行宏任务的过程中，遇到微任务，依次加入微任务队列。当前宏任务执行栈空后，再次读取微任务队列里的任务，依次类推。

特别提一下，Promise的内层嵌套
```js
new Promise(resolve => {
    console.log(1);
    resolve(3);
    Promise.resolve().then(()=> console.log(4))
}).then(num => {
    console.log(num)
});
console.log(2)
```
答案是 1243 不是1234 的原因在于 **`里面的promise的then要比外面的promise的then先执行，也就是说它的nextTick更先注册，所以4是在3之前输出。`**

详细可以看<a>Promise原理分析</a>一文

# 4.异步编程

现在直接用`async/await`即可

# 5.内存控制

# 6.Buffer

## 内存分配

C++层申请，js层分配，采用slab分配策略。

8KB作为区别大小对象的边界

## Buffer转换

支持的编码`ASCII、UTF-8、base64、Binary、Hex、UTF-16/UCS-2`

### 字符串转buffer

> new Buffer(str,[encoding]) 

> buf.write(str,[offset],[length],[encoding]) //可写入多种编码

### buffer转字符串


> buf.toString([encoding],[start],[end])

### 不支持的编码

GBK等，采用iconv(利用c++调用libiconv)或者iconv-lite(纯js实现)

推荐iconv-lite：无需编译、不依赖环境、性能更好（少了C++与js之间的转换）

> iconv.decode(buf,[encoding])

> iconv.encode(str,[encoding])

对应编码下无法转换，iconv-lite会将其用问号表示（多字节是黑影）

### buffer拼接的方式

1. data +=buf => data = data.toString() + buf.toString() // 可能data中含2个字节，buf含一个字节。中文在utf8下需要三个字节，本来是把buf拼接在一起的。toString后会出现两个乱码

2. io流可以setEncoding([encoding]) //内部维护一个StringDecoder,会把上次没解码完的拼接到下一个收到的buf头。 但是只支持UTF8/BASE64/UTF16LE

3. Buffer.concat(chunkArr,size)//合并小buffer数组 再利用iconv转码

## 性能优化

1. web服务，静态内容事先转为Buffer对象

2. 读取文件设置合理的buf大小

# 7. 网络编程

## TCP

server端
```js
var net = require('net')
var server = net.createServer(function(socket){
    socket.on('data',function(data){
        socket.write('发往客户端的消息')
    })
    socket.on('end',function(){
        console.log('连接断开')
    })
    socket.write('与服务端建连连接')
})
// or
/*
server.on('connection',function(socket){
    ...
    socket.write('与服务端建连连接')
})
*/
server.listen(8877,()=>console.log('服务启动'))
```
client端
```js
var net = require('net')
var client = net.connect({port:8877},function(){
  //建连连接
  client.write('建连')
})
client.on('data',(data)=>{
  //收到数据
  client.end()//主动断开
})
client.on('end',()=>console.log('连接断开'))

```

nagle算法：小包合并，延时发送

注意：node中tcp默认启用nagle算法，可以调用`socket.setNoDelay(true)`去掉算法，使得write可以立即发送小数据包

## UDP
server端
```js
var server = require('dgram').createSocket('udp4')
server.on('message',function(msg,rinfo){
  console.log(`server got:${msg} from ${rinfo.address}:${rinfo.port}`)
})
server.on('listening',function(){
  //bind后触发
  var address = server.address()
  console.log(`server listening ${address.address}:${address.port}`)
})
server.bind(41234)
```

client端
```js
var server = require('dgram').createSocket('udp4')
let msg = new Buffer('hello')
client.send(msg,0,msg.length,41234,'localhost',function(err,bytes){
  client.close();//client主动断开
})
```

## HTTP

server端
```js
var http = require('http')
http.createServer(function(req,res){
    //根据req.url和req.method做路由
    res.writeHead(200,{'Content-type':'text/plain'})
    res.end('hello\n')
}).listen(8877,'127.0.0.1')
console.log('server running 8877')
```
client端
```js
var options = {
  hostname:'127.0.0.1',
  port:8877,
  path:'/',
  method:'GET',
  agent:new http.Agent({maxSockets:10}) //客户端连接并发默认5个 false取消并发限制
}
var req = http.request(options,function(res){
  console.log(res.statusCode)
  res.setEncoding('utf8') //设置响应内容的编码格式 buf=>str
  res.on('data',function(chunk){
    console.log(chunk)
  })
})

```

http.Agent 设置 maxSockets 限制http客户端对服务端发起的请求并发数

## WebSocket

### 握手部分由http完成

请求
```
Connection:Upgrade
Sec-WebSocket-Extensions:permessage-deflate; client_max_window_bits
Sec-WebSocket-Key:VSlvUdbYjhpfojIDjlGUUw==
Sec-WebSocket-Version:13
Upgrade:websocket
```
响应
```
Status Code:101 Switching Protocols
Connection:Upgrade
Sec-WebSocket-Accept:6sN7ky5vYsu2qmUoKH+0G7nYqa4=
Upgrade:websocket
```

表示更换协议成功
### 数据传输
...

## TLS、HTTPS

# 9.进程

## 进程间通信

## 集群

## Cluster模块

# 10.测试

##

# 11.生产模式

# 文件操作

