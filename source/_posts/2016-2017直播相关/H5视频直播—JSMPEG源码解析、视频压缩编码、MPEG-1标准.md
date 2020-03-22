---
title: H5视频直播—JSMPEG源码解析、视频压缩编码、MPEG-1标准
date: 2016/08/17 11:00:00
categories: 流媒体
tags: 
  - HTML
---

# jsmpeg是什么？

    https://github.com/phoboslab/jsmpeg

一个[mpeg-1][1] video的js解码库

<!--more-->

# jsmpeg可以用来干什么？

利用ffmpeg采集视频源并推送到node.js服务器
nodejs利用ws模块*[基于tcp]*将数据包转发到网页，利用该js进行解码，提供canvas渲染
最后的效果就是浏览器能够实时看到视频源的数据
> 使用方法请参考github
> 本电脑使用记录

    1. cd到对应目录D:\nodejs\projects\live_audio 
    2. node stream-server.js ququ 9091 9092
    3. ffmpeg -f dshow -i video="Integrated Webcam"  -f mpeg1video -b 500k -r 20 -vf scale=640:360  http://localhost:9091/ququ/640/360

# 应用场景
基本直播场景都可以用到**[注意是基于tcp的]**
但是注意！！这个是只有视频 没有音频
PS:关于音频以及利用流媒体协议或封装格式做同步的下篇文章会写到


<!--more-->

# mpeg-1 video 简介
>随机访问
灵活的帧率`（最大25帧/s）`
可变的图像尺寸`(最大720*576)`
定义了`I-帧`、`P-帧（参考之前的I或P）`和`B-帧（参考前后的I或P 实时流不用这个）` 
运动补偿可跨越多个帧
半像素精度的运动向量 、量化矩阵、GOF结构 、slice结构
版权：free

**满足多达16路以上25帧/秒的压缩速度，在500kbit/s的压缩码流和352像素×288行的清晰度下，每帧大小仅为2k**

# mpeg-1 video 编码简介
这边只是说一下简单的做法，或者说是视频编码的基本做法 忽略了很多细节.. 
h164和mpeg1都是在此基础上进行改进的

参考

> http://blog.jobbole.com/95862/
> http://blog.csdn.net/leixiaohua1020/article/details/28114081

## （1）I帧(I-frames)
不依赖于其他视频帧
帧内压缩，jpeg编码技术,采用离散余弦变换DCT的压缩技术，GOP(帧组)的第一帧且一组只有一个I帧，不考虑运动矢量

### 变换编码-二维DCT
1. 假设一帧图像的大小为1280 * 720，首先将其以网格状的形式分成160 * 90个尺寸为8 * 8的彼此没有重叠的图像块
2. 每个8 * 8点的图像块被送入DCT编码器，将8 * 8的图像块从空间域变换为频率域
3. 一个实际8*8图像块[亮度值] 相邻像素亮度值差距不大
 ![请输入图片描述][2]  
4. 图像块经过DCT变换后的系数
 ![图像块经过DCT变换后的系数][3]

从图中可以看出，左上角(低频系数)集中大量能量，右下角(高频系数)能量小

5. 量化-有损压缩。人眼对低频敏感对高频不敏感，故对低频区的系数进行细量化，高频区的系数进行粗量化。
 **量化公式**：![请输入图片描述][4]

其中`FQ（u,v）`表示经过量化后的DCT系数；
`F（u,v）`表示量化前的DCT系数；
`Q（u,v）`表示量化加权矩阵；
`q`表示量化步长；
`round`表示归整，即将输出的值取为与之最接近的整数值。
合理选择量化系数，对变换后的图像块进行量化后的结果如图所示。
![请输入图片描述][5]

DCT系数量化后大部分为变为0，将少部分非0值进行压缩编码即可。

### 熵编码
 多用可变字长编码(VLC) 实现
基本原理是对信源中**出现概率大的符号赋予短码**，对于**出现概率小的符号赋予长码**，从而在统计上获得较短的平均码长。
游程编码`[常用，压缩效率不高，但编解码快]` 
参考：[计算机算法：数据压缩之游程编码][6]
实现：
1. 在上图量化DCT时对结果进行`Z-型扫描`化为一维序列(按图箭头方向)
2. 将该一维序列进行游程编码
3. 对编码后的数据再次进行VLC ( 比如 `Huffman`编码
## （2）P帧
播放解码时需要依赖于前面已解码的参考帧
需要帧存储器 
> PS:解码时如果都依赖I帧就比较简单，保存一份I帧数据到帧存储器即可，否则由于不知道参考的哪一帧 需要保存GOP里的所有I P到帧存储器

编码时直接拿前面参考帧的未编码数据
### 运动预测
将参考帧(P1,可以是I帧也可以是P帧)，预测帧(P2,待编码的P帧) 分块(例如将图像分割成n个16*16图像块)
定义两个颜色的误差为：

    PixelDiff(c1, c2) = (c1- c2) ^ 2

两个图像块之间的误差即16*16个PixelDiff的sum

    int block_diff(const unsigned char b1[16][16], const unsigned char b2[16][16]) { 
        int sum = 0; 
        for (int i = 0; i < 16; i++) { 
             for (int j = 0; j < 16; j++) { 
                  int c1 = b1[i][j]; 
                  int c2 = b2[i][j]; 
                  sum += (c1 – c2) * (c1 – c2); 
             } 
        } 
        return sum; 
    }

P2中每一个block找出上一帧中相似度最高的block坐标，并记录下来
做法可以直接2个for循环(暴力)
当然实际中不可能这么暴力搜索，而是围绕P2中该block对应坐标在P1中位置作为中心，慢慢四周扩散，搜索***一定步长,在一定误差范围内的宏块坐标***。
所以结果是，P2进行运动预测编码的结果就是一大堆(x,y)的坐标，代表P2上每个block在上一帧P1里面最相似的 block的位置
### P帧编码
刚才的运动预测矢量（一堆block的坐标），我们先用P1按照这些数据拼凑出一张类似P2的新图片叫做P2’，然后同P2上**每个像素**做减法，得到一张保存differ的图片：

    D = (P2 – P2′) / 2 

用一个 `8位的整数(只够表示256个数字)` 可以表示 [-255, 255] 之间的误差范围，步长精度是2。
> 即-2 -3映射到-1 (1000001) 解码时*2即可

由于是 **图片细节的修改**，比起I帧这种一整张图的图片 **熵要低很多**，占的空间也比较小
然后将D用类似于jpeg的算法进行编码 **`[DCT+熵编码]`**
故P帧的完整编码为：

    Encode(P2)=记录P1 block位置(x,y)的矩阵+类jpeg有损图像编码(D)

## （3）GOP
实时传输收到B帧无法播放，这里就不介绍B帧了，一般 I P 就足够了
一个GOP是这样的 I P1 P2 P3 P4... 
一般 P1 - Pn 都参考I 就好了， 虽然参考P可以得到更高的压缩空间

## （4）视频容器
mpg 记录视频信息，比如分辨率，帧率，时间索引

## （5）优化
编码效率优化：追求同质量（同信噪比）下更低的码率
编码性能优化：追求同样质量和码率的情况下，更快的编码速度。

# 混合编码模型

![请输入图片描述][7]

应用于MPEG1，MPEG2，H.264等标准中

# MPEG1 标准
与刚刚所说的简单编码所谓的优化。
MPEG1是保存的是YCbCr的4:2:2
关于YCbCr可以参考[RGB、YUV和YCbCr][8]

待更新。。


  [1]: http://baike.baidu.com/link?url=IdDNfUYYiss4iUee-J5RKHujDyCinU3pO07wdRGuMfEHw9Ih3OaoOHbCRwTuMT_ktsTwTgvniHVHVrmBZu3G8K
  [2]: http://img.blog.csdn.net/20140602173641875?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvbGVpeGlhb2h1YTEwMjA=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center
  [3]: http://img.blog.csdn.net/20140602173658734?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvbGVpeGlhb2h1YTEwMjA=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center
  [4]: http://img.blog.csdn.net/20140602173713140?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvbGVpeGlhb2h1YTEwMjA=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center
  [5]: http://img.blog.csdn.net/20140602173723046?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvbGVpeGlhb2h1YTEwMjA=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center
  [6]: http://blog.jobbole.com/79758/
  [7]: http://img.blog.csdn.net/20140602173439593?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvbGVpeGlhb2h1YTEwMjA=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast
  [8]: http://blog.sina.com.cn/s/blog_a85e142101010h8n.html