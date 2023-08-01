---
title: VSCode 1.79 更新，支持 Markdown 中直接粘贴图片！
date: 2023-06-15 00:16:19
permalink: /pages/2d7c3a/
tags: 
  - 
categories: 
  - 软素质
  - 写作分享
  - 写作
  - VSCode 写作
---

相信大家在使用 VSCode 处理 Markdown 文档时，可能都遇到了一个共同的问题，就是无法直接添加剪切板图片到Markdown 文档中。

我们不得不手动将图片复制到工作区，然后在 Markdown 文档中添加图片引用片段，例如 `![](该图片在工作区的相对地址)`。

以前，我们可以通过插件如 `Markdown Paste` 或者 `Paste Image` 来解决这个问题。但现在，你不再需要了，因为 VSCode 1.79 版本已经内置了这样的功能。

<!-- more -->

本文将重点介绍以下内容：
1.  VSCode 新功能介绍
2.  功能使用配置
3.  能力对比


# VSCode 新功能介绍

VSCode 在 2023.05 发布了 [1.79 版本](https://code.visualstudio.com/updates/v1_79)，提供了一项名为 **[Automatic copy of external files](https://code.visualstudio.com/updates/v1_79#_copy-external-media-files-into-workspace-on-drop-or-paste-for-markdown)** 的新功能，当用户使用拖拽或粘贴将外部媒体文件（比如图片、音视频）放置到 Markdown 文档上时，VSCode 会自动复制一份文件到工作区，并在 Markdown 文档中插入相应的图片引用片段。

以下是一个图片拖拽的例子：
![Coping-a-file-into-the-workspace-by-drag-and-dropping-it.gif](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3926731cddcf470b8aa30c1aadcbf1bf~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp?)

当然，剪贴板图片也同样可用，包括系统复制或者工具截图。你可以在 Markdown 文档中执行粘贴操作，VS Code 将从剪贴板数据中创建一个新的图像文件，并插入一个指定新文件的 Markdown 图像链接。

图片默认存放目录与粘贴该图片的 Markdown 文件同级，插入的 Markdown 片段如下(假设图片名为 `image.png`)：
```markdown
![Alt text](image.png)
```

除了图片，新功能还支持音频和视频，会生成 `<audio>` 和 `<vidoe>` 的 Markdown 片段。为了简单起见，本文只讲图片。

# 功能使用配置

某些情况下我们可能需要调整该功能的默认行为，包括：
- 自定义存放目录
- 重命名
- 重名覆盖
- 功能关闭

为方便后续配置介绍，我们建立一个名为 myProject 的项目，项目的绝对路径假定为 `/User/me/myProject`。

并建立如下的项目结构：
```
--docs
----api
------README.md
--assets
```


## 自定义存放目录

由 `markdown.copyFiles.destination` 配置控制图片文件的存放目录。

```json
    "markdown.copyFiles.destination": {
        "/docs/api/**/*": "${documentWorkspaceFolder}/docs/images/"
    }
```

该配置是一个对象，key 使用 Glob 语法，表示匹配的 Markdown 文档；value 则表示所匹配的这些 Markdown 文档，它们的图片文件存放目录，可以使用一些简单的变量。

-   `${documentFileName}` — Markdown 文档的完整文件名，比如 `README.md`
-   `${documentBaseName}` — Markdown 文档的基本文件名，比如 `README`
-   `${documentExtName}` — Markdown 文档的拓展名，比如 `md`
-   `${documentDirName}` — Markdown 文档的上级目录名词，比如示例的 `api`
-   `${documentWorkspaceFolder}` —  Markdown 文档工作区路径，比如示例的 `/Users/me/myProject`。如果 Markdown 文档不是工作区的一部分，则该值与 `${documentDirName}` 相同
-   `${fileName}` — 被拖拽或粘贴的图片文件名，比如 `image.png`

常见的图片存放目录有这两种：
1. 与当前 Markdown 文档同级并新建目录
2. 工作区固定目录统一管理图片


### 1. Markdown 同级目录（假设为 images）

VSCode 配置：
```json
    "markdown.copyFiles.destination": {
        "**/*": "images/"
    }
```
项目结构
```
--docs
----api
------images
--------image.png
------README.md
```
markdown 插入内容
```markdown
![Alt text](images/image.png)
```

### 2. 工作区固定目录（假设为 `工作区目录/assets`）

VSCode 配置：
```json
    "markdown.copyFiles.destination": {
        "**/*": "${documentWorkspaceFolder}/assets/"
    }
```
项目结构
```
--docs
----api
------README.md
--assets
----image.png
```
markdown 插入内容
```markdown
![Alt text](../../assets/image.png)
```

## 重命名

`markdown.copyFiles.destination` 配置字段也可以用于图片重命名。

当配置以 "/" 结尾时，VSCode 会将其视为目录，并在原始文件名前拼接该路径作为新的文件路径。但如果结尾没有 "/"，VSCode 将其视为准确的文件路径。

以下面配置为例：
```json
    "markdown.copyFiles.destination": {
        "**/*": "images/custom-${fileName}"
    }
```
如果原始图片名为 "image.png"，生成的图片名将是 "images/custom-image.png"。

目前，配置支持类似于 [片段语法（snippet syntax）](https://code.visualstudio.com/docs/editor/userdefinedsnippets#_snippet-syntax)  的正则表达式变量替换语法，但其功能相对有限，缺少了内置变量和转换器。GitHub 上有个 [issue](https://github.com/microsoft/vscode/issues/183560) 就是关于时间戳重命名的，如果官方解决的话意味着需要支持完整的片段语法。
```json
    "markdown.copyFiles.destination": {
        "/docs/**/*": "images/me.${fileName/(.*)\\.(.*)/$2/}"
    }
```
> 如果粘贴的图片是 `test.jpg` ，那么新的图片路径为 `images/me.jpg`

因此，就目前来说，可以理解为重命名功能受限，无法实现更复杂的编码转换等需求。



## 重名覆盖

如果出现重名（通常出现在截图，图片名始终为 `image.png`），**默认不会覆盖，而是修改图片名词后缀并进行自增。**

比如出现的重名是 `image.png`，那么新图片名词为 `image-1.png`

如果希望重名覆盖，可以配置 overwriteBehavior 字段

```json
"markdown.copyFiles.overwriteBehavior": "overwrite"
```


## 功能关闭

此项功能默认开启，如果觉得干扰，也可以配置 copyIntoWorkspace 字段进行关闭


```json
// 拖拽行为
"markdown.editor.drop.copyIntoWorkspace": "never"
// 粘贴行为
"markdown.editor.filePaste.copyIntoWorkspace": "never"
```


# 能力对比

将内置能力和 Markdown 图片粘贴插件放一起进行对比，顺便也做下内置能力的总结。



|  | 基础能力 | 自定义存放目录 | 重命名 | 重名覆盖 | 拓展能力 | 维护性 |
| --- | --- | --- | --- | --- | --- | --- |
| 内置 | ✅ | ✅ | 弱，支持简单替换 | ✅ 支持自动增加后缀避免覆盖 | - 支持 audio 和 video 的粘贴 <br/> - 支持拖拽 | 新功能 |
| [Paste Image](https://marketplace.visualstudio.com/items?itemName=mushan.vscode-paste-image) | ✅ <br/> 注意粘贴命令用的是 `Ctrl+Alt+V` / `Cmd+Option+V` | ✅ | ✅ <br/> 支持多种方式，自动、手动 | 出现覆盖提示，默认使用时间戳命名基本不会重名 | - | 停止维护 |
| [Markdown Paste](https://marketplace.visualstudio.com/items?itemName=telesoho.vscode-markdown-paste-image) | ✅ <br/> 注意粘贴命令用的是 `Ctrl+Alt+V` / `Cmd+Option+V` | ✅ | ✅ 同上 | 同上 | - 支持 HTML 内容和富文本转化为 Markdown 片段 <br/> - 支持 base 图片内联 | 持续维护，[Paste Image](https://marketplace.visualstudio.com/items?itemName=mushan.vscode-paste-image) 的增强版 |

> **基础能力**指的是支持粘贴图片到工作区，并自动生成 Markdown 的语法片段。


整体对比下来，[Markdown Paste](https://marketplace.visualstudio.com/items?itemName=telesoho.vscode-markdown-paste-image) 插件功能最为强大，缺点就是需要额外安装，以及和系统默认不一致的粘贴快捷键。

# 使用建议 

如果没有重命名的需求，使用内置功能就足够了。

但如果你希望自动重命名，例如使用时间戳替换原始文件名，那么你可以使用 [Markdown Paste](https://marketplace.visualstudio.com/items?itemName=telesoho.vscode-markdown-paste-image) 插件。由于两者的粘贴快捷键不同，实际上你也可以同时使用它们。

> 请考虑在正常项目中是否真的需要进行重命名。

不过 VSCode 内置能力也在不断迭代，后续估计是能彻底取代 `Markdown Paste`

# 总结

本文介绍了 VSCode 1.79 新增的图片粘贴功能，现在不再需要依赖插件就能将图片插入 Markdown 文档中。

接下来提供了常见的功能使用配置，包括`自定义存放目录`、`重命名`、`重名覆盖` 以及 `能力关闭`等选项。

最后，对比了内置功能和其他插件的能力，并得出结论：`Markdown Paste` 插件的能力最强，但在大多数情况下，内置功能已经足够使用。
