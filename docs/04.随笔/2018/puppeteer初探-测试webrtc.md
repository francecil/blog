---
title: puppeteer初探-测试webrtc
date: 2018-02-07 11:12:40
tags: 
  - puppeteer
  - 前端测试
permalink: /pages/ae64b9/
categories: 
  - 随笔
---

# 介绍

puppeteer是什么?

它是一个nodejs的库，支持调用Chrome的API来操纵Web 它的dom操作可以完全在内存中进行模拟而不打开浏览器

功能强大，可用于截图、pdf生成、UI测试、表单提交、数据爬取、性能诊断...

官方接口地址：https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md
<!--more-->

# 安装

通过`npm i puppeteer`安装

正常是会报错的。

解法方法1：

> 1.采用`cnpm i puppeteer`

解法方法2：

> 1.使用`npm i --save puppeteer --ignore-scripts`安装并忽略`chromium`的下载
> 2.自行下载 <a href='https://link.jianshu.com/?t=https%3A%2F%2Fdownload-chromium.appspot.com%2F'>chromium</a>
> 或 采用本地chrome (后面会说明这样的好处)


参考：https://www.jianshu.com/p/a89d8d6c007b

# 运行

新建index.js,代码

```js
const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://y.qq.com');
    await page.screenshot({path: 'yqq.png'});
    browser.close();
})();
```
使用`node index.js`运行

若出现`async/await` 问题，检测node版本是否在7.6以上 否则的话重新安装即可

正常应该是可以获得截图了。

# 测试webrtc应用

`puppeteer.launch()` 可以填入参数`{headless: false}` 这样就可以打开浏览器测试，默认是只在内存跑

首先采用 chromium  测试我们的webrtc应用，发现画面没有显示，采用`chrome://webrtc-internals`发现本地只支持VP8,而我们的webrtc服务端只传H.264的流。

百度查看了下 chrome 和 chromium 的区别，chromium 会比chrome 少一些音视频的格式支持，包括`h264,acc`

那么本地的chrome能否支持呢？测试结果发现是可以支持的。（没下的话记得下

使用也很简单。

找到chrome的安装目录。我这里是`C:/Program Files (x86)/Google/Chrome/Application/chrome.exe`

然后launch方法中传入`executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'`

测试成功。

完整测试代码：

```js
const puppeteer = require('puppeteer');
function timeout(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
console.log(process.argv)
puppeteer.launch({
  // headless: false,
  executablePath: './chrome/chrome.exe',
}).then(async browser => {
  const page = await browser.newPage();
  await page.goto('http://10.8.116.11:8081/tryplay-h5/#/main?....');
  await timeout(10000);
  await page.screenshot({ path: 'rtc.png' });
  await browser.close();
  console.log('end')
}).catch(e => {
  console.error(e)
});
```



