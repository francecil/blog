## 背景

有个个人项目，比如博客、开源项目，在学校宿舍电脑上写一半，回到家想继续写，怎么做到？

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

从 code server 的 [docker-compose](https://github.com/cdr/code-server/blob/master/docker-compose.yml) 中可以看到，

```
    volumes:
      - "${PWD}:/home/coder/project"
      - "${HOME}/.local/share/code-server:/home/coder/.local/share/code-server"
```

以上挂载了两个主机目录作为数据卷，如果主机目录不存在，会先创建目录





TODO


## git 配置

我们试着将某个项目推送到 github 上

TODO

## 插件安装

目前在市场上下载的插件很多都不能用，所以推荐的方式是 `Install from VSIX... `

如何快速离线安装拓展，可以参考我之前写的文章 [vscode配置同步及拓展批量离线安装](../2019Q3/vscode配置同步及拓展批量离线安装.md)



## 域名配置和转发

目前，我们的项目是通过 ip 访问的，太过麻烦（我是经常记不住

TODO

## ssl 配置

可能我们需要将我们的

### 申请 ssl 证书

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
http 重定向到 https
```conf

```
TODO

### 指定cert启动容器