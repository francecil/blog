---
title: CSS 学习笔记
date: 2017-02-14 17:11:23
permalink: /pages/68abf6/
categories: 
  - 大前端
  - 前端基础
  - 编程语言
  - CSS
tags: 
  - 
titleTag: 笔记
---

# 1.background属性
## background-image 设置的背景图默认会填充整个所在布局，
可以通过设置background-repeat: repeat-x no-repeat等设置在x方向重复 不重复等
## background-position: 50% 20% 图片描述为50% 20%的点与 页面元素50% 20%处(水平，垂直)对齐  
注意repeat没有设置的话(默认背景图填充全部)将不会生效对应的x,y端
也可以用像素200px 100px 这样的代替 repeat同上

## background-attachment
设置背景图像是否固定或者随着页面的其余部分滚动。
scroll 默认值。背景图像会随着页面其余部分的滚动而移动。
fixed 当页面的其余部分滚动时，背景图像不会移动。
inherit 规定应该从父元素继承 background-attachment 属性的设置

## 一句话写完所有属性
例 background: #ff0000 url(/i/eg_bg_03.gif) no-repeat fixed center;

# 文本属性

px <=0 都会设置为0

要让文字出现重叠效果 

text-indent 缩进

text-align 对齐方式

text-transform 处理文本的大小写

text-decoration 文本装饰，下划线，上划线等

white-space  设置pre后 保留空白及换行 http://www.w3school.com.cn/cssref/pr_text_white-space.asp

# 盒模型

## padding： 上 右 下 左
子div设置padding 若为 x% 则padding实际大小为父div的width*x%
外边距类似内边距，这里我们只讲外边距合并
只有普通文档流中块框的垂直外边距才会发生外边距合并。行内框、浮动框或绝对定位之间的外边距不会合并。

# 定位

一切皆为框
（比如 div）的开头。即使没有把这些文本定义为段落，它也会被当作段落对待：无名框
```
<div>
some text           
<p>Some more text.</p>
</div>
```
## 相对 position: relative; 
相对定位是“相对于”元素在文档中的初始位置
移动的块还是会占据空间

## 绝对定位 position: absolute;
绝对定位使元素的位置与文档流无关，因此不占据空间
绝对定位是“相对于”最近的已定位祖先元素，如果不存在已定位的祖先元素，那么“相对于”最初的包含块。
因为绝对定位的框与文档流无关，所以它们可以覆盖页面上的其它元素。可以通过设置 z-index 属性来控制这些框的堆放次序。

## 浮动
浮动的框可以向左或向右移动，直到它的外边缘碰到包含框或另一个浮动框的边框为止。
clear 属性的值可以是 left、right、both 或 none，它表示框的哪些边不应该挨着浮动框。

# 选择器
## 属性选择器
用[]修饰
`*[lang|="en"] {color: red;}`上面这个规则只会选择 lang 属性等于 en 或以 en- 开头的所有元素，其他分隔符不会应用
## 后代选择器
采用 空格
可以找到很深的子代，而不一定是直接子代
例： ul em{xxx}; 
## 子元素选择器
采用 >
只能是直接子元素
子选择器使用了大于号（子结合符）
## 相邻兄弟选择器
采用 +
可选择紧接在另一元素后的元素，且二者有相同父元素
h1 + p {margin-top:50px;} 选择紧接在 h1 元素后出现的段落，h1 和 p 元素拥有共同的父元素

## 一般兄弟选择器

~

https://developer.mozilla.org/zh-CN/docs/Web/CSS/General_sibling_combinator

## 伪类
采用 ：
用于向某些选择器添加特殊的效果。
```
a:link
input:focus
提示：在 CSS 定义中，a:hover 必须被置于 a:link 和 a:visited 之后，才是有效的。
提示：在 CSS 定义中，a:active 必须被置于 a:hover 之后，才是有效的。
提示：伪类名称对大小写不敏感
p:first-child p元素里面的第一个 

p:nth-child(n+1)
:lang 伪类 
使你有能力为不同的语言定义特殊的规则。在下面的例子中，:lang 类为属性值为 no 的 q 元素定义引号的类型
```

```html
<html>
<head>
<style type="text/css">
q:lang(no)
   {
   quotes: "~" "~"
   }
</style>
</head>
<body>
<p>文字<q lang="no">段落中的引用的文字</q>文字</p>
</body></html>
```
效果：段落中的引用的文字被 ~ 包围

### nth-child(x of selector 语法)

[MDN](https://developer.mozilla.org/zh-CN/docs/Web/CSS/:nth-child#of_selector_%E8%AF%AD%E6%B3%95)

示例：在一个 div 列表中，对应用 test 类的第三个元素设置背景色红色。
```html
<body>
  <div></div>
  <div class="test"></div>
  <div id="item3"></div>
  <div class="test"></div>
  <div></div>
  <div class="test">本元素背景色红色</div>
</body>
```
如果只是简单的写 `.test:nth-child(3){}` ，会错误的匹配到 #item3 元素。

因为 nth-child 的默认匹配规则是：前面选择器匹配到一个元素，再找到该元素兄弟元素列表的某个索引的元素。后面的匹配与前面的选择无关。

如果希望相关，即后面在找兄弟元素列表索引时希望对兄弟列表做个筛选再查，那么可以应用 `nth-child(x of selector 语法)` 语法

示例：
```css
.test:nth-child(3 of .test) {
  background: red;
}
```

该语法某些低版本浏览器不支持，可以通过 js 或者调整 html 结构来解决。

## 伪元素
:first-line 伪元素用于向文本的首行设置特殊样式。p:first-line{}

:first-letter 伪元素 用于向文本的首字母设置特殊样式：

上面两个只能作用于块级元素

":before" 伪元素可以在元素的内容前面插入新内容。

下面的例子在每个` <h1>` 元素前面插入一幅图片：

```css
h1:before
  {
  content:url(logo.gif);
  }
```

> ":after" 伪元素可以在元素的内容之后插入新内容。

# 高级使用
display:block - 把链接显示为块元素可使整个链接区域可点击（不仅仅是文本），同时也允许我们规定宽度。
将 `<li>` 元素规定为行内元素：`display:inline;`

# CSS3
transform 2D 或 3D转换
## 2D
### translate(x,y) 方法
元素从其**当前位置**移动,从左侧移动 x 像素，从顶端移动y像素
### rotate(deg)
rotate(30deg); 元素按自身中心点旋转30度，参数为﹣则逆时针
### scale(x,y)
按照水平线，垂直线进行缩放对应的倍数
### skew(x,y) 方法按照元素的x轴，y轴翻转对应的角度 注意：仍在2D平面内 倾斜会出现平行四边形的效果
与rotate相比 要实现整体旋转的效果 在skew后可能还得修正
### matrix() 方法
## 3D
rotateX / Y   绕 x y轴旋转 3维的
## 过渡
transition: width 2s; 当元素改变宽度时 有2s的过渡时间
transition: transform 2s; 当元素进行转换时有2s的过渡时间
div:hover{将属性改变} 这样当鼠标移动到元素上 就会有效果，移出效果复原 过渡时间一致(默认)
另外还可以定义等待时间，过渡效果时间曲线等
## 动画
先定义
@keyframes myfirst{
0% {}
...
100%{}
}
div{
animation-name: myfirst;
还有一些其他的属性
}

## 多列
### column-count:3; 
### column-gap:40px; 列之间的间隔..|<-40px->|..
如果还设置column-width并且总宽度不够时，column-width会自动调整
### column-rule 属性设置列与列之间的边框宽度，样式和颜色
当column-rule的宽度大于column-gap时，column-rule将会和相邻的列重叠，
甚至有可能延长超出了元素框，从而形成了元素的背景色；
但有一点需要注意column-rule只存在两边都有内容的列之间。
## 用户界面
### Resizing 
规定 div 元素可由用户调整大小：
```
div
{
resize:both;
overflow:auto;
}
```

# 随意补充

## pointer-events

用于阻止元素成为鼠标事件目标。



取值：

1. auto: 默认值，不设置时就是auto的效果，但是存在父元素设置none时，要捕获就得设置成auto(感觉只是为了说明不是none而已)

2. none: 元素不会成为鼠标事件的target。 但若后代元素的pointer-events指定其他值时，鼠标事件指向后代元素，该情况下鼠标事件会在捕获or冒泡阶段触发父代的事件监听器

情况1： 

`<div><button/></div>`

div 设置 none , button设置auto，点击 button 位置，两者都会触发监听器。点击div 非button位置，都不触发。

情况2：

`<parent><child/><button/></parent>`

child 是绝对定位，盖过button。

欲实现触发button不触发child 则：child设置none,parent和button设置auto或不设置。反之什么都不设置即可。

## translateZ

`transform: translateZ(0px)` 实现字体变模糊 