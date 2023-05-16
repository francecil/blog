---
title: monorepo学习
date: 2022-05-06 20:40:35
permalink: /pages/d2e57e/
categories: 
  - 大前端
  - 工程能力
  - 工程管理
  - monorepo
tags: 
  - 
titleTag: 草稿
---
https://mp.weixin.qq.com/s/PIdmJ2cHmq9QBj6MBJ9ygQ



## 使用 yarn + workspace 时的踩坑记录

背景：一个 yarn + workspace 的项目，里面包含了一些工具包和业务包（ts构建）；工具包可以对外发布，也可以由业务包引用；
希望达到的效果：运行业务包时，采用源码引用的方式引用工具包，避免改动工具包代码还得重新构建或者新开终端去进行热更新。想到的实现方式有：业务包里面直接引入工具包源码路径，或者配置下 alias 
但是网上说这个方式很精分，包不像包源码不像源码。关于这个你怎么看？
> 后续决定就当成纯粹的包，仅采用产物引用方式

如果想当其为纯粹的包，采用产物引用的方式去引用工具包（业务包里面引入的是工具包的编译产物）；但这种方式就有一个包提前构建的环节，新同学下载项目用跑业务包，还需要先把工具包编译下。想到的解决方案是监听 install 钩子，编写脚本去编译工具包。感觉还是有点麻烦，我看你们的 pnpm monorepo 有个 prepare 钩子，试了下 yarn workspace 的好像不能生效。
> 自己去写脚本进行 build 是有问题的。可能子包之间是有依赖关系的；自己去做依赖分析是不靠谱的，而 lerna 帮忙做了这个处理
> 可以看这个 issue 的讨论 https://github.com/yarnpkg/yarn/issues/3911
> install 的时候会触发顶层 monorepo 的 prepare 脚本，此时再调用 `lerna run prepare` （不要用 yarn 的），那么子仓库有该脚本的都会去执行

如果也做了预先打包，那远程仓库代码变更，本地拉取后由于未重新打包，可能会存在一些问题（比如本地测试认为没问题了，但实际上线是不一致的）。关于这块有什么建议不？
> 改成业务启动调试时，通过 `lerna run --sort compile` 命令对通用包进行编译

### 推荐方案
顶部配置
```
"dev": "npm run compile && lerna run --parallel dev --max-buffer 99999999",
"compile": "lerna run --sort compile",

// 子包配置 
"compile": "yarn build",
```

## node monorepo 实践

https://juejin.cn/post/6983908579904323598


### 方案：业务 package 打包时取消 monorepo 特性

1. 将项目 yarn.lock 文件复制至业务 package
2. 删除项目根目录的 `package.json` 文件，取消 yarn monorepo 状态
3. 业务 package 开始安装依赖
4. 业务 package 执行打包指令

缺点：？


### 方案：通用 package 发包 + 业务 package 安装已发包的 通用 package 依赖

在顶层 `yarn install` 之后，还需要进入对应业务 package 执行添加通用 package 的指令

```sh
lerna exec \
--scope @biz-project/server \
-- npm install @me/lib-common
```


缺点：
- 只能绑定 npm 包版本
- 打包脚本难以维护

### 方案：通用 package 打包，并转移至业务 package 的 node_modules 中

yarn-workspace-isolator

## 子 package 安装不同版本，顶部 yarn.lock 是怎么组织的？

## Monorepo-node 测试仓库，带各种环境

## lerna 指令

http://www.febeacon.com/lerna-docs-zh-cn/routes/commands/

lerna clean:	从所有包中删除node_modules目录

```sh
# 删除除了 @p/a 包之外其他包的 node_modules
lerna clean --ignore @p/a --yes
```

lerna publish 发包，会记录

lerna 发包原理：
- https://zhuanlan.zhihu.com/p/392438222