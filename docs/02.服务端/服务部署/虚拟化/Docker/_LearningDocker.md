---
title: LearningDocker
date: 2019-09-05 23:56:45
permalink: /pages/399c46/
tags: 
  - 
titleTag: 草稿
categories: 
  - 服务端
  - 服务部署
  - 虚拟化
  - Docker
---

## Q
1. control group 限制资源，使用场景
2. -d 参数 和 守护态 区别
   添加 -d 只是让容器启动后进入后台（比如还需要进入容器内部操作，若不使用-d的话ctrl+c就终止终端并终止容器，想象一下npm start）；
   一个docker容器运行需要指定一个前台进程，该进程终止了，该容器也就停止运行了。
3. 容器内的网络和宿主机处于同一个网络
   同虚拟机一样，可以设置桥接等模式
4. EXPOSE 端口 其实是让容器会选择那个端口而已，不定义的话 会随机选择一个
   expose 相当于 README, 告诉用户容器内进程使用的端口，不写的话也没关系，用户自己去找（好比我们npm start了一个项目 但是没有任何提示说 应用启动在哪个端口
5. 做项目基础镜像（数据库镜像）需要注意的点，比如要打包os环境？
   需要基于os镜像（或者其更上层的封装镜像），多个项目基础镜像用的同个os镜像，不会占用内存
6. windows 用命令行进行配置：在 `C:\Users\{USER-NAME}\.docker\` 目录下有各种配置文件

前端项目本地开发，使用docker，如何避免每次 run dev 都要 npm install，过程略久

采用 -d 参数，又想查看输出

多个 docker-compose 服务，每个都会连接公共的容器？

进入容器查看配置

```
docker exec -it container_id sh
```

## 防止容器自动退出

```sh
docker run xxx /bin/sh -c "while true; do echo hello world; sleep 1; done"

docker run xxx /bin/sh -c "tail -f /dev/null"
```

## 一条龙

```sh
# 构建镜像
docker build -t [image_name] .
# 启动运行
docker run -dit [image_name]  /bin/sh -c "tail -f /dev/null"
# 展示容器
docker container ls
# 进入容器
docker exec -it [container_id] bash
```