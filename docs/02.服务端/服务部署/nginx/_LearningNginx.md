---
title: LearningNginx
date: 2019-12-02 19:47:43
permalink: /pages/7b0288/
tags: 
  - null
titleTag: 草稿
categories: 
  - 服务端
  - 服务部署
  - Nginx
---
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
