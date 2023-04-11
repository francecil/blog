---
title: vscode配置同步及拓展批量离线安装
date: 2019/07/01 02:00:00
tags: 
  - vscode
  - shell
permalink: /pages/3036b4/
---

## 前言

1. 换电脑后，怎么保持 配置（settings.json,插件,键位设置等）同步？
2. 离线安装拓展？
3. 利用脚本自动进行前面两个步骤

<!-- more -->

## 配置同步

[三分钟教你同步 Visual Studio Code 设置](https://juejin.im/post/5b9b5a6f6fb9a05d22728e36)

## 离线安装拓展

[简单的 VSCode 插件离线安装方法](https://blog.csdn.net/u012814856/article/details/80684376)

安装指令
```sh
# vscode安装目录/bin
# 注意拓展的路径

./code --install-extension xxx/octref.vetur-0.22.6.vsix
```

## 批量下载离线安装包

这个需求的来源是：云桌面不能访问外网但是可以访问宿主机，想要同步宿主机的 vscode 拓展到云桌面环境

可以直接采用 `离线安装拓展` 的做法，但是当拓展多了就很浪费时间。

故主要做的事情就是：
1. 获取并解析 拓展列表 配置文件
2. 根据配置下载安装包

<!--more-->

我们先上最终的操作步骤：

> 为了保证平台统一，我们的操作采用 `git bash`

进入宿主机的 vscode安装目录/bin 下,右键 `Git Bash Here` 执行以下脚本

```sh
# 先创建一个tmp临时目录，安装包都会下到里面
# tr '\n' ' ' 多行转一行
# | sh 将输出进行执行
mkdir tmp;
./code --list-extensions --show-versions | sed -r 's/(.*?)\.(.*?)@(.*)/https:\/\/marketplace.visualstudio.com\/_apis\/public\/gallery\/publishers\/\1\/vsextensions\/\2\/\3\/vspackage -o tmp\/\1.\2-\3.vsix/' | tr '\n' ' ' | sed -r 's/(.*)/curl \1/' | sh
```
安装包下载到 tmp 目录下

在云桌面的 vscode 中，点击 EXTENSIONS 后面的 … 符号，选择 `install from VXIS` 然后选择本地相应的插件包，插入，reload 即可。


> 下面进行详细介绍：

### 一、获取并解析 拓展列表 配置文件

#### 方案0: 直接拿 `配置同步` 时 gist.github 中保存的json

#### 方案1：解析目录并得到列表：

我们可以在以下目录中拿到拓展列表目录，目录名为`${publisher}.${name}-${version}`
```
Windows %USERPROFILE%\.vscode\extensions
Mac ~/.vscode/extensions
Linux ~/.vscode/extensions
```
这个方案是可行的，但是感觉操作有点麻烦，弃

#### 方案2：使用`code --list-extensions`命令

在 vscode 安装目录下的bin目录中执行
```sh
// linux or git shell
./code --list-extensions --show-versions
// windows cmd or powershell
.\code --list-extensions --show-versions
```
可以列出 `${publisher}.${name}@${version}`列表

例如（第一行为命名行操作完的提示，不在实际输出中）：
```sh
[createInstance] extensionManagementService depends on downloadService which is NOT registered.
Andreabbondanza.ignoregit@1.0.1
bpruitt-goddard.mermaid-markdown-syntax-highlighting@1.0.1
dbaeumer.vscode-eslint@1.6.0
```

参考[Command Line Interface (CLI)](https://code.visualstudio.com/docs/editor/command-line)



#### 方案3：使用 vscode npm 包

本想使用 vscode.extensions.all 接口拿到，碰到一些ts相关的问题后放弃了

----

> 最终采用 **方案2**

### 二、根据配置下载安装包 

下载链接为：
```sh
https://marketplace.visualstudio.com/_apis/public/gallery/publishers/${publisher}/vsextensions/${name}/${version}/vspackage
```

假设某个插件配置为
```json
  {
    "metadata": {
      "id": "e337c67b-55c2-4fef-8949-eb260e7fb7fd",
      "publisherId": "Shan.code-settings-sync",
      "publisherDisplayName": "Shan"
    },
    "name": "code-settings-sync",
    "publisher": "Shan",
    "version": "3.1.2"
  },
```
则 下载链接为 
```sh
https://marketplace.visualstudio.com/_apis/public/gallery/publishers/Shan/vsextensions/code-settings-sync/3.1.2/vspackage
```

下载的文件名为 `Shan.code-settings-sync-3.1.2.vsix`

#### 在指定目录下利用 git bash 下载文件

```
curl https://marketplace.visualstudio.com/_apis/public/gallery/publishers/Shan/vsextensions/code-settings-sync/3.1.2/vspackage -O
```
本以为使用 -O （以服务器上的名称保存在本地），下载的文件名是 `Shan.code-settings-sync-3.1.2.vsix`，结果是 `vspackage`

根据 [cURL-将链接保存到文件](http://www.codebelief.com/article/2017/05/linux-command-line-curl-usage/#3) 中得知，

> 注意：使用 -O 选项时，必须确保链接末尾包含文件名，否则 curl 无法正确保存文件。如果遇到链接中无文件名的情况，应该使用 -o 选项手动指定文件名，或使用重定向符号。

另外介绍下 sh 的正则和文本替换
```sh
echo dbaeumer.vscode-eslint@1.6.0 | egrep "(.*?)\.(.*?)@(.*)"
#输出 dbaeumer.vscode-eslint@1.6.0
```
一开始使用 egrep 命令，发现不能直接做替换，后直接采用 sed 命令

```sh
echo 'dbaeumer.vscode-eslint@1.6.0' |  sed -r 's/(.*?)\.(.*?)@(.*)/\1.\2-\3.vsix/'
# 输出 dbaeumer.vscode-eslint-1.6.0.vsix
```

-r 参数表示 sed 开启拓展正则功能

参考 [sed介绍](https://www.cnblogs.com/jcli/p/4088514.html)

**单文件下载的 sh 命令即**
```sh
echo 'dbaeumer.vscode-eslint@1.6.0' | sed -r 's/(.*?)\.(.*?)@(.*)/curl https:\/\/marketplace.visualstudio.com\/_apis\/public\/gallery\/publishers\/\1\/vsextensions\/\2\/\3\/vspackage -o \1.\2-\3.vsix/' | sh
```

结合步骤一

```sh
# 先创建一个tmp临时目录，安装包都会下到里面
# tr '\n' ' ' 多行转一行
# | sh 将输出进行执行
mkdir tmp;
./code --list-extensions --show-versions | sed -r 's/(.*?)\.(.*?)@(.*)/https:\/\/marketplace.visualstudio.com\/_apis\/public\/gallery\/publishers\/\1\/vsextensions\/\2\/\3\/vspackage -o tmp\/\1.\2-\3.vsix/' | tr '\n' ' ' | sed -r 's/(.*)/curl \1/' | sh
```


## 后续

发现有的文件下载下来安装不了，提示 `end of central directory record signature not found`

可能是当前插件所依赖的 vscode 版本较高，要么升级 vscode 要么下载旧版插件

> 可以去 `https://marketplace.visualstudio.com/items/${publisher}.${name}/changelog` 查看版本记录下载旧版本

也有可能需要去 `gallery.vsassets.io` 下载
```sh
https://${publisher}.gallery.vsassets.io/_apis/public/gallery/publisher/${publisher}/extension/${extension name}/${version}/assetbyname/Microsoft.VisualStudio.Services.VSIXPackage
```

sh 命令
```sh
echo 'dbaeumer.vscode-eslint@1.6.0' | sed -r 's/(.*?)\.(.*?)@(.*)/curl https:\/\/\1.gallery.vsassets.io\/_apis\/public\/gallery\/publisher\/\1\/extension\/\2\/\3\/assetbyname\/Microsoft.VisualStudio.Services.VSIXPackage -o \1.\2-\3.vsix/' | sh
```

注意，如果用命令行下载的时候提示：`curl:(92) HTTP/2 stream 1 was not closed cleanly: HTTP_1_1_REQUIRED (err 13)`,需要重新下