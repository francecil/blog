---
title: Vue3 学习笔记
date: 2024-09-09 20:35:35
permalink: /pages/1f84eb/
categories: 
  - 大前端
  - 应用框架
  - UI 框架
  - Vue
tags: 
  - 
titleTag: 草稿
---
## vue3 defineExpose 时序问题 

有这么一个场景，父组件修改传递给子组件的 prop 并调用子组件的方法，而在该子组件方法中会读取 props。请问子组件方法中读取的 props 是修改前还是修改后的值？

```vue
<script setup lang="ts">
import { ref, nextTick } from 'vue'
import Comp from './Comp.vue';
const count = ref(0)
const comRef = ref();

const update = () => {
  count.value++
  comRef.value.say()
}
</script>

<template>
  <div @click="update">ttt {{ count }}</div>
  <Comp :count="count" ref="comRef"></Comp>
</template>
```

结论：读取的是修改前的值，如果想要确保子组件执行时读取的是新的 prop 值，需要用 nextTick 包装一下

```js
const update = () => {
  count.value++
  nextTick(() => {
    comRef.value.say()
  })
}
```

[在线示例](https://play.vuejs.org/#eNqVUstu2zAQ/BVCF9uIIRdoT65s9AEf2kMbpDnyokorVQlFEny4Lgz9e4ekFCtBmyAHQeLO7nBmNefso9b50VO2zQpbmU47Zsl5zUQp2x3PnOXZnsuu18o4dmaGmjWTdHK3XXXPBtYY1bMFCBYPTZ9Vr8d6vgmHwL94z2WlpHWsUl46tgtMyzerS7W/oWYsr9A8AV7XpSMAyxXb7dmZS5Yo8mMpPF1dpUKYTpXcln+W4GWMy4HLYpNswQQOjnotwIcTY0XdHdmHSsAJnKaL4NY5GD2POoeh2KAt9Udn2whgIL55FhTHU5CA8SJ6xkCxmd2WrbFKOGq6Nr+zSmLf0Uoc1J0g8127Do55tk0mA1YKoX5/jTVnPK2nevWLqvt/1O/sKdR4dm3IkjnCzgPmStMS9Ab48OMbfuEM7FXtBbqfAW/IKuGDxtT2ycsasmd9Ue2XGIJOtrf2cHIk7WQqCA2dQ+znGUIRFvU/6xe5b/N3cQ6/E1ucAvWKwD6K6Sxa2ihtkayamk7SdTgVl3xtmfT9TxiUwz7kaZqyeJ6mF5F7mlCJbVEuVLuM1+SRM8YSBCmpGJlhMa1cJjGHk1aWluM2QA8Uwy+EOX6wEN4gcgAf6mN8H6dx+AsUKlhO)

