---
title: Edge 浏览器在亚像素宽度计算的表现差异
date: 2020-09-04 10:12:40
categories: 大前端
tags: 
  - CSS
---
# 前言

我们需要开发一个多栏无限内容滚动的功能，以[西瓜视频](https://www.ixigua.com/)为例: 

![](https://sf1-dycdn-tos.pstatp.com/obj/eden-cn/nupohneh7nupehpqnulog/img/blog/www.ixigua.com_feed.png)

布局的话，首先想到的就是 flex 了。

## 0907 补充

采用 grid 布局就不会有 calc 舍入问题了，这类场景还是采用 grid 布局吧。如果采用 flex 布局还遇到问题的话，可以继续看本文哈。

<!--more-->

这里我们以**容器宽度 1228px ，7 栏内容**为例，很快可以写出以下 React 代码

```js
import React, { useState } from "react";

const counts = 8;
function genRandomColor() {
  const fn = () => parseInt(Math.random() * (255 + 1), 10);
  return `rgb(${fn()},${fn()},${fn()})`;
}
function Item({ item }) {
  const { id, color } = item;
  return (
    <div
      style={{
        width: `calc(100% / 7)`,
        height: "40px",
        backgroundColor: color
      }}
    >
      {id}
    </div>
  );
}
export default function App() {
  const [items] = useState(() =>
    new Array(counts)
      .fill(1)
      .map((_, i) => ({ id: `node${i + 1}`, color: genRandomColor() }))
  );
  return (
    <div style={{ width: 1228, display: "flex", flexWrap: "wrap" }}>
      {items.map((item) => (
        <Item key={item.id} item={item}></Item>
      ))}
    </div>
  );
}

```

在线 demo 见 [codesandbox](https://codesandbox.io/s/browser-decimal-j2ldg?file=/src/App.js)

打开 Chrome 上看，嗯效果没问题，提测！

过了不久，QA 跑来说，Edge 上布局错乱了。。。每行只有 6 列而不是 7列，node7 被放到下一行显示了！效果如下：

![](https://sf1-dycdn-tos.pstatp.com/obj/eden-cn/nupohneh7nupehpqnulog/img/blog/edge-6cols.png)

> 有 Edge 的可以测试下，确实有问题。注意本文所说的 Edge 均指低版本 Edge ，即非 chromium 内核的；新 Edge 与 Chrome 用的同一渲染引擎，结果是一样的

”讲道理这样写应该是没问题的，我看其他国内外很多网站也是这样布局的呀？“ 于是我打开了 YouTube 首页上验证一下，结果发现在 Edge 上**有时候**(比如 2560px 分辨率)还是出现了换行，右侧空了一块空白，如下图所示，和我们上面的例子表现相似

![](https://sf1-dycdn-tos.pstatp.com/obj/eden-cn/nupohneh7nupehpqnulog/img/blog/edge-youtube.png)


# 初步分析

每项的宽度，我们预期计算结果为 `1228/7=175.42857142857142`

接下来查看每种浏览器的 width 大小，在 Elements 面板右侧 Computed tab 上查看

- Chrome 84, Computed width 显示为 175.422
- Edge 14, Computed width 显示为 175.48
- Safari 13.1, Computed width 显示为 175.42
- Firefox 79, Computed width 显示为 175.417
> PS: 本文所有实验测试的都是这 4 款浏览器

![黑人问号.jpg](https://www.easyatm.com.tw/img/9/1bd/wZwpmL0MTO2ATMxcTN5ADN0UTMyITNykTO0EDMwAjMwUzL3UzL1gzLt92YucmbvRWdo5Cd0FmLzE2LvoDc0RHa.jpg)

这里面，就只有 Edge 上的宽度大于 1228/7 ，导致第 7 项无法被装下

那这些小数点取值又为何不一样？

# 背景知识

在深入分析之前，我们先介绍下一些基本概念

## 亚像素

像素是成像系统上最小的单位，也就意味着 2 个像素在宏观上是相连的

但是在数值计算上，它们还可以存在更小的单位，我们称之为亚像素。

亚像素的值是通过像素细分（比如继续分为4x4），数据插值等细分算法计算而成。

所以对于页面中的小数点宽度，将表示为亚像素，其值可以通过像素细分算法得到

更多细节可以参考:

- [亚像素Sub Pixel](https://www.cnblogs.com/Jessica-jie/p/8529564.html)
- [Subpixel rendering](https://en.wikipedia.org/wiki/Subpixel_rendering)

>（不过这里我仍有疑问：知道亚像素的表示又如何，屏幕最小显示单元不还是像素么？可能在一些边缘检测上才能体现作用？

关于亚像素的大小貌似没有标准。根据貘大所说，Chrome 和 Safari 用的是 1/64 ，Firefox 用的是 1/60 。而 IE/Edge 就不清楚了，根据下文的测试结果，可以理解为 1/100

## css 的值

css 2.2 和 css 3 对 「值」 都有相应的定义

- [css 2.2 - Specified, computed, and actual values](https://www.w3.org/TR/CSS22/cascade.html#value-stages)
- [css3 - Value Processing](https://www.w3.org/TR/css-cascade-3/#value-stages)


区别在于前者的值处理步骤是 4 步，而后者是 6 步。这里我们直接按后者最新规范来描述

1. 收集**声明值 `Declared Values`**，可能是 0 至多个，比如在不同样式表里的定义
2. 对声明值列表按照[一定规则](https://www.w3.org/TR/css-cascade-3/#cascading)进行优先级排序，得到最终的**级联值 `Cascaded Values`**
3. **指定值 `Specified Values`** = 级联值 || [默认值](https://www.w3.org/TR/css-cascade-3/#defaulting)。继承属性用的继承值 `inherit`，非继承属性将用初始值 `initial`，也可以显式的设置 `initial/inherit/unset` 等关键字

4. 对指定值进行解析得到**计算值 `Computed Values`** 。计算值尽可能解析指定值，但不会布局文档。比如 `font-size` 在布局前就能确定的，所以 vw,rem 等值会被解析成 px，其他的还有 calc ,会对里面的表达式尽可能解析。
> 由于历史原因（我也不知道什么原因，文档没说，但确实应该有些需要显示使用值，计算值比如 auto 没啥意义）， getComputedStyle 拿到的不一定是计算值，也有可能是使用值。\
> devtools 上显示的样式值就是通过 getComputedStyle 拿到的 \
> 即使属性不适用，计算值也存在

5. 在文档布局(Layout)中对计算值进行进一步计算，得到**使用值 `Used Values`**。顾名思义，该值是真正拿来布局中使用的
> 比如计算值为 auto 或者百分比, 在布局过程中拿到使用值 100px；或者 flex 属性对于非 flex 元素来说没有使用值 \
> 对于 width 等属性来说，使用值相当于 `dom.getBoundingClientRect().width` ，与计算值的区别在于存在舍入关系，见下文「小数点精度」
6. 使用值原则上是可以直接用的，但是用户代理可能无法在给定环境下使用。比如只能呈现整数像素边框，因此需要对使用值进行舍入；或者元素的字体大小可能需要根据字体可用性进行调整。在此类调整后得到值称之为**实际值 `Actual Values`**

举个例子

| Property  |  声明值 |  级联值 |  指定值 | 计算值  | 使用值 | 实际值 |
|---|---|---|---|---|---|---|
| 	width   |	width: 80% |	80%	| 80% |	80%	| 354.2px	| 354px |
|  font-size	|font-size: 1.2em|	1.2em|	1.2em|	14.1px	|14.1px	|14px|

更多示例： https://www.w3.org/TR/css-cascade-3/#stages-examples


在实际值这边，我们可能会遇到有趣的现象，即相同的使用值，但是实际值却会变化
> 这里我把 offsetWidth 当做实际值理解了，不确定是否正确，欢迎探讨

还是上面的 [demo](https://j2ldg.csb.app/)，我们可以发现
```js
document.querySelector("#root > div > div:nth-child(1)").offsetWidth // 175
document.querySelector("#root > div > div:nth-child(2)").offsetWidth // 176
...
```

具体原因已有相关小伙伴进行分析了，详见 
- [rem 产生的小数像素问题](https://fed.taobao.org/blog/2015/11/05/mobile-rem-problem/) 
- [消失的 1px](https://quanru.github.io/2016/04/17/%E6%B6%88%E5%A4%B1%E7%9A%841px/)
- [LayoutUnit](http://trac.webkit.org/wiki/LayoutUnit)

大意是：
1. 元素在渲染时会进行舍入处理，对应到实际值，所以可能经常出现背景图被裁掉的问题
2. 占据的空间还是原始大小，即使用值，所以元素总宽度不变
3. 后面的元素计算实际值时会根据上个元素的舍入情况进行补全或扣除，导致实际值和之前的可能会不一样

# 小数点精度测验

根据上文我们得知，css 的`使用值` 通过亚像素技术来保留小数位。

那么具体保留的位数是多少呢？参与计算时的百分比又是怎么处理的呢？

通过以下这些 case 来进行测试
1. 显式设置的百分比，如 `14.285714285714286%` 会取几位？还是说等最后再对计算结果舍入？
2. 显式设置的小数像素，如 `210.123456789123456789px` 会取几位？
3. calc 里面进行百分比数学运算，比如 `calc(100%/7)` ，会取几位？
4. calc 里面除了百分比数学运算，还有其他像素的运算，比如 `calc(100%/7 - 0.019)` 又会取几位？

demo 见 [TEST2: 测试小数点精度](https://j2ldg.csb.app/#test2)

得到以下测试结果：

Chrome:
![](https://sf1-dycdn-tos.pstatp.com/obj/eden-cn/nupohneh7nupehpqnulog/img/blog/subp_chrome.png)

Safari:
![](https://sf1-dycdn-tos.pstatp.com/obj/eden-cn/nupohneh7nupehpqnulog/img/blog/subp_safari.png)

Firefix:
![](https://sf1-dycdn-tos.pstatp.com/obj/eden-cn/nupohneh7nupehpqnulog/img/blog/subp_firefox.png)

Edge:
![](https://sf1-dycdn-tos.pstatp.com/obj/eden-cn/nupohneh7nupehpqnulog/img/blog/subp_edge.png)


## 第 1、2 组实验：验证百分比小数的舍入情况(2位、4位、13位)

其中第 1 组在小数点第 3 位、5 位、14 位取 < 5 的值，第 2 组则取 > 5 的值

本实验来自于文章 [浏览器亚像素渲染与小数位的取舍](https://isux.tencent.com/articles/105.html)，但我这里得到的结论与之有出入


Edge 上百分比取的是 2 位小数向下舍入规则，且最终计算结果继续取 2 位向下舍入
```js
1228/100 * 50.42 = 619.1576 => 619.15(同测试结果)
1228/100 * 50.56 = 620.8768 => 620.87(同测试结果)
1228/100 * 50.57 = 620.9996
```

无论对 Chrome/Safari/Firefox 采用何种小数位进位，都不能取到相应的结果
```js
1228/100 * 50.4234 = 619.199352 
1228/100 * 50.5698 = 620.997143
```

但是按亚像素理论来描述就合理了。
```js
1/64 = 0.015625
1/60 = 0.016666666666666666

12/64 = 0.1875
11/60 = 0.18333333333333332

63/64 = 0.984375
59/60 = 0.9833333333333333
```

### 实验 1、2 结论

即 Chrome/Safari/Firefox 都是用足够位数的小数（可以理解为不舍入）去计算，得到的小数位再转为亚像素，根据 1/64 或 1/60 等基本单位向下舍入，正好匹配测试结果
> firefox 由于用的 1/60 不能除尽，在后面几位的小数位上可能有一些差异，但始终小于我们手动计算出来的值

另外可以得到其他结论：

- Firefox 和 Chrome 的计算值都是对使用值进行四舍五入**保留 3 位小数**
- Safari 的计算值和使用值相同，即 `getComputedStyle` 与 `getBoundingClientRect` 取值相同
- Firefox 由于亚像素除不尽的原因，「使用值」**保留 14 位小数**，而 Chrome/Safari 仅**保留 6 位小数**即可
- Edge 的「使用值」**保留 14 位小数**，计算值 **保留 2 位小数**，两者之间差值 < 1e-4 忽略不计，可以理解为 Edge 亚像素的特殊处理，暂未找到相关文档
- 当然上面这些都无关紧要，我们布局时使用的是 「使用值」，计算值只会影响 devtools 等工具的展示


由于向下舍入，可以发现两个大于 50% 元素能被容纳在 100% 内

具体见 demo [实验二：测试两个宽度大于 50% 的能容纳在 100% 内](https://kc2z7.csb.app/)

Edge 上是百分比舍入的原因，而 Chrome 等浏览器则是因为没有达到一个亚像素大小
```
1228 * 0.0011/100 = 0.013508 < 1/64 = 0.015625
```

## 第 3 组实验：小数位像素的舍入规则

Chrome/Safari/Firefox 依然是满足亚像素规则，取亚像素基本单位并向下舍入
```js
7/64 = 0.109375
7/60 = 0.11666666666666667
```

对于 Edge 来说，是向下舍入取 2 位小数

## 第 4 ~ 6 组实验：calc 中的百分比处理规则

上面的结果都是向下舍入的，所以和溢出没啥关系。

但是到这有意思的来了，回到了我们文章一开始的问题：**为何 Edge 上 calc 的计算结果偏大了**

对 Chrome/Safari/Firefox 例行分析，发现依然满足亚像素规则，而 Edge 呢？

```js
calc(100%/7) = 175.48
calc(100%/7 - 10px) = 165.43
calc(100%/7 - 0px) = 175.43
```

由于
```js
100/7 = 14.285714
1228/100 * 14.29 = 175.48119 ~= 175.48(满足第 4 组结果)
1228/100 * 14.2857 = 175.428396 ~= 175.43 (满足第 6 组结果)
```
我们大胆提出假设：
1. calc 中仅百分比计算的，「计算值」阶段，百分比将四舍五入保留 2 位小数
2. 还有参加其他数值计算的，「计算值」阶段，百分比将四舍五入保留 4 位小数

后面我们将做验证，继续分析下面几组

## 第 7~8 组：calc 中显式设置百分比舍入规则

```
calc(14.2857%) = 175.35
calc(14.2857% - 0px)  = 175.36
```

![黑人问号.jpg](https://www.easyatm.com.tw/img/9/1bd/wZwpmL0MTO2ATMxcTN5ADN0UTMyITNykTO0EDMwAjMwUzL3UzL1gzLt92YucmbvRWdo5Cd0FmLzE2LvoDc0RHa.jpg)

由于
```js
1228/100 * 14.28 = 175.3584
```

我们提出以下假设：
1. calc 中显式设置的百分比，如果没有其他数值项计算，对结果进行向下舍入保留 2 位小数
2. 如果还有其他数值项计算，对结果进行四舍五入保留 2 位小数

# Edge 小数点测验

在 Edge 上的表现比较怪异，我们单独拿出来分析，见 [TEST3: Edge 小数点测验](https://j2ldg.csb.app/#test3)

为方便理解，我们做出以下定义：
1. 显式百分比： 指直接设置好的百分比，如 `14.28%`
2. 隐式百分比：指对百分比进行除运算的百分比，如 `100%/7`
3. 小数像素：指可能含小数的像素值，如 `0px, 14.11px`
4. 像素数值项：小数像素及小数像素的运算（如 `72px/7`）
5. 数值项：包括百分比，像素数值项

测试结果见下图
![](https://sf1-dycdn-tos.pstatp.com/obj/eden-cn/nupohneh7nupehpqnulog/img/blog/width_edge.png)


## 根据 1~2 组可以得到以下结论：

显式百分比，只有在小数点 3456 位大于 9985 的情况下才会进位到第二位小数；
否则均向下舍入保留 2 位小数

## 根据 3~5 组可以得到以下结论

显式百分比和小数像素，会先预处理向下取整保留 2 位小数（除了第 2 组这种特殊情况）

对于计算结果的舍入：
- 如果仅单个数值项（百分比或小数像素），结果将向下舍入保留 2 位小数
- 如果有多个数值项，结果将四舍五入保留 2 位小数

## 根据 6~7 组可以得到以下结论

结合律不影响数值项计算

像素数值项会进行向下舍入保留 2 位小数，如 `72/7 = 10.2857 =>10.28`

## 根据 8~12 组可以得到以下结论

隐式百分比与像素数值项进行计算，像素数值项的个数将影响隐式百分比的舍入规则：
- 如果仅一个像素数值项，隐式百分比四舍五入保留 4 位小数
- 否则（ 0 个，或 2 至多个），隐式百分比四舍五入保留 2 位小数

## 根据 13~16 组可以得到以下结论

同 3~5 组结论：
- 显式百分比数值项会先向下舍入处理
- 单个数值项，计算结果按向下舍入处理
- 多个数值项，计算结果按四舍五入处理

## 根据 17~18 组可以得到以下结论

隐式百分比的舍入规则仅与像素数值项有关，与显式百分比个数无关。

## 20200906 后续补充

偶然想到，如果对多个像素数值项通过括号结合的话，在处理「计算值」阶段，会将其进一步处理，应该当成一个数值项来考虑。

结果也验证了我的想法
```js
calc(100% / 7 - (0px - 0px))
第 20 组： getComputedStyle 取值：175.43px;
getBoundingClientRect 取值：175.42999267578125
描述：1228 * 0.142857 = 175.428396 ~= 175.43
```

也就是说，用括号括起来后，像素数值项间的运算，统一算一个像素数值项

```js
calc(100% / 7 - (72px / 7 + 0.01px))
// 等同于 
calc(100% / 7 - 10.29px)
```

重新定义像素数值项：与隐式百分比间有运算关系的才算一项，多个像素数值项之间先进行计算的统一为一项

## Edge 综合结论

1. 对于显式百分比和像素数值项，会向下舍入保留两位 2 小数

2. 对于隐式百分比，舍入规则由像素数值项的个数决定

3. 对计算结果的继续舍入保留 2 位小数，单数值项采用的是向下舍入，多数值项采用的是四舍五入。

# Edge 解决方案

回到问题本身，Edge 上是因为舍入规则总计算值比容器大，导致溢出换行

指定值为： `width: calc(100%/7)` ，按照上面结论，有
```js
实际值 = (1228 * 0.1429).toFixed(2) = 175.48
175.48 * 7 === 1228.36 > 1228
```

会导致最后一项放不下，因此我们需要扣掉一定的舍入值


假设我们的容器宽度 width = 1228 ，列数为 cols = 7 ，列间总 margin 值 margins = 0

如果后面还会扣掉一个舍入值，像素数值项 numCounts = 2

```js
const floor = (num, decimal = 0) => {
    const expand = 10 ** decimal
    return Math.floor(num * expand) / expand
}
const getRealWidth = (width, cols, margins, numCounts) => {
    const fixed = numCounts === 1 ? 6 : 4 //一个数值型保留四位小数否则保留2位小数
    const tmp = width * (1 / cols).toFixed(fixed) - floor(margins / cols, 2)
    return Number(tmp.toFixed(2))
}

/**
 * 
 * @param {*} width 
 * @param {*} cols 
 * @param {*} margins 
 * @param {*} numCounts 像素数值项个数，用来确定隐式百分比的舍入规则
 */
const getDifference = (width, cols, margins, numCounts) => {
    const calcWidth = (width - margins) / cols
    const realWidth = getRealWidth(width, cols, margins, numCounts)
    return {
        calcWidth,
        realWidth, // 浏览器实际渲染的值
        difference: calcWidth - realWidth
    }
}

```

根据上述值，我们可以得到
```js
getDifference(1228,7,0,2)
// {calcWidth: 175.42857142857142, realWidth: 175.48, difference: -0.05142857142857338}
```

因此，对每项的计算结果扣除 0.06px 即可
```js
calc(100%/7 -0px -0.06px)
=>
(1228 * 0.1429).toFixed(2) -0.06  = 175.42
175.42 * 7 = 1227.94 < 1228
```

## 20200906 后记

我们通过调整像素数值项的计算顺序，让像素数值项个数 numCounts 变成 1 ，这样算出来的 difference 会比较小

```js
getDifference(1228,7,0,1)
// {calcWidth: 175.42857142857142, realWidth: 175.43, difference: -0.0014285714285904305}
```

取 difference = 1

```js
calc(100%/7 -(0px + 0.01px))
// 等同于
calc(100%/7 - 0.01px)
=>
(1228 * 0.142857).toFixed(2) - 0.01  = 175.42000000000002
175.42000000000002 * 7 = 1227.94 < 1228
```

看起来 0.01px 能够满足所有情况？我们进行验证：

```js
const getRealWidth = (width, cols, margins, numCounts) => {
    const fixed = numCounts === 1 ? 6 : 4 //一个数值型保留四位小数否则保留2位小数
    const tmp = width * (1 / cols).toFixed(fixed) - floor(margins / cols, 2)
    return Number(tmp.toFixed(2))
}
```
margins 向下取值，导致扣掉的值变少了，对于 margins = 72 cols = 7 的情况，

`floor(margins / cols, 2) = floor(10.285714285714286) ` , 少算了 0.0057

由于 margins 和 cols 可能取各种值，我们假设取极限值 0.0099

另一个，隐式百分比计算，算上百分比，宽度为四舍五入保留 6 位小数，即极限值为 width * 0.0000005

按照 width=5120 来算，极限值也就 0.00256

最后是四舍五入，由于我们可能让原来的结果多了 0.01xx (0.0099+0.00256)，最终结果可以是 0.02px 的偏移

结论：
- 正常 0.01px 就够用了，如果不够用，是 magins 的问题，可以自己进行 floor 计算看会少掉多少
- 如果想稳定，一直设置 0.02px 即可

# 最佳实践

我们项目中都是进行响应式处理的，即不同分辨率下展示不同个数的卡片。

如果有两个像素数值项，我们需要对每个分辨率进行差值计算，取最大的 difference

```js
// 假设不同分辨率对应的列数分别为：
$narrowItemRowCounts = {
  '1024px': 4,
  '1280px': 5,
  '1440px': 5,
  '1680px': 6,
  '1920px': 6,
  max: 7
}
// 列间隔为 12px
```
最大的 difference 可以这么计算(4,5 列的不用算，因为可以整除， difference 必定为 0)
```js
const floor = (num, decimal = 0) => {
    const expand = 10 ** decimal
    return Math.floor(num * expand) / expand
}
const getRealWidth = (width, cols, margins, numCounts) => {
    const fixed = numCounts === 1 ? 6 : 4 //一个数值型保留四位小数否则保留2位小数
    const tmp = width * (1 / cols).toFixed(fixed) - floor(margins / cols, 2)
    return Number(tmp.toFixed(2))
}

/**
 * 
 * @param {*} width 
 * @param {*} cols 
 * @param {*} margins 
 * @param {*} numCounts 像素数值项个数，用来确定隐式百分比的舍入规则
 */
const getDifference = (width, cols, margins, numCounts) => {
    const calcWidth = (width - margins) / cols
    const realWidth = getRealWidth(width, cols, margins, numCounts)
    return {
        calcWidth,
        realWidth, // 浏览器实际渲染的值
        difference: calcWidth - realWidth
    }
}

$narrowItemRowCounts = {
    '1024px': 4,
    '1280px': 5,
    '1440px': 5,
    '1680px': 6,
    '1920px': 6,
    max: 7
}

let max = 0
let width = 0
for (let i = 1025; i <= 1440; i++) {
    let result = Math.abs(getDifference(i, 5, 4 * 12, 2).difference)
    if (result > max) {
        max = result
        width = i
    }
}
console.log(`1025~1440 cols:5,max difference: ${max} ,width:${width}`)
// 1025~1440 cols:5,max difference: 0 ,width:0
for (let i = 1441; i <= 1920; i++) {
    let result = Math.abs(getDifference(i, 6, 5 * 12, 2).difference)
    if (result > max) {
        max = result
        width = i
    }
}
console.log(`1441~1920 cols:6,max difference: ${max} ,width:${width}`)
for (let i = 1921; i <= 5120; i++) {
    let result = Math.abs(getDifference(i, 7, 6 * 12, 2).difference)
    if (result > max) {
        max = result
        width = i
    }
}
console.log(`1921~5120 cols:7,max difference: ${max} ,width:${width}`)

// 1025~1440 cols:5,max difference: 0 ,width:0
// 1441~1920 cols:6,max difference: 0.06666666666666288 ,width:1853
// 1921~5120 cols:7,max difference: 0.2300000000000182 ,width:5119
```

可以发现后后面 difference 有点大了，如果都扣除 difference 的话，最终会有 1 像素的差距（0.23*7）

我们最好应该采用**单像素数值项的解决方案**，经过上面的验证， `0.01px` 满足了绝大部分情况

最后说说 YouTube 的问题。本文最开始说了， YouTube 在某些分辨率下是有问题的，这是因为它里面的代码为
```
calc(100%/7 - 6*12px/7 - 0.01px)
```

直接减 0.01px 在有些时候是有问题的，还是会出现问题，因此应该采用本文的解决方案。
- 不对像素数值项进行结合，需要扣除一个较大的偏差值
- 对像素数值项进行结合，仅需要扣除 `0.01px` 即可，即 `calc(100%/7 - (6*12px/7 + 0.01px))`

# 结论

在小数点像素的处理上，浏览器都采用的亚像素技术，但在细节上又不太相同，其中 Firefox 采用的是 1/60 , Chrome/Safari 采用的是 1/64 。在处理的时候，亚像素会并向下舍入，因此始终不会超过父容器宽度。

在 calc 的处理上，Firefox/Chrome/Safari 的结果始终遵循亚像素向下舍入原则。而 Edge 可能是向上舍入，因此我们需要对每个元素扣掉一个偏差值，保证最终结果不会超过父容器宽度


# 其他资料

除了上文出现的文章外，以下回答也对我有所帮助：

- css设置元素的宽高为整数，为什么有的浏览器解析出来的宽高是小数？ - 孙北吉的回答 - 知乎
https://www.zhihu.com/question/48624427/answer/134621269
- css设置元素的宽高为整数，为什么有的浏览器解析出来的宽高是小数？ - 貘吃馍香的回答 - 知乎
https://www.zhihu.com/question/48624427/answer/134726875
- 浏览器将rem转成px时有精度误差怎么办？ - 貘吃馍香的回答 - 知乎
https://www.zhihu.com/question/264372456/answer/280662029
- 浏览器将rem转成px时有精度误差怎么办？ - 大漠的回答 - 知乎
https://www.zhihu.com/question/264372456/answer/280496269
