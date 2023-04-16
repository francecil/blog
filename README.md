## 项目介绍

这是 gahing 的个人博客，记载大学之后的所有笔记。 在线访问：[https://gahing.top](https://gahing.top)

### 其他博客

用过的其他博客平台，早期写的文章可能没有同步过来

- [CSDN](https://blog.csdn.net/u011644423/)
- [cnblogs](https://www.cnblogs.com/france/)
- [掘金](https://juejin.im/user/59818c62f265da3e3a0bdbf0)
- [West2Online](https://www.hongweipeng.com/index.php/author/8/)

### 微信公众号

![WeChat](https://upload-images.jianshu.io/upload_images/9277731-591f9a53b8acf2c1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/620)


## 项目说明

博客基于 vuepress + vdoing 搭建，有二次修改

### 目录说明
- vdoing: [vdoing 主题源码](https://github.com/xugaoyi/vuepress-theme-vdoing-doc)的二次修改
- docs: vuepress 文档目录，包含 vueprees 基础配置和博客文档原文件
- utils: 一些用于批量处理文章的工具函数

### 文件规范

- 以 _ 开头的文件夹，将忽略其及底下文件生成文档
- 以 _ 开头的 markdown 文件，允许生成文章，但是会被表示为「草稿」，不在文章列表页展示
- 随笔文章放在 `docs/_posts` 目录下，无具体分类，随感而发
- 若文章为某个专题（比如算法）但是不想再首页展示，可以将顶部的 frontMatter 的 titleTag 标记为 「专题」