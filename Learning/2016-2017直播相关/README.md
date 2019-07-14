## 前言

16~17 年主要研究流媒体比较多一点试玩客户端

在 kj 在做一个 `云游戏` 的项目，负责了 前端 后端业务层 Android 等方面的开发。

一些技术上的记录详见各MarkDown

live.json 是关于直播的Chrome 书签Json 感兴趣的可以收藏下

更新于 2019.07 里面大部分技术还没有过时，webrtc也还没有全面普及

项目入口 demo/index.html
**访问 http://<your ip>:<port>/TryPlay/ 默认就访问该网页**

这个是PC端的页面，只做了触摸捕获。

如果检测到用户是手机访问，则通过`judgePhone("phone_frame.html")`跳转到手机页面。

移动端页面phone_frame.html

> js文件有些是fiiser的，但是拷贝过来用于研究，但是没有用到。