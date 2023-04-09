---
title: css与js的阻塞关系
date: 2018-10-01 10:18:32
tags: 
  - HTML
permalink: /pages/d1ea01/
categories: 
  - 随笔
sidebar: auto
---

在 html 的解析过程中，样式文件和脚本文件之间是否有依赖关系呢？

我们经常看到这样一句话
> 浏览器将延迟脚本执行和 DOM 构建，直至其完成 CSSOM 的下载和构建

<!--more-->

(引自:<a href="https://developers.google.com/web/fundamentals/performance/critical-rendering-path/adding-interactivity-with-javascript?hl=zh-cn">使用 JavaScript 添加交互</a>

简单进行了以下测试

```html
<!DOCTYPE html>
<html>

<head>
  <meta charset="utf-8">
  <title>页面</title>
  <script>var start = +new Date;</script>
  <script>
    var end1 = +new Date;
    console.log(end1-start);
  </script>
  <script>
    var end2 = +new Date;
    console.log(end2-start);
  </script>
  <link rel="stylesheet" href="./css/style.css" />
   
  <script>
    var end3 = +new Date;
    console.log(end3-start);
  </script>
</head>

<body>
  <span id="span">test</span>
  <script>
    var end4 = +new Date;
    console.log(end4-start);
    document.getElementById("span").style.height = "20px";
    var end5 = +new Date;
    console.log(end5-start);
    alert((end1-start)+','+(end2-start)+','+(end3-start)+','+(end4-start)+','+(end5-start))
  </script>

</body>

</html>
```
得到了这样的结果
```
0
3
82
83
83
```

说明 script 的执行需要等待前面 css 的执行。


又看到这样一句话：
> Firefox 在样式表加载和解析的过程中，会禁止所有脚本。而对于 WebKit 而言，仅当脚本尝试访问的样式属性可能受尚未加载的样式表影响时，它才会禁止该脚本。

(引自:<a href="https://www.html5rocks.com/zh/tutorials/internals/howbrowserswork/#Tree_construction_algorithm">浏览器的工作原理</a>

但测试了ios safari 12(WebKit),发现还是会禁用脚本，脚本还是会被样式阻塞

假设能实现，引擎是如何判断脚本中访问的样式会受未加载的样式表影响？欢迎探讨