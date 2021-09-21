## 安装

```
brew install go
```

## 环境配置

```
# 编辑 ~/.bash_profile 文件
vim ~/.bash_profile
# 在最后一行添加下面这句。$HOME/go 为你工作空间的路径，你也可以换成你喜欢的路径
export GOPATH=$HOME/go
# 保存退出后source一下（vim 的使用方法可以自己搜索一下）
source ~/.bash_profile
```

## hello world


## 目录说明

一般来说GOPATH下面会有三个文件夹：bin、pkg、src，没有的话自己创建。每个文件夹都有其的作用



## 参考文献

https://www.jianshu.com/p/c43ebab25484