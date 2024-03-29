---
title: 速看，iPhone 惊天漏洞，双重验证也挡不住被盗刷 | 漏洞分析 | 防护技巧
date: 2023-07-26 10:26:37
permalink: /pages/4a15cd/
sidebar: auto
categories: 
  - 随笔
  - 2023
tags: 
  - 
---

苹果一直标榜自己安全，即使自己的苹果账号和密码泄露，在**其他新设备上或网页上登录**还需要进行双重验证。

> 所谓[双重验证](https://support.apple.com/zh-cn/HT204915)就是还需要提供自动显示在**其他受信任设备上**的六位验证码，或者**受信任电话号码**的手机验证码
>
> <img src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9f0a0515228f4a409ad135c1dd19204e~tplv-k3u1fbpfcp-zoom-1.image" alt="" width="50%" />

你是不是以为这样就高枕无忧了，即使密码泄露了，账号也不会随意出问题？今天这个事，狠狠打了苹果的脸。

<!-- more -->

本文将分成以下 5 部分进行讲解：

*   事情经过
*   漏洞分析
*   防范技巧
*   常见疑问
*   后续跟进

# 事情经过

> 原贴地址：[家人的 Apple ID 开了双重认证，仍然被钓鱼，求大佬解惑，也顺便给大家提个醒](https://v2ex.com/t/959041)

**一句话描述**：贴主家人下载了一款钓鱼 App ，该 App 提供了**苹果一键登录（这里划重点）** ，并在登录后**弹出一个假弹窗（这里划重点）** 要求你再次输入密码。你可能以为是自己人脸没成功或者密码输入错误，一旦你按要求做了，你的苹果账号就不属于你了，已经**被绑定上了其他号码**，可以在**任意设备上登录（这里划重点）。**

以下为长截图方便大家查看（点击放大查看）。

<img src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6a165cfeca0a45abb866e79c8d67f926~tplv-k3u1fbpfcp-zoom-1.image" alt="" width="30%" />

你是不是会开始疑惑：

1.  使用苹果一键登录为何会有问题？**因为这个是苹果官网的系统登录，不是正经的 App 一键登录。这个动作登录后，骗子此时还不知道密码，危险性还好。**
2.  为何账号在其他设备上登录不会触发双重验证？**因为骗子把其他受信任设备删了，走的受信任手机号登录。**
3.  我的苹果账号是怎么绑定上其他手机号的？**在苹果官网可以添加受信任手机号（同理也可以删除），但是需要输入账号密码，所以骗子还弹出了一个弹窗用来获取密码。。**

还看不懂？不着急，下面的漏洞分析将为你详细讲解。

# 漏洞分析

要利用该漏洞需要进行以下 3 个步骤：

1.  在 App 内登录苹果官方页面
2.  获取苹果账号密码，添加上骗子的受信任手机号
3.  异地登录，用受信任手机号绕过双重验证

<!---->

## 1. 苹果官方页面登录

先说一个技术背景：各个厂商系统为了方便自家网站的登录以及安全性，都会提供系统级的便捷登录

以 iPhone 为例，可以尝试在 Safari （或者其他浏览器、微信）中上打开[苹果官方登录页面](https://appleid.apple.com/)，它会直接唤起 Apple ID 登录。

<img src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6b4e2da40ec8453db9a0f64b143a46cd~tplv-k3u1fbpfcp-zoom-1.image" alt="" width="30%" />

乍一看，这个弹窗和钓鱼 App 怎么一模一样。。

<img src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0132a8ae735f4a86ac389772e050dfc6~tplv-k3u1fbpfcp-zoom-1.image" alt="" width="30%" />

而实际上正经的苹果一键登录不长这样，以京东为例：

<img src="https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/25d747b4ed7a4d97817f431b0dcf093f~tplv-k3u1fbpfcp-watermark.image" alt="" width="30%" />



> 然而这个页面是可以**半自定义**的，理论上可以做得和苹果官方站点很像，所以才防不胜防。。

如果直接打开苹果官网，用户容易察觉，所以钓鱼 App 就**将这个浏览器进行了隐藏**，让用户看不出来。。。

到了这一步，钓鱼 App 已经可以控制我们的苹果官网页面的所有功能了，包括：

1.  查看账号 ID
2.  移除受信任设备
3.  添加受信任手机号码（需要输入苹果账号密码）

由于登录这一步是系统做的，此时钓鱼 App 还拿不到账号密码，于是就进行了第二步攻击。

## 2. 获取苹果账号密码

日常使用 iPhone 购买或登录时，经常会遇到人脸识别不通过让输入密码的情况。骗子就是利用这个心理，立即弹出了一个输入密码的弹窗，让你以为是自己没通过验证。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/53651da329aa4cb7ac62e3bfa20a96f6~tplv-k3u1fbpfcp-zoom-1.image)

> AppLeID 文案。。是它最后的善良。。。

一旦输入密码后，骗子就可以**利用脚本**控制苹果官网的行为 **（技术行话叫 Webview Evaluate** **JavaScript** **）** ，包括添加受信任手机号码。

至此，你的苹果账号已经不属于你了，骗子将会开始第三步攻击：用受信任手机号绕过双重验证。

## 3. 用受信任手机号绕过双重验证

正如前文所说，双重验证可以选择使用自动显示在**其他受信任设备上**的六位验证码，或者**受信任电话号码**的手机验证码。

然而，受信任设备已经删完，现在默认只会走受信任电话号码，而这个电话号码又是骗子的号码。

于是，双重验证形同虚设，骗子轻松异地登录，实现账号控制。

而如果苹果账号还绑定了微信自动扣款，那么等待用户的，就是无尽的盗刷。。

## 小结

1.  钓鱼 app 内部启动内置的浏览器访问 apple 官网
2.  苹果对于 apple 官网的登录，允许使用手机上的苹果账号直接登录，效果上有点像一键登录，存在迷惑性
3.  登录 apple 官网后，想要给 apple 账号添加辅助手机号，还需要输入账号密码
4.  一旦添加上辅助手机号，这个苹果账号基本已经不属于自己，诈骗者可以随时攻击
5.  如果苹果账号绑定了自动扣款，那么诈骗方就可以随意盗刷了

# 防范技巧

1.  观察苹果一键登录界面，如果弹窗样式和以下一样，又出现「appleid.apple.com」红框文案，必为诈骗

<img src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cc8a18eefa254ade9215c3e04a3b94a2~tplv-k3u1fbpfcp-zoom-1.image" alt="" width="30%" />

2.  如果没注意登录了，又让输入密码，先拒绝再说，宁愿重新回到上一步流程，观察登录弹窗样式
3.  一旦没注意输入密码，请立即冻结银行卡和微信支付，并联系苹果客户处理

# 常见疑问

看到一些错误言论，我这边也做个回答。

## 误解1：故意输错密码用来防骗

拜托，不会以为现在的骗子还那么傻，用错密码还会让你登进去吧。

实际上如果用了错密码，骗子那边是能够拿到错误的返回状态，原封不动的将错误显示在登录页面，看你怎么防。。

## 误解2：为什么这个 App 能够审核上架

骗过苹果审核早不是什么秘密了，可以搞个阴阳版本，针对审核环节下发不同的逻辑，某大厂就是这么做的。

所以，不要太相信苹果审核。

# 后续跟进

看贴主目前是说还在和苹果客服 Battle

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c8e680e33a7843fbb82c84598976af1c~tplv-k3u1fbpfcp-zoom-1.image)

按理说这个锅，苹果应该占 9 成，就不应该**让内置 Webview 能够使用苹果一键登录，** 期待后续苹果官方的处理吧。

***

如果本文对你有用的话，欢迎一键三连（点赞、收藏、分享）哦 \~ ✿✿ヽ(°▽°)ノ✿\~
