---
title: Android 内核 MT 笔记 测试数据
date: 2020-06-29 22:18:37
permalink: /pages/225cd1/
tags: 
  - null
titleTag: 草稿
categories: 
  - 客户端
  - Android
  - 系统原理
---
## getevent/sendevent

**ABS_MT_TRACKING_ID  表示一次接触；  -1 代表一个不用的slot；** 

**0003 0039 ffffffff
0003 002f 00000000 转到第一个触点**


<!--more-->


    1指按
    /dev/input/event9: 0003 002f 00000000 //转到第一触点
    /dev/input/event9: 0003 0030 00000022
    /dev/input/event9: 0003 0032 00000022
    /dev/input/event9: 0003 003a 00000022
    /dev/input/event9: 0003 0035 000001fa
    /dev/input/event9: 0003 0036 00000303
    /dev/input/event9: 0003 0039 000000df //ID df
    /dev/input/event9: 0001 014a 00000001 ACTION_DOWN事件
    /dev/input/event9: 0000 0000 00000000
    
    

    2指按
    /dev/input/event9: 0003 0030 00000030
    /dev/input/event9: 0003 0032 00000030
    /dev/input/event9: 0003 003a 00000030
    /dev/input/event9: 0003 002f 00000001 //转到第二触点
    /dev/input/event9: 0003 0030 0000001d
    /dev/input/event9: 0003 0032 0000001d
    /dev/input/event9: 0003 003a 0000001d
    /dev/input/event9: 0003 0035 00000279
    /dev/input/event9: 0003 0036 0000047b
    /dev/input/event9: 0003 0039 000000e0 //ID e0
    /dev/input/event9: 0000 0000 00000000
    
    
    
    
    
    2指抬
    /dev/input/event9: 0003 002f 00000000 //第一触点做了些许改动
    /dev/input/event9: 0003 0030 00000031
    /dev/input/event9: 0003 0032 00000031
    /dev/input/event9: 0003 003a 00000031
    /dev/input/event9: 0003 002f 00000001 //转到第二触点
    /dev/input/event9: 0003 0039 ffffffff //该触点不再使用
    /dev/input/event9: 0000 0000 00000000
    
    
    
    
    
    
    
    2指按
    /dev/input/event9: 0003 002f 00000000 //第一触点做了些许改动
    /dev/input/event9: 0003 0030 00000034
    /dev/input/event9: 0003 0032 00000034
    /dev/input/event9: 0003 003a 00000034
    /dev/input/event9: 0003 002f 00000001 //转到第二触点
    /dev/input/event9: 0003 0030 00000025
    /dev/input/event9: 0003 0032 00000025
    /dev/input/event9: 0003 003a 00000025
    /dev/input/event9: 0003 0035 0000027a
    /dev/input/event9: 0003 0036 0000047c
    /dev/input/event9: 0003 0039 000000e1 //二触点新ID e1
    /dev/input/event9: 0000 0000 00000000
    
    

    
    
    1指抬
    /dev/input/event9: 0003 002f 00000000 //转到第一触点
    /dev/input/event9: 0003 0039 ffffffff //该触点不再使用
    /dev/input/event9: 0003 002f 00000001 //转到第二触点
    /dev/input/event9: 0003 0030 00000028
    /dev/input/event9: 0003 0032 00000028
    /dev/input/event9: 0003 003a 00000028
    /dev/input/event9: 0000 0000 00000000

    
    
    2指抬
    /dev/input/event9: 0003 0039 ffffffff //该触点不再使用
    /dev/input/event9: 0001 014a 00000000 //ACTION_UP事件
    /dev/input/event9: 0000 0000 00000000



**注：002f 的指表示有点像手指头的ID 而不是第几个触点；
举例：1指按->2指按->1指抬->1指按(此时会调用0003 002f 00000000而不是将原2指触点改为0)**


#### 模拟关机键

    shell@htc_a51dtul:/ $ sendevent /dev/input/event2 1 116 1
    shell@htc_a51dtul:/ $ sendevent /dev/input/event2 0 0 0
    shell@htc_a51dtul:/ $ sendevent /dev/input/event2 1 116 0
    shell@htc_a51dtul:/ $ sendevent /dev/input/event2 0 0 0


#### 模拟touch
通过getevent得到的值

    /dev/input/event9: 0003 0030 00000017
    /dev/input/event9: 0003 0032 00000017
    /dev/input/event9: 0003 003a 00000017
    /dev/input/event9: 0003 0035 00000325
    /dev/input/event9: 0003 0036 00000358
    /dev/input/event9: 0003 0039 00000235
    /dev/input/event9: 0001 014a 00000001
    /dev/input/event9: 0000 0000 00000000
    /dev/input/event9: 0003 0039 ffffffff
    /dev/input/event9: 0001 014a 00000000
    /dev/input/event9: 0000 0000 00000000

sendevent产生相同的效果


    sendevent /dev/input/event9 3 48 23
    sendevent /dev/input/event9 3 50 23
    sendevent /dev/input/event9 3 58 23
    sendevent /dev/input/event9 3 53 805
    sendevent /dev/input/event9 3 54 856
    sendevent /dev/input/event9 1 330 1
    sendevent /dev/input/event9 0 0 0
    sendevent /dev/input/event9 3 57 -1
    sendevent /dev/input/event9 1 330 0
    sendevent /dev/input/event9 0 0 0


#### 模拟multi-touch


    sendevent /dev/input/event9 3 47 0
    sendevent /dev/input/event9 3 48 34
    sendevent /dev/input/event9 3 50 34
    sendevent /dev/input/event9 3 58 34
    sendevent /dev/input/event9 3 53 506
    sendevent /dev/input/event9 3 54 770
    sendevent /dev/input/event9 3 57 223
    sendevent /dev/input/event9 1 330 1 
    sendevent /dev/input/event9 0 0 0
    
    sendevent /dev/input/event9 3 48 48
    sendevent /dev/input/event9 3 50 48
    sendevent /dev/input/event9 3 58 48
    sendevent /dev/input/event9 3 47 1
    sendevent /dev/input/event9 3 48 39
    sendevent /dev/input/event9 3 50 39
    sendevent /dev/input/event9 3 58 39
    sendevent /dev/input/event9 3 53 633
    sendevent /dev/input/event9 3 54 1147
    sendevent /dev/input/event9 3 57 224
    sendevent /dev/input/event9 0 0 0
    
    sendevent /dev/input/event9 3 47 0
    sendevent /dev/input/event9 3 48 49
    sendevent /dev/input/event9 3 50 49
    sendevent /dev/input/event9 3 58 49
    sendevent /dev/input/event9 3 47 1
    sendevent /dev/input/event9 3 57 -1
    sendevent /dev/input/event9 0 0 0
      
    sendevent /dev/input/event9 3 47 0
    sendevent /dev/input/event9 3 48 52
    sendevent /dev/input/event9 3 50 52
    sendevent /dev/input/event9 3 58 52
    sendevent /dev/input/event9 3 47 1
    sendevent /dev/input/event9 3 48 37
    sendevent /dev/input/event9 3 50 37
    sendevent /dev/input/event9 3 58 37
    sendevent /dev/input/event9 3 53 634
    sendevent /dev/input/event9 3 54 1000
    sendevent /dev/input/event9 3 57 225 
    sendevent /dev/input/event9 0 0 0
    
    sendevent /dev/input/event9 3 47 0
    sendevent /dev/input/event9 3 57 -1
    sendevent /dev/input/event9 3 47 1
    sendevent /dev/input/event9 3 48 40
    sendevent /dev/input/event9 3 58 40
    sendevent /dev/input/event9 3 50 40
    sendevent /dev/input/event9 0 0 0

    sendevent /dev/input/event9 3 57 -1
    sendevent /dev/input/event9 1 330 0
    sendevent /dev/input/event9 0 0 0


### get->send 数据转化脚本
