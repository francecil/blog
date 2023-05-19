---
title: Code Server搭建指南
date: 2019/12/10 00:00:00
tags: 
  - Docker
permalink: /pages/829400/
categories: 
  - 闲言碎语
  - 服务搭建
---

## 背景

有个个人项目，比如博客、开源项目，在学校宿舍电脑上写一半，回到家想继续写，怎么做到？

<!-- more -->

上古时代我们可能会采用文档拷贝传送的方式。弊端太多：
1. 部分改动需要传整个项目，太麻烦
2. 家里还得配置一样的开发环境
3. 手机等移动端无法开发

后来有了 git ，我们只需要把项目传到公网仓库，通过 git 操作来同步项目，不过这也仅仅是解决了上面的问题1，其他问题仍存在：
1. 环境配置
2. 移动端无法开发

甚至还引入新的问题：
1. 代码写一半，就提交远程仓库，此时该提交是有问题的，后面回退容易出问题

把问题捋一捋，为了解决多地开发环境一致，我们需要把项目的开发放到服务器上，这样同时解决了项目同步的问题，因为不需要进行同步。

为了实现多端开发，我们肯定是直接通过浏览器操作最方便，而不是每次都得先下载工具远程连接到服务器。

因此，我们需要一个 web 版的 IDE ，最好把权限控制这块也做好了，防止安全问题。

那么本文的主角 Code Server 就登场了



## 简介

[code-server](https://github.com/cdr/code-server) 是运行在远程服务器上的 VS Code, 通过浏览器进行访问.

拥有以下特点

- 一致的环境：可以在各种平台上进行编码并且实时同步。
- Server-powered：利用服务器性能加速测试和编译；个人设备省电

![code-server](https://github.com/cdr/code-server/raw/master/doc/assets/ide.gif)

## 快速开始

我们通过 docker 进行项目的启动

- ① 安装 docker 并启动
```sh
$ yum install docker-io –y
$ systemctl start docker
```
- ② 启动 code server

```sh
docker run -d -e PASSWORD=xxxx -p 8080:8080 codercom/code-server:v2
```

以上的命令，将拉取当前较为稳定的 code-server v2 版本镜像，并基于此构建并启动一个容器

`-d`： 使用守护态运行容器，这样终端中断就不会终止项目 \
`-e PASSWORD=xxxx`： 表示设置环境变量 PASSWORD 为 xxxx ，构建的时候会将该参数传进入。如果不传的话，系统会随机生成一个密码 \
`-p 8080:8080`： 默认配置。使用服务器的8080端口映射该容器的8080端口，也可以使用本机的80端口进行映射\



- ③ 使用浏览器访问

访问 `http://<server_ip>:8080` 进入我们的登录界面，输入密码 xxxx 后即可进入编辑器界面

界面和 vscode 一致，可以进行愉快的编码了 ~


## 数据存储

你可能会有这样的疑问：
1. 我们创建的文件都存在哪里
2. 容器删除后数据会不会不见了

> 如果对 docker 比较了解的话可以跳过本章

从 code-server 的 [Dockerfile](https://github.com/cdr/code-server/blob/master/Dockerfile#L56) 中可以看到，
```
VOLUME [ "/home/coder/project" ]
```
也就是说，`/home/coder/project` 目录在运行时会自动挂载为匿名数据卷，往该目录中写入的信息不会进容器存储层。

这里介绍下数据卷：

数据卷简单的说就是在主机上分配了一个目录，容器对被挂载路径文件的访问其实就是对该目录文件的访问。其拥有以下特性：
- `数据卷` 用于容器间的共享。（这里一般指的是命名数据卷，因为匿名卷名字是随机分配的，而其他容器并不清楚
- 对 `数据卷` 的修改立马生效。（修改数据卷中的内容，容器访问到的也是修改后的
- 对 `数据卷` 的更新，不会影响镜像。（镜像和数据卷之间没有关联
- 手动删除 `数据卷` 后，如果该容器还在运行，那么容器所挂载的目录会变成一个空目录，且无法对其进行操作(删除目录，创建文件)
- `数据卷` 默认一直存在，即使容器被删除。



相关命令：
```sh
# 查看所有数据卷
docker volume ls

# 查看容器的信息
docker inspect <container-name>
# 找到 Mounts 信息，如
#        "Mounts": [
#            {
#                "Type": "volume",
#                "Name": "4dc8ad7ccc34b91b0beedf722072537cc545530f9b86de207305913614a82c0c",
 #               "Source": "/var/lib/docker/volumes/4dc8ad7ccc34b91b0beedf722072537cc545530f9b86de207305913614a82c0c/_data",
#                "Destination": "/home/coder/project",
#                "Driver": "local",
#                "Mode": "",
#                "RW": true,
#                "Propagation": ""
#            }
#        ],
# 可以看出来其将容器的 /home/coder/project 目录挂载了匿名数据卷，并分配了 4dc8ad7ccc34b91b0beedf722072537cc545530f9b86de207305913614a82c0c 这个 name，该数据券其实是位于主机的 /var/lib/docker/volumes/<volume_name>/_data/ 目录下


# 查看指定数据卷（可以是命名的，也可以是匿名的）的信息， 
# 比如 my-vol 就是一个命名数据卷，后者就是某个匿名数据卷的 name
# docker volume inspect my-vol
docker volume inspect 4dc8ad7ccc34b91b0beedf722072537cc545530f9b86de207305913614a82c0c
# 大致输出如下：
#[
#    {
#        "Driver": "local",
#        "Labels": null,
#        "Mountpoint": "/var/lib/docker/volumes/4dc8ad7ccc34b91b0beedf722072537cc545530f9b86de207305913614a82c0c/_data",
#        "Name": "4dc8ad7ccc34b91b0beedf722072537cc545530f9b86de207305913614a82c0c",
#        "Options": {},
#        "Scope": "local"
#    }
#]

```

> 数据卷是可以指定存储位置（即 Driver 配置项），默认 local 为当前主机，也可以指定其他机器作为driver，感兴趣的可以看 [Docker 数据卷之进阶篇](https://www.cnblogs.com/sparkdev/p/8504050.html)

所以我们可以回答前面两个问题了：

我们项目中创建的文件（`/home/coder/project/` 目录下创建的），是存在于主机目录的，可以通过`docker inspect <container-name>` 查看，一般是在  `/var/lib/docker/volumes/<volume_name>/_data/` 目录下

容器删除后数据不会丢失，都还在匿名数据卷目录下。

只是有个问题，其他容器不知道这个匿名数据卷的存在

所以你会发现，你再启动一个新的容器，它又创建了一个匿名数据卷，并且不会有上个匿名数据卷中的数据

解决方法有两种：
1. 使用命名数据卷
2. 挂载主机目录

先介绍做法，再讨论利弊

### 使用命名数据卷

```sh
docker run -d -e PASSWORD=xxxx -v coder_project:/home/coder/project  -p 8080:8080 codercom/code-server:v2
```
`-v coder_project:/home/coder/project` ：挂载 coder_project 数据卷到容器的 `/home/coder/project` 目录，如果数据卷不存在，会进行创建。同时覆盖这个挂载设置： `VOLUME [ "/home/coder/project" ]`

我们在浏览器中访问该项目，并在 project 目录下新增几个文件，然后关闭容器。此时开启一个新的容器，打开浏览器进行访问，可以发现 project 目录下加载了刚刚创建的文件。

说明现在多个容器都是去拿同个数据卷上的数据

```sh
# 展示 coder_project 数据卷的详细信息
# 可以看到数据存放在 /var/lib/docker/volumes/coder_project/_data
docker volume inspect coder_project

# 可以看到我们刚刚创建的文件
cd /var/lib/docker/volumes/coder_project/_data && ll
```

也可以使用 --mount 指令，上面的 -v 指令相当于
```
--mount source=coder_project,destination=/home/coder/project
```
> 注意：Docker 17.06 版本之后才支持 --mount 指令

关于两个指令的区别还可以看 [Use volumes](https://docs.docker.com/storage/volumes/)

当 coder_project 数据卷不存在时，会报错而不是自动创建

### 挂载主机目录

```sh
docker run -d -e PASSWORD=xxxx -v /usr/local/coder/project:/home/coder/project  -p 8080:8080 codercom/code-server:v2
```

`-v /usr/local/coder/project:/home/coder/project` ：挂载 主机的 `/usr/local/coder/project` 目录到容器的 `/home/coder/project` 目录，如果主机目录不存在，会进行创建。同时覆盖这个挂载设置： `VOLUME [ "/home/coder/project" ]`

我们创建几个文件试试

> 如果发现 Permission denied ，可能是 selinux 的问题或者用户目录权限的问题，可以自行搜索解决方案

可以发现主机目录 `/usr/local/coder/project` 也会有刚刚创建的文件，我们往主机目录创建的文件，容器中也可以看到。

也可以使用 --mount 指令，上面的 -v 指令相当于
```
--mount type=bind,source=/usr/local/coder/project,target=/home/coder/project
```
type=bind 表示挂载主机目录，默认为 volume

当 主机目录 不存在时，会报错而不是自动创建


### 总结

数据卷拥有挂载主机目录的特点和优点，并且支持挂载在其他主机上，对我们后续集群应用提供了可行性。

个人更偏向于采用数据卷的方式。

**因此，我们的容器启动命令如下：**
```sh
docker run -d -e PASSWORD=xxxx -v coder_project:/home/coder/project  -p 8080:8080 codercom/code-server:v2
```


## git 配置

code server 内置了 git 插件了

我们 new Terminal，clone 一个自己的项目看看
```sh
git clone https://github.com/francecil/LearningWeb.git
```
修改提交，此时会提示说你没有配置 git 账号

按说明的指示，输入以下命令
```
  git config --global user.email "you@example.com"
  git config --global user.name "Your Name"
```

然后进行 push （使用命令行 git push ），此时会提示输入账号密码。

输入完后即可推送成功。

所以 git 其实也没有什么需要配置的

## 插件安装和配置同步

直接在线下载，很多插件都不能用，并且 code server 的插件市场 和 vs code 的不一样，见 https://github.com/cdr/code-server#extensions

所以推荐的方式是 `Install from VSIX... `

如何快速离线安装拓展，可以参考我之前写的文章 [vscode配置同步及拓展批量离线安装](../2019Q3/vscode配置同步及拓展批量离线安装.md)

注意，拓展应该下载到数据卷中，这样容器就可以进行共享了

有了前文的经验，我们明白此时应该采用命名数据卷的方法。

那么目标容器目录是哪个呢，从官方的介绍中得知

code server 的配置和拓展处在 `/home/coder/.local/share/code-server` 目录

修改下我们的容器运行命令如下
```sh
docker run -d -e PASSWORD=xxxx -v coder_project:/home/coder/project -v coder_config:/home/coder/.local/share/code-server -p 8080:8080 codercom/code-server:v2
```

成功运行？ 不，正常你应该会得到这个报错(可以通过 docker logs <容器名>查看)
> permission denied, mkdir '/home/coder/.local/share/code-server/extensions'

[issue](https://github.com/cdr/code-server/issues/992) 上有这个的讨论，好像是因为权限问题

有个解决方案，chmod 设置该所挂载的主机目录权限

```
chmod 777 -R /var/lib/docker/volumes/coder_config/_data
```

然后重新执行上面的容器运行命令，执行以下命令
```
cd /var/lib/docker/volumes/coder_config/_data && ll

-rw-r--r-- 1 coder coder   75 Nov  1 19:31 coder.json
drwxr-xr-x 2 coder coder 4096 Nov  1 19:30 extensions
-rw-r--r-- 1 coder coder    0 Nov  1 19:31 heartbeat
-rw-r--r-- 1 coder coder    2 Nov  1 19:31 languagepacks.json
drwxr-xr-x 3 coder coder 4096 Nov  1 19:30 logs
-rw-r--r-- 1 coder coder   36 Nov  1 19:30 machineid
drwxr-xr-x 4 coder coder 4096 Nov  1 19:31 User
```
可以看到自动创建了很多文件。

回到正题，我们安装的插件应该就是放在 extensions 目录下

我们新建个目录用来存放离线下载的插件
```
[xxx _data]# mkdir tmp
```

然后 `Install from VSIX... ` 的时候就从该目录加载即可，安装成功后会存在于 extensions 下

后面新建的容器直接读的 extensions 目录，无需再次安装

## docker-compose 的使用

是不是觉得 docker run 的命令太长了，还有容器挂了怎么办。

我们可以采用 docker-compose 技术

```sh
#安装docker-compose
curl -L https://github.com/docker/compose/releases/download/1.24.1/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
#查看安装情况
docker-compose --version
```

然后找个目录（如 `/usr/local/code-server`）创建 docker-compose.yml , 内容如下

```yml
version: "2"

services:
  code-server:
    container_name: code-server
    image: codercom/code-server:v2
    restart: always
    ports:
      - "8080:8080"
    volumes:
      - "coder_project:/home/coder/project"
      - "coder_config:/home/coder/.local/share/code-server"
    environment:
      PASSWORD: "xxxx"
volumes:
  coder_project:
    external: true
  coder_config:
    external: true
```
注意这里配置了 `restart: always` 当容器挂掉,或 docker 启动的时候， code-server 会进行启动（重启）

命名数据卷需要在外层使用 volumes 指定。这里增加 `external: true` 配置表示使用外部已经定义的数据卷，不存在则会报错，提示我们需要先用 `docker volume create --name=coder_project` 创建

那不配置的话呢，会创建数据卷，名为 code-server_coder_project 和 code-server_coder_config ，即 `<service-name>_<volume-name>`

和我们之前已创建的数据卷不一致，另外还有可能出现之前的 Permission denied 问题。因此这里直接用的原数据卷

然后在 docker-compose.yml 同级目录下执行
```
docker-compose up -d
```
即可启动服务

## 域名配置和转发

目前，我们的项目是通过 ip 访问的，太过麻烦（我是经常记不住

买域名和配置dns解析这里就略过了。

现在的问题是，访问域名怎么转发到 8080 端口的项目上去？

显然，我们需要通过nginx进行转发，且nginx是跑在80端口上的。

- 安装 nginx
  > yum install nginx
- 修改配置
  > vi /etc/nginx/nginx.conf \
  > 增加如下配置,当采用域名 `code.test.com` 访问的时候，会转发到本地 8080 端口的项目 \
  > 因为用到了 websocket ，所以还加了一些头部设置
```sh
    server {
        listen       80;
        server_name  code.test.com;

        location / {
          proxy_pass http://127.0.0.1:8080;
          proxy_set_header Host $host;
          proxy_set_header Upgrade $http_upgrade;
          proxy_set_header Connection upgrade;
          proxy_set_header Accept-Encodeing gzip;
        }
    }
```
- 启动 nginx
  > systemctl start nginx

此时，我们访问 http://code.test.com/ 即可进入我们的 code server 项目 ~

## ssl 配置

为了让我们的项目更安全，比如防劫持，我们需要配置上 ssl

首先进行ssl证书申请

### 免费申请 ssl 证书

[申请界面](https://common-buy.aliyun.com/?commodityCode=cas#/buy)

切换到最后的 免费型 DV SSL，然后0元购买，接着按提示点点点，然后等待审核就可以了

一般10分钟就审核完毕

可以在 SSL 证书页面查看到状态显示为 `已签发`
> 可以通过顶部搜索栏搜 ssl 快速找到该页面

然后下载证书，将证书上传到服务器即可。

### nginx 配置

阿里云的文档写的很详细，这里以 nginx 为例

1. 解压下载的文件，得到 .crt 和 .key 文件，比如 a.crt 和 a.key
2. 进入服务器的 nginx 配置目录 /etc/nginx
  > 如果是自己编译生成的 nginx 就用 `whereis nginx` 命令看下安装目录在哪，如 /usr/local/nginx/
3. 创建 cert 目录，将解压后的两个文件放入该目录
  > 我这个新买的服务器没有 rz 工具，得进行安装： `yum install -y lrzsz` \
  > 或者使用 xshell 的文件传输 sftp
4. 编辑 nginx.conf 文件，找到 443 相关的注释
```sh
#    server {
#        listen       443 ssl http2 default_server;
#        listen       [::]:443 ssl http2 default_server;
#        server_name  _;
#        root         /usr/share/nginx/html;
#
#        ssl_certificate "/etc/pki/nginx/server.crt";
#        ssl_certificate_key "/etc/pki/nginx/private/server.key";
#        ssl_session_cache shared:SSL:1m;
#        ssl_session_timeout  10m;
#        ssl_ciphers HIGH:!aNULL:!MD5;
#        ssl_prefer_server_ciphers on;
#
#        # Load configuration files for the default server block.
#        include /etc/nginx/default.d/*.conf;
#
#        location / {
#        }
#
#        error_page 404 /404.html;
#            location = /40x.html {
#        }
#
#        error_page 500 502 503 504 /50x.html;
#            location = /50x.html {
#        }
#    }

```
5. 配置替换为
```sh
    server {
      listen 443;
      server_name localhost;
      ssl on;
      root html;
      index index.html index.htm;
      ssl_certificate   cert/a.pem;
      ssl_certificate_key  cert/a.key;
      ssl_session_timeout 5m;
      ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE:ECDH:AES:HIGH:!NULL:!aNULL:!MD5:!ADH:!RC4;
      ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
      ssl_prefer_server_ciphers on;
      location / {
        root html;
        index index.html index.htm;
      }
    }
```
6. 重启 nginx 配置 `systemctl reload nginx`

上面是通用步骤，由于我们的 code server 项目放在8080端口，因此我的最终配置如下：
```sh
    server {
      listen 443;
      # 这里写上你的域名
      server_name code.test.com;
      ssl on;
      ssl_certificate   cert/a.pem;
      ssl_certificate_key  cert/a.key;
      ssl_session_timeout 5m;
      ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE:ECDH:AES:HIGH:!NULL:!aNULL:!MD5:!ADH:!RC4;
      ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
      ssl_prefer_server_ciphers on;
      location / {
          proxy_pass http://127.0.0.1:8080;
          proxy_set_header Host $host;
          proxy_set_header Upgrade $http_upgrade;
          proxy_set_header Connection upgrade;
          proxy_set_header Accept-Encodeing gzip;

        }
    }

```
此时我们通过 https://code.test.com/ 就可以访问了