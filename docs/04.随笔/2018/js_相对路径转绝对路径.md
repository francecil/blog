---
title: 前端实现相对路径转绝对路径的几种方法
date: 2018-08-16 10:18:32
permalink: /pages/654fcb/
categories: 
  - 随笔
tags: 
  - 
---

## 1.使用a标签

```js
function getAbsoluteUrlByA (url) {
  var a = document.createElement("a")
  a.href = url
  a.href = a.href //ie8的问题
  return a.href
}

```

<!--more-->

注：node.js 不适用

## 2.数组处理

```js
function getAbsoluteUrl(url) {
  url = url.replace(/&amp;|&#38;/g, "&");
  if (url.startsWith("http") || url.startsWith("javascript:") || url === "about:blank") return url;
  if (url.startsWith("//")) {
      return window.location.protocol + url
  }
  var stack = window.location.href.split("/");
  stack.pop()
  var parts = url.split("/")
  for (var i = 0; i < parts.length; i++) {
      if (parts[i] == ".")
          continue;
      if (parts[i] == "..")
          stack.pop();
      else
          stack.push(parts[i]);
  }
  return stack.join("/");
}
```
参考<a href="https://stackoverflow.com/questions/14780350/convert-relative-path-to-absolute-using-javascript">stackoverflow</a>

## 3.正则字符替换

```js
function relPathToAbs (sRelPath) {
  var nUpLn, sDir = "", sPath = location.pathname.replace(/[^\/]*$/, sRelPath.replace(/(\/|^)(?:\.?\/+)+/g, "$1"));
  for (var nEnd, nStart = 0; nEnd = sPath.indexOf("/../", nStart), nEnd > -1; nStart = nEnd + nUpLn) {
    nUpLn = /^\/(?:\.\.\/)*/.exec(sPath.slice(nEnd))[0].length;
    sDir = (sDir + sPath.substring(nStart, nEnd)).replace(new RegExp("(?:\\\/+[^\\\/]*){0," + ((nUpLn - 1) / 3) + "}$"), "/");
  }
  return sDir + sPath.substr(nStart);
}
```
转自<a href="https://developer.mozilla.org/en-US/docs/Web/API/document/cookie#Using_relative_URLs_in_the_path_parameter">MDN</a>

## 结论

测试多次,总体速度相近，第二种可能会快一点点