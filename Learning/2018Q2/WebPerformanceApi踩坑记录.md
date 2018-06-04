## 介绍：
https://w3c.github.io/resource-timing/

## 问题：

`responseStart、transferSize`为0，根据w3c描述，当值为0说明走的是缓存

> zero otherwise, including for resources retrieved from relevant application caches or from local resources.

但我这边测试响应为200OK