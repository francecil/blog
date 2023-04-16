---
title: puppeteer优化实践
date: 2023-04-10 00:37:26
permalink: /pages/032018/
categories: 
  - 大前端
  - 工程能力
  - 前端测试
  - E2E
tags: 
  - null
titleTag: 草稿
---

# 前言




开源库是通用的，对于业务来说，需要定制化

# 优化 Chromium 启动项

https://peter.sh/experiments/chromium-command-line-switches/

## 开启缓存

--user-data-dir

会耗费磁盘内存

# 优化Chromium执行流程

请求到达->启动Chromium->打开tab页->运行代码->关闭tab页->关闭Chromium->返回数据

=>

请求到达->连接Chromium->打开tab页->运行代码->关闭tab页->返回数据

官方并不建议这样做，因为一个tab页阻塞或者内存泄露会导致整个浏览器阻塞并Crash。万全的解决办法是定期重启程序，可参考php-fpm的做法，当请求1000次或者内存超过限制后重启对应的进程。


## 使用默认的 page 页面而不是新开页面，减少内存消耗


```js
// const page = await browser.newPage();
const page = (await browser.pages())[0]
```

收益：

注意事项：

# 参考资料

- [Puppeteer 性能优化与执行速度提升](https://blog.it2048.cn/article-puppeteer-speed-up/)
- [Puppeteer自动化的性能优化与执行速度提升](https://github.com/biaochenxuying/blog/issues/69)
- [无头浏览器性能对比与 Puppeteer 的优化文档](https://blog.it2048.cn/article-headless-puppeteer/)

> * [playwright](https://github.com/microsoft/playwright)
> * [跨平台的浏览器自动化工具Playwright简析](https://yrq110.me/post/front-end/dive-into-playwright/)
> * [使用 generic-pool 优化 puppeteer 并发问题](https://blog.guowenfh.com/2019/06/16/2019/puppeteer-pool/)
> * [结合项目来谈谈 Puppeteer](https://juejin.im/post/5d4059305188255d38489a8c)
> * [Puppeteer 爬虫性能优化](https://github.com/nfwyst/Blog/issues/14)
> * [京喜前端自动化测试之路](https://aotu.io/notes/2020/05/06/jingxi-automated-testing/index.html)
> * [利用 cluster 优化 Puppeteer](https://www.yuque.com/luqixiuzichiji/nodejs/ces)
> * [可爱的Puppeteer使用小技巧](https://yrq110.me/post/front-end/some-tips-of-using-puppetter/)
> * [puppeteer优化小技巧](https://juejin.im/post/5db97541e51d4529de39f72d)
> * [使用 Puppeteer 搭建统一海报渲染服务](https://www.infoq.cn/article/dcSBL_9AzCwVPsaQ70dh)

https://www.chromium.org/developers/how-tos/run-chromium-with-flags

