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