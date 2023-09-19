---
title: React Hooks 实现原理
date: 2023-09-12 21:17:43
permalink: /pages/a793a3/
categories: 
  - 大前端
  - 应用框架
  - UI 框架
  - React
tags: 
  -
titleTag: 笔记 
---

核心原理：闭包存储状态、索引维护次序、变更触发渲染

# useState 模拟实现

```js
const globaltate = []
let hookIndex = 0
function useState(initState) {
    const currentIndex = hookIndex++
    const state = globaltate[currentIndex] || initState
    const setState = (_state) => {
        globaltate[currentIndex] = _state
        render() // 触发 react 渲染
    }
   
    return [state, setState]
}
```

# 拓展阅读

- [手写ReactHook核心原理，再也不怕面试官问我ReactHook原理](https://cloud.tencent.com/developer/article/1784501)