---
title: Vue 第一个组件，浏览器后退无法触发beforeRouteLeave的问题与解决
date: 2020-06-29 22:18:37
permalink: /pages/cce291/
categories: 
  - 大前端
  - 应用框架
  - UI 框架
  - Vue
tags: 
  - 
titleTag: 草稿
---
~~已提issue: https://github.com/vuejs/vue-router/issues/1951~~

## 现象

加载第一个组件（这里的第一个意思是浏览器历史记录的第一个，后文称为`待监听组件`）时，正常跳转其他页面可以触发beforeRouteLeave。
**但是**按浏览器的后退按钮监听不到该事件。

## 解决方案
目前采用比较土且不实用的解决方案。加一层组件，再router.push到`待监听组件`，使得`待监听组件`非第一个组件，可以正常监听beforeRouteLeave事件。
###注意点：
由于打乱了原来的路由。需要在main.js中添加全局的路由监听

    router.beforeEach((to, from, next) => {
      if (to is '用于跳转的组件' && from is '待监听组件') {
        router.go(-1) 
        next(false)
      } else {
        next()
      }
      // 这样当从一个普通页面A进入待监听组件时，在待监听组件中按返回键时能正常进入A
    })

### 存在的问题：
1. 若访问不是访问`中转组件`而是直接访问`待监听组件`,则没有效果
2. 增加路由后，多了白屏时间。

~~可能官方有什么解决方案，或者我用错了。欢迎评论~~

### 后记：

VUE路由控制是基于h5的`history API`实现

而`beforeRouteLeave`又是基于`window.onpopstate`

该事件的官方描述：

>Note that just calling history.pushState() or history.replaceState() won't trigger a popstate event. The popstate event is only triggered by doing a browser action such as clicking on the back button (or calling history.back() in JavaScript). And the event is only triggered when the user navigates between two history entries for the same document.

简而言之：该事件仅在`按了浏览器按钮`或者调用`history.back()`方法时生效，**且在同一document的两条历史记录条目间的导航才会生效**，而上文出现的原因正是不属于同一document
