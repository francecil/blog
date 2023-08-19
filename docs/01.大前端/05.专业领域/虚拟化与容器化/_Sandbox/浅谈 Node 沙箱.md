
## 最新补充
> vm2 不再维护，因为跟不上 node 升级导致的漏洞绕过；推荐改用 isolated-vm
> 
> https://github.com/patriksimek/vm2/wiki/vm2-vs-isolated-vm

vm 沙箱

## vm 沙箱原理解析

https://github.com/nodejs/node/blob/main/doc/api/vm.md

https://github.com/nodejs/node/blob/main/lib/vm.js

ContextifyScript 内部 C++ 执行

## 能否用来运行任意代码？

官方说了不可，从上面的源码解析来看，也可以看出来


举一些例子，比如 process 问题


简单提一下 proxy 的解决方向，然后引出 vm2

microtask timeout 问题， microtaskMode 能解决？

## vm2: 更安全的沙箱

原理解析

acorn 库进行 ast 分析？作用是什么

## 拓展阅读

https://www.anquanke.com/post/id/207283