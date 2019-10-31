
1. 在 /usr/local 下新建 xxx 文件夹
```bash
cd /usr/local
mkdir thingsBoard
cd thingsBoard
```
2. 将前端打包资源文件放至 /usr/local/xxx 目录下

3. 安装 nginx 依赖
```bash
cd /usr/local
yum -y install gcc zlib zlib-devel pcre-devel openssl openssl-devel
```
4. /usr/local 目录下下载 nginx tar 包并且解压
```bash
wget http://nginx.org/download/nginx-1.13.7.tar.gz
tar -xvf nginx-1.13.7.tar.gz
```
5. 安装 nginx
```bash
cd /usr/local/nginx-1.13.7
./configure
make
make install
```
后续 nginx-1.13.7 相关文件和目录可以选择删除了
6. 配置 nginx
```bash
vi /usr/local/nginx/conf/nginx.conf
```
7. 修改 http -> server 节点下 localhost 为如下：
```bash
location / {
    root /usr/local/xxx/;
    index index.html index.html;
}
location /api/ {
    proxy_pass http://x.x.x.x:xx;
}
```
并且将该配置项下 server 的 port 修改为 3000(静态资源访问地址)，之后保存。

8. 启动 nginx
```bash
cd /usr/local/nginx/sbin/
./nginx -t
#或者
/usr/local/nginx/sbin/nginx -c /usr/local/nginx/conf/nginx.conf
```
9. 若修改配置后，重启 nginx
```bash
/usr/local/nginx/sbin/nginx -s reload
```

## 注意

3~5 步骤可以采用在线安装的方式，不用下载编译的方式:
```sh
yum install nginx
```
采用此法安装的nginx,默认的配置文件位置在 `./etc/nginx/nginx.conf` 
> 通过 `find . -name "nginx.conf"` 找到

启动程序为 `/usr/sbin/nginx` 

## 使用 [systemctl](https://www.cnblogs.com/sparkdev/p/8472711.html) 管理nginx

- 开机自启动

```sh
systemctl enable nginx
```

- 启动

```sh
systemctl start nginx
```

- 关闭

```sh
systemctl stop nginx
```

- 重启:关闭再启动

```sh
systemctl restart nginx
```

- 重载配置：`nginx.conf` 更新后，使用该命令更新

```sh
systemctl reload nginx
```