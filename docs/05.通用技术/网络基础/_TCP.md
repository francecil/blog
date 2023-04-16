---
title: TCP
date: 2019-12-14 21:38:09
permalink: /pages/f16f21/
categories: 
  - 通用技术
  - 网络基础
tags: 
  - 
titleTag: 草稿
---

## TCP

刚开始的时候，一直疑惑： A 可以向 B 发送信息了，不就代表 B 也可以向 A 发消息么？

在学过网络相关课程后，就知道了，网络可以配置出入口， `A->B` 的通道正常，不代表 `B->A` 的通道正常

举例: `A<->C->B` ，此时 B 就无法向 A 发消息



1. 建立连接 - 三次握手

双方都能确定自己的收、发能力正常

![@猿人谷](https://user-gold-cdn.xitu.io/2019/10/8/16da9fd28a45bd19?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

2. 数据传输

连接握手之后，每次发送数据都需要进行握手么，如果网络抖动数据没发送成功怎么判断重传的？


::: details Answer
  
  不需要， A 向 B 发送完数据， B 会给关于收到信息的回馈
:::

3. 断开连接 - 四次挥手


![tcpipguide](https://my-1255788407.cos.ap-shanghai.myqcloud.com/tcp_close.png)

第一次挥手(FIN=1，seq=x) A 向 B 发送一个 FIN 包，表明自己没有数据发送了，但仍可接受数据

第二次挥手(ACK=1，ACKnum=x+1) B 收到 A 的 FIN 包,向 A 发送一个 ACK 包，表明自己收到了 A 的关闭请求

第三次挥手(FIN=1，seq=y) B 向 A 发送一个 FIN 包，表明自己可以关闭连接了

第四次挥手(ACK=1，ACKnum=y+1) A 向 B 发送一个 ACK 包，表明自己收到了 B 的关闭请求。 B 收到 ACK 包后关闭连接

A 在等待 2MSL 之后，没有收到 B 重传的 FIN 表明 B 已正常关闭，则自己也关闭连接

Q1: 如果 B 马上可以关闭，可以合并第2,3次挥手，直接向 A 发送 ACK,FIN 么？

::: details Answer

  可以， RFC793 3.5节有提到这个优化
  
  参考自[tcp/ip 四次挥手？no, 还有三次挥手](https://blog.csdn.net/zqz_zqz/article/details/79548381)

  但是很多场景是依赖于应用层的，B 收到 A 的关闭请求，需要询问应用层，等待关闭的回馈，反正都要等，为什么不早点把 ACK 包发出去呢？当然，应用层想直接关闭（即使还有消息未发送也不发了）也可以，这样传输效率更高，就是多了 B 和应用层消息交互的短暂时间

  参考自[TCP中断可以用3次挥手吗？](https://www.zhihu.com/question/50646354)
:::


Q2: 第四次挥手后，为什么还得等待，直接关闭不行么，什么情况下会收到 B 的 ACK
::: details Answer
  
  不可以，如果第四次挥手 A 发往 B 的 ACK 包丢失了，那 B 什么时候关闭？如果说 B 发完 FIN 包直接关闭，那要是 FIN 包丢了呢？那 A 也不知道自己什么时候关闭

  所以 B 在发完 FIN 包之后会进入 LAST-ACK 状态，在一定时间内没收到 A 的回复，要么 FIN 丢了，要么 ACK 丢了，所以 B 不断的重发 FIN 给 A 告诉 A 自己没收到其发过来的 ACK

  因此 A 在需要等待一段时间，根据 B 有没有重发 FIN 来判断自己的 ACK 有没有发送成功
:::

Q3: 为什么是 2MSL，具体时间是多少？ 

::: details Answer
  
  MSL （Maximum Segment Lifetime）即报文段最大生存时间，是任何报文在网络上存在的最长时间，超过这个时间的报文将被丢弃。可以在 OS 中可以设置值的大小，例如我本机是 60s 
  > 参考自[Linux和Windows系统修改MSL的值](https://blog.csdn.net/qwertyupoiuytr/article/details/71436967)


  回到问题，为什么是 2MSL ？ 
  
防止 TCP 连接混用：这 2个 MSL 中的第一个 MSL 是为了等自己发出去的最后一个 ACK 从网络中消失，而第二 MSL 是为了等在对端收到 ACK 之前的一刹那可能重传的 FIN 报文从网络中消失。

> 参考：[为什么TCP4次挥手时等待为2MSL？ - 知乎](https://www.zhihu.com/question/67013338)
  如果第一次的 fin 比最后一次快，A 将收不到 FIN 就断开了，而 B 也会重试几次达到上限然后断开

:::

### 拓展阅读

1. [TCP面试题](https://github.com/Advanced-Interview-Question/front-end-interview/blob/dev/docs/guide/tcp.md)
2. [面试官，请别再问我 3 次握手与 4 次挥手了！
](https://juejin.im/post/5d9c284b518825095879e7a5)
3. [为什么tcp的TIME_WAIT状态要维持2MSL](https://cloud.tencent.com/developer/article/1450264)