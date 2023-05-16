---
title: VSCode 调试 V8 源码
date: 2020-07-12 04:45:20
permalink: /pages/9f42be/
categories: 
  - 大前端
  - 前端基础
  - 浏览器原理
  - V8 执行引擎
tags: 
  - 
titleTag: 草稿
---
## hint

发现 linux or macos 上调试 v8 较麻烦，后面直接调试 JavaScriptCore 了

win 上可以用 vs 调试，后面有机会可以看看

## 需求

看懂 js 方法里的某些原生实现一直是我的梦想，正好最近有个契机，看了网上很多文章，总结的技巧

调试某个方法，可以看到每个 v8 中执行的每一步

时效性

## 下载

官方文档： https://v8.dev/docs/source-code

```sh
# 进一个你要测试的目录，后面拉的工具和代码都放此目录下, 测试机我直接放 ~ 了
cd /path/to/your_test_dir
git clone https://chromium.googlesource.com/chromium/tools/depot_tools.git
export PATH=$PATH:~/depot_tools
gclient config https://chromium.googlesource.com/v8/v8
gclient sync

# 又拉了一遍？ 这个步骤应该不需要
mkdir ~/v8
cd ~/v8
fetch v8
cd v8

# linux 上需要执行此步骤，下载依赖
sudo ./build/install-build-deps.sh
# 根据提示安装某些安装包?执行以下命令
sudo dpkg --configure -a
```

macOS 坑

xcode-select: error: tool 'xcodebuild' requires Xcode, but active developer directory '/Library/Developer/CommandLineTools' is a command line tools instance 

[xcode-select active developer directory error](https://stackoverflow.com/questions/17980759/xcode-select-active-developer-directory-error)


## 编译

https://v8.dev/docs/build

官方文档见 https://v8.dev/docs/build-gn

```sh
export PATH=/Users/bytedance/Repos/test/depot_tools:$PATH

# alias gm=/path/to/v8/tools/dev/gm.py
alias gm=~/v8/tools/dev/gm.py
gm x64.release
gm x64.release.check
gm x64.debug
```

## debug
```sh
# 使用 d8 输出运行结果（类似 node）
./out/x64.debug/d8  test.js
# 或者先进入 d8 ,可以执行 js 代码
./out/x64.debug/d8

# 使用 gdb 调试  -q:不带版本号等无用输出
gdb -q ./out/x64.debug/d8
# 注意需要指定这个！?
gdb -q ./out/x64.debug/d8 -x ./tools/gdbinit 
# 主功能汇编代码?
disassemble main
# 使用 gdb debug test.js
r --allow_natives_syntax ./test.js
# 查看内存
x/gx [elements内存地址]
# 设置断点
b v8::base::ieee754::cosh
```

## v8 基础知识

Iso

## 实例分析





## vscode

安装相关插件：C/C++ Clang，C++ Intellisense，C/C++
配置launch.json，当中配置成gdb即可

https://v8.dev/docs/ide-setup

只看代码分析，支持跳转

https://source.chromium.org/chromium/chromium/src/+/master:v8

## 参考文档

- [v8 docs](https://v8.dev/docs)

https://www.youtube.com/watch?v=HimbmR7e4dk

- [[V8]使用VS Code调试V8代码](http://www.lichen.in/2018/11/21/v8-shi-yong-vs-code/)
- [Node.js 调试 源码](https://juejin.im/post/5cc5141ce51d456e3e7a3be2)
- [V8代码编译](https://v8.dev/docs/build)