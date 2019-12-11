1. js中执行dom相关的操作。
demo:
```html
<div class="t"/>
<script>document.getElementsByClassName('t')</script>
<div class="t"/>
```
未加速前只会拿到一个dom节点，加速后js会放在page load后运行导致拿到两个节点。

这种算是否错误，还得做一个评判。

2. document.write

rocketloader的`document.write`，会去分析里面字符串，形成一个一个的节点，可能有`<script>` 也可能有普通的文本节点

目前我们这边都是只默认只有一种，没有做分离


~~哪些网站我们加速后有错误的 也用代理去测试下cloudflare的效果
jd网站报错：jd上面js的一个src里面有多个js地址(nginx优化),cf不能正确识别为多个 导致不能下载~~