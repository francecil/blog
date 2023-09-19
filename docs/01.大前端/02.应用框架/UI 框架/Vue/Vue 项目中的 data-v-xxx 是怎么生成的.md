---
title: Vue 项目中的 data-v-xxx 是怎么生成的
date: 2023-09-19 10:36:29
permalink: /pages/90503c/
categories: 
  - 大前端
  - 应用框架
  - UI 框架
  - Vue
tags: 
  - 
---

最近在研究微前端的样式隔离方案，看到了这样一个评论：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/faad1977ae954375b04d277118ca94ad~tplv-k3u1fbpfcp-jj:0:0:0:0:q75.image#?w=1586&h=218&s=75011&e=png&b=ffffff)

> 来自：[微前端方案 qiankun 的样式隔离能不用就别用吧，比较坑 - 掘金](https://juejin.cn/post/7184419253087535165#comment)


大意是说 Vue scoped 的 `data-v-xxx` 是根据文件相对路径计算的，如果微前端的两个 Vue 子项目采用相同的路径结构，那么算出来的 `data-v-xxx` 是一样的，可能会导致样式冲突。

<!-- more -->
  

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ba2e2565867548f5bf2b68c34656b656~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1046&h=328&s=106437&e=png&b=fdfdfd)


**听起来有点离谱，但事实是这样的么？** 直接看源码：

  


-   webpack + vue-loader 对 vue2 的处理

```js
  // vue-loader/src/index.ts
  
  const shortFilePath = path
    .relative(rootContext || process.cwd(), filename)
    .replace(/^(..[/\])+/, '').replace(/\/g, '/')
  
  const id = hash(
    isProduction
      ? shortFilePath + '\n' + source.replace(/\r\n/g, '\n')
      : shortFilePath
  )
```

> [https://github.com/vuejs/vue-loader/blob/8357e071c45e77de0889a9feedf2079a327f69d4/src/index.ts#L142](https://github.com/vuejs/vue-loader/blob/8357e071c45e77de0889a9feedf2079a327f69d4/src/index.ts#L142)

  


-   vite + @vitejs/plugin-vue 对 vue3 的处理

```js
// vite-plugin-vue/src/util/descriptorCache.ts
  
import path from "node:path";
import { createHash } from "node:crypto";
import slash from "slash";

function getHash(text) {
  return createHash("sha256").update(text).digest("hex").substring(0, 8);
}

// 获取文件相对路径
const normalizedPath = slash(path.normalize(path.relative(root, filename)));
// 计算 ID
descriptor.id = getHash(normalizedPath + (isProduction ? source : ""));
```

> [https://github.com/vitejs/vite-plugin-vue/blob/04c3b0b76b6782cc99d5eff471e117b0755e0ebd/packages/plugin-vue/src/utils/descriptorCache.ts#L32](https://github.com/vitejs/vite-plugin-vue/blob/04c3b0b76b6782cc99d5eff471e117b0755e0ebd/packages/plugin-vue/src/utils/descriptorCache.ts#L32)

  


可以发现，不管是 `vue-loader` 还是 `@vitejs/plugin-vue` ，data 属性 ID 的生成机制都是一样的，即：

-   开发环境下会根据**文件相对路径**生成唯一 ID，比如 vite 中 `src/App.vue` 固定生成 `7a7a37b1`
-   生产环境下会根据**文件相对路径+文件内容**共同生成唯一 ID


因此，我们可以回答文章一开始的问题：

> 相同路径结构的 Vue 子应用的组件，在开发环境下会出现重复的 `data-v-xxx` 属性进而产生样式冲突。
> 
> 在生产环境下大概率不会出现重复的 `data-v-xxx` 属性，除非文件内容也完全一样。
> 
> 另外需要注意的是，文件内容一样不意味着样式一样， `<style>` 中的 CSS 变量和`@import` 也会影响最终的样式结果。

---


那如果遇到了冲突问题，除了手动修改文件路径或文件名，还有什么办法可以完全避免？

**给 Vue 提** **PR** **！** 一个更好的 ID 计算方式是加上项目名(或者 `package.json` 的 name)，并支持手动指定，这样就可以彻底避免冲突问题了。

```js
import path from "node:path";
import { createHash } from "node:crypto";
import slash from "slash";

function getHash(text) {
  return createHash("sha256").update(text).digest("hex").substring(0, 8);
}

// 获取项目名
const projectName = config.projectName || path.basename(root)
// 获取文件相对路径（含项目名）
const normalizedPath = slash(path.normalize(path.join(projectName, path.relative(root, filename))));
// 计算 ID
descriptor.id = getHash(normalizedPath + (isProduction ? source : ""));
```

> 有遇到冲突的小伙伴，给 Vue 提 PR 的机会来了~

  


## 进一步思考：为什么开发环境和生产环境的 ID 计算方式不一样？

  


首先，开发环境下最好不要加入文件内容进行 hash 计算。

这很好理解，一来 hash 计算是耗时的，内容越多耗时越长；二来还会频繁变动节点样式，徒增成本。

  


那生产环境为什么还要加入文件内容计算 hash ？

如果 ID 与文件内容无关，就可以实现稳定的 data 属性。对于 E2E 测试用例，就可以直接使用 data 属性进行元素寻址。

  


我能想到的原因同本文主题相关，为了缓解多个 Vue 应用的样式冲突问题，但确实不算是一个非常好的解决措施。如果还有其他原因，欢迎在评论区分享 ~

## 总结

本文简单分析了 Vue 中 `data-v-xxx` 的计算规则 。

在开发环境中，会采用文件相对路径进行 hash 计算，而在生产环境中，还会加入文件内容共同计算。

在微前端逐步流行的情况下，这套生成策略在某些情况下会导致样式冲突。或许更好的计算方式是加入应用名，取消文件代码。

* * *

最后，笔者水平有限，欢迎评论探讨。如果本文对你有帮助的话，也欢迎一键三连（点赞、收藏、分享）~