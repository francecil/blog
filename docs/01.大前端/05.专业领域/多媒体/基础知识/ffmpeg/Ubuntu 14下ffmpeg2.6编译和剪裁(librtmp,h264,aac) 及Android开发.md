---
title: Ubuntu 14下ffmpeg2.6编译和剪裁(librtmp,h264,aac) 及Android开发
date: 2016/07/10 11:00:00
tags: 
  - ffmpeg
  - Android
permalink: /pages/a17f40/
categories: 
  - 大前端
  - 专业领域
  - 多媒体
  - 基础知识
  - ffmpeg
---

## 前言

本来写的是最新版3.0的 但是遇到太多坑，编译老错 换老版本的2.6

## 配置Java环境

**如果只是编译ffmpeg 该步骤非必要，仅是做个记录**
从[http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html][1]下载jdk8

下载完文件默认在 `~/Downloads`


<!--more-->

```
    ~# cd Downloads
    ~/Downloads# sudo mkdir /usr/java       //创建目录用于存放
    ~/Downloads# sudo tar zxvf jdk-8u91-linux-x64.tar.gz -C /usr/java //解压
    ~/Downloads# cd /usr/java/
    /usr/java# sudo mv jdk-8u91-linux-x64  jdk8  //改名,后面配置就比较方便
    /usr/java# sudo gedit /etc/environment
    //如果发现错误，可能是gedit的命令(usr/bin)没添加到系统环境下
    //如果不能访问 就chmod 777 /etc/environment  
    //并且在environment中配置的只有root用户有效 且关闭终端后无效因此配置在/etc/profile最好
    //再这里我们可以用gedit的全路径 也可以用vim
    // 先按照
    sudo apt-get install vim
    /usr/java# sudo vim /etc/profile
    //vim命令：dd删除一样 yy复制一行 p粘贴 在environment中加入
     export JAVA_HOME=/usr/java/jdk8
     export JRE_HOME=/usr/java/jdk8/jre
     export CLASSPATH=.:$JAVA_HOME/lib:$JRE_HOME/lib:$CLASSPATH
     export PATH=$JAVA_HOME/bin:$JRE_HOME/bin:$PATH
     > ubuntu启动后 先加载environment再加载profile
     //注意 要按顺序写 比如JAVA_HOME写在后面 PATH的$JAVA_HOME就是空了
     //:wq 保存退出
     注意 要重启。且注意这边配置要小心 否则会开不了机
     java -version 查看jdk版本 输出信息则成功
```

## 配置android linux NDK以及SDK

如果只是编译ffmpeg 只要下载sdk ndk并配置环境就可以


### Android studio 2.1 download

参考：[https://developer.android.com/studio/install.html][2]
下载`android studio 2.1` 
[https://developer.android.com/studio/index.html][3] (拖到下面有各种版本)

    /usr# sudo mkdir android
    ~/Downloads# unzip xxx.zip -d /usr/android 将xxx文件解压到android目录下



`Note`: If you are running `a 64-bit version of Ubuntu`, you need to install some 32-bit libraries with the following command:

    sudo apt-get install lib32z1 lib32ncurses5 lib32bz2-1.0 lib32stdc++6

利用`/bin/studio.sh`可以启动`android-studio`

    Tip: Add android-studio/bin/ to your PATH environment variable so you can start Android Studio from any directory.



运行`studio.sh`

    `error:`unable to detect graphics environment
    xdg_runtime_dir not set in the environment

    参考 http://www.cnblogs.com/gaodong/p/3463152.html
    加上 `export DISPLAY=:0.0`

切换到界面窗口
 按步骤安装 可以选择之前下好的sdk

然后创建 helloworld项目 运行..（话说，真是卡。。）

还是用命令吧..

### 配置 sdk ndk 环境变量

sdk下载https://developer.android.com/studio/index.html 下方
ndk下载https://developer.android.com/ndk/downloads/index.html

类似配置：`PATH=$PATH:/home/android_sdk/tools:/home/android_sdk/ndk`


## 从ffmpeg官网下载ffmpeg源码包

```sh
git clone https://git.ffmpeg.org/ffmpeg.git ffmpeg
# 没安装git的先安装
sudo apt-get install git
```

## 修改 ffmpeg/configure 文件

将该文件

    SLIBNAME_WITH_MAJOR='$(SLIBNAME).$(LIBMAJOR)'
    LIB_INSTALL_EXTRA_CMD='$$(RANLIB)"$(LIBDIR)/$(LIBNAME)"'
    SLIB_INSTALL_NAME='$(SLIBNAME_WITH_VERSION)'
    SLIB_INSTALL_LINKS='$(SLIBNAME_WITH_MAJOR)$(SLIBNAME)'

修改为：

    SLIBNAME_WITH_MAJOR='$(SLIBPREF)$(FULLNAME)-$(LIBMAJOR)$(SLIBSUF)'
    LIB_INSTALL_EXTRA_CMD='$$(RANLIB)"$(LIBDIR)/$(LIBNAME)"'
    SLIB_INSTALL_NAME='$(SLIBNAME_WITH_MAJOR)'
    SLIB_INSTALL_LINKS='$(SLIBNAME)'

这样编译出来的so命名才符合android的使用

接下来这些参考：https://trac.ffmpeg.org/wiki/CompilationGuide/Ubuntu

## 安装类库

### 安装基本的工具类库

```sh
sudo apt-get update
sudo apt-get install build-essential checkinstall git libfaac-dev libjack-jackd2-dev   libmp3lame-dev libopencore-amrnb-dev libopencore-amrwb-dev libsdl1.2-dev libtheora-dev    libva-dev libvdpau-dev libvorbis-dev libx11-dev libxfixes-dev texi2html zlib1g-dev       libssl1.0.0 libssl-dev libxvidcore-dev libxvidcore4 libass-dev
```

### Yasm

一个汇编程序被推荐用于x264 和 ffmpeg (只要解码不知道这样要不要装 蛮装了
如果 库中 yasm package ≥ 1.2.0 可以这样

```sh
sudo apt-get install yasm
```

否则只能
```sh
cd ~/ffmpeg_sources
wget http://www.tortall.net/projects/yasm/releases/yasm-1.3.0.tar.gz
tar xzvf yasm-1.3.0.tar.gz
cd yasm-1.3.0
./configure --prefix="$HOME/ffmpeg_build" --bindir="$HOME/bin"
make
make install
make distclean
```
### libx264 

更多的详见https://trac.ffmpeg.org/wiki/CompilationGuide/Ubuntu
我只需要解码的 这边我就不需要安装了

### librtmp的支持

自带的rtmp只能支持播放非直播的 `rtmp(live !=1)`，而添加 librtmp 之后是可以播放直播的视频 并支持多种格式(rtmp://, rtmpt://, rtmpe://, rtmpte://,以及 rtmps://协议)

```sh
cd ~/src
git clone git://git.ffmpeg.org/rtmpdump
cd rtmpdump
make SYS=posix
sudo checkinstall --pkgname=rtmpdump --pkgversion="2:$(date +%Y%m%d%H%M)-git" --backup=no  --deldoc=yes --fstrans=no --default
```

### 编译脚本和配置选项

参考https://github.com/dxjia/ffmpeg-compile-shared-library-for-android

1. 指定临时目录
```sh
export TMPDIR=/home/gahing/tmpdir
```

2. 指定NDK路径
```
NDK=/home/Downloads/android-linux-sdk/android-ndk-r12b
```

3. 指定使用NDK Platform版本

```
SYSROOT=$NDK/platforms/android-16/arch-arm/
```

一定要选择比你的目标机器使用的版本低的

4. 指定编译工具链

```
TOOLCHAIN=$ND
K/toolchains/arm-linux-androideabi-4.9/prebuilt/linux-x86_64
```
5. 指定编译后的安装目录

```
PREFIX=/home/gahing/ffmpeg_shared_compile/arm
```

示例脚本1 支持所有的编解码器 arm版本

#!/bin/bash
export TMPDIR=/home/gahing/tmpdir
PREFIX=$HOME/ffmpeg_shared_compile/
NDK=/home/gahing/Downloads/android-sdk-linux/android-ndk-r12b
SYSROOT=$NDK/platforms/android-16/arch-arm/
TOOLCHAIN=$NDK/toolchains/arm-linux-androideabi-4.9/prebuilt/linux-x86_64
CPU=arm
ADDI_CFLAGS="-marm"
function build_one
{
./configure \
--prefix=$PREFIX \
--enable-shared \
--disable-static \
--disable-doc \
--disable-ffmpeg \
--disable-ffplay \
--disable-ffprobe \
--disable-ffserver \
--disable-doc \
--disable-symver \
--enable-small \
--cross-prefix=$TOOLCHAIN/bin/arm-linux-androideabi- \
--target-os=linux \
--arch=arm \
--enable-cross-compile \
--sysroot=$SYSROOT \
--extra-cflags="-Os -fpic $ADDI_CFLAGS" \
--extra-ldflags="$ADDI_LDFLAGS" \
$ADDITIONAL_CONFIGURE_FLAG
make clean
make
make install
}
build_one

so的全部文件大概8~9M

示例脚本2 本章题目的要求（该脚本有问题 待解救）


```sh
#!/bin/bash
make clean
export TMPDIR=/home/gahing/tmpdir
PREFIX=$HOME/ffmpeg_shared_compile/
NDK=/home/gahing/Downloads/android-sdk-linux/android-ndk-r12b
SYSROOT=$NDK/platforms/android-16/arch-arm/
TOOLCHAIN=$NDK/toolchains/arm-linux-androideabi-4.9/prebuilt/linux-x86_64
CPU=arm
ADDI_CFLAGS="-marm"
function build_one
{
./configure \
--prefix=$PREFIX \
--enable-shared \
--disable-static \
--disable-avdevice \
--disable-avfilter \
--disable-network \
--disable-encoders \
--disable-doc \
--disable-ffmpeg \
--disable-ffplay \
--disable-ffprobe \
--disable-ffserver \
--disable-doc \
--disable-symver \
--disable-muxers \
--disable-demuxers \
--disable-debug  \
--disable-yasm \
--disable-parsers \
--disable-decoders \
--disable-everything \
--enable-nonfree \
--enable-gpl  \
--enable-postproc  \
--enable-vdpau \
--enable-librtmp \
--enable-decoder=h264 \
--enable-decoder=aac  \
--enable-decoder=h264_vdpau\
--enable-parser=aac \
--enable-parser=h264 \
--enable-protocol=rtmp \
--enable-small \
--cross-prefix=$TOOLCHAIN/bin/arm-linux-androideabi- \
--target-os=linux \
--arch=arm \
--enable-cross-compile \
--sysroot=$SYSROOT \
--extra-cflags="-Os -fpic $ADDI_CFLAGS" \
--extra-ldflags="$ADDI_LDFLAGS" \
$ADDITIONAL_CONFIGURE_FLAG  
}  
  
build_one  
  
make  
make install  
```



6. 生成so

运行脚本后 `$PREFIX` 目录下生成 include和lib两个文件夹，将lib文件夹中的 pkgconfig 目录和so的链接文件删除，只保留so文件，然后将include 和lib两个目录一起copy到你的apk jni下去编译

之后可以参考
[http://blog.csdn.net/leixiaohua1020/article/details/47008825][4]

eclipse下编写jni参考[http://www.cnblogs.com/skyseraph/p/3979238.html][5]


  [1]: http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html
  [2]: https://developer.android.com/studio/install.html
  [3]: https://developer.android.com/studio/index.html
  [4]: http://blog.csdn.net/leixiaohua1020/article/details/47008825
  [5]: http://www.cnblogs.com/skyseraph/p/3979238.html