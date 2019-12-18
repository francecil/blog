## seo 优化
head, 语义化 ,图片加 alt，spa 采用 ssr

## webpack打包优化
外部引入 externals
模块化引入
DLLReferencePlugin 配置单独打包的模块 

## sass 和 less 区别
前者支持条件；变量符号 $ 后者用 @

## css3 的 gpu加速
创建独立图层渲染
transform，opacity，filter，will-change  字体锯齿问题

## shadow dom 是什么
dom css 规则只作用于绑定的 dom ，有封装的作用

## 清除浮动
末尾加块状元素，设置 clear:both;
父容器使用 after 伪元素，设置看不见的块元素
bfc
br 标签 clear="all"

## 埋点与错误监控
全埋点，代码埋点（封装一套sdk）

## 如何高效地从1000个div中删除10个div
单独抽出一个层（display none 或者 css3）,现在的渲染引擎可能优化了，

## 如何在移动端处理兼容性
自动播放，移动端点透问题，click 300 ms

## babel 转码流程
Parser 解析成 AST -> Traverse 遍历AST + Transformer 转换 AST -> Generator AST 转源代码

## 实现一个三栏布局
float flex

## websocket原理
http的升级,通讯在一次 tcp 连接中 

## BFC 的应用
清除浮动，块级元素的外边距塌陷，自适应布局

## proxy
Proxy 可以直接监听对象而非属性,很方便的监听数组变化

## Generator 函数
类似状态机，next 控制迭代 并执行操作

## 迭代器