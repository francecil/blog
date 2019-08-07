## 问题描述：

> 父组件为A.vue,子组件为child.vue通过动态引入得到

```html
<template>
  <div>
    <child ref="child"></child>
  </div>
</template>
<script>
export default {
  mounted () {
    console.log(this.$refs['child'])
  },
  components: {
    child': () => import('@/components/child')
  }
}
</script>

```
在 mounted 生命周期时想获取到 child 组件的引入，输出得到 `undefined`

## 原因分析

动态引入原理：

1. Vue 仅在该组件被使用时才引入（一般配合 component的is 或者v-if等使用）。这里会被使用到，所以延时200ms(默认值)加载
2. 父组件的 mounted 不会等待异步组件的 mounted 完成。

## 解决方案

1. 动态引入改为静态引入

```js
import child from '@/components/child'
export default {
  mounted () {
    console.log(this.$refs['child'])
  },
  components: {
    child': child
  }
}
```

2. 设置延时
```js
mounted () {
  // 500ms大概是加载完成了
  setTimeout(()=>console.log(this.$refs['child']),500)
},
```