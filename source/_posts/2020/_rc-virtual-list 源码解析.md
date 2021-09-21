
## 前言

之前写过一个长列表原理的文章 -- [「前端长列表」开源库解析及最佳实践](https://juejin.im/post/5dea86f7f265da33a8758820)

里面提到说 [rc-virtual-list](https://github.com/react-component/virtual-list) 是性能最好问题最少的方案。

并做了一番解析。

但当时只停留在「怎么做」的层面，没有从「为什么这么做」去出发，导致一些小伙伴问我为啥这么处理的时候，我回答不上来

今天就来重新解读下这个项目

<!--more-->

## 核心思想

任意高度的列表项都占据相同的滚动条范围

那么

支持自适应高度，支持动画效果，支持滚动位置复原

### 渲染

```html
  <!-- 用户可见的容器高度可能只有 300px -->
  <div
    class="container"
    style="width: 200px; height: 300px;"
    @scroll.passive="handleScroll"
  >
    <!-- 总的列表 div ，用于撑起列表的高度 -->
    <div
      class="total-list"
      :style="{
        height: `${itemHeight * data.length}px`,
      }"
    >
      <div
        class="visible-list"
        :style="{
        transform: `translateY(${topHeight}px)`,
      }"
      >
        <div
          v-for="item in visibleList"
          :key="item.id"
          class="visible-list-item"
          :style="{
          height: `${itemHeight}px`,
        }"
        >{{ item.value }}</div>
      </div>
    </div>

    <!-- 此处只需渲染可见列表即可，无需渲染全部数据 -->

  </div>
```

和上面的方案不一样，这里是创建了一个 total-list 的容器，直接对这个容器进行 translateY 偏移


### 计算

总高度始终固定，等于 `列表项个数(itemCount) * 列表项最小高度(itemHeight)`

处理逻辑如下：

1. 滚动，确定定位项和起止项
2. 渲染起止列表项（虚拟 dom 到真实 dom）
3. 列表项渲染完毕，计算并调整起始项偏移位置（回流获取）
4. 进行重渲染

> 注意：本处渲染的含义和浏览器实际渲染(UI Render)不同，整个过程的操作和渲染均处在一个宏任务，还未到 UI Render 阶段

**核心思想是任意高度的列表项都占据相同的滚动条范围**

先上图（建议分屏和下文对照阅读）

![](https://upload-images.jianshu.io/upload_images/9277731-fb1c1dfa4c257067.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

在获取到数据（data）后，未滚动前，有哪些值我们是确定的呢？

1. 列表项个数(itemCount): `data.length`
2. 列表项预设高度(itemHeight): 预设值，必须是列表项最小高度
3. 列表固定总高度(listHeight): `itemCount * itemHeight`
4. 容器高度(clientHeight): 预设值，或者通过 `element.clientHeight` 获得
5. 滚动条高度(scrollBarHeight): `clientHeight * (clientHeight/listHeight)`
    >  滚动条高度/容器高度 = 容器高度/列表固定总高度
6. 最大可滚动高度(scrollTopMax): `listHeight - clientHeight`
7. 滚动条最大偏移量(scrollBarHeightMax): `clientHeight - scrollBarHeight`
8. 可见列表项个数(visibleCount): `Math.ceil(clientHeight / itemHeight)`
    > 注意必须向上取整；为了保证充满容器，我们以最小高度计算可见列表项个数


先不考虑源码中「定位项」的做法，我们如何确定起始位置(startIndex)呢？

上文说过，我们把每一项都看成是相同高度，所以我们采用固定高度的做法试试：

```js
startIndex = Math.floor(scrollTop/itemHeight)
// 起始项偏移高度
startItemTop =  startIndex * itemHeight
```

列表渲染完毕时，


这么简单？举个例子验证下
```
itemCount=50
itemHeight=20
clientHeight=100
visibleCount=5
scrollTopMax=900
=> scrollTop = 0
startIndex=0
endIndex=9
=> scrollTop = 120
startIndex=(120/900)*45

50 项* 20 最小高度， 总高度固定 1000

视口高 100 ，滚动条高度 100 * (100/1000)  =  10，可滚动距离为 90，可滚动的实际高度为 1000 - 100 = 900

假设此时往下滚动了 400 px, 则滚动条滚动的百分比为 400/900 = 44.4%

对应的，此时滚动条指向的列表项称为定位项，索引值为 50 * 44.4%
```


#### ① 确定起止项和定位项

进行滚动后，我们拿到了新的信息量：
- 滚动偏移量(scrollTop): 通过 `element.scrollTop` 获得
- 滚动条滚动百分比(scrollPtg): `scrollTop / scrollTopMax`
- 滚动条偏移量(scrollBarTop): `scrollBarHeightMax * scrollPtg`




此时我们就可以

这里我们提到了一个**定位项**的概念，何为定位项？

定位项与滚动条位置对应，可以理解为滚动条水平方向指向的那个列表项。

当滚动条为0时，指向第0项，此时定位项为第0项，即本次渲染列表的 startIndex

当滚动条处于最大值时，指向最后一项，此时定位项为最后一项，即本次渲染列表的 endIndex

```js
const scrollTopMax = listHeight - clientHeight
/** 进度条滚动百分比 */
const scrollPtg = scrollTop / scrollTopMax
/** 确定定位项 */
const itemIndex = Math.floor(scrollPtg * itemCount);
/** 可见列表项个数 = 可见容器高度 / 每个列表项高度 ，记得向上取整 */
const visibleCount = Math.ceil(this.$el.clientHeight / this.itemHeight)
/** 确定起始项和结束项 */
const startIndex = Math.max(0, itemIndex - Math.ceil(scrollPtg * visibleCount))
const endIndex = Math.min(itemCount - 1, itemIndex + Math.ceil((1 - scrollPtg) * visibleCount))
const itemOffsetPtg = (scrollPtg - itemTopPtg) / (itemBottomPtg - itemTopPtg)
```


#### ② 渲染列表项

渲染 startIndex ~ endIndex 的列表项

#### ③ 调整 offset

在列表项渲染完毕后，触发 update 回调 

获取并统计 startIndex ~ itemIndex 列表项的实际总高度 s2iHeight

计算起始项偏移高度 startItemTop ,如下：

```js
const startItemTop = 定位项绝对高度(itemAbsoluteTop) - 起始项至定位项的高度(s2iHeight)
const itemAbsoluteTop = scrollTop + 定位项相对视口高度(itemRelativeTop)
const itemRelativeTop = 滚动过的视口高度(scrollPtg * clientHeight) - 定位项偏移高度(itemOffsetPtg * itemHeight)
```


### 健壮

**由于总高度固定，不存在鼠标和滚动条不同步的问题**

### 总结

性能优异，通过几个数学公式即可确定起止位置（还有优化的空间）

若需要自适应高度，则需要进行2次render，否则第一次render即可计算偏移位置

目前**唯一**一种不产生鼠标和滚动条不同步问题的方案

拓展性强，毕竟后面是 Ant Design 4 的核心组件之一

react 长列表首选方案

vue 可以尝试造个轮子
