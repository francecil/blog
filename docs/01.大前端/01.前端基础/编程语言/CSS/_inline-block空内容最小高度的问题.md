

默认字体的原因，父容器设置 font-size 0px 即可



https://segmentfault.com/q/1010000014455867

https://www.zhangxinxu.com/wordpress/2015/08/css-deep-understand-vertical-align-and-line-height/



## 使用 padding-top 占位图在 Safari 的异常表现

padding-top 百分比参照是父容器宽度

container 1000px
  wrapper   200px
    item      padding-top:100% => height:200px

    如果 item 里面有内容，会有 line-height 的问题

overflow: hidden 解决

demo https://codesandbox.io/s/tender-lamarr-zq65c?file=/src/styles.css


## 撑开在 ie 11 也有问题

https://www.geek-share.com/detail/2733122778.html