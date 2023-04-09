---
title: Vue之从零编写一个ContextMenu(右键菜单)插件
date: 2019/07/03 03:00:00
tags: 
  - Vue
permalink: /pages/d78c0d/
categories: 
  - 随笔
sidebar: auto
---

## 前言

ContextMenu 即右键菜单，当前的需求是：右键点击某些组件时，根据所点击组件的信息，展示不同的菜单。

本插件已开源，具体代码和使用可参考： [vue-contextmenu](https://github.com/Francecil/vue-contextmenu)

本文采用的是 vue 技术栈，部分处理对于 react 是可以借鉴的

其中需要注意的点有：

1. 菜单完全显示，即右键点击位于页面下/右侧时，菜单应该向上/左显示
2. 具体菜单由上层控制，该组件仅提供slot
3. 该菜单dom上唯一，不需要时应该销毁
4. 点击页面其他位置，菜单消失

先不考虑插件形式，按日常组件开发


<!--more-->


## 项目结构


```js
|-components
|---ContextMenu.vue    //菜单组件
|-views
|---Home.vue            //页面组件
|---Dashbox.vue        //图表组件，绝对定位于App中，有多个，右键展示自定义菜单
```
其余的 vue-router 什么的，不再赘诉

右键菜单的内容由使用者定义（通过slot），所以我们可以很快的编写 ContextMenu 的代码

> 同时解决了 **注意点2**

ContextMenu.vue
```html
<template>
  <div class="context-menu" v-show="show" :style="style">
    <slot></slot>
  </div>
</template>
<script>
export default {
  name: "context-menu",
  props: {
    show: Boolean
  },
  computed: {
    style() {
      return {
        left: "0px",
        top: "0px"
      };
    }
  }
};
</script>
<style lang="scss" scoped>
.context-menu {
  z-index: 1000;
  display: block;
  position: absolute;
}
</style>
```

先不考虑显示的位置，通过 show prop 的值来显示/隐藏该菜单，当前实现 菜单将会显示在左上角

Dashbox.vue
```html
<template>
  <div :style="dashbox.style" class="dashbox" @contextmenu="showContextMenu">
    {{ dashbox.content }}
  </div>
</template>
<script>
export default {
  props: {
    dashbox: Object
  },
  methods: {
    showContextMenu(e) {
      this.$emit("show-contextmenu", e);
    }
  }
};
</script>
<style>
.dashbox {
  position: absolute;
  background-color: aliceblue;
}
</style>
```
绝对定位在页面中，右键时会向上层传递事件

Home.vue
```html
<template>
  <div class="home">
    <Dashbox
      v-for="dashbox in dashboxs"
      :key="dashbox.id"
      :dashbox="dashbox"
      @show-contextmenu="showContextMenu"
    />
    <ContextMenu :show="contextMenuVisible">
      <div>复制</div>
      <div>粘贴</div>
      <div>剪切</div>
    </ContextMenu>
  </div>
</template>

<script>
import ContextMenu from "@/components/ContextMenu.vue";
import Dashbox from "./Dashbox.vue";

export default {
  name: "home",
  components: {
    ContextMenu,
    Dashbox
  },
  data() {
    return {
      contextMenuVisible: false,
      dashboxs: [
        {
          id: 1,
          style: "left:200px;top:200px;width:100px;height:100px",
          content: "test1"
        },
        {
          id: 2,
          style: "left:400px;top:400px;width:100px;height:100px",
          content: "test2"
        }
      ]
    };
  },
  methods: {
    showContextMenu(e) {
      e.preventDefault();
      this.contextMenuVisible = true;
    }
  }
};
</script>
```

此时可以看到页面中有2个矩形框，右键的时候，左上角能出现菜单

当然，此时并没有办法将该菜单隐藏

下面，我们将一步步进行优化

## 菜单处于右键点击位置

上面我们在 showContextMenu 方法中获取到点击事件e，

其中 `e.clientX/Y` 是基于浏览器窗口viewport的位置，参考点随着浏览器的滚动而变化（即一直是视窗左上角）

那么，将 clientX/Y 直接传入 ContextMenu 组件修改其样式是否就可以了？

思考一下...

------------

.

.

.

.

答案是不可以的，原因在于 ContextMenu 的祖先节点的定位可能不是 static,

当祖先节点定位非 static 时，absolute 定位的 ContextMenu 的参考点就是以祖先节点为参考点了。

举个例子：
```html
<body>
  <div class="header" style="height:200px"/>
  <div class="home" style="position: relative;">
    <div class="context-menu" style="left: 200px;top: 200px;position: absolute;">
      我是右键菜单
    </div>
  </div>
</body>
```
而实际上，当右键的 clientX/Y 值为 200，200时，传入 context-menu的style后，其菜单应该显示在点击处下方 200px, 即相对 viewport 的 left,top 分别为 200，400


> 了解 element-ui等组件库的应该知道，在涉及 poper 显示的时候，官方默认`popper-append-to-body`，目的就是将弹窗组件插入body，脱离文档流，不与定义处的父组件产生关系，并且方便使用 event.clientX/Y

所以，将其直接插入 body 是最省事的，

```js
mounted () {
  document.body.appendChild(this.$el)
}
```

ContextMenu 增加 offset 属性并修改样式

Home.vue
```html
<template>
  <div class="home">
    <Dashbox
      v-for="dashbox in dashboxs"
      :key="dashbox.id"
      :dashbox="dashbox"
      @show-contextmenu="showContextMenu"
    />
    <ContextMenu :show="contextMenuVisible" :offset="contextMenuOffset">
      <div>复制</div>
      <div>粘贴</div>
      <div>剪切</div>
    </ContextMenu>
  </div>
</template>

<script>
import ContextMenu from "@/components/ContextMenu.vue";
import Dashbox from "./Dashbox.vue";

export default {
  name: "home",
  components: {
    ContextMenu,
    Dashbox
  },
  data() {
    return {
      contextMenuVisible: false,
      contextMenuOffset: {
        left: 0,
        top: 0
      },
      dashboxs: [
        {
          id: 1,
          style: "left:200px;top:200px;width:100px;height:100px",
          content: "test1"
        },
        {
          id: 2,
          style: "left:400px;top:400px;width:100px;height:100px",
          content: "test2"
        }
      ]
    };
  },
  methods: {
    showContextMenu(e) {
      e.preventDefault();
      this.contextMenuVisible = true;
      this.contextMenuOffset = {
        left: e.clientX,
        top: e.clientY
      };
    }
  }
};
</script>
```
ContextMenu.vue
```html
<template>
  <div class="context-menu" v-show="show" :style="style">
    <slot></slot>
  </div>
</template>
<script>
export default {
  name: "context-menu",
  props: {
    offset: {
      type: Object,
      default: function() {
        return {
          left: 0,
          top: 0
        };
      }
    },
    show: Boolean
  },
  computed: {
    style() {
      return {
        left: `${this.offset.left}px`,
        top: `${this.offset.top}px`
      };
    }
  },
  mounted() {
    document.body.appendChild(this.$el);
  }
};
</script>
<style lang="scss" scoped>
.context-menu {
  z-index: 1000;
  display: block;
  position: absolute;
}
</style>
```

到这里，我们就可以实现 **菜单处于右键点击位置** 的效果了，每次右键点击，context-menu 会显示在对应位置



## 该菜单dom上唯一，不需要时应该销毁

这个也很简单

在组件销毁时，把自己从 body 中移除

```js
beforeDestroy () {
  let popperElm = this.$el
  if (popperElm && popperElm.parentNode === document.body) {
    document.body.removeChild(popperElm);
  }
}
```

## 点击页面其他位置，菜单消失

这里我们选择监听 mousedown，若事件没有停止传递，则 document 上可以监听到
> 当然 这里我们需要保证 事件不会被 stopPropagation

ContextMenu.vue
```html
<template>
  <div
    class="context-menu"
    v-show="show"
    :style="style"
    @mousedown.stop
    @contextmenu.prevent
  >
    <slot></slot>
  </div>
</template>
<script>
export default {
  name: "context-menu",
  props: {
    offset: {
      type: Object,
      default: function() {
        return {
          left: 0,
          top: 0
        };
      }
    },
    show: Boolean
  },
  computed: {
    style() {
      return {
        left: `${this.offset.left}px`,
        top: `${this.offset.top}px`
      };
    }
  },
  beforeDestroy() {
    let popperElm = this.$el;
    if (popperElm && popperElm.parentNode === document.body) {
      document.body.removeChild(popperElm);
    }
    document.removeEventListener("mousedown", this.clickDocumentHandler);
  },
  mounted() {
    document.body.appendChild(this.$el);
    document.addEventListener("mousedown", this.clickDocumentHandler);
  },
  methods: {
    clickDocumentHandler() {
      if (this.show) {
        this.$emit("update:show", false);
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.context-menu {
  z-index: 1000;
  display: block;
  position: absolute;
}
</style>
```

Home.vue 增加 `@update:show` 事件处理
```html
<ContextMenu
  :show="contextMenuVisible"
  :offset="contextMenuOffset"
  @update:show="show => (contextMenuVisible = show)"
>
  <div>复制</div>
  <div>粘贴</div>
  <div>剪切</div>
</ContextMenu>
```


## 菜单完全显示

根据点击位置，判断菜单向上显示或向下显示，即右键点击位于页面下/右侧时，菜单应该向上/左显示

页面高度：`let docHeight = document.documentElement.clientHeight`

菜单高度：`let menuHeight = this.$el.getBoundingClientRect().height`

当 `e.clientY + menuHeight >= docHeight` 时，菜单向下显示就会被遮挡了，需要向上显示

同理，

页面宽度：`let docWidth = document.documentElement.clientWidth`

菜单高度：`let menuWidth = this.$el.getBoundingClientRect().width`

当 `e.clientX + menuWidth >= docWidth` 时，菜单需要向左显示

由于菜单由外部定义，宽高不可控，所以每次都需要通过 `getBoundingClientRect` 获取实际宽高

这里需要注意获取 getBoundingClientRect 的时机。

一开始尝试：
```js
computed: {
    style() {
      console.log(this.$el)
      return {
        left: `${this.offset.left}px`,
        top: `${this.offset.top}px`
      };
    }
  }
```
发现此时组件处于 `display:none` 状态，获取到的宽高都为0

有2种解决方案，一种是将 v-show 也就是 `display 样式` 改为 `visibility`

但担心此法不够通用（其实是想试试 $nextTick，

另一种就是在下一个渲染周期结束后才执行，即 `v-show="true"` 后计算宽高

故我们需要监听 show prop 的值，当其为 true 时，在 `$nextTick` 回调中设置菜单坐标样式，此时 style 不用 computed,具体看代码。

```html
<template>
  <div
    class="context-menu"
    v-show="show"
    :style="style"
    @mousedown.stop
    @contextmenu.prevent
  >
    <slot></slot>
  </div>
</template>
<script>
export default {
  name: "context-menu",
  data() {
    return {
      style: {}
    };
  },
  props: {
    offset: {
      type: Object,
      default: function() {
        return {
          left: 0,
          top: 0
        };
      }
    },
    show: Boolean
  },
  watch: {
    show(show) {
      if (show) {
        this.$nextTick(this.setPosition);
      }
    }
  },
  beforeDestroy() {
    let popperElm = this.$el;
    if (popperElm && popperElm.parentNode === document.body) {
      document.body.removeChild(popperElm);
    }
    document.removeEventListener("mousedown", this.clickDocumentHandler);
  },
  mounted() {
    document.body.appendChild(this.$el);
    document.addEventListener("mousedown", this.clickDocumentHandler);
  },
  methods: {
    clickDocumentHandler() {
      if (this.show) {
        this.$emit("update:show", false);
      }
    },
    setPosition() {
      let docHeight = document.documentElement.clientHeight;
      let docWidth = document.documentElement.clientWidth;
      let menuHeight = this.$el.getBoundingClientRect().height;
      let menuWidth = this.$el.getBoundingClientRect().width;
      // 增加点击处与菜单间间隔，较为美观
      const gap = 10;
      let topover =
        this.offset.top + menuHeight + gap >= docHeight
          ? menuHeight + gap
          : -gap;
      let leftover =
        this.offset.left + menuWidth + gap >= docWidth ? menuWidth + gap : -gap;
      this.style = {
        left: `${this.offset.left - leftover}px`,
        top: `${this.offset.top - topover}px`
      };
    }
  }
};
</script>
<style lang="scss" scoped>
.context-menu {
  z-index: 1000;
  display: block;
  position: absolute;
}
</style>
```

当然，如果要做到（页面滚动/page resize）等菜单位置跟着变化，可以参考 element popper 的实现
1. https://github.com/ElemeFE/element/blob/dev/src/utils/popper.js
2. https://github.com/ElemeFE/element/blob/dev/src/utils/vue-popper.js

右键菜单应该是没有这样的需求

## 增加显示/隐藏的过度动画

这个也比较简单，采用 vue 自带的 transition

ContextMenu 中包一层 `<transition name="context-menu">`

style 样式 改为
```css
<style lang="scss" scoped>
.context-menu {
  z-index: 1000;
  display: block;
  position: absolute;
  &-enter,
  &-leave-to {
    opacity: 0;
  }

  &-enter-active,
  &-leave-active {
    transition: opacity 0.5s;
  }
}
</style>
```

## 插件注册

参考了 [element-ui](https://github.com/ElemeFE/element/blob/master/src/index.js) 的代码和 [README](https://github.com/ElemeFE/element#quick-start)

以及 [vue 官方文档-插件](https://cn.vuejs.org/v2/guide/plugins.html) 

我们先创建一个 contextmenu.js

```js
import ContextMenu from "@/components/ContextMenu.vue";
const plugin = {};
plugin.install = function(Vue) {
  Vue.component(ContextMenu.name, ContextMenu);
};

/**
 * Auto install
 */
if (typeof window !== "undefined" && window.Vue) {
  window.Vue.use(plugin);
}
export default plugin;
export { ContextMenu };
```

接下来使用的话有3种方式

main.js
```js
import ContextMenu from "./contextmenu";
// 将会调用install方法
Vue.use(ContextMenu);
// or 
import { ContextMenu } from "./contextmenu";
Vue.component(ContextMenu.name, ContextMenu);
```

或者在vue文件中使用(同法2，局部注册)
```js
import { ContextMenu } from "@/contextmenu";
components: {
  "context-menu": ContextMenu,
}
```


需要注意的是，`ContextMenu.vue` 中 name 为 `context-name`, 故 Home.vue 中应该相应的改为 `<context-name/>` 

## 滚动定位偏移问题

body 和 Dashbox 父容器 都可滚动的情况下，会出现菜单不在点击位置的问题，


测试页面：修改 Home.vue
```html
<div class="home">
+   <div class="content">
      ...
+   </div>
</div>

//增加样式
<style lang="scss" scoped>
.home {
  margin: 10px;
  overflow: scroll;
  height: 1500px;
  width: 100%;
  background: #eee;
  .content {
    position: relative;
    height: 2000px;
  }
}
</style>
```
此时先滚动 home，然后右键dashbox 就会发现错位了，因为此时的 event.clientY 比 绝对定位的 top 少了一个 scrollY 值

有两种方法：

1. 将 ContextMenu 的 position 由 absolute 改为 fixed
2. 传入的坐标采用 pageX/Y

*题外话*

上文提到，ContextMenu 是插入 body 的，那有没有什么场景是不插入body的，另外 element-ui 中 `popper-append-to-body=false` 的场景是什么，这里会出现么，应该怎么解决？

当 Dashbox 组件的父节点容器是限制高度且可以 scroll 的时候，若要求右键菜单（弹框等）不能超出容器，则不应该插入body,当前，我们右键菜单没有这样的要求

参考 antd-select 例子 https://codesandbox.io/s/4j168r7jw0

## 生成 vue-cli 插件

有用过 `vue-cli 3` 和 `element-ui` 的，应该熟悉 [vue-cli-plugin-element](https://github.com/ElementUI/vue-cli-plugin-element)

在我们的项目中，使用 `vue add element` 命令后，会自动去下载 `vue-cli-plugin-element` 并在 plugins 文件夹中新增 element.js 最后在 main.js 中使用，省去了上面那些手动引入的过程。

这里我们也尝试编写一个 [vue-cli-plugin-contextmenu](https://github.com/francecil/vue-cli-plugin-contextmenu)


项目结构
```
.
├── README.md
├── generator.js  # generator (可选,这里采用 generator/index.js 的形式)
├── prompts.js    # prompt 文件 (可选,本项目不使用)
├── index.js      # service 插件
└── package.json
```

代码的话主要是参考 [vue-cli-plugin-element](https://github.com/ElementUI/vue-cli-plugin-element) ，其中最主要的是 generator 的代码，如下
```js
module.exports = (api, opts, rootOptions) => {
  const utils = require('./utils')(api)

  api.extendPackage({
    dependencies: {
      '@gahing/vcontextmenu': '^1.0.0'
    }
  })

  api.injectImports(utils.getMain(), `import './plugins/contextmenu.js'`)

  api.render({
    './src/plugins/contextmenu.js': './templates/src/plugins/contextmenu.js',
  })
}
```

当我们写完后，需要进行本地测试下


```sh
# 创建测试项目(全选默认设置)
vue create test-app
cd test-app
# cd到项目文件夹并安装我们新创建的插件
npm i file://E:/WebProjects/vue-cli-plugin-contextmenu -S
# 调用该插件
vue invoke vue-cli-plugin-contextmenu
```
查看test-app项目的main.js,将会看到新增这行代码：
```js
import './plugins/contextmenu.js'
```

plugins/contextmenu.js 中内容为
```js
import Vue from 'vue'
import ContextMenu from '@gahing/vcontextmenu'
import '@gahing/vcontextmenu/lib/vcontextmenu.css'
Vue.use(ContextMenu)
```

至此，vue-cli-plugin-contextmenu 就开发完成，将其发布到 npm 上

## 参考 

1. [插件开发指南](https://cli.vuejs.org/zh/dev-guide/plugin-dev.html#%E6%A0%B8%E5%BF%83%E6%A6%82%E5%BF%B5)

2. [vue-cli-plugin-element](https://github.com/ElementUI/vue-cli-plugin-element)

3. [「Vue进阶」5分钟撸一个Vue CLI 插件](https://juejin.im/post/5cb59c4bf265da03a743e979)
