---
title: chrome.storage 的表升级和索引
date: 2022-05-06 20:40:35
permalink: /pages/2d1787/
categories: 
  - 大前端
  - 前端基础
  - 浏览器
  - 浏览器生态
  - Extension
tags: 
  - 
titleTag: 草稿
---
## 前言

本文探讨了 `chrome.storage` 的优缺点，简单介绍了 IndexedDB 技术，并通过一个案例探讨 `chrome.storage` 应该如何进行上层封装以支持复杂场景

如无特殊说明，本文提到的插件均指 Chrome 浏览器拓展

## 背景

开发浏览器拓展的时候，数据存储我们一般是用 `chrome.storage`。相比 localStore 具有数据同步、读写异步、模块互通、支持对象存储等优势。
> 如果想了解 `chrome.storage` 的更多内容，请查看 [chrome.storage](https://developer.chrome.com/docs/extensions/reference/storage/)

一般情况下，`chrome.storage` 提供的 API 就够用了
- `get(keys?: string | string[] | object)`
- `set(items: object)`
    > 参数为一个对象，键未存在新增，存在进行更新，已有的其他键不受影响。相当于 `Object.assign`
- remove

但是当数据存储结构较为复杂，且存储结构可能出现变更时，原有 API 就不够用了。

## 案例分析

举个例子，某传统公司 KJ 的图书借阅是通过一款浏览器拓展来完成的（没有涉及服务端，纯本地应用，图书借阅需要去行政的电脑上登记，拓展及数据都在该电脑上）

开发小 A 没啥经验，设计了如下的数据结构：

```ts
{
    employees: [
        {
            no: number, // 工号
            name: string,
            books: [
                {
                    id: number, // 书本唯一 id
                    name: string, // 书本名
                },
                ...
            ]
        },
        ...
    ]
}
```

该插件用了一段时间，可以查看每个人的借书情况。

但是后来发现无法查询未被借走的书籍情况，于是给小 A 提了需求。小 A 将数据结构改造如下：
```ts
{
    books: [
        {
            id: number, // 书本唯一 id
            name: string, // 书本名
            employeeNo: number, // 当前归属， -1 表示未被借走
        },
    ],
    employees: [
        {
            no: number, // 工号
            name: string,
        }, 
        ...
    ],
}
```

正当小 A 打包完浏览器拓展准备上线时，突然发现一个问题：按这个数据结构，新的代码访问 books 表将找不到数据，且丢失了借阅情况。

此外还引发了另一个问题：原先查询某个员工的借阅情况，我们只需找到该员工，取 books 值就行，现在需要对 books 列表进行筛选，速度变慢了。

这两个问题在数据库中有专门的名称，一个是**表升级**，另一个**是索引**

在探讨 `chrome.storage` 如何解决前，我们先来看看前端 Web 的另一种数据存储方案 -- IndexedDB


## IndexedDB 技术介绍

IndexedDB 是一种底层 API，用于在客户端存储大量的结构化数据（也包括文件/二进制大型对象（blobs））。该 API 使用索引实现对数据的高性能搜索
> 引自 [MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/IndexedDB_API)



1. 表升级

必须要在 request.onupgradeneeded 中进行表创建/更新操作

旧版本的数据库无法访问新版本创建的表，同个表旧版本访问的也只是旧的配置

2. 事务
3. 索引

可以指定该索引是否为唯一值

可以增快查询速度


MDN 提供的参考链接有 Polyfill & 包装

## 实现方案

哪些特性

怎么实现

## 兼容迁移

用户的旧版本拓展，采用传统 storage 不兼容，想用这套方案怎么办？

版本 0

## 后续

给 localForce 提 MR ，支持 chrome.storage ，

结合 PWA 视图更新，当拓展未下载时，保证本地存储可用