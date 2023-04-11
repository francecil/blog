---
title: Node子进程执行ping操作并获取统计信息
date: 2018-03-09 11:12:40
tags: 
  - nodejs
permalink: /pages/6c5984/
categories: 
  - 服务端
  - 编程语言
  - NodeJS
---


## 需求

采用`ping -t`方式不断进行ping操作，直到收到关闭信号or某个超时时间时结束操作，获取统计信息。

<!--more-->

## 分析

在cmd窗口进行`ping -t`操作，会一直进行ping，直到输入`ctrl+C` 会输出ping统计信息。

`kill('SIGINT')` 即模拟 `ctrl+C` 终止进程


## 编码

这里我自己手动进行统计信息，原因见下面分析。

```js
var exec = require('child_process').exec;
var iconv = require('iconv-lite');
let ping = exec(`ping www.google.com.hk -t`, { encoding: 'binary'}, function (err, stdout, stderr) {
    let send = 0
    let accept = 0
    let lost = 0
    let min = Infinity
    let max = -Infinity
    let avg = 0
    let Min = (a,b)=>a<b?a:b;
    let Max = (a,b)=>a>b?a:b;

    let str = iconv.decode(new Buffer(stdout, 'binary'), 'GBK')
    console.log(str);
    console.log('=========')
    let regAccept = /来自 .*的回复: 字节=(\d+) 时间=(\d+)ms TTL=(\d+)/g
    let regAll = /\n/g
    send = str.match(regAll).length - 2
    send=send<0?0:send
    let res
    while (res = regAccept.exec(str)) {
        accept++
        let tim = Number(res[2])
        min=Min(tim,min)
        max=Max(tim,max)
        avg= (avg*(accept-1)+tim)/accept
        console.log(res[1], tim, res[3],avg)
    }
    console.log('=========')
    console.log(`发送:${send};接收:${accept};丢失:${send-accept};${(1-(accept/send))*100}%丢失`)
    console.log(`最短:${min}ms;最长:${max}ms;平均:${avg}ms`)
});
ping.on('close', (code) => { console.log('close by', code) })
setTimeout(function () {
    ping.kill('SIGINT')
}, 5 * 1000);

```

想通过`ping.kill('SIGINT')`去关闭exec子进程。

测试结果是：输出了 `close by null` 后，程序依然再运行，并且没有输出统计信息。




## 问题解决

**思路1**：在`setTimeout`中增加`process.kill(ping.pid,'SIGINT');process.exit(0)`

测试结果：程序会退出，但是没有输出`close by`也没有输出统计信息。并且任务管理器中ping进程仍然存在。

**思路2**：换个思路，给exec的options增加`timeout`参数，取消`setTimeout`。

测试结果：达到timeout时间后，会执行回调函数，可以输出统计信息（cmd ping操作最后的统计信息在这边是没有的，这边我自己进行了统计）。

但是！！ping进程并没有关闭。当ping进程大量存在的时候，ping的速度会越来越慢。



**看到网上有篇文章[child_process模块怎么真正的杀死子进程][1]有一样的问题。**

最后他是采用 [node-tree-kill][2] 库解决。

### node-tree-kill 使用、源码及原理

#### 使用

`npm i tree-kill` 安装

```js
var kill = require('tree-kill');
setTimeout(function () {
    kill(ping.pid) //把最初代码这边做下替换
}, 5 * 1000);
```

#### 源码

```js
module.exports = function (pid, signal, callback) {
    var tree = {};
    var pidsToProcess = {};
    tree[pid] = [];
    pidsToProcess[pid] = 1;
    
    if (typeof signal === 'function' && callback === undefined) {
      callback = signal;
      signal = undefined;
    }

    switch (process.platform) {
    case 'win32':
        // /T终止指定的进程和由它启用的子进程
        // /F指定强制终止进程 /pid指定进程pid号
        exec('taskkill /pid ' + pid + ' /T /F', callback);
        break;
    case 'darwin':
        buildProcessTree(pid, tree, pidsToProcess, function (parentPid) {
          return spawn('pgrep', ['-P', parentPid]);
        }, function () {
            killAll(tree, signal, callback);
        });
        break;
    // case 'sunos':
    //     buildProcessTreeSunOS(pid, tree, pidsToProcess, function () {
    //         killAll(tree, signal, callback);
    //     });
    //     break;
    default: // Linux
        buildProcessTree(pid, tree, pidsToProcess, function (parentPid) {
          return spawn('ps', ['-o', 'pid', '--no-headers', '--ppid', parentPid]);
        }, function () {
            killAll(tree, signal, callback);
        });
        break;
    }
};
```
#### 原理

很简单。就是调用了系统指令强行关闭进程，而不是原来程序中去做关闭。做了不同平台的兼容。




[1]:https://cnodejs.org/topic/5664f61e374362a006a1a572
[2]:https://github.com/pkrumins/node-tree-kill