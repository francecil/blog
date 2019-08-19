# git 命令学习
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
git symbolic-ref
```