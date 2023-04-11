---
title: nodejs文件下载
date: 2018/04/03 01:00:00
tags: 
  - nodejs
permalink: /pages/fe1c77/

---

本文来谈谈 nodejs 文件下载的细节

注：这边的文件下载，发起者为客户端

<!--more-->

```js
function (req, res, next) {
  //项目根目录下的/files/xls/demo.xlsx文件
  var filePath = path.join(__dirname, '../') + '/files/xls/demo.xlsx'
  // 定位到具体文件
  var stats = fs.statSync(filePath)
  //判断文件是否存在
  if (stats.isFile()) {
    //Content-Disposition属性，如果不考虑中文的话，直接用filename=demo.xlsx即可
    //如果有中文，需要进行utf8编码，filename后需带上*=UTF-8''
    // 如有中文但不进行编码设置，Content-Disposition参数将不生效，还是原来的文件名
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': "attachment; filename*=UTF-8''" + encodeURI('App提交模板.xlsx'),
      'Content-Length': stats.size
    })
    res.send(stats)
    //fs.createReadStream(filePath).pipe(res)
  } else {
      res.status(404).end()
  }
}
```

对于小文件来说，采用`res.send(buffer)` 或`res.sendFile(fileName)`的形式，是先将文件内容放到buff中再进行传输

若文件相对较大，需要采用`fs.createReadStream(filePath).pipe(res)`用流管道的方式传输,这种方式读一部分写一部分，用过的部分会被GC,故占内存少

express 还对res封装了一个download方法，已采用`res.set`进行参数设置，并调用`res.sendFile()`方法进行文件传输，用起来很方便

```js
var filePath = path.join(__dirname, '../') + '/files/xls/demo.xlsx'
res.download(filePath, 'App提交模板.xlsx')
```
当文件不存在时(err)，是走路由的Error Handler.若指定第三个参数`(err)=>{}`则走该参数

```js
//文件不存在时产生的err
err:
  code:"ENOENT"
  errno:-4058
  expose:false
  message:"ENOENT: no such file or directory, stat 'e:\WebProjects\client-management-server\files\xls\demos.xlsx'"
  path:"e:\WebProjects\client-management-server\files\xls\demos.xlsx"
  stack:"Error: ENOENT: no such file or directory, stat 'e:\WebProjects\client-management-server\files\xls\demos.xlsx'"
  status:404
  statusCode:404
  syscall:"stat"
```


故小文件（<500M），推荐直接采用express的download方法