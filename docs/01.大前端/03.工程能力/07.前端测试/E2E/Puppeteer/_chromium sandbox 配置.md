---
title: chromium sandbox 配置
date: 2023-08-18 01:56:25
permalink: /pages/f967b3/
categories: 
  - 大前端
  - 工程能力
  - 前端测试
  - E2E
  - Puppeteer
tags: 
  - 
titleTag: 草稿
---

线上服务使用 Puppeteer 去启动 chromium 进程，需要配置 `--no-sandbox` 才能使用 headless 功能。

详见：[setting-up-chrome-linux-sandbox](https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md#setting-up-chrome-linux-sandbox)

需要注意的是：关闭 sandbox 可能会引发安全问题，导致 chromium 漏洞直接攻击到宿主服务器。如果页面访问内容可控就可以接受，否则还需要找下解决方案。