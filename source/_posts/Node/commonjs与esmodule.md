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

## Es Module

es6 语法，编译时就确定好了

自动提升到顶部

import 使用总结：
- 导入的属性只读，相对于 const , 无论其是否为基础类型
- import 的模块运行在严格模式下
- 导入的变量始终是一个引用，和原变量绑定在一起，无论其是否为基础类型

底层处理的，不是 es5 可以实现的

## 文章推荐
https://mp.weixin.qq.com/s/y_uk7wXAfvq8FzcUZrR93w
