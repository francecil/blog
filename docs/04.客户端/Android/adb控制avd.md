---
title: adb控制avd
date: 2016/07/13 11:00:00
tags: 
  - adb
permalink: /pages/841da0/
categories: 
  - 客户端
  - Android
---

## 1.显示所有avd

<!--more-->

    android list avd
    示例输出
    Available Android Virtual Devices:
        Name: Nexus_5_API_23
      Device: Nexus 5 (Google)
        Path: C:\Users\zhengjx\.android\avd\Nexus_5_API_23.avd
      Target: Android 6.0 (API level 23)
     Tag/ABI: google_apis/x86_64
        Skin: nexus_5
      Sdcard: 100M
    ---------
        Name: Nexus_6
      Device: Nexus 6 (Google)
        Path: C:\Users\zhengjx\.android\avd\Nexus_6.avd
      Target: Android 6.0 (API level 23)
     Tag/ABI: google_apis/x86
        Skin: nexus_6
      Sdcard: 100M


<!--more-->


## 2.启动模拟器：

    emulator -avd 模拟器名称   
    示例
    emulator -avd Nexus_6
    开始该模拟器后cmd窗口堵塞
    此时可另开启一个窗口操作命令(手动情况下)
    ps:Ctrl+C 可关闭该模拟器
 

## 3.查看活动的avd

    adb devices

    示例输出
    List of devices attached
    emulator-5554   device
    HT49NYC00215    device  (该设备是真机)
 
## 4.对该avd进行操作

    avd -s <avd编号> 命令
    例：
    adb -s emulator-5554 shell input keyevent 3  //模拟按home键
    
    adb -s emulator-5554 shell input tap 250 250 //模拟单击<x,y>位置
    
    adb -s emulator-5554 shell input swipe 250 250 400 400 500//模拟滑动<p1,p2,滑动的时间ms>

### 题外话
ffmpeg 通过 gdigrab 无法直接录制avd

    ffmpeg -f gdigrab -i desktop out.mpg

画面是黑屏的 且带有手机外观 



