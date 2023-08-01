---
title: 使用 VSCode 管理 Markdown 笔记，还有必要吗？
date: 2023-06-09 14:21:00
permalink: /pages/4d9852/
tags: 
  - 
categories: 
  - 软素质
  - 写作分享
  - 写作
  - VSCode 写作
---

在 201x 年的时候，使用 VSCode 编写 Markdown 笔记，是一件很极客很酷的事情。

轻敲 Markdown 语法，即可生成还不错的格式；使用 VSCode 以及强大的插件系统，可以得到一个免费强大离线化的 Markdown 编辑器。

但在 2023 年的今天，我们发现除了给项目写 README 文件，好像很少人会单独使用 VSCode 来写 Markdown 笔记了。

<!-- more -->

尝试从上手成本、编写体验、管理能力三个方向来分析：
1. VSCode 上手成本太高：如果只是简单编写和展示，VSCode 的 Markdown 默认能力是支持的。但如果想要增强功能（比如支持流程图、思维导图等）、优化编写体验（比如粘贴上传、可视化工具栏等），就需要去安装各种插件，尝试各种配置，踩各种坑，才能实现目的。人的时间宝贵，真不如直接使用各种在线文档（飞书文档、腾讯文档、Notion 等）或者笔记软件（印象笔记、Obsidian 等）。
2. Markdown 编写体验不佳：现在更流行的是 Notion 这种 `编辑即所得` 的编写方式，体验比 Markdown 编辑器这种「左侧编写、侧边预览」的体验更好。同时 Notion 等类型软件也能导出 Markdown 原数据，还支持更丰富的编辑区块，对纯 Markdown 软件来说就是降维打击。
3. 笔记管理能力太弱：包括数据同步和分类索引。如果要做数据同步，我们需要创建 Git 仓库，配合 GitHub 等服务来进行同步；如果要支持分类和标签，我们可能还得引入博客工具，搭建在线博客服务才能进行索引。而这些能力，常见的笔记工具都提供了，且大多数免费。

那么，如今我们是否还有必要学习 Markdown 语法，写 Markdown 笔记？以及是否还有必要使用 VSCode 来管理笔记？

本篇文章就来回答这两个问题，方便笔记软件选型，纯个人见解，欢迎讨论。

<!-- more -->

# 1. 是否还有学习 Markdown 语法的必要？

先说我的观点：需要了解基础语法，但相对复杂的比如 `表格、数学公式、mermaid 图表` 等无需了解，永远交给工具来自动生成

## 1.1 为什么需要了解基础语法

基础语法的定义是什么？常用且简单，比如
- 分级标题 `#`
- 加粗 `**`
- 链接 `[]()`
- 行内代码 `` ` ``
- 代码块 `` ``` ``
- 引用 `>` 
- 有序列表 `1.` 和无序列表 `-`

基本每篇 Markdown 文档都会含有的元素

为什么要了解？因为**高效**，相比点击工具栏图标，直接手敲语法字符更快，同时保持连续编辑状态不会有**打断**和**跳脱感**。Notion 等主流笔记软件也基本兼容 Markdown 语法。


当然你也可以使用快捷键达到相同的目标，但由于各家笔记软件的快捷键标准并不统一，有些还不支持（原生 VSCode），因此个人还是推荐了解并手敲基础语法。

除此之外，研发人员经常需要给项目编写 README 和 SDK 文档，直接使用 VSCode 编辑可没有笔记软件那些操作功能。

## 1.2 为什么不需要了解复杂语法

复杂语法是什么？不常用，很难写，很难记。每个人认为的复杂语法可能不一样，对我来说，表格就是复杂语法了。



为什么不需要了解？有以下两点：
1. 记忆成本：我将近 10 年的 Markdown 使用经验，但也常常忘记表格和数学公式
2. 编写成本：**慢、不直观、易出错**，不如直接使用工具

那么，有哪些工具可以帮忙生成复杂语法呢？

### 1.2.1 万能的 ChatGPT

正常描述需求，让它提供 Markdown 语法。

比如让他生成一个表格：

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a9fe7a986ca842979dae3cd943cc60f1~tplv-k3u1fbpfcp-watermark.image?)

如果不知道怎么描述，可以先这样问它：
```
假设我是 ChatGPT，你想让我生成 Markdown 语法表格，你会怎么描述
```



### 1.2.2 在线工具

使用 ChatGPT 进行对话描述，有时候效率太低，我更喜欢使用在线工具

1. [Markdown 表格在线生成](https://www.tablesgenerator.com/markdown_tables)
![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/bba38423b1b44e818542289f7ee8a723~tplv-k3u1fbpfcp-watermark.image?)
2. [Markdown 数学公式在线生成](https://editor.codecogs.com/)
![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e09ced69f31e42ddbfbe07fb58024e5c~tplv-k3u1fbpfcp-watermark.image?)
  还提供图片渲染地址，比如 `https://latex.codecogs.com/svg.image?\int_{a}^{b}` ，将渲染为：
![](https://latex.codecogs.com/svg.image?\int_{a}^{b})
3. [mermaid 在线编辑](https://mermaid.live/edit)
![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/14cfe9b54cba4ec4b47c4718eb233468~tplv-k3u1fbpfcp-watermark.image?)
不支持可视化操作，需要了解并编写语法。暂未找到支持可视化编辑 mermaid 图表的工具，因此我更偏好于使用 ChatGPT
![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f4930a7c9a584095a4dc256b790d2529~tplv-k3u1fbpfcp-watermark.image?)


# 2. 是否还有使用 VSCode 管理笔记的必要？

先说我的观点：
1. 大多数人没必要使用 VSCode ，而是使用现成的笔记软件比如 Obsidian 等，更好用更强大，也支持数据导出。如果想快速对外分享，可以尝试 Notion、飞书文档；如果想定制站点样式，可以尝试 Notion、Wordpress 等。
2. 少数有完全自定义并部署博客的需求（通常是前端研发同学），那就可以使用 VSCode 来管理。
3. 在如今降本增效的今天，把时间花在更有意义的事情上。

本文不做笔记软件的推荐，读者可以根据自己的诉求选择合适的软件。

我个人常用的是飞书文档，也自己搭了一个[博客站点](http://www.gahing.top/)，有一些 VSCode 管理 Markdown 笔记的经验。

分享几个不错的 VSCode 拓展：
1. [Front Matter CMS](https://marketplace.visualstudio.com/items?itemName=eliostruyf.vscode-front-matter)（强烈推荐）: 像 CMS 一样管理自己的本地 Markdown 笔记。提供了 3 个很强大的功能：front-matter 可视化编辑、类似 CMS 的本地预览、Markdown 工具栏，详情查看官方文档。
2. [Foam](https://marketplace.visualstudio.com/items?itemName=foam.foam-vscode)：支持笔记图谱、双链笔记、卡片写作等等。少数派有一篇文章[介绍了如何使用 Foam 来管理双链笔记](https://sspai.com/post/70956)，感兴趣可以看看。

# 总结

本文讨论了在笔记软件盛行的今天，是否还有使用 VSCode 管理笔记的必要。

总结一下观点：
1. 需要了解 Markdown 基础语法，可以帮助提效，但复杂语法始终交给工具生成
2. 大多数情况下不应该使用 VSCode 来管理笔记，如果仍有这个述求，本文也提供了两个不错的 VSCode 拓展

最后，重要的不是工具，而是内容和思维方式，不能因噎废食。