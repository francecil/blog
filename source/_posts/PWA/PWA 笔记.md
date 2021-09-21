

## 疑问

检测更新的时机是？

## 安装失败终止流程

## 开发
webpack 通过 [workbox-webpack-plugin](https://developers.google.com/web/tools/workbox/modules/workbox-webpack-plugin) 生成 sw

可以配置 


update on reload

## 更新时机

url hash 变更 sw.js?v=111

sw 内容变更

skipWaiting 阶段

- 手动点击 skipWaiting
- 关闭所有终端
- 代码里设置 self.skipWaiting()


https://lavas-project.github.io/pwa-book/chapter04/3-service-worker-dive.html


另外默认 24 小时触发更新
