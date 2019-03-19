
1. 在 /usr/local 下新建 thingsBoard 文件夹
cd /usr/local
mkdir thingsBoard
cd thingsBoard

2. 将前端打包资源文件放至 /usr/local/thingsBoard 目录下

3. 安装 nginx 依赖
cd /usr/local
yum -y install gcc zlib zlib-devel pcre-devel openssl openssl-devel

4. /usr/local 目录下下载 nginx tar 包并且解压
wget http://nginx.org/download/nginx-1.13.7.tar.gz
tar -xvf nginx-1.13.7.tar.gz

5. 安装 nginx
cd /usr/local/nginx-1.13.7
./configure
make
make install

后续 nginx-1.13.7 相关文件和目录可以选择删除了
6. 配置 nginx
vi /usr/local/nginx/conf/nginx.conf

7. 修改 http -> server 节点下 localhost 为如下：
location / {
    root /usr/local/thingsboard/public;
    index index.html index.html;
}
location /api/ {
    proxy_pass http://180.101.29.90:8080;
}

并且将该配置项下 server 的 port 修改为 3000(静态资源访问地址)，之后保存。

8. 启动 nginx
cd /usr/local/nginx/sbin/
./nginx -t
或者
/usr/local/nginx/sbin/nginx -c /usr/local/nginx/conf/nginx.conf

9. 若修改配置后，重启 nginx
/usr/local/nginx/sbin/nginx -s reload