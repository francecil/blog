先说结论，只能将复杂请求改完简单请求

常见的做法是：
1. token放原生的请求头：Authorization 
2. Content-Type改为text/plain 然后后端统一处理


若无法修改请求，那么可以设置`Access-Control-Max-Age`响应

每个url的OPTIONS都有一个生命周期，在该时间内不会再次发生。chrome默认是5s

故我们可以通过设置`Access-Control-Max-Age`来提高周期上限。不过每个浏览器也是有上限的，比如chrome上限是10min。

故此，在10min内 对于**同一请求（完整url相同,参数不同也视为不同url）**不会再发第二次OPTIONS。

注意：若设置了`disable-cache` 那么每次复杂请求都会发OPTIONS

