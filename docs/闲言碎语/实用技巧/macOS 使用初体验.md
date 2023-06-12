---
title: macOS 使用初体验
date: 2020-04-01 23:55:17
permalink: /pages/c5fa7e/
categories: 
  - 闲言碎语
  - 实用技巧
tags: 
  - 
---

## 前言

之前都在 win10 上进行前端开发，最近新公司入职发了 mbp15 ，在此对 macOS 的使用做个记录。

<!-- more -->

## 键鼠

### 触控板

手势怎么用？请看 `系统偏好设置->触控板` ，这里不进行说明

需要注意的是，三指左右轻扫（默认）可以在**全屏幕显示**的 App 间进行切换， win 上貌似无法做到这个？认识的一个朋友说她喜欢开着多个全屏应用（全屏窗口），然后用三指轻扫切换，应用多的话，就三指上滑后再选择应用。
> 注意与 `command+tap` 切换程序区分开

### 选择文字

再光标处轻按，另一只手指滑动

### 键盘快捷键

option 键用于对功能进行增强，常用的有
1. option + 最小化窗口 =》 最小化此程序的所有窗口

键盘上的符号，shift⬆ 得到的是上面的字符，右边的通过切换中英得到

<s>长按中英键 2s 就可以切换到大写模式，再轻按返回中英模式</s>
<s>> 我个人是关掉这个中英切换的功能（偏好设置—键盘—输入法—长按以启用全大写键入），让该键保持和 win 一致。 </s>\
<s>> 不过要应用大写依然需要在英文模式下，所以经常混杂中英文输入（包括中英符号）的话，可以切到中文模式，在输入英文时先按 `capslock` 键</s>


下载了搜狗输入法即可解决，可以保持与 win 一致的使用习惯，即在中文输入状态按 shift 即可切换到英文输入状态

win 上的 f1～f12 ？
> 对于有 touchBar 的，先按 fn 键，即可显示 f1~f12 

浏览器的刷新是 command + r ，等效于 win 的 f5

浏览器的强制刷新是 command＋shift＋r ，等效于 win 的 ctrl+f5

## 文件系统

### 新建文件

win 上一般是右键新建文件，而在 macOS 上一般是用命令行创建或者打开对应程序执行新建操作

如果真想右键新建的话，推荐 APP -- 超级右键

### 访问其他目录

访达都仅显示几个常用目录，要是想可视化的进入其他目录，应该怎么做呢？

可以工具栏那边选择进入其他目录

### 快捷打开

1. 在当前终端路径输入 `open .` ，即可打开对应路径的 finder 目录
2. 在当前目录右键，有选项可以快速打开终端

## 安全

### 锁屏

control+command+Q



## 软件

在网上下载了一个文件，

1. 如果是应用程序，可以直接使用，但最好拖到访达的应用程序目录，方便管理和使用
2. 如果是磁盘映像(.dmg,类似 win 的 msi)，就双击进行安装，得到一个应用程序，继续第一步（有些磁盘映像会提供拖到应用程序目录的快捷操作）

作为一个 coder ，我们更经常的是利用 brew 进行安装和管理

### brew

需要先安装 HomeBrew 
```sh
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
# 可能会用 bash ,  /usr/bin/bash
```

然后进行软件安装，比如
```sh
brew install node
```
用法和 npm 相似

### 常用软件安装

- [Sourcetree](https://www.sourcetreeapp.com/): Git 可视化工具
- [Hoppscotch](https://github.com/hoppscotch/hoppscotch): API 开发工具，支持 [PWA](https://hoppscotch.io/)
- [oh-my-zsh](https://ohmyz.sh/): zsh 的插件管理方案，插件可以从[这边](https://github.com/ohmyzsh/ohmyzsh/wiki/Plugins)找，后面整理一个常用的
- [whistle](http://wproxy.org/whistle/)


## 开发

- 创建项目文件夹，个人习惯放在 `~/Repos` 下

## 其他

