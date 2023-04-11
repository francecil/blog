---
title: log4js配置详解
date: 2018/04/14 01:00:00
tags: 
  - nodejs
permalink: /pages/b950eb/
categories: 
  - 服务端
  - 编程语言
  - js
---

## 前言

log4js 主要包括以下几项配置

<!--more-->

## Appender

负责日志记录的方式：文件、控制台输出、网络发送、邮件发送

常用方式：console,file,dataFile

REF: https://blog.csdn.net/hfty290/article/details/42844085

1. type:"console"

将日志输出至控制台，这样可以方便开发人员在开发时接看到所有日志信息，在其他环境不建议设置

2. type:"file"

```
"filename": "log/access.log",
"maxLogSize ": 31457280,//设置文件大小，当达到最大容量，重命名文件为access.log.1，日志写入新文件access.log
"backups":1,//最多产生的文件备份数，超过会删除
```

3. type:"dateFile"

```
"filename": "log/app-info.log",
"pattern": ".yyyy-MM-dd",//e.g.:app-info.log.2018-04-18
"alwaysIncludePattern":false//如果为true，则每个文件都会按pattern命名，否则最新的文件不会按照pattern命名
"compress":false,是否压缩，之前的文件会被压缩
```

4. type:"logLevelFilter"

继续配置appender 会继承AppenderName的所有设置并在其上做level的过滤

```
"appender": "AppenderName",
"level": "error"
```

### layout

定义日志记录格式：哪些字段，颜色等

### level,maxLevel

当 `let log=log4js.getLogger(name)` 得到的 Category 后，有一个 appender 列表，
log 记录的方式，如 `log.warn/log.error` ,会在 appender 列表中继续过滤，取满足 `[level,maxLevel]` 的 level 的 appender

若未设置，默认 all

## Category

配置日志的类别，可以配置一个Appender数组，表示当前类别日志会通过其Appender数组的每种方式被记录，
可以配置一个level属性，表示传入的日志的level需要在其配置的level及之上才会被记录

Appender 和 Category 的关系：`Category <--- 1：n ---> Appender`

Category 可以配置一个default，当log4js.getLogger(name)的name不在Category配置中就走default,如果没有配置该default，**name也不在Category配置中，会走所有Appender**

Category中可以直接配置level 或者log4js.getLogger(name).setLevel(log4js.levels.INFO)这样配置

## replaceConsole
默认false,如果为true，则程序中用console.log输出到控制台的信息，也会输出到日志文件中，且格式按照log4js的格式输出，如果为false，则console.log只会输出在控制台。与type:console的appender正好相反，如果设置了type:console，则会将log4js.log日志输出至控制台。

## level

从低到高：ALL,TRACE,DEBUG,INFO,WARN,ERROR,FATAL,OFF


## DEMO

```json
  {
    "appenders": {
      "console": {
        "type": "console"
      },
      "trace": {
        "type": "file",
        "filename": "log/access.log",
        "maxLogSize ": 31457280
      },
      "http": {
        "type": "logLevelFilter",
        "appender": "trace",
        "level": "trace",
        "maxLevel": "trace"
      },
      "info": {
        "type": "dateFile",
        "filename": "log/app-info.log",
        "pattern": ".yyyy-MM-dd",
        "layout": {
          "type": "pattern",
          "pattern": "[%d{ISO8601}][%5p  %z  %c] %m"
        },
        "compress": true
      },
      "maxInfo": {
        "type": "logLevelFilter",
        "appender": "info",
        "level": "debug",
        "maxLevel": "info"
      },
      "error": {
        "type": "dateFile",
        "filename": "log/app-error.log",
        "pattern": ".yyyy-MM-dd",
        "layout": {
          "type": "pattern",
          "pattern": "[%d{ISO8601}][%5p  %z  %c] %m"
        },
        "compress": true
      },
      "minError": {
        "type": "logLevelFilter",
        "appender": "error",
        "level": "error"
      }
    },
    "replaceConsole": true,
    "pm2":true,
    "categories": {
      "default": {
        "appenders": [
          "console",
          "http",
          "maxInfo",
          "minError"
        ],
        "level": "debug"
      }
    }
  }
```