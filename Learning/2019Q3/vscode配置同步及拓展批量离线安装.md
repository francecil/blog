## 前言

1. 换电脑后，怎么保持 配置（settings.json,）同步？
2. 离线安装拓展？
3. 利用脚本自动进行前面两个步骤


## 配置同步

[三分钟教你同步 Visual Studio Code 设置](https://juejin.im/post/5b9b5a6f6fb9a05d22728e36)

## 离线安装拓展

[简单的 VSCode 插件离线安装方法](https://blog.csdn.net/u012814856/article/details/80684376)

## 批量下载离线安装包

这个需求的来源是：云桌面不能访问外网但是可以访问宿主机，想要同步宿主机的 vscode 拓展到云桌面环境

可以直接采用 `离线安装拓展` 的做法，但是当拓展多了就很浪费时间。

故主要做的事情就是：
1. 获取并解析 拓展列表 配置文件
2. 根据配置下载安装包 

我们先上最终的操作步骤：

为了保证平台统一，我们的操作采用 `git bash`


> 下面进行详细介绍：

### 获取并解析 拓展列表 配置文件

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

例如：
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

### 根据配置下载安装包 

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
本以为使用 -O （以服务器上的名称保存在本地），下载的文件名能变成 `Shan.code-settings-sync-3.1.2.vsix`，结果是 `vspackage`

