## 前言

Babel 是什么？

> Babel 是将我们写的 ES6+ 代码，包括 语法层（比如 let、class） 和 api 层（比如 Promise、Array.prototype.flat ），转换为向后兼容的代码的工具

在使用 Babel 的过程中，或多或少会有这些疑问：

1. Babel 7 的组成
2. Babel 6 和 Babel 7 有什么区别
3. Babel 与 TypeScript 是怎么配合的
4. vue-cli3 构建的项目的默认babel配置是哪些，如何新增配置
5. Babel 与 webpack 什么关系，如何单独使用 Babel

我们带着这些问题开始本文~

## Babel 7 的组成 



## Babel 6 与 Babel 7

直接看官网 xxx

主要注意的点是xxx

## vue-cli3
## Babel 与 webpack

现在的项目中，好像用 Babel 的时候就得带上 webpack ,其实在于用的项目。

如果项目 xxx 是得用上 webpack 等构建工具, 如果项目 xxx 那仅需要 Babel + npm scripts 就可以了

如果这样的项目

xxx

我们要 xxx

只需要 xxx 命令即可

babel-cli 用命令 执行 文件转换操作

babel-loader webpack 文件加载器，获取到文件流 调用 @babel/core 进行转换

## 参考

1. [Babel学习系列](https://zhuanlan.zhihu.com/p/58624930)
2. [不要肆无忌惮地在你的项目中使用 ES78910 了](https://juejin.im/post/5d7efbbb6fb9a06b2650c74a)