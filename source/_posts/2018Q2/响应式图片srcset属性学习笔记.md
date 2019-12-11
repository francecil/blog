## 介绍

以下参考了MDN,并添加了一些细节和自己的测试结论

`<img/>`的属性，设置srcset之后不同屏幕密度加载不同图片。

其值为：**以逗号分隔的一个或多个字符串列表表明不同User Agent可能设置的图像资源。**

每一个字符串由以下组成：
1. **一个图像的 URL**。
2. **可选的描述符**，空格后跟以下的其一：
   - 一个宽度(w)描述符，这是一个正整数，后面紧跟 'w' 符号。该整数宽度=sizes属性给出的资源（source）大小*像素密度。该值需配合sizes使用。
   - 一个像素密度描述符，这是一个正浮点数，后面紧跟 'x' 符号。该值其实指的就是dpr。若像素密度描述符直接命中的话，就不考虑sizes和w描述符了，但是建议一般所有字符串仅用其中一个
如果没有指定描述符，那它会被指定为默认的 1x。


<!--more-->


设置srcset后，src属性就没有效果了。

在相同的 srcset 属性中混合使用宽度描述符和像素密度描述符时，会导致该值无效。重复的描述符（比如，两个源 在相同的srcset两个源都是 '2x'）也是无效的,最后只取第一个设置。

>举个栗子：`<img src="small.jpg" srcset="small.jpg 1x, medium.jpg 2x, large.jpg 3x">` 在dpr=2的情况下会加载medium图片

再介绍下**sizes属性**，也是由一至多个的以逗号分隔的字符串组成，每组由以下内容组成：
1. 一个媒体条件。最后一组没有媒体条件，相当于default值
2. 图像尺寸，指定了图像的预期显示大小

当srcset的图片资源是用w描述符来描述的时候，user agent使用当前图像尺寸(媒体条件过后的)来选择由srcset属性提供的图片资源地址。若未进行css样式设置，所选图像尺寸（宽度）即最终图片展示的宽度。

若srcset属性不存在或者不包括w描述符的值，sizes属性不起作用。

>举个栗子：
```html
<img sizes=" (max-width: 360px) 200px,(max-width: 480px) 300px,400px" srcset="a.jpg 400w,b.jpg 700w">
``` 
>
> 当视区宽度为375px时，满足`max-width: 480px`的媒体条件，故图像尺寸为300px. 假设当前设备的dpr为2.0,那么就会去srcset中寻找300*2=600w的宽度描述符，若没有找到，则寻找更大的，找到700w，图片显示b.jpg
>
> 若没有找到更大的，则往剩下的中选最大的

>再举个栗子 dpr1.0 视口大小375 
>
```html
<img class="image" src="128px.jpg" srcset="128px.jpg 128w, 256px.jpg 256w,512px.jpg 512w" sizes="(max-width: 360px) 100px, 200px">
```
>最终呈现width=200px的256px.jpg

## 多图使用同一图像源的不同尺寸

一般情况下，了解上面就够了，我们也很少有多个`<img>`使用同一图像源的不同尺寸。

会提到这个主要是看<a href="http://www.zhangxinxu.com/wordpress/2014/10/responsive-images-srcset-size-w-descriptor/">张哥的文章</a>，里面举了一个这个例子

视口大小250，dpr1.0
```html
<img src="128px.jpg"
     srcset="128px.jpg 128w, 256px.jpg 256w, 512px.jpg 512w"
     sizes="(max-width: 360px) 340px, 128px">

<img src="128px.jpg"
     srcset="128px.jpg 128w, 256px.jpg 256w, 512px.jpg 512w"
     sizes="(max-width: 360px) calc(100vw - 20px), 128px">
```
`calc(100vw - 20px)`指的是*视口宽度-20px*，本例中值为230px
按上文分析，最后应该是显示img1为**512px.jpg**,img2为**256px.jpg**

可是最后显示的确是两张512px的图。

真如张哥说的，这是bug吗？

## 问题分析
首先，说是bug也得给这个bug安个理由，比如说出现同一图像源，会显示最大尺寸的那张。

我们从网络请求中发现，浏览器是做了 512px.jpg 和256px.jpg两次网络请求的，说明第二张图本来是想渲染256.jpg的

我们把两个img的位置换一个，后面一个img改用js的document.write输出，网络slow 3G,呈现的效果变成：**`第一个img先是256，等第二个img下载完毕后，第一个img也变成512了。`**

这说明我们刚刚随便找的理由好像有点靠边了！
 
google了一番，首先引入<a href="https://stackoverflow.com/questions/28155861/google-chrome-version-40-srcset-attribute-problems/28160797#28160797">stackoverflow</a>上的一个回答：

>It's a feature not a bug. Chrome does not switch the size because Chrome already has a larger image in cache, so there is no need to download new data of the same image.

也就是说，当浏览器中有较大的image资源缓存（512px）时，虽然本次渲染应该是渲染的256px，但是srcset满足以下条件时，就会去渲染512px的资源：
1. 设置了512px.jpg 并且其宽度描述符比当前256px.jpg的宽度描述符大
2. 这个512px.jpg的图片实际大小确实是比256px.jpg的图片实际大小大的。测试了一组 256px.jpg实际大小40x40 512px.jpg实际大小10x10，虽然设置了512px.jpg 512w但是并不会替换

并且这个srcset不是一开始设置完就结束了，它会继续监听，当出现更大的图片资源被缓存时，将替代当前img的图片资源，这就是现代浏览器做的优化！

（: 以上并没有看浏览器源码，纯属经验和测试结果后进行的猜测，有误欢迎指正

### 图片展示宽度

当出现图片资源被替换时，其img展示宽度并不一定和sizes所设置的图像尺寸一致了。举个栗子：
视口大小250，dpr1.0，注意img2的 **`512px.jpg 1024w`**
```html
<img src="128px.jpg"
     srcset="128px.jpg 128w, 256px.jpg 256w, 512px.jpg 512w"
     sizes="(max-width: 360px) 340px, 128px">

<img src="128px.jpg"
     srcset="128px.jpg 128w, 256px.jpg 256w, 512px.jpg 1024w"
     sizes="(max-width: 360px) 100px, 128px">
```
所以毫无疑问，两个都显示的512px.jpg

审查元素看一下，第一张图片的width为340px,第二张图却不是100 而是width=50px??

主要原因在于img2想用与img1一样的图片资源但是自己的宽度描述符却需要是img1的两倍才能达到，故浏览器认为img2只能拿到一半大小的图像，其换算为 `512/1024*100=50`

(: 感觉自己好像也只是在讲表象，没讲到根源

### 问题来了，若只是想渲染小图，不想受缓存的大图影响，在不修改srcset的前提下该怎么做呢？

试了下，没有办法，只有改srcset

## 参考资料：
https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img
http://www.zhangxinxu.com/wordpress/2014/10/responsive-images-srcset-size-w-descriptor/