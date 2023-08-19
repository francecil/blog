---
title: 谈谈 React 组件设计原则
date: 2023-08-18 14:51:58
permalink: /pages/138e49/
categories: 
  - 大前端
  - 应用框架
  - UI 框架
  - React
tags: 
  - 
titleTag: 笔记
---

从易用性、可维护性、可复用性三个方面考虑
- 易用性：从组件使用者角度出发
  - 规范的 API：通用命名、尽量提供默认值
  - 支持组件组装
  - 支持 renderProps 和 ReactNode props
  - 尽可能受控，某些场景也暴露非受控方式
- 可维护性：从组件维护者角度出发
  - 可以从 solid 角度考虑
  - 组合优于继承
- 可复用性：同时从组件使用者和维护者角度出发
  - 样式覆盖
  - 梳理并提供可能存在需求的 slot ：比如选择器组件的 renderFooter
  - Headless UI ：两个模式，以 hooks 方式复用逻辑并保留不复用 UI、提供原子组件

## 规范的 API

减少必填项，提供默认值

通用命名原则：
1. onXXX：监听/触发方法
2. renderXXX：含参的渲染方法，比如 `renderItem: (data) => Element` ； 无参推荐直接传 Element ，比如 title。详见：slot 和 renderProps 的选择
3. beforeXXX/afterXXX：前置/后置动作，比如 beforeUpload/afterUpload
4. xxxProps：组件中的子组件属性命名，比如
5. 优先使用常见单词进行命名，如：value、visible、size、disabled、label、type 等等
6. 暴露通用参数：style、className、rootClassName（组件最外层 className）

## slot 和 renderProps 的选择


# 拓展阅读
- [浅谈前端组件设计-ELab](https://mp.weixin.qq.com/s/gIPvBEFh7qGLlyVSfSs6RA)
- [7 Architectural Attributes of a Reliable React Component](https://dmitripavlutin.com/7-architectural-attributes-of-a-reliable-react-component/)
- [React组件设计实践总结-系列文章-荒山](https://juejin.cn/post/6844903843189243917#heading-0)