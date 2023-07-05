---
title: 关于 lockfile 合并冲突的问题分析与最佳实践
date: 2023-07-05 17:15:05
permalink: /pages/e261ca/
categories: 
  - 大前端
  - 工程能力
  - 工程管理
  - npm
tags: 
  - 最佳实践
sticky: true
---


某次前端需求开发中，新增了一个 npm 包，在进行合码时发现 `lockfile` 出现冲突。

> lockfile，即包管理工具的 lock 文件，比如 `package-lock.json` 、`yarn.lock` 、`pnpm-lock.yaml`

  


手动解冲突非常低效，又容易出错。以下是几种常用的解决方案：

1.  删掉 lockfile，后面再重新安装依赖
2.  重置为其中一个分支的 lockfile，后面再重新安装依赖
3.  运行依赖安装命令，利用包管理工具自带的机制修复 lockfile 冲突


方案 1 会丢失 lock 记录，通常不会选择。

**那方案 2 和方案 3 可行么？需要注意什么问题？** 本文将对这些问题进行讨论，并在最后给出**最佳实践**。

> 如果不想关注细节，也可以滑到最后直接查看「最佳实践」。

<!-- more -->


在此之前，我们先来讲讲什么情况下会出现 lockfile 合并冲突。

# lockfile 合并冲突的原因

Git 合并出现冲突的原因在于两个分支版本对**一个文件**的**同一区域**做了修改。如果是不同区域，Git 会尝试自动合并（auto-merge，默认策略）解决冲突。

> 如果对 Git 合并冲突不熟悉，可以先看 [How to Resolve Merge Conflicts in Git – A Practical Guide with Examples](https://www.freecodecamp.org/news/resolve-merge-conflicts-in-git-a-practical-guide/) 这篇文章

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0a422803436f442eaffe658cb8a81dfa~tplv-k3u1fbpfcp-zoom-1.image)

  


注意合并冲突的关键：**同一区域发生变化**。以 `package.json` 的依赖配置为例，下面这两个例子，第一个会冲突而第二个不会冲突。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/41ad242807f04c49b39322cf42fb9748~tplv-k3u1fbpfcp-zoom-1.image)

对于 lockfile 而言，同一区域发生变化一般有以下两种情况：

-   包管理工具版本不一致导致 lockfile 的结构发生变化，出现不兼容合并。对于这个问题，我们应该限定包管理工具的版本，可以参考我的另一篇文章：[为什么保证前端依赖一致这么难? - 掘金](https://juejin.cn/post/7250383386183876645)
-   两个分支的 `package.json` 依赖配置都发生了变更，并修改了 lockfile 的同一区域。


什么情况下会修改 lockfile 的同一区域？

由于不同包管理工具以及不同版本的生成策略都不一样，这个问题说来话长，开发者也很难通过调整 `package.json` 的写法来避免冲突，因此无需过多关注，只要知道当出现这个问题的时候怎么解决即可。

下面将讨论两种常用的解决策略。

  


# 方案分析：重置分支 lockfile

> **太长不看版**：重置分支 lockfile ，即还原 lockfile 到**目标分支**或者**当前分支**中的某个版本，也意味着会丢失某个分支的 lock 记录，可能会导致错误。该问题很难彻底解决，只能通过改进开发流程和必要的人工 review 来避免。

  


重置分支 lockfile 指的是「合并时以**目标分支**或者**当前分支**的 lockfile 文件为准」，后面需要再重新执行依赖安装命令去更新 lockfile 。

  


## 三种重置方案

以下三种方案可以方便的重置分支 lockfile：

1.  忽略冲突提示并暂存 lockfile 文件，而后丢弃该文件变更，表示继续当前分支的 lockfile 文件。
2.  执行 `git checkout --ours "*lock*"` 或 `git checkout --theirs "*lock*"` 命令，将以**当前分支**或**目标分支**为基准自动修复 lockfile 冲突。
3.  基于 Git 配置实现 lockfile **冲突修复自动化**，需要执行以下两个操作，且二者缺一不可：
    1.  新增 `.gitattributes` 文件，配置文件的合并策略，示例：
    2.  ```
        # .gitattributes
        # 当 pnpm-lock.yaml 出现冲突时，将以当前分支为准
        pnpm-lock.yaml               merge=ours
        ```
    3.  执行 `git config merge.ours.driver true` 命令，开启合并驱动配置（如果用了 `theirs` 的合并策略，则命令改成 `merge.theirs.driver`）。
    4.  参考文档：
        1.  [Have Git Select Local Version On Merge Conflict on a Specific File?](http://stackoverflow.com/a/930495/958481)
        2.  [Merge Strategies](https://git-scm.com/book/en/v2/Customizing-Git-Git-Attributes#Merge-Strategies:~:text=further%20development%20work.-,Merge%20Strategies,-You%20can%20also)

## 存在的问题

无论是以**当前分支**还是**目标分支**为基准，重置分支 lockfile 再更新依赖**意味着会丢失一部分 lock 记录，可能会引发错误**。

举个业务中遇到过的例子：


![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/311d530bcede45dbafaa0e09f3db8735~tplv-k3u1fbpfcp-watermark.image?)

1.  从主分支拉取一个开发分支 `feat1` ，`feat1` 中新增了依赖 `A^1.0.0` ，此时装的版本是 `1.0.0`
2.  在 `feat1` 开发的这段时间，有另一个开发分支 `feat2` 先合到了主分支，并新增了依赖 `B^2.0.0` ，此时装的版本是 `2.0.0`
3.  `feat1` 开发完毕，准备合码到主分支，发现 lockfile 冲突了
4.  使用上面的 **「重置分支 lockfile」**方案，并重新安装了依赖
5.  但是这个时候，社区发布了有 *`BREAKING CHANGE`* 的 `A@1.0.1` 和 `B@2.0.1`。由于**「重置分支 lockfile」**方案会忽略 `feat1` 或者 主分支（`feat2`）新增的 lock 记录，导致安装了较新版本的 `A@1.0.1` 或 `B@2.0.1`
6.  `feat1` 直接合到了主分支，导致线上代码报错


## 解决方案

有同学说，**直接使用固定版本安装依赖不就好了**？比如新增依赖时使用 `A@1.0.0` 和 `B@2.0.0` ，而不是使用 `^` 这种版本范围的写法。

```
{
    "dependencies": {
      "A": "1.0.0",
      "B": "2.0.0",
  }
}
```

首先，对于**应用项目**来说，可以直接使用固定版本；但是对于**类库项目**，不推荐固定版本，有以下两点原因：

-   依赖该类库的应用项目无法充分复用依赖：比如 `^1.0.0` 和 `^1.1.0` 可以合并成 `^1.1.0`）
-   **类库项目**的间接依赖出现安全漏洞时，无法通过重新安装依赖直接修复

其次，锁定直接依赖的版本也不完全有效，丢失 lock 后，直接依赖的间接依赖还是会进行升级，进而导致 *`BREAKING CHANGE`*


因此，一旦选择该方案，要么就**信任其他依赖不会出现问题（听天由命）** ，要么就需要**必要的 lockfile 人工 review** ，并通过**合理的开发流程**来保障。

-   **合理的开发流程**：开发阶段，及时 merge 或者 rebase 主分支的代码，有冲突提前解，而不是等到提测后要上线的时候再去处理。提测后合码前，如果发现代码冲突，解决冲突并合码上线前最好再重新测试一下代码冲突相关的场景（如果项目重要和人力允许的话）。
-   **必要的人工 review**：仅需关注**直接依赖**（比如 `pnpm-lock.yaml` 文件的 `specifier` 和 `version` 部分）的版本变更，对于**直接依赖**引入的**间接依赖**，自动升级出错的概率较小（一旦出错影响的不只一个项目），且 review 成本太高，选择信任社区，也可选择「变更复测」来保障。


## 方案小结

1.  重置分支 lockfile 即还原 lockfile 到**目标分支**或者**当前分支**中的某个版本
2.  有三种方案可以帮助方便的重置分支 lockfile
3.  重置分支 lockfile 会丢失其中某个分支的 lock 记录，进而引发错误
4.  锁定直接依赖的版本不是最终解决方案，会引发其他的两个问题
5.  尽量由开发流程保证，有冲突就复测，并做好充足的人工 review



# 方案分析：包管理工具自带机制

> 太长不看版：解析冲突文件得到不同版本的 lock 对象，再对 lock 对象进行合并。每种包管理工具的合并方案都不一样，总体来说 pnpm 的最为出色。但无论如何，有合并肯定有丢失，不能保证 100% 没问题。

  


lockfile 出现合并冲突，目前主流的包管理工具都支持运行依赖安装命令（`npm install/yarn/pnpm install`）来自动解决冲突。

-   npm：[Resolving lockfile conflicts](https://docs.npmjs.com/cli/v6/configuring-npm/package-locks#resolving-lockfile-conflicts) ，v5.7 + 支持
-   yarn：[Auto-merging of lockfiles](https://engineering.fb.com/2017/09/07/web/announcing-yarn-1-0/#:~:text=Auto%2Dmerging%20of%20lockfiles) ，v1.0+ 支持
-   pnpm：[Merge conflicts](https://pnpm.io/git#merge-conflicts) ，v5.11+ 支持

> 可以认为大部分用户使用的包管理工具的版本都是支持的

  


那么这些包管理工具是怎么解决冲突的呢？

  


## npm 的冲突合并修复策略

我在另一篇文章 《[浅谈 package-lock.json 的合并冲突修复算法](https://juejin.cn/post/7251895470548697143) 》中已经分析过这个问题。

总体来说，策略是**基于目标分支（** **`theirs`** **），并应用上当前分支（** **`ours`** **）的变更。**

  


举个例子，在`主分支`上合入`开发分支`（`git merge feat-branch`），`theirs` 指的就是`开发分支`，`ours` 指的是`主分支`，那么将基于`开发分支`的 lock 记录，并应用上`主分支`的变更。

  


也就是说，**如果两个分支同时更新同一模块的版本号，则会以主分支（`ours`）的版本为准，这在 `极少数情况下`会出错。**

文章给出的解决办法是通过流程和复测来降低影响，下文会讲。

  


## yarn 的冲突合并修复策略

PR 在 [Auto detect and merge lockfile conflicts](https://github.com/yarnpkg/yarn/pull/3544) ，看最新的实现代码 [/src/lockfile/parse.js](https://github.com/yarnpkg/yarn/blob/master/src/lockfile/parse.js#L334)

实际上只要看其中的一行代码就能明白

```
Object.assign({}, parse(variants[0], fileLoc), parse(variants[1], fileLoc));
```

**浅合并**两个分支的 yaml 对象，对象属性都存在则以目标分支（`theirs`）的为准

  


换句话说，当同一依赖的版本发生冲突，**会以目标分支的为准**。这点与 npm 的策略相反，但存在的问题和解决方案是类似的。

## pnpm 的冲突合并修复策略

pnpm 的冲突修复算法由 [@pnpm/merge-lockfile-changes](https://github.com/pnpm/pnpm/tree/main/lockfile/merge-lockfile-changes) 项目维护，

  


整体实现上也是先将冲突部分拆解为目标分支内容（`theirs`）和当前分支内容（ `ours` ），然后做合并。

但是这个合并不是像 yarn 那样简单粗暴的浅合并，而是**做了深合并（** **[lockfile](https://github.com/pnpm/spec/blob/master/lockfile/6.0.md)** **结构其实一共也就两层），当出现版本冲突时取版本号较大的。**

  


写个 demo 测试下

```js
const { mergeLockfileChanges } = require("@pnpm/merge-lockfile-changes");
const simpleLockfile = {
  importers: {},
  lockfileVersion: 5.2,
};
const mergedLockfile = mergeLockfileChanges(
  {
    ...simpleLockfile,
    packages: {
      ".": {
        version: "1.1.0",
        dependencies: {
          foo: "1.2.0",
          bar: "3.0.0_qar@1.0.0",
          zoo: "4.0.0_qar@1.0.0",
          ktv: "5.0.0"
        },
      },
    },
  },
  {
    ...simpleLockfile,
    packages: {
      ".": {
        version: "1.2.0",
        dependencies: {
          foo: "1.1.0",
          bar: "4.0.0_qar@1.0.0",
          zoo: "3.0.0_qar@1.0.0",
          pua: "5.0.0"
        },
      },
    },
  }
);
console.log(JSON.stringify(mergedLockfile, null, 2));
```

输出得到

```js
{
  "importers": {},
  "lockfileVersion": 5.2,
  "packages": {
    ".": {
      "version": "1.2.0",
      "dependencies": {
        "foo": "1.2.0",
        "bar": "4.0.0_qar@1.0.0",
        "zoo": "4.0.0_qar@1.0.0",
        "ktv": "5.0.0",
        "pua": "5.0.0"
      }
    }
  }
}
```

  


也就是说，pnpm 选择了**更新的版本**，如果会出问题，则表示新版本出现了 `BREAKING CHANGE` ，但这个情况比起选择旧版本而出现 `BREAKING CHANGE` 的概率更小。

  


目前，pnpm 官方还在持续优化 lockfile 方案以减少冲突，包括：

1.  针对分支使用不同的锁文件：https://github.com/pnpm/pnpm/pull/4475
2.  更改锁定文件格式以减少冲突数量：https://github.com/pnpm/rfcs/pull/1


此外，pnpm 还提供了一个 [resolution-mode](https://pnpm.io/npmrc#resolution-mode) 配置，用户可以通过配置来决定依赖安装时版本的选择策略：最低（默认）、最高、time-base（与最后一个直接依赖有关）。

  


## 方案小结

三种方案都选择对 lockfile 进行合并，但在合并的时候策略又不相同：

-   **npm**：深合并，并以当前分支（ `ours` ）的为准
-   **yarn**：浅合并，并以目标分支（`theirs`）的为准
-   **pnpm**：深合并，以版本号大的为准


yarn 虽是第一个提出解决 lockfile 冲突的，但过去这么久了方案没咋更新。。

npm 的理念是版本合并应该尽量以主分支的为准，更稳定。

pnpm 的理念是更信任社区 `semver` ，选择新版本出现的问题会比旧版本更少。

  


整体来说，pnpm 方案出现问题的概率最小，但也不是一定不会出现问题，正如[官方文档](https://pnpm.io/zh/git#%E5%90%88%E5%B9%B6%E5%86%B2%E7%AA%81)所说：

> 建议您提交之前查看更改，因为我们无法保证 pnpm 会选择正确的头（head） - 它会构建大部分更新的锁文件，这在大多数情况下是理想的。

  


![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/923ec1649965448d9fe41a7d9f5147c0~tplv-k3u1fbpfcp-zoom-1.image)

# 最佳实践

**包管理自带机制**相比**重置分支 lockfile**，丢失的 lock 信息更少，出现的问题也更少。

总结一下上文，我们得到如下最佳实践：

1.  不要手动解冲突，容易语法错误
2.  尽量使用包管理工具自带机制来解决冲突
3.  如果还未对包管理工具进行选型，尽量选择 `pnpm`


此外，包管理工具方案不是一劳永逸，极端情况也可能出现问题。如果项目有这个价值，最好还是做下人工 review 和需求复测，具体行为指南可以参考「方案分析：重置分支 lockfile」一节中的解决方案。

# 总结

本文系统分析了 lockfile 冲突的常见方案，并在最后提供了一份最佳实践。

前端底层很多设计都是在修修改改，或许需要拓宽视野，上升软件层面的最佳实践，再反哺社区。

* * *

最后，如果看完本文有收获，欢迎一键三连（点赞、收藏、分享）🍻 ~

# 拓展阅读

-   [Avoid lockfile conflicts in Rush](https://7tonshark.com/posts/avoid-conflicts-in-pnpm-lock/)
-   [一次yarn.lock的conflict引发的思考 - 掘金](https://juejin.cn/post/6953948250671939591)