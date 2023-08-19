---
title: LearningHTML
date: 2017-02-14 17:11:23
permalink: /pages/b48438/
categories: 
  - 大前端
  - 前端基础
  - 编程语言
  - HTML
tags: 
  - 
titleTag: 笔记
---

# 标签

可以在 `<abbr>` 标签中使用全局的 title 属性，这样就能够在鼠标指针移动到 `<abbr>` 元素上时显示出简称/缩写的完整版本

`<area>` 设置到图像的映射，`<img>` 设置`usemap="planetmap" alt="xxx"` `<map name="planetmap" id="planetmap">`

`<article> <aside>` H5 名字上的意义而已
## `<button> `

控件 与 `<input type="button">` 相比，提供了更为强大的功能和更丰富的内容。
`<button>` 与 `</button>` 标签之间的所有内容都是按钮的内容，

其中包括任何可接受的正文内容，比如文本或多媒体内容。
例如，我们可以在按钮中包括一个图像和相关的文本，
用它们在按钮中创建一个吸引人的标记图像。
请始终为按钮规定 type 属性。Internet Explorer 的默认类型是 "button"，
而其他浏览器中（包括 W3C 规范）的默认值是 "submit"。
## `<del>`

请与 `<ins>` 标签配合使用，来描述文档中的更新和修正。

## `<embed>` H5 使用范畴?
## `<output>`
```html
 <form oninput="x.value=parseInt(a.value)+parseInt(b.value)">0
<input type="range" id="a" value="50">100
+<input type="number" id="b" value="50">
=<output name="x" for="a b"></output>
</form>
```

IE不支持

## `<pre>`
pre 元素可定义预格式化的文本。被包围在 pre 元素中的文本通常会保留空格和换行符。而文本也会呈现为等宽字体。
`<pre>` 标签的一个常见应用就是用来表示计算机的源代码。
## `<progress>`

H5标签 用于显示进度条

## `<q>` 短引用 用"代替 `<blockquote>` 长引用 有外边距
## `<sub>` 下标 `<sup>`上标 用于数学符号
## `<wbr>`
Word Break Opportunity (`<wbr>`) 规定在文本中的何处适合添加换行符。
H5标签 IE不支持


# 全局属性
contenteditable H5 设置元素是否可编辑，大部分浏览器(包括IE8)都支持

accesskey  属性规定激活（使元素获得焦点）元素的快捷键。几乎所有浏览器均 accesskey 属性

`data-*` H5 属性用于存储页面或应用程序的私有自定义数据。

`<p hidden>这个段落应该被隐藏。</p>` H5  不会占位置 等待用js设置其可见

tabindex `<element tabindex="number">` 属性规定元素的 tab 键控制次序（当 tab 键用于导航时 

# 事件

onmousemove	script	当鼠标指针移动到元素上时触发。
onmouseout	script	当鼠标指针移出元素时触发。

## onmouseup 属性在松开鼠标按钮时触发。

提示：相对于 onmouseup 事件的事件次序（限于鼠标左/中键）：
```
onmousedown
onmouseup
onclick
onmouseup 事件的事件次序（限于鼠标右键）：
onmousedown
onmouseup
oncontextmenu
```
## onMouseover 和 onMousemove 有什么区别?
区别是进入后onmousemove鼠标每动一下都会执行事件，onmouseover只在鼠标进入时执行一次
```
clientX / clientY：// 触摸点相对于浏览器窗口viewport的位置  参照点会随着浏览器的滚动而变化
pageX / pageY：// 触摸点相对于页面的位置  参照点不会随着浏览器的滚动而变化
screenX /screenY：// 触摸点相对于屏幕的位置 
```
所以如果要算鼠标在当前div的相对位置 

通过获取var offset = $("#mainScreen").offset();后

当前鼠标的绝对位置要用pageX/Y去拿 否则浏览器页面滚动后会少算一段

## 键盘事件 keyup

可以绑定任何元素，但事件仅发生到获取焦点的元素，

由于不同浏览器可获取焦点的元素略有不同，但是表单元素总能获取焦点

所以一般是绑定表单元素，或者全局 document 上

[.keyup()](https://www.jquery123.com/keyup/)