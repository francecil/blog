---
title: vuepress踩坑记录
date: 2023-04-12 02:19:49
permalink: /pages/9e54dd/
tags: 
  - 
categories: 
  - 闲言碎语
  - 服务搭建
  - 博客
---


## 1. 双大括号中的代码会被编译成模板取值

示例，文档中写了如下的代码引用，会导致 vuepress 解析并报错
```
`{{options}}`
```

## 2. `<details>` 代码块无法正常使用

需要改用 `::: details xxx`

## 3. `<s>` 多行无法正常使用

示例，如下代码将导致文档无法正常解析
```html
<s> 是是

是是</s>
```

## 4. 图片资源路径问题

两种情况会出现问题：
1. 引用的图片如果不以 `./` 或者 `../` 开头
2. 路径中包含URL 非法字符，比如中文字符

问题原因简述：
1. 问题1：webpack `url-loader` 的问题，没有正常处理相关路径图片引用。
2. 问题2：产物没有做 URL 编码，但引用路径却是编码过的，导致文件没找到。

一种解决方案是调整打包配置，具体可以看 [Vuepress 图片资源中文路径问题](https://segmentfault.com/a/1190000022275001)

还有另一种思路：保证粘贴的图片一定是相对路径引用，并且编码正确。需要用到 VSCode 1.79 版本更新的[图片粘贴功能](https://juejin.cn/post/7244809769794289721)。VSCode 配置如下：
```json
"markdown.copyFiles.destination": {
    "/docs/**/*": "${documentWorkspaceFolder}/docs/@assets/img/image.${fileName/(.*)\\.(.*)$/$2/}"
}
```

> 测试下 `![一张工作区图片](../../../@assets/img/image.jpeg)` => ![一张工作区图片](../../../@assets/img/image.jpeg)