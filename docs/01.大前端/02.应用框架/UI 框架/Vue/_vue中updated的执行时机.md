---
title: vue 中 updated 的执行时机
date: 2020/01/15 00:00:00
---

## 背景

本文主要是为了搞清两个问题：

1. 父子组件的 updated 钩子的执行顺序 
2. 为什么父组件的 updated 钩子调用时不保证子组件已被重绘

## 文档中的 updated

官方文档是这样介绍 updated 的

> 由于数据更改导致的虚拟 DOM 重新渲染和打补丁，在这之后会调用该钩子。

> 当这个钩子被调用时，组件 DOM 已经更新，所以你现在可以执行依赖于 DOM 的操作。然而在大多数情况下，你应该避免在此期间更改状态。如果要相应状态改变，通常最好使用计算属性或 watcher 取而代之。

单从这两句话中看，还不能确定父子间的 updated 钩子的执行顺序，但是可以确定的是，当执行 updated 钩子时，该组件的表层 vdom 树已经更新完毕

## 源码中的 updated 

这个钩子的调用时机为：

```js
function flushSchedulerQueue () {
  // ... 不断的执行队列中观察者的更新方法
  callActivatedHooks(activatedQueue)
  callUpdatedHooks(updatedQueue)

}

// 按照子->父的顺序执行钩子
function callUpdatedHooks (queue) {
  let i = queue.length
  while (i--) {
    const watcher = queue[i]
    const vm = watcher.vm
    if (vm._watcher === watcher && vm._isMounted && !vm._isDestroyed) {
      callHook(vm, 'updated')
    }
  }
}
```

由于 queue 根据 `watcher.id` 做了一次升序排序，所以队列后面的 watcher 对应的 vm 为子组件

执行 updated 钩子时，说明 render 相关的 watcher 以及执行完毕了，换句话说，虚拟 DOM 已经重新构建并且打补丁到真实 DOM 了

也就是说， updated 钩子的执行顺序一定是由子到父


异步组件的情况又是如何？ demo 如下：

```html
<body>

  <div id="el">
  </div>

  <script type="text/x-template" id="super-template">
    <div>
      <h2>super</h2>
      <Sub :val="val" ref="sub"/>
    </div>
  </script>

  <script type="text/x-template" id="sub-template">
    <div>
      <h2>sub {{val}}</h2>
      <my-text v-if="flag" ref="text"/>
    </div>
  </script>

  <script type="text/x-template" id="text-template">
    <span>text</span>
  </script>

  <script>
    Vue.component('my-text', function (resolve, reject) {
      setTimeout(function () {
        // 向 `resolve` 回调传递组件定义
        resolve({
          template: '#text-template',
          updated: function () {
            console.log("text update")
          },
          mounted: function () {
            console.log("text mounted")
          }
        })
      }, 1000)
    })
    Vue.component('Sub', {
      props: ['val'],
      template: '#sub-template',
      data() {
        return {
          flag: false
        }
      },
      updated: function () {
        console.log("Sub update")
      },
      watch: {
        val: function (value) {
          this.flag = true
        }
      }
    })

    var vm = new Vue({
      el: '#el',
      template: '#super-template',
      data: {
        val: 1
      },
      updated: function () {
        console.log("super update")
        console.log(this.$refs.sub.$refs.text)
        // this.$nextTick(() => {
        //   console.log(this.$refs.sub.$refs.text)
        // })
      }
    })
  </script>
</body>

```

当 `vm.val` 改变时，会异步加载 `my-text` 组件，控制台输出如下：
```js
Sub update
super update
undefined
// 过了大概 1s
text mounted
Sub update
```

也就是说，在执行父组件的 updated 钩子时，`my-text` 组件还未被绑定到 Sub 上，以至于 Super 中访问 `this.$refs.sub.$refs.text` 拿到的是 `undefined`

不过放到 nextTick 中一样拿不到

但可以确定的是，callUpdatedHooks 执行时，一定是以 **子组件调用 updated 钩子 -> 父组件调用 updated 钩子** 的顺序执行

如果子组件通过 nextTick 去改变状态，则父组件执行 updated 回调时子组件还未执行下一轮的重渲染，执行效果异步组件的 demo 差不多

## 为什么父组件的 updated 钩子调用时不保证子组件已被重绘

这个也是我一直没搞懂的点，子组件用了异步组件或者 nextTick 改变数据状态，父组件 updated 钩子就算用了 nextTick 也拿不到重渲染后的完整视图

难道说 vdom diff 更新到真实 dom 的过程也是放到队列中去做？

查看源码发现没有，都是同步的操作，那么还有什么情况呢？