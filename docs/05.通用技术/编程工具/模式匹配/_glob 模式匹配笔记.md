---
title: glob 模式匹配笔记
date: 2023-07-10 09:59:34
permalink: /pages/7b8732/
categories: 
  - 通用技术
  - 编程工具
  - 模式匹配
tags: 
  - 
titleTag: 草稿
---

## 基础语法

| 通配符 | 描述 | 例子 | 匹配 | 不匹配 |
| --- |  --- |  --- |  --- |  --- |
| `*` | 匹配任意数量的任何字符，包括无 | `Law*` | `Law`, `Laws`, `Lawyer` | `GrokLaw`, `La`, `aw` |
| `?` | 匹配任何 **单个** 字符 | `?at` | `Cat`, `cat`, `Bat`, `bat` | `at` |
| `[abc]` | 匹配括号中给出的一个字符 | `[CB]at` | `Cat`, `Bat` | `cat`, `bat` |
| `[a-z]` | 匹配括号中给出的范围中的一个字符 | `Letter[0-9]` | `Letter0`, `Letter1` ... `Letter9` | `Letters`, `Letter`, `Letter10` |
| `[!abc]` | 匹配括号中未给出的一个字符 | `[!C]at` | `Bat`, `bat`, `cat` | `Cat` |
| `[!a-z]` | 匹配不在括号内给定范围内的一个字符 | `Letter[!3-5]` | `Letter1`... | `Letter3` ... `Letter5`, `Letterxx` |

## 拓展语法

支持三种功能
- Brace Expansion
- globstar
- extglob

## 和正则的区别

主要用于匹配路径，能力相比正则较弱（模式匹配能做的正则都能做）。


## 在线工具

[https://www.digitalocean.com/community/tools/glob](https://www.digitalocean.com/community/tools/glob)

## 前端的使用

- minimatch: 用于模式匹配
- node-glob: 用于文件路径匹配，基于 minimatch 封装

## 参考文档
- [glob 模式匹配简明教程](https://juejin.cn/post/6844904077801816077) 

