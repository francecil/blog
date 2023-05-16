---
title: commonjs与esmodule
date: 2021-09-21 21:02:37
permalink: /pages/95bf2e/
categories: 
  - 大前端
  - 工程能力
  - JS 模块化
tags: 
  - 
titleTag: 草稿
---
## CommonJS

node 中对文件进行加载，使用自己的一套包装机制（底层还是用的 es5 js 那套，没有新语法糖）

同步加载并执行模块文件

require 加载源码，看完差不多就懂加载过程了
```js
 // id 为路径标识符
function require(id) {
   /* 查找  Module 上有没有已经加载的 js  对象*/
   const  cachedModule = Module._cache[id]
   
   /* 如果已经加载了那么直接取走缓存的 exports 对象  */
  if(cachedModule){
    return cachedModule.exports
  }
 
  /* 创建当前模块的 module  */
  const module = { exports: {} ,loaded: false , ...}

  /* 将 module 缓存到  Module 的缓存属性中，路径标识符作为 id */  
  Module._cache[id] = module
  /* 加载文件 */
  runInThisContext(wrapper('module.exports = "123"'))(module.exports, require, module, __filename, __dirname)
  /* 加载完成 *//
  module.loaded = true 
  /* 返回值 */
  return module.exports
}
```

模块id放缓存-》初始化-》加载文件-》返回值

一旦出现某个模块被"循环加载"，就只输出已经执行的部分(那一刻的 exports 的值)

因此:
1. 多次 require 引入同一个文件，实际都是引用的同一个 `module.exports` 对象，故某个地方进行修改会影响其他地方的访问值
2. 
## Es Module

es6 语法，编译时就确定好了

自动提升到顶部

import 使用总结：
- 导入的属性只读，相对于 const , 无论其是否为基础类型
- import 的模块运行在严格模式下
- 导入的变量始终是一个引用，和原变量绑定在一起，无论其是否为基础类型

底层处理的，不是 es5 可以实现的

循环加载的处理：认为引用的模块都是导出好了的，结果在实际执行时使用了尚未导出的引用模块的方法，导致报 undefined  

## 文章推荐
https://mp.weixin.qq.com/s/y_uk7wXAfvq8FzcUZrR93w
