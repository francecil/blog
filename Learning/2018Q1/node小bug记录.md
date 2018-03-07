## 1.使用exec命名，中文输出乱码

使用 `iconv-lite`

demo:

```js
var exec = require('child_process').exec;
var iconv = require('iconv-lite');
exec('ping 127.0.0.1',{encoding:'binary'},function(err,stdout,stderr){
    let str = iconv.decode(new Buffer(stdout,'binary'),'GBK')
    console.log(str)
});
```

## 2.子进程执行`ping -t`, kill('SIGINT')获取统计信息

无法实现，自行统计。

## 3.