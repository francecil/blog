---
title: 开启 diff3，帮助解决 Git 合并冲突难题
date: 2023-07-04 17:39:57
permalink: /pages/17b23b/
categories: 
  - 通用技术
  - Git
tags: 
  - 金石计划
---

> 导读：Git 早在 2008 年就提供 diff3，用于冲突展示时额外提供该区域的原始内容（两个分支公共祖先节点在此区域的内容），帮助更好的合并冲突。在 2022 年 Q1 发布的 Git 2.35 ，提供了一个新的选项 zdiff3，进一步优化了diff3 的展现。

<!-- more -->

Git 合并冲突，常见的展示形式分为 Current Change （ours, 当前分支的变更）和 Incoming Change （theirs, 目标分支的变更），两者针对的是同一区域的变化。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a2bf447ca0184b89bfd406e2dbbf0ad8~tplv-k3u1fbpfcp-zoom-1.image)

观察上面这个冲突示例，我们并不清楚两个分支各自都发生了什么变化，有两种可能：

1.  两个分支同时增加了一行代码 `"pkg": xxx`
2.  原先的提交记录里就有 `"pkg": xxx` ，只是两个分支同时修改了版本号

实际上这个例子，是第二种情况，两个分支都对 `pkg` 的版本做了改变。


![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c00e584c06b242798612b02b474d769c~tplv-k3u1fbpfcp-watermark.image?)

  


这样的场景还有很多，如果不知道上下文，在解决冲突的时候容易束手束脚。

  


现在，我们可以使用 git 提供的 diff3 选项来调整合并冲突的展示效果

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/69264ba7dc8745c4a2b5e6a8de45c52a~tplv-k3u1fbpfcp-zoom-1.image)

红框区域（`|||||||` 至 `=======`）表示的就是改动前的上下文，确切的说，**是** **`当前分支`** **和** **`目标合并分支`** **的最近公共祖先节点在该区域的内容。**

# 如何开启

冲突展示有两个选项 `diff3` 和 `merge`（默认选项），可以通过以下方法进行配置

> 在 v2.35 新增了 `zdiff3` 选项，下文会提到

  


-   对单个文件开启

```sh
git checkout --conflict=diff3 <文件名>
# 示例
git checkout --conflict=diff3 package.json
# 使用默认配置
git checkout --conflict=merge package.json
```

-   项目配置

```sh
git config merge.conflictstyle diff3
# 删除配置
git config --unset merge.conflictstyle
# 使用默认配置
git config merge.conflictstyle merge 
```

-   全局配置

```sh
git config --global merge.conflictstyle diff3
# 删除配置 
git config --global --unset merge.conflictstyle
```

# 示例展示

## 在同一位置添加代码行

```js
<<<<<<< HEAD
import 'some_pkg';
||||||| merged common ancestor
=======
c
>>>>>>> merged-branch
```

如上示例，合并的公共祖先节点在该位置是空白，每个分支都在相同的位置添加代码行。

我们通常希望保留两者，并按照最有意义的顺序排序，也可能选择只保留其中一个。以下是一个冲突修复后的示例：

```js
import 'some_pkg';
import 'some_pkg';
```

  


## 一方修改一方删除

```js
<<<<<<< HEAD
||||||| merged common ancestor
console.log('调试信息')
=======
console.log('调试信息2')
>>>>>>> merged-branch
```

如上示例，一方把调试信息删除，而另一方修改了调试信息内容。对于这个示例，我们通常是选择删除而不保留修改。

  


# 为什么不是默认选项

经常需要知道祖先节点的内容来确保正确的合并，而 diff3 解决了这个痛点。同时，diff3 没有任何弊端（除了冲突区域行数变多🌝），没有理由不启用它。

那为什么 Git 不将 diff3 作为默认的合并冲突展示选项呢？

stackoverflow 上有人回答了[这个问题](https://stackoverflow.com/questions/27417656/should-diff3-be-default-conflictstyle-on-git)，大概意思是说可能和 Unix diff 有关，早前默认的 Unix diff 不支持展示 [3-way diff](https://en.wikipedia.org/wiki/Diff3) （待考证）。

之后的新版本也不方便调整默认值，否则会对用户造成困扰 — “合并冲突区域怎么多了一块内容？”。

  


# zdiff3 （zealous diff3）

2022 年 Q1 ，Git 发布 v2.35，其中有个变化是冲突展示新增了 `zdiff3` 的配置选项。

`zdiff3` 基于 `diff3` ，并对冲突块两侧的公共代码行做了压缩。

举个例子：

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/25781a3793a14609a57956c677365716~tplv-k3u1fbpfcp-watermark.image?)


使用默认配置，合并冲突展示如下：

```
1
2
3
4
A
<<<<<<< ours
B
C
D
=======
X
C
Z
>>>>>>> theirs
E
7
8
9
```

使用 `diff3` 后，合并冲突展示如下：

```
1
2
3
4
<<<<<<
A
B
C
D
E
||||||
5
6
======
A
X
C
Z
E
>>>>>>
7
8
9
```

通过观察可以发现，冲突区域两侧有**公共的代码行** A、E 。而这些代码行在默认配置下会被提取到外部。

  


而用了 `zdiff3` 之后，A、E 两行又将移到冲突之外。

```
1
2
3
4
A
<<<<<<
B
C
D
||||||
5
6
======
X
C
Z
>>>>>>
E
7
8
9
```

一句话总结 `zdiff3` 的优化：**即展示公共祖先节点内容，又能够充分压缩冲突的公共部分。**

  


# 最后

解决 Git 合并冲突是一个难题，`diff3` 并不是一个“银弹”，它只能帮助提供更多的信息，减少决策成本。

  


推荐读者尝试下 `zdiff3` ，至少使用 `diff3` ，并将其作为默认配置。

  


最后，如果看完本文有收获，欢迎一键三连（点赞、收藏、分享）🍻 ~

# 拓展阅读

-   [Should diff3 be default conflictstyle on git?](https://stackoverflow.com/a/27417871)
-   [Take the pain out of git conflict resolution: use diff3](https://blog.nilbus.com/take-the-pain-out-of-git-conflict-resolution-use-diff3/)
-   [Reducing merge headaches: git meets diff3](https://psung.blogspot.com/2011/02/reducing-merge-headaches-git-meets.html)
-   [Git - 高级合并](https://git-scm.com/book/zh/v2/Git-%E5%B7%A5%E5%85%B7-%E9%AB%98%E7%BA%A7%E5%90%88%E5%B9%B6)
-   [Git workflow and rebase vs merge questions](https://stackoverflow.com/questions/457927/git-workflow-and-rebase-vs-merge-questions/11219380#11219380)