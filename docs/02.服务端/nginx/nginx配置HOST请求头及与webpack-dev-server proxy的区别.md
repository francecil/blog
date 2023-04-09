---
title: nginx配置HOST请求头及与webpack-dev-server proxy的区别
date: 2023-04-09 22:57:12
permalink: /pages/27c0b7/
categories:
  - 服务端
  - nginx
tags:
  - 

---
## 前言

遇到一个这样的场景：

>往CAS系统进行认证需要带上当前（前端server）域名，拿到认证密钥后向后端发起鉴权，后端校验密钥时还会去校验鉴权url的 Host 和刚刚CAS认证时带的前端server域名是否一致，不一致的话即使密钥合法了也无用。

旧平台是jsp项目，所以 鉴权url Host 和 前端server域名 是一样的。

前后端分离后，前端发起的鉴权url是通过代理转发到后端，代理没有额外处理的情况下，该请求的 Host 指的是后端地址，导致后端鉴权时两个 host 匹配不上


<!--more-->


## 解决方案

一开始是在本地开发环境（webpack-dev-server）上，利用 proxyTable 进行接口代理，结果发现后端鉴权通过了

而用 nginx 却出现 host不匹配的情况。

经过分析发现 proxyTable 转发时会带上请求头 Host ,比如

`Host: localhost:3000`

那么 nginx 代理规则里面也加上即可

```conf
proxy_set_header    Host    $host; # 80时不配端口，后端校验没有处理:80
# proxy_set_header    Host    $host:$server_port; #当端口非80时这样配置
```
后面发现可以直接
```conf
proxy_set_header    Host    $http_host;
```
就不用考虑是否非80了

## 关于 $host 和 $http_host 的区别

### $host

`$host` 按以下顺序匹配

1. 请求行中的 host name 部分
2. Host 请求头的 host name 部分
3. 处理请求的 server 对应配置的 server_name


### $http_host

`$http_host` 定义在 `$http_`*`name`*

> 对应任意请求头字段。*`name`* 为请求头字段名称转换为小写，短划线由下划线替换

> $http_host值为 Host 请求头数据

### 什么是请求行？

如：
```
GET /index.html HTTP/1.1
GET www.test.com/index.html HTTP/1.1
```
**请求行可以不带 host部分**

### Host 请求头

> HTTP/1.0不支持Host请求头；

> 而在HTTP/1.1中，Host请求头部必须存在，否则会 400


### 仅当以下情况 `$host` 等于 `$http_host`：

- 请求行中没有 host，Host请求头存在且其值为小写且不带端口号
> 从0.8.17版本开始，$host 值总是小写.



## 参考：

[nginx docs](http://nginx.org/en/docs/http/ngx_http_core_module.html)

[stackoverflow](https://stackoverflow.com/questions/15414810/whats-the-difference-of-host-and-http-host-in-nginx)

[Nginx $host变量详解](https://www.jianshu.com/p/0850db5af284)