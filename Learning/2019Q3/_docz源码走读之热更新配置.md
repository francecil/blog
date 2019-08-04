
## 前言

umijs/father 项目依赖于 docz,但是却少了docz热更新的功能，为了给father提个pr

特地分析了下 docz怎么进行热更新

## 源码走读

docz-core/cli.ts

命令再此处注册，此时走到 commands.dev(args)

## 监听文件变动

Q: chokidar 监听change事件会触发两次？ 