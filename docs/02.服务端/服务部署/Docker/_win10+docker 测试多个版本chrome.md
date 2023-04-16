---
title: win10+docker 测试多个版本chrome
date: 2019-07-21 17:31:39
permalink: /pages/c7b05a/
categories: 
  - 服务端
  - 服务部署
  - Docker
tags: 
  - 
titleTag: 草稿
---
## 前言

在某个chrome版本遇到了一个bug，需要复现

由于一个电脑不支持装2个版本 chrome。 当然，是可以装一个标准版一个dev版

> 不过，试了下 chrome dev版本的只有高版本可以，dev低版本打开一样是进入原先的chrome

## 测试环境

OS: win10

docker 18.09.02

## 步骤

1. 安装 docker

[下载地址](https://download.docker.com/win/stable/Docker%20for%20Windows%20Installer.exe)

下载很慢。。千万不用用浏览器自带的下载，容易网络错误然后中断

2. 下载镜像（docker pul）

打开 命令提示符（CMD）

下载的命令是docker pull+镜像名称+tag

这里主要下这两个

```sh
docker pull baozhida/selenium-hub:3.3.1
docker pull baozhida/selenium-node-chrome-debug:58
```

3. 创建并运行容器
```sh
#创建selenium hub容器
docker run -d -p 4444:4444 --name selehub baozhida/selenium-hub:3.3.1

#创建chrome node容器
docker run -d -p 5901:5900 --name node58 --link selehub:hub --shm-size=512m baozhida/selenium-node-chrome-debug:58
```
**说明：**

-d参数：后台模式运行；

--name参数：别名；

-p参数：将容器的5900端口映射到docker的5901端口，访问Docker的5901端口即可访问到node容器；

--shm-size参数：docker默认的共享内存/dev/shm只有64m，有时导致chrome崩溃，该参数增加共享内存大小到512m.

4. 查看镜像和容器

```sh
#查看本地已经下载的镜像
docker images
#查看正在运行的容器
docker ps -a
```

在浏览器输入地址 http://localhost:4444/grid/console

查看Selenium Grid控制台，能看到刚创建的容器已经正常注册。

5. VNC远程浏览器环境

需要先下载 [vnc viewer](https://www.realvnc.com/download/file/viewer.files/VNC-Viewer-6.19.325-Windows.exe)

新建连接->VNC Server输入 localhost:5901-->回车-->输入密码：secret-->确认-->进入容器桌面

6. 启动chrome

进入容器桌面后，桌面是黑的且只有一个图标（这里就不截图了）

右键->应用程序-shell-sh->执行命令

```sh
#查看驱动的版本
chromedriver -v 
#查看浏览器版本
google-chrome --version
#直接启动浏览器
google-chrome
```
直接启动浏览器进行测试~

## 后记

可以在 [这里](https://hub.docker.com/r/baozhida/selenium-node-chrome-debug/tags) 找到 `baozhida/selenium-node-chrome-debug` 的所有版本，目前最新版本为 58 ，作者已不再维护

若想使用其他版本的浏览器，参考我的另一篇文章 -- [通过docker-selenium进行浏览器测试](./通过docker-selenium进行浏览器测试.md)

## 参考

1. [Selenium Docker 在 WebUI 自动化测试中的应用](https://testerhome.com/topics/8450)