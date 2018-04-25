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
git push origin :dev
```