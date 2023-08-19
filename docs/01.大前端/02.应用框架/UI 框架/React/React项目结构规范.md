---
title: React项目结构规范
date: 2023-08-18 12:23:53
permalink: /pages/2922c4/
categories: 
  - 大前端
  - 应用框架
  - UI 框架
  - React
tags: 
  - 
titleTag: 笔记
---

根据项目复杂度使用不同的结构
1. 简单结构
2. 中间文件夹结构
3. 高级文件夹结构

## 简单结构
> 适用于简单项目

![](https://blog.webdevsimplified.com/articleAssets/2022-07/react-folder-structure/beginner.png)

特点：
- 全局的 hooks 、components、`__test__` 文件夹
- 页面的 jsx、css、图像、工具文件等在 src 目录下平铺

## 中间文件夹结构
> 适用于中小型项目

![](https://blog.webdevsimplified.com/articleAssets/2022-07/react-folder-structure/intermediate.png)

特点：
- 新增 pages、assets、context、utils 等目录，方便组织
- 问题：跨页面的组件复用较难组织


## 高级文件夹结构
> 适用于大型项目，特别是复杂的中后台项目

![](https://blog.webdevsimplified.com/articleAssets/2022-07/react-folder-structure/advanced.png)

特点
- 按功能分组，新增 features 目录，每个 feature 就是一个完整的模块，也包含 components/hooks/services/utils
- 页面变成功能的组织，不同页面可以复用功能模块
- 使用 services 目录管理 api 调用和数据处理的逻辑
- 增加 layouts 目录，用于关于布局相关组件

## 拓展阅读
- [react 项目结构说明](https://blog.webdevsimplified.com/2022-07/react-folder-structure/)