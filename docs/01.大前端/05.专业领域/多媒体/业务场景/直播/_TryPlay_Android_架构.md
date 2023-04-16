---
title: TryPlay_Android_架构
date: 2017-03-09 18:06:44
permalink: /pages/1ab3c6/
categories: 
  - 大前端
  - 专业领域
  - 多媒体
  - 业务场景
  - 直播
tags: 
  - 
titleTag: 草稿
---


##主流程

```flow
tryplay=>start: 点击试玩进入GameActivity

end=>end: 退出应用

initFullScreen=>operation: 初始化界面,沉浸竖屏全屏

showLoadingView=>operation: 显示loading动画

loadingOperation=>subroutine: loading过程中操作

cond1=>condition: 是否出错？
cond2=>condition: 结束条件为显示窗口？

showLoadErrorView=>condition: 显示出错窗口yes下载游戏no重新试玩

showLoadCompleted=>operation: 接受到流显示视频画面

initReceiveTouchEvent=>subroutine: 初始化触控捕获模块

startTask=>subroutine: 启动计时模块

showDialog=>operation:  显示窗口

downloadTask=>subroutine: 下载游戏

rePlayGame=>subroutine: 重新试玩

showBackDialog=>condition: 显示返回窗口？
con3=>condition: 是否确认退出？
showEndDialog=>condition: 显示试玩时间结束窗口？
showDisconnectDialog=>operation: 显示断连结束窗口？
con4=>condition: yes确认退出no下载游戏
con5=>condition: yes重新试玩no确认退出

tryplay->initFullScreen->showLoadingView->loadingOperation->cond1(yes)->showLoadErrorView

cond1(yes)->showLoadErrorView
cond1(no)->showLoadCompleted
showLoadErrorView->tryplay
showLoadCompleted->initReceiveTouchEvent->startTask->cond2
showLoadErrorView(yes)->downloadTask
showLoadErrorView(no,left)->rePlayGame
rePlayGame->showLoadingView
cond2(yes)->showDialog->showBackDialog
cond2(no)->end
showBackDialog(no)->showEndDialog(no)->showDisconnectDialog->con5(no)->end
showBackDialog(yes)->con3(yes)->end
con3(no)->cond2
showEndDialog(yes)->con4(yes)->end
con4(no)->downloadTask
con5(yes)->rePlayGame


```

## loading过程中操作 

> 该过程顺序执行 任意一个环节出错直接进入showLoadErrorView

```flow
loadingOperation=>start: 初始化loading控制器
initGameView=>operation: 初始化游戏界面GameRender
checkPermission=>operation: 检测应用是否拥有对应的本地权限
initPcParameters=>operation: 初始化PC参数
checkServerPermision=>operation: 服务端鉴权，并获取模拟器信息和游戏方向
initToolView=>operation: 初始化工具栏和DownloadToast
initGameDialog=>operation: 根据游戏方向初始化所有窗口
startCall=>operation: 开始PC建联并进行数据交换，具体查看webrtc相关文档
end=>end: 获取到流

loadingOperation->initGameView->checkPermission->initPcParameters->checkServerPermision->initToolView->initGameDialog->startCall->end
```

## 初始化触控捕获模块

注意点：非游戏画面的过滤，同步报文的发送

具体请看代码注释


## 启动计时模块

由于该部分流程与最新产品需求不符，需要进行修改。

TODO：
添加暂停逻辑。
希望这些计时线程能用一个工具类封装 而不是独立的几个线程。


## 下载游戏

目前仅显示一个toast

TODO:
断点续传,不重下载

## 重新试玩

**`disconnect->resetFlag`**

`disconnect`:PC等相关数据的回收

`resetFlag`:由于非重启Activity，故部分数据需初始化。并设置firstPlay为false