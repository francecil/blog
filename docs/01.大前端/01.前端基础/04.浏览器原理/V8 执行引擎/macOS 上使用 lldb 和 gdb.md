---
title: macOS 上使用 lldb 和 gdb
date: 2020-06-22 11:12:40
tags: 
  - V8
permalink: /pages/26ca79/
categories: 
  - 大前端
  - 前端基础
  - 浏览器原理
  - V8 执行引擎
---

## 背景

在尝试调试 JS 引擎的时候，发现需要用到这些工具

其中 v8 用 gdb, JavaScriptCore 用 lldb

macOS 版本： 10.15 

先来说说 gdb 的使用吧

<!--more-->

## gdb 安装与签名

```sh
brew install gdb
gdb -v
# 9.2
```

网上有说什么高版本有坑的需要下特定版本的，反正我暂时没遇到

上面安装完后还会输出以下信息（很关键）

```
gdb requires special privileges to access Mach ports.
You will need to codesign the binary. For instructions, see:

  https://sourceware.org/gdb/wiki/BuildingOnDarwin

On 10.12 (Sierra) or later with SIP, you need to run this:

  echo "set startup-with-shell off" >> ~/.gdbinit
```

安装完需要进行签名，否则会报类似以下的错误
```
Starting program: /x/y/foo
Unable to find Mach task port for process-id 28885: (os/kern) failure (0x5).
 (please check gdb is codesigned - see taskgated(8))
```
网上[大部分文章](https://blog.csdn.net/weixin_30257433/article/details/94883470)讲的都是 10.14 之前的做法，按之前的做法还是会签名失败。

可以看上面输出的地址 -- https://sourceware.org/gdb/wiki/BuildingOnDarwin ，里面讲了如何解决这个问题。

```sh
sudo killall taskgated
codesign -fs gdb_codesign "$(which gdb)"
```

## gdb 调试命令

权当记录

```sh

list(l) # 查看程序代码
回车 # 表示执行上一条命令
start(s) # 开始执行程序
run(r) #从头开始调试
quit(q) #退出程序
next(n) #单步执行
step(s) #进入函数
backtrace(bt) #查看函数调用栈帧 结果显示: #0 xxx #1 xxx
frame(f) x #选择 x 号栈帧

info(i) locals #查看变量信息
info(i) breakpoints #查看断点信息
info(i) watchpoints #查询观察点

print(p) x #输出变量 x 的值
finish #将程序运行到当前函数返回
continue(c) #将程序运行到结束或者断点处
set var 变量=XX #进行变量赋值
display 变量 #追踪变量值，每次执行(next)都会对追踪变量进行输出显示
undisplay 编号 #取消追踪

break(b) 行号/函数名 <条件语句> #设置断点
delete breakpoints 断点编号  #删除断点，没带断点编号则删除所有断点
disable breakpoints 断点编号 #禁用断点
enable 断点编号 #启用断点

#观察点是当程序访问某个存储单元时中断
watch arr[4] # 访问arr[4] 时中断
```

## gdb 调试-实例分析
 
 ```sh
gcc test.c -g -o test
gdb test
```

[GDB调试工具总结](https://www.jianshu.com/p/30ffc01380a0) 这篇文章举了几个例子，并一步步教命令怎么使用，建议阅读，这里就不重复了。

## gdb 与 vscode

利用命令进行调试，对于新手来说有点麻烦，那么用 vscode 来进行调试就是一个不错的选择

需要先安装 c/c++ 插件

启动调试，此时需要一个启动的 json 文件

```json
{
    // Use IntelliSense to learn about possible attributes.
    // Hover to view descriptions of existing attributes.
    // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
    "version": "0.2.0",
    "configurations": [

        {
            "name": "gcc - 生成和调试活动文件",
            "type": "cppdbg",
            "request": "launch",
            "program": "${workspaceRoot}/test",
            "args": [],
            "stopAtEntry": true,
            "cwd": "${workspaceFolder}",
            "environment": [],
            "externalConsole": false,
            "MIMode": "lldb",
            "preLaunchTask": "build"
        }
    ]
}
```

等价于 `gdb test`

test 是我们要调试的程序，再执行之前我们需要先编译链接生成它，所以又创了一个任务 build

版本不一样，配置也不一样，根据系统提示的进行创建

```json
{
    // See https://go.microsoft.com/fwlink/?LinkId=733558
    // for the documentation about the tasks.json format
    "version": "2.0.0",
    "tasks": [
        {
            "label": "build",
            "type": "shell",
            "command": "gcc test.c -g -o test.o"
        }
    ]
}
```

## peda 插件：增强 gdb 的显示

```sh
git clone https://github.com/longld/peda.git ~/peda
echo "source ~/peda/peda.py" >> ~/.gdbinit
```

## lldb 使用

https://lldb.llvm.org/

[与 gdb 命令的映射](https://lldb.llvm.org/use/map.html)

### chisel 插件：增强 lldb 的显示

```sh
brew install chisel
echo "command script import /usr/local/opt/chisel/libexec/fblldb.py" >> ~/.lldbinit
```


## 参考文档

- [GDB调试工具总结](https://www.jianshu.com/p/30ffc01380a0)
- [PermissionsDarwin](https://sourceware.org/gdb/wiki/PermissionsDarwin)