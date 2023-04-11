## 修改上传文件大小限制

默认 1M 

只需要在 server 中进行配置即可
```conf
server {
  listen 80
  server_name localhost;
  # 这里配置
  client_max_body_size 10M;
  
  location / {

  }
}
```
