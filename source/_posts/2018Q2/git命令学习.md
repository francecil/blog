---
title: git命令学习
date: 2018/06/14 01:00:00
categories: Git
---

## 1. 分支切换

### 查看远程分支

git branch -a

### 查看本地分支

git branch

### 切换分支

```
$ git checkout -b dev origin/dev   
从远程dev分支取得到本地分支dev
Branch dev set up to track remote branch dev from origin.
Switched to a new branch 'v0.9rc1'
```

-b :创建并切换，相当于 git branch dev;git checkout dev

<!--more-->

## 2. 分支合并

### 整个分支合并

```bash
#切换到master分支
git checkout master
#合并dev分支
git merge dev
```

### 合并某个commit到指定的分支上
```bash
# 查看当前分支的commit记录，记录commit_id
git log
# 切换到master分支
git checkout master
# 将该次commit 合并到master分支
git cherry-pick <commit_id>
```

### 合并连续多个commit（aaaa->bbbb）到指定的分支上

```bash
# 创建并切换到newbranch分支 以bbbb提交为结尾
git checkout -b newbranch bbbb
# 以aaaa的commit记录开始合并到master，此时合并的为aaaa->bbbb的commit
git rebase —onto master aaaa^
```

## 3. push
### 推送到指定名称的远程分支
```bash
// 将local-dev推送到 origin-dev 分支
git push origin local-dev:origin-dev
// 当 local-dev 为空时，将删除 origin-dev 分支
git push origin :origin-dev
```
### 将本地仓库转到远程仓库

```bash
# 添加远程仓库
git remote add [name] [url]
# 推送远程仓库：这里的场景 localBranchName 一般用master
git push [remoteName] [localBranchName]
```

## 4. 版本回退

### 删除远程仓库的文件 并忽略提交

当文件进入版本管理时，设置 gitignore 将没有效果，此时将提交push到远程仓库会发现远程仓库有这些文件

举例：在`.gitignore`设置忽略test目录时，已进行test目录的git管理,此时我们不小心把test目录也push到远程分支了，怎么办？

```bash
git rm -r --cached test
git commit -m "delete test/"
git push origin master
```

此时可以把忽略规则写到gitignore中了。

### git reset 
先用git log 查看commit记录，回车下一页，q退出查看

git reset --hard commit_id 或者 HEAD^ 表示当前版本的上一个版本，10个前的版本就是 HEAD~10

将 commit 信息和文件都进行回退

> 不指定 --hard 的话即默认的 --mixed 模式, 回退 commit 信息，文件处于工作区（待 add）

还可以指定为 --soft ，回退 commit 信息，文件处于 staged 状态（待 commit）

当前版本被重置后，想回到刚刚的版本，又找不到commit_id,刚刚的命令窗口被关闭，怎么办?

可以通过 git reflog 里面记录了我们每次的命令 

## git 文件改一半需要临时改个bug -commit上怎么写？

[参考](https://www.cnblogs.com/wufangfang/p/6085617.html)

1. git stash  存储工作区
2. git checkout -b issue-xxx 复制当前分支到issue-xxx分支
3. git commit -m "fix bug xxx"  修改bug并提交
4. git checkout master 切换到master分支
5. git merge issue-xxx 合并issue-xxx分支
6. git branch -d issue-xxx 删除issue-xxx分支
7. git stash list 展示刚才的工作区
8. git stash pop 还原工作区并删除对应的stash
9. git stash list 此时应该是空的

## git commit

--amend : 用来修改上次提交时的 message

## git rebase

### -i [start_point] [end_point] 可交互变基

常用来调整 commit 记录的顺序， 进行 commit 合并等。

首条 pick or edit(修改 message 用)，其他的用 s or f(丢弃该 commit 的 message)

## git tag
[参考](https://www.jianshu.com/p/9e64bdf1e8f9)
### 添加tag
```bash
git tag -a  <tag名> -m <注释文字>

# git tag -a v0.1.0 -m v0.1.0
```

### push tag
```bash
git push origin <标签名>

#一次推送本地所有 tags，使用 --tags选项：
git push origin --tags
```

## git clone
```sh
##最近一次提交
git clone --depth 1 <remote-addr:repo.git>
```

## gh-pages

```sh
# 指定某个文件夹
git subtree push --prefix=dist origin gh-pages
# 整个项目都上传
git symbolic-ref HEAD refs/heads/gh-pages
git push origin gh-pages
```

## 切换仓库

```sh
git remote set-url origin url
```

注意，正常的话 切换完 pull 是没问题的（新的远程仓库也是原来本地仓库的记录）

但如果新的仓库地址的记录与本地不相关的话，就会报
```
fatal: refusing to merge unrelated histories
```

此时应该放弃原来的git记录，采用代码覆盖重新提交的方式。。

若采用 `git pull origin master --allow-unrelated-histories` 强制合并，会有各种冲突等等，

其实最好的方法就是让同伴不要把不相关的记录直接传新的仓库。。

**方式2**

具体迁移步骤

在新地址上新建对应项目
```bash
git clone --bare $url  //拷贝一份旧GIT裸版本的代码
cd xxx.git             //进入到目录底下
git push --mirror $newurl   //推送到新的仓库地址
cd ../ && rm -rf xxx.git     //删除拷贝
```

git remote add 和 set-url 区别

## 克隆仓库

https 与 ssh 的区别

前者每次 push 时都需要输入账号密码

后者会利用已经配置的 key 进行登陆，要求自身为克隆的仓库的拥有者或者加入者

## MR 的正确姿势

功能分支合入主分支时，保证提交记录只有一个，让主分支记录看得更清晰点。

此时有两种做法：

1. merge 的时候开启 square
2. 本地交互变基合成一个后再提交

前者 code review 时可以按子提交纬度来看；
后者合完后可以追溯到子提交。

因此前者适用于后面不再追溯某个子提交的情况，大部分情况用这个足够了。

## 撤销线上提交

```
git revert commit_id
```

## 去除 mr 信息

release 分支里带有很多功能分支的 mr

此时 release 合到 master 的时候，会带有这些 mr 记录

需要先 rebase 下 master ，这样 master 里就不会带这些功能分支合到 release 的 mr 记录
