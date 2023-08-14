---
title: Babel 使用总结
date: 2022-10-08 10:31:49
permalink: /pages/4a5805/
categories: 
  - 大前端
  - 工程能力
  - 编译构建
  - babel
tags: 
  - 
---
# 前言

Babel 是什么？

> Babel 是将我们写的 ES6+ 代码，包括`语法层（比如 let、class）` 和 `api 层（比如 Promise、Array.prototype.flat ）`，转换为向后兼容的代码的工具

在使用 Babel 的过程中，或多或少会有这些疑问：

1. Babel 怎么用？它有哪些主要模块？
2. Babel 与 webpack 什么关系？如何单独使用 Babel？如何处理第三方依赖的？
3. Babel 与 TypeScript 是怎么配合的？

我们带着这些问题开始本文~

# Babel 的组成 

- @babel/preset-env
- @babel/plugin-transform-runtime

## @babel/preset-env

> 详见官方文档：https://babeljs.io/docs/babel-preset-env

智能预设，以供项目使用最新的 JavaScript ，包括语法以及**可选的 api polyfill**。

包含三个关键配置：
- targets: 指定目标浏览器环境配置，表示这些语法和 polyfill 需要在目标浏览器上可以无错运行。实际项目推荐使用 .browserslistrc 文件配置
- useBuiltIns: 配置 polyfill 导入策略，包括：
  - false：不引入 polyfill，只转语法，默认值
  - entry：全量导入，严格来说，是导入 targets 所需 polyfill。
    - 使用：除了配置外，还需要入口文件引入 `core-js`
    - 缺点：包体积较大
    - 优点：可以避免第三方包没有处理 polyfill 或者处理不当，导致引用异常
  - usage：按需导入。
    - 使用：配置即可，无需手动引用模块，babel 会根据用户代码自动导入 polyfill
    - 优点：按需导入包体积较小
    - 缺点：无法处理第三方包的 polyfill 问题
    - 注意：按需引入时，如果无法确定具体的原型方法，则都导入。比如 `t.includes` 这段代码，不知道是 string 还是 array ，babel 会都导入
- corejs：配置 corejs 的版本，是否使用提案特性（proposals）

## @babel/plugin-transform-runtime
> 详见官方文档：https://babeljs.io/docs/babel-plugin-transform-runtime

该插件主要为库开发而生，有两个特点：
1. 为待 polyfill 的 api 创建沙盒环境，避免污染全局范围：比如库中使用了 Promise ，与外部项目的 Promise Polyfill 不兼容，那么就可以利用该插件给库用到的 Promise 进行沙盒转换，同时不影响外部的 Promise Polyfill
2. 引用模块 `@babel/runtime` 以避免编译重复输出：减少包体积

然而，大多数第三方包并没有做 `transform-runtime` 这个处理，主要有两个原因：
1. 导致产物体积变大
2. 三方包并不知道外部项目的目标环境，不知道哪些该转

因此，第三方包一般只转语法，不转 api 。
同时，大家都约定所用语法基于标准，仅当库所用 api 非标准时才自行加 runtime Polyfill。

## 总结

- 库一般不需要提供补丁，始终由应用方统一提供即可。
- 应用补丁，使用 @babel/preset-env + useBuiltIns ，根据兼容目标自动获取补丁


# Babel 与 webpack

现在的项目中，好像用 Babel 的时候就得带上 webpack ，实际上不是的。

如果项目已经采用 webpack 等构建工具, 那么可以选择使用 babel-loader ，内部会获取文件内容并调用 `@babel/core` 进行转换
> 推荐 babel 配置用 `babel.config.js` 维护，打包配置用 webpack 维护


如果不是标准项目，仅仅只是为了转换，那么可以选择使用 babel 命令

> 详见：https://babeljs.io/docs/usage

## 示例 Babel 项目
1. 安装依赖
```sh
yarn add --dev @babel/core @babel/cli @babel/preset-env
```

2. 配置 babel
```js
module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          edge: "17",
          firefox: "60",
          chrome: "67",
          safari: "11.1",
          ie: "11",
        },
        useBuiltIns: "usage",
        corejs: "3.6.5",
      },
    ],
  ],
};

```

3. 编写代码，并执行命令转换
```sh
# 将 src 目录下的 js 文件进行转换，并输出到 lib 目录
./node_modules/.bin/babel src --out-dir lib
```

## Babel 与第三方依赖

babel 只处理单文件，因此如果要转译第三方依赖，以及其他文件，就需要用到打包器（比如 webpack）

注意 core-js 的代码逻辑，除了引入 `core-js/modules` 的代码，还会引入众多 `core-js/internals` 工具代码（这部分代码量还是挺多的）。

## 将第三方依赖进行 babel 处理

默认情况下不对第三方依赖进行处理 **（包括语法转译）** ，即 exclude /node_modules/ 。

如果想要 babel 处理第三方模块，需要修改 exclude 逻辑：
```js
{
  exclude: (path) => {
    return /node_modules/.test(path) && !/@gahing\/test-pkg/.test(path)
  },
}
```

注意：webpack 的 target 配置（比如 `['web','es5']`），只会作用于包裹代码，对第三方依赖的代码不生效。

# Babel 与 TypeScript

对于 typescript 项目，编译采用 tsc 还是 babel？

直接说结论：
- 大部分项目用 tsc 足以，支持语法转译，polyfill 可以走 core-js 全量引入，担心体积太大可以用 `polyfill.io` 这类在线方案
- 有草案阶段语法诉求，可以升级 tsc 版本实现支持；当然也可以走 babel 方案编译
- 如果走 babel 方案编译，需要注意 babel 主要针对单文件处理，部分 ts 语法无法正常转换

更多细节可以看以下文章：
- [Babel vs. TypeScript: Choosing the right compiler for your project](https://blog.logrocket.com/babel-vs-typescript-choosing-right-compiler-project/)
- [编译 ts 代码用 tsc 还是 babel？](https://juejin.cn/post/7084882650233569317)
- [为什么说用 babel 编译 typescript 是更好的选择](https://juejin.cn/post/6968636129239105549)

# 常见问题

## Q: 如果第三方依赖没有转译 es5，webpack 打包时默认会处理么？会出现什么问题？怎么解决？

不会。将导致低版本浏览器解析报错甚至白屏。可以将该包加入 babel 编译

## Q：如果项目 useBuiltIns 配置按需加载，且项目代码中未使用 Map，而第三方库使用了 Map ，目标兼容 ie11 ，会出现什么问题？怎么解决？

将导致运行时报错。可以手动添加 Polyfill ，或者改用 entry 的 useBuiltIns 配置

## Q：为什么不对第三方依赖全部重新 babel 处理下？

考虑到重新 babel 处理比较耗时，大多数业务对浏览器兼容性诉求没那么高，故通常不会这么做。

但实际上是可以这么做的，比较保险。此外也可以通过一些白屏检测方案来保证这件事

## Q：如何避免不必要的 Polyfill 加载？

有两种解决思路：
1. 使用 polyfill.io 这类线上方案
   - 原理：根据 UA 动态加载差异 Polyfill
   - 优点：项目中仅需处理语法，无需处理 api polyyfill
   - 缺点：项目代码中的语法还是得转译，转译语法执行性能相对较差
2. 使用 @vitejs/plugin-legacy 的解决方案
  - 利用 script 的 module/nomodule 特性差异化加载，现代浏览器走 module 逻辑+剩余差异 Polyfill，传统浏览器走语法转译+Polyfill
  - 优点：优先保证大多数现代浏览器的加载体验，少部分浏览器再走语法编译逻辑
  - 缺点：产物文件较多；少部分版本的浏览器存在 ESM 文件重复加载的问题；发展时间短，可能有隐藏问题
  - 更多细节可以看这篇文章：[【原理揭秘】Vite 是怎么兼容老旧浏览器的？你以为仅仅依靠 Babel？](https://juejin.cn/post/7217449801633628215)

## Q：部署 polyfill.io 这类方案，需要注意什么？

polyfill.io 根据 ua 对比自动下发差异，提供[开源部署方案](https://github.com/JakeChampion/polyfill-service)，使用时需要注意：
- 时刻关注 browserlist 变化
- 需要部署 CDN 边缘服务
- 异常 UA （比如国产浏览器）无法识别，只能走降级兜底策略
- 不能处理语法层面

# 最佳方案是什么

目标：尽可能快的打包，尽可能少的加载产物，尽可能快的执行代码

一个终极方案是：
1. 打包不处理 Polyfill ，走 `polyfill.io` ：尽可能快的打包，尽可能少的加载产物
2. 业务产物走 script 的 module/nomodule 特性差异化加载方案：尽可能快的执行代码
3. 线上真机白屏检测卡点：避免第三方依赖语法和 api 缺失的报错问题

当然，要完成这套方案成本较高，可以根据各自公司基建能力和业务诉求来做，最合适的才是最佳的。

# 参考

1. [Babel学习系列](https://zhuanlan.zhihu.com/p/58624930)
2. [不要肆无忌惮地在你的项目中使用 ES78910 了](https://juejin.im/post/5d7efbbb6fb9a06b2650c74a)