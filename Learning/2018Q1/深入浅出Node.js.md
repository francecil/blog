# 模块机制

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


# 异步IO

