
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