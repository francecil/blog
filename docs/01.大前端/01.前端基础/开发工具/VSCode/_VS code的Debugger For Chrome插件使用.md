---
title: VS code的Debugger For Chrome插件使用
date: 2018-01-10 11:31:06
permalink: /pages/f9ddbd/
categories: 
  - 大前端
  - 前端基础
  - 开发工具
  - VSCode
tags: 
  - 
titleTag: 草稿
---

配置例子

```
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome against localhost",
      "url": "http://localhost:8081/LearningWeb",
      "webRoot": "${workspaceRoot}"
    }
     // {
    //   "name": "Launch index.html (disable sourcemaps)",
    //   "type": "chrome",
    //   "request": "launch",
    //   "sourceMaps": false,
    //   "file": "D:/wamp64/www/LearningWeb/index.html"
    // } 
  ]
}
```

>前面是有web服务器支持的，项目文件需要放在web服务器下
>后面的是静态项目，直接用file访问，无需web服务器

其实这个插件我感觉没什么用，直接用chrome就好了。

后记：当调试其他浏览器兼容性时，发现ie的调试不好用，这时候该插件就派上用场了