## 博客介绍

这是 gahing 的个人博客，记载大学之后的所有笔记。 在线访问：[https://www.gahing.top](https://www.gahing.top)

### 其他博客

- [掘金](https://juejin.im/user/59818c62f265da3e3a0bdbf0)
- [知乎](https://www.zhihu.com/people/zheng-jia-xing-4)
- [DEV.to](https://dev.to/francecil)
- [CSDN](https://blog.csdn.net/u011644423/): 不再更新
- [cnblogs](https://www.cnblogs.com/france/): 不再更新
- [West2Online](https://www.hongweipeng.com/index.php/author/8/): 不再更新

### 微信公众号

![WeChat](https://cdn.jsdelivr.net/gh/francecil/cdn-resouce/uploads/9277731-591f9a53b8acf2c1.webp)


## 项目说明

博客基于 vuepress + vdoing 搭建，有二次修改

### 目录说明
- vdoing: [vdoing 主题源码](https://github.com/xugaoyi/vuepress-theme-vdoing-doc)的二次修改
- docs: vuepress 文档目录，包含 vueprees 基础配置和博客文档原文件
- utils: 一些用于批量处理文章的工具函数

核心为博客原文档，存放在 docs 目录下，及时后续更换博客框架，也只需调整目录结构而已

## 博客结构

为了不耦合博客框架，我们基于文件目录来决定一篇文章的分类，基于自定义 frontMatter 字段来决定一个页面的文章类型。

TL;DR:
- 按目录自动生成分类
- frontMatter 的 article 取值 false ，则页面仅在「导航栏目录页」中展示
- frontMatter 的 titleTag 取值「专题」、「草稿」、「卡片」、「归档」 ，则页面不在「文章列表页」中展示，同时以 `_` 开头的 Markdown 文件会被自动视为草稿文章

### 1. 分类设计

一篇文章按分类可以分为**随笔文章**和**主题文章**，随笔文章无固定主题，或者说不好归类到某个主题。

- 随笔文章需要放到 `_posts/年份` 目录下，其得到的分类为 `随笔、年份` 两个
- 主题文章需要找到相应的专题目录下（如未合适目录则新建），比如目录 `01.大前端/01.前端基础/编程语言/CSS` 下新增文章，则这篇文章的分类为 `大前端、前端基础、编程语言、CSS` 等四个分类

> 注：有时候一篇文章可能满足同时存放在多个分类，但只能选择最贴切的那个

### 2. 类型设计

- 页面类型分为**文章**和**非文章**，**非文章**即「个人介绍、友链」等类型的页面，文章可进一步分为`普通文章、专题文章、草稿文章`。
- 页面类型关注的是入口展现，共有`列表页、分类侧边栏、导航栏目录页`三种展示入口，不同类型的页面有不同的展现要求。

非文章仅会在`导航栏目录页`中展示，可通过在 markdown 中标识 frontMatter 的 `article` 字段为 `false` 来指定页面非文章，此时将不再生成分类，也不会在文章列表页中展示入口。

关于文章类型，有些文章比如基础知识类文章、草稿未完稿文章等不适合在博客文章列表中展示，应该仅在分类侧边栏、导航栏目录页中展示。对于这类场景，可通过在 markdown 中标识 frontMatter 的 `titleTag` 字段为 `专题`、`草稿`、`卡片` 来指定文章类型。当 titleTag 为这两个值的其中之一时，文章不会在文章列表中展示，同时在「文章详情页」和「导航栏目录页」会显示 tag 样式

> 注：以 `_` 开头的 markdown 文件会被自动视为草稿文章，故可通过文件命名来自动生成 titleTag ，后续如果修改文件名去掉 `_` 前缀也会自动去除 titleTag

### 3. 临时目录

以 _ 开头的文件夹，将忽略其及底下文件生成页面，适合暂不对外展示的内容

### 4. 额外说明

可以在任意目录使用 `README.md` 文件来进行额外说明，该文件不会参与博客产物打包。

## 开发说明
```sh
# 安装依赖
yarn
# 本地开发
yarn dev
```

目前 vdoing 采用子目录安装依赖的方式（暂未使用 monorepo），安装依赖的方式为：
```sh
yarn add ./vdoing
```