---
title: node小bug记录
date: 2020-03-22 13:35:02
permalink: /pages/278908/
tags: 
  - null
titleTag: 草稿
categories: 
  - 大前端
  - 专业领域
  - 服务端
  - js
---
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

## 2. sql批量插入

```js
this.connection.query('INSERT INTO user(id,name) VALUES ?',[[[1,'a'],[2,'b']]])
```

注意的是params参数外面包了一层[],sql语句 VALUES后面只带`?`

## 3. 下载文件，文件名乱码

```js
try {
    var filePath = path.join(__dirname, '../') + '/files/xls/demo.xlsx'
    // 定位到具体文件
    var stats = fs.statSync(filePath)
    if (stats.isFile()) {
      // 对指定的中文名进行utf8编码，否则直接filename=中文名 将不生效还是使用原来文件名
      res.set({
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': "attachment; filename*=UTF-8''" + encodeURI('App提交模板.xlsx'),
        'Content-Length': stats.size
      })
      res.send(stats)
    } else {
      res.status(404).end()
    }
  } catch (error) {
    res.status(404).end()
  }
```