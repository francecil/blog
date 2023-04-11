
## 故事是这样的...

深夜 12 点，正当我快睡觉的时候，测试给我发了一条消息：「搜狗浏览器上，我们网站的布局乱了」



那时候我心想，估计是用了什么插件或者代理吧，改变了网站的样式（因为之前有遇到这样的情况），就直接回说：

「你在无痕模式下看看，记得别开代理」

以为事情就这么过去了，直到第二天上班，测试回我说，问题还在

这就让我纳闷了，我赶紧要了

## 一个中文汉字的宽度是多大



## 当然，有种场景是需要设置宽度的，就是显示省略号那种

### inline-block 指定宽度导致字体换行

成因：设计稿直接复制，设置了容器宽度
```css
width: 30px;
```

但实际上字体可能会大于 30px

相同浏览器和操作系统，显示不一致？？

设计稿 宽度 30px font-size: 15px

大概率是字体的原因

等宽字体 monospace 宽度比 font-size 大

sans-serif 设置了新宋体。奇数字体宽度为向上取偶数。标准字体为默认字体，即在没有设置family熟悉或者设置了从列表没找到相应字体时使用，再没找到就用系统默认的了。 arial 没有中文字体
10:06
其他两个一般系统默认不会安装

## 字体比例

下载一份新宋体，用 fontforge 打开看下效果

https://www.zhihu.com/question/20420500

https://developer.mozilla.org/zh-CN/docs/Web/CSS/font-family

https://www.w3cplus.com/css/css-font-metrics-line-height-and-vertical-align.html

https://fontforge.org/en-US/  设计字体

## 系统默认字体

Chrome 浏览器默认字体是 xxx ，有几种选项，一般也不会去动，而搜狗浏览器的默认字体就直接只有一种选项

## 字间距默认设置 

letter-spacing

默认值为 normal ，其值与 0 的区别是，用户代理可以设置这个属性的默认值

不过目前 Chrome 上我没找到可以设置的地方