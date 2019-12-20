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
## ali
讲一个最有难度的项目 (企业环网,简单说这就是一个帮助企业用户配置不同分部之前的内网通信规则。)
 追问：有哪些功能，负责什么模块
 追问：做了哪些体验优化
 追问：pv 多少
 追问：首屏加载时长
vue 和 react 的区别 （基于依赖的响应式 vs 不可变数据；render 处理不同）
虚拟dom用来解决什么问题，性能和设计两方面回答（性能上解决操作dom引发的回流重绘问题，设计下将组件识别为vnode，让节点具有明确的语义，方便domdiff）
react hooks 解决了什么问题
讲讲 vue 原理 (模板解析，响应式，渲染)
 追问：模板解析过程
 追问：模板解析的核心是什么 （构建 vdom -> diff -> patch）
从输入 url 到页面渲染的过程()
 追问：哪些地方可以做优化，归类
 （基本优化：资源压缩，缓存控制，域分片
   图像：分层及懒加载，特定图像优化，图像内联
   js：js合并，js异步
   其他：cdn，预解析，预加载，http2）
csrf 是什么？不是说 cookie 隔离的么，为什么其他页面发请求会带上
（浏览器Cookie策略针对的是同源页面可以获取，没有说非同源页面发请求不能带上，如果不能带的话，像单点登录就做不了了）
settimeout ，promise，async/await 区别
 追问：事件循环有哪些任务源 （网络，定时器，history，用户交互事件，DOM 操作）
 追问：以什么优先级取任务源 （3/4概率拿交互任务源）
后端项目，用的什么框架
  express 的中间件原理，源码 （本质就是回调队列，next 执行）
egg 用过么

## vue 原理

创建渲染函数，挂载在观察者 Watcher 中，执行渲染函数时，触发了响应式数据的getter方法，对观察者进行依赖收集，响应式数据变动时通知所有观察者进行更新，此时观察者 Watcher 会触发组件重新渲染，生成一个新的 VDOM Tree，然后 Diff，更新到真实 DOM