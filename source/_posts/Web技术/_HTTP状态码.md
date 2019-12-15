
## 3xx

301 302 303 307 的区别

301 永久重定向（下次再访问原链接，浏览器会直接访问重定向后的链接）

后面三个是临时重定向

302 在 http1.1 中细分为 303 307 ，后者的话 原请求不是 get/head 则忽略重定向

## 参考

https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Status
