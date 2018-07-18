## 注意点
1. 默认情况下dns prefetch只对href属性的url地址进行dns预解析，但若当该网站处于https时则不会进行处理
2. 可以通过`<meta http-equiv="x-dns-prefetch-control" content="on">`手动开启，此时https也可正常处理，可通过设置off来进行关闭，当设置off关闭后，再设置on就没有效果了。
3. 利用`<link rel="dns-prefetch" href="//host_name_to_prefetch.com">`手动预解析，一般用来预解析以下场景：请求重定向后的地址，js代码中的异步请求地址，图片请求地址，较晚被dom解析的script节点地址

## 参考文献
<a href="http://dev.chromium.org/developers/design-documents/dns-prefetching">DNS Prefetching</a>