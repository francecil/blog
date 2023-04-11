
## 需求

在进行页面开发时，难免会遇到浏览器兼容问题，有时候需要跑在相应的浏览器进行 debug

一般本机不会且不能装多个版本的浏览器，比如同时装几个版本的 chrome

由于 docker 的命名空间特性，我们可以解决不能装多版本浏览器的问题，那我们的需求是什么呢？

1. 指定浏览器类型和版本号即可生成对应的镜像
2. 通过 VNC 访问对应镜像所启动的容器

通过调研，发现 [docker-selenium](https://github.com/SeleniumHQ/docker-selenium) 项目比较满足需求，随后我们将对其进行介绍，最后将其进行改造变得更加方便使用
> 改造原因稍后会说，主要是侧重点不一样

## docker-selenium

介绍 组成 生成对应版本镜像

快速使用

https://github.com/SeleniumHQ/docker-selenium/wiki/Building-your-own-images

## 改造