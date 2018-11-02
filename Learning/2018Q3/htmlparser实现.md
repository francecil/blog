## 方法1 全局开闭标签栈

忽略 `script` 和 `textarea` 中的内容 不处理

忽略 `<xxx/>` 

忽略格式化标签：`a, b, big, code, em, font, i, nobr, s, small, strike, strong, tt, and u.` 这些可单独开标签存在

检测到开标签，将其放入栈中

检测到闭标签，弹出开标签栈相应的元素

每次write结束，判断是否存在开标签。若存在，内容继续存入buffer,否则直接原生write输出buffer

存在问题：开闭标签是通过多次write达到的， 此时不易检测标签。

可以unicode转码，判断当前内容是否有`<` 有的话即使没有开标签也不会直接输出

## 方法2 上下文开闭标签栈

document.write 一段完整的html结构，必须是在一个script中进行的，否则缺失闭标签将导致后续html解析失败

故可以获取当前docwrite的上下文环境，当前script与之前不同，则写入之前的全部。最后一个在window.onload时写入

延后了docwrite的时机，看下有没有办法实时

解决：script onload时

问题 实现当前脚本运行时注册onload

> 无法做的话 用原始document.write插入个自己的脚本实现，插入的内容在该`<script>`之前，最后把该scrite删除
无法实现，write时 会先进行解析而不是运行剩余脚本，采用appendChild试试？

对于firefox 可以采用 `document.addEventListener("afterscriptexecute",()=>{})`

采用settimeout 0 ? 无法实现，不是每段js运行后运行 而是所有js运行完（一个事件周期内）才运行的

## script textarea内的内容不处理 其他的进行正则匹配

当当前script中document.write一个script tag 时 闭标签一定要用`<\/script>` 否则会导致解析器提前结束当前script。

而后 我们获取document.write中内容时，拿到的就是`</script>`

那么在该write的script中,又write了script时,闭标签要用`<\\\/script>`

即 第一层是`document.write('<script>var a;document.write(\'<scrip src="//whois.pconline.com.cn/jsFunction.jsp?callback=jsShow_476102"><\\\/script>\')<\/script>');`

第二层为 `document.write('<scrip src="//whois.pconline.com.cn/jsFunction.jsp?callback=jsShow_476102"><\/script>')`

故 对于嵌套的script 其实只需要匹配

```js
var matchUrl = ()=>{}
var encodeUrl = ()=>{}
var string = `<script type="text/javascript"><!--
google_ad_client = "ca-pub-9717849951270719";
/* 网易07-300x250 */
google_ad_slot = "8115538508";
google_ad_width = 300;
google_ad_height = 250;
//-->
</script>
<script type="text/javascript"
src="//pagead2.googlesyndication.com/pagead/show_ads.js">
</script>

<script type="text/javascript" > document.write('<script>var a;document.write('<scrip src="//whois.pconline.com.cn/jsFunction.jsp?callback=jsShow_476102"><\\\\/script>')<\\\/script>');
</script><a href="xxx"></a><script type="text/javascript" src="http://cbjs.baidu.com/js/o.js"></script>
<script type="text/javascript">var cnzz_protocol = (("https:" == document.location.protocol) ? " https://" : " http://");document.write(unescape("%3Cspan style='display:none;' id='cnzz_stat_icon_1256734798'%3E%3C/span%3E%3Cscript src='" + cnzz_protocol + "s4.cnzz.com/stat.php%3Fid%3D1256734798' type='text/javascript'%3E%3C/script%3E"));</script>
<img src='a.jpg'/>`
string = string.replace(/(?<=(<\/script>)|^)[\s|\S]*?((<script[\s\S]*?>)|$)/gi,function(outerScript){
            if(outerScript.length>10){
                var regExp = /(src|href|poster|data|value|url)\s*=\s*(['"]?)(.*?)(['" >])/gmi;
                return outerScript.replace(regExp, function (match, arrt, pre, src, suf) {
                    if (!src.startsWith("<%=") && matchUrl(src)) {
                        if (match.slice(-1) == ">") {
                            return arrt + '=' + pre + encodeUrl(src) + suf + '>';
                        } else {
                            return arrt + '=' + pre + encodeUrl(src) + suf;
                        }
                    } else {
                        return match;
                    }
                });
            }
            return outerScript
        })
```

ff、ie不支持 `?<=`,可以删去


# 正则 获取大括号外的内容

输入：`{sd{999}ee}as{6}ss{9}`
匹配： `as,ss`

思路：匹配`}xxx{`中的xxx

表达式：`/(?<=}|^)[^{}]+(?={|$)/gmi`输入：`{sd{999}ee}as{6}ss{9}`
匹配： `as,ss`

思路：匹配`}xxx{`中的xxx

表达式：`/(?<=}|^)[^{}]+(?={|$)/gi`



# 正则 匹配`<script>xxx</script>`外的内容

注意由于document.write的存在 会有嵌套

```js 
`<iframe src="666.html"/>
<div>9999</div>
<script>
document_write('<script>function jsShow_476102(area){var adList = [{key:'其他地区',value:'<script>document_write(unescape(\'%3C%73%63%72%69%70%74%3E%3C%2F%73%63%72%69%70%74%3E\'));}
<\/script>'}];adList = document_write(getContent(adList,keyList,areaKey,area));}</script>
<scrip src="//whois.pconline.com.cn/jsFunction.jsp?callback=jsShow_476102"></script>');
</script>
<img src="666.js"/><div>9999</div>`.match(/(?<=(<\\?\/script>)|^)((?!<script>)(?!<\\?\/script)[\s|\S])*(?=(<script)|$)/gi)
```

# 正则 匹配所有节点的src属性的值

## 注意：上述匹配`<script>xxx</script>`外的内容 没有考虑到script的src内容，故规则做了调整

`/(?<=(<\\?\/script>)|^)((?!<script[\s\S]*>)(?!<\\?\/script)[\s|\S])*((<script[\s\S]*?>)|$)/gi`

取消了`零宽度正预测先行断言`

## 注意：script 和 textarea 里面的内容要忽略

~~由于textarea和script可以互相嵌套，导致规则变得复杂。~~

本小结内容忽略，见下一小节

把`script`比作`{}`,`textarea` 比作`[]` ,`{}` 中可以嵌套`[]`, `[]`中也可以嵌套`{}`

故可以写出正则表达式：`/(?<=}|^|\])[^{}\[\]]+(?={|$|\[)/gi`

举例： `111{2{12[444]12}22}333[444]555` 可以匹配

但是对于[]和{}同级且还有再外面一层{}或[]就会导致匹配了[]和{}间的内容。

举例：`111{2{12[444]1{}2}22}333[444]555` 错误匹配

一个思路是，故先用每个规则将`[.*]`做一个替换 比如换成$$$等唯一字符串存入map，后面等`{}`处理完后再还原。

js 没有固化分组，如果层数过多，我们应该自己用js写逻辑判断，
```js
 var sc = '（', ec = '）', count = 0, rst = [],c;
    var s = '今年的雨水比较多（除了夏季（夏季（天气）炎热）），降雨量是往年的130%（特别是在江南地区）'
    var l = s.length;
    for (var i = 0; i < l; i++) {
        c = s.charAt(i);
        if (c == sc && count == 0) rst[rst.length] = sc;
        if (count > 0) rst[rst.length - 1] += c;
        if (c == sc) count++;
        else if (c == ec) count--;
    }
```
或者正则循环匹配和替换，

或者采用拓展库（<a href="https://github.com/slevithan/xregexp">xregexp</a>）

这里的场景 层数最多两层，故我们针对特定两层可以这么写：`/\[([^\[\]]*\[[^\[\]]*\][^\[\]]*)*\]/g`

## textarea 的特殊判断

```js
document.write(`<textarea>
666<textarea>77</textarea><script></script><img/>
</textarea>`)
```
结果为：结果为：
```html
<textarea>666&lt;textarea&gt;77</textarea><script></script><img>`
```
而不是
```html
<textarea>666&lt;textarea&gt;77&lt;/textarea&gt;&lt;script&gt;&lt;/script&gt;&lt;img&gt;</textarea>
```

说明·textarea 是尽早的匹配闭标签，那只要 `/<textarea>[\s\S]*?<\/textarea>/ig` 即可

那么 textarea 的匹配替换就是：

```js
var uuid = 'd3NfdGVzdA=='
var uuidReg = /d3NfdGVzdA==(\d+)\$/gi
var regexOuterScript = /(?<=(<\\?\/script>)|^)((?!<script[\s\S]*>)(?!<\\?\/script)[\s|\S])*((<script[\s\S]*?>)|$)/gi
var regexTA = /<textarea[\s\S]*?>[\s\S]*?<\/textarea>/ig
var source = `<iframe src="666.html"/>
<textarea width=60>
666<textarea><script>console.log(test)</script><img src="test.jpg">77</textarea>
99<script src="666.js"></script>
999
<script>
document_write('<script>function jsShow_476102(area){var adList = [{key:'其他地区',value:'<script>document_write(unescape(\'%3C%73%63%72%69%70%74%3E%3C%2F%73%63%72%69%70%74%3E\'));}
<\/script>'}];adList = document_write(getContent(adList,keyList,areaKey,area));}</script>
<scrip src="//whois.pconline.com.cn/jsFunction.jsp?callback=jsShow_476102"></script>');
</script>
<textarea width=70>
99977</textarea>
<img src="666.js"/><div>9999</div>`
var arr = []
source = source.replace(regexTA,function(match){
  var len = arr.length
  arr.push(match)
  return uuid+len+'$'
})
// 一顿操作后
source = source.replace(uuidReg,function(match,index){
	return arr[index]
})
```
> 这一顿操作就是：
```js
source = source.replace(regexOuterScript,function(match){

})
```

# 正则 匹配所有节点带链接的属性的值

`/(src|href|poster|data|value|url)\s*=\s*(['"]?)(.*?)(['" >])/gmi`

url 的匹配场景：`<meta http-equiv="refresh" content="2;URL=http://www.xxx.com/">` 2s后跳转至`www.xxx.com`

字符串长度<10忽略