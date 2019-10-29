# 手势
注意保证 保证PC web端和APP端 的兼容性
fiiser 通过wss传输 [x,y,isTouched] 
isTouched为监测鼠标移动/APP端触摸 是否按下
研究了下其实不需要第三个参数，用js判断不传输就好了。
# 音视频传输
直接通过wss传输binary frame, 客户端这边再解码 渲染
其中用到了Emscripten native2web的翻译，还用到了asm.js 主要翻译解码库(Decoder.min.js 第1335行)
## 关于解码
H.264通过BroadwayJS解码(Decoder.min.js 第19655行)
音频(这边我没找到它是怎么编码的) 数据利用base64解码(Decoder.min.js 第1127行)
网上有人利用Speex.js进行编解码，再利用AudioContext渲染
不过Speex.js我没用过..貌似还得编译，可以客户端编码为mp3orOgg 利用AudioContext自带的decode去解(硬解码)
不过mp3的编码格式最近还在看

## 关于渲染
音频上 由于 WebRTC 及 Web Audio API（AudioContext）不支持 IE 11，但是fiiser支持IE11
所以fiiser不是利用以上两种解决方案，音频渲染貌似是利用https://github.com/googleads/videojs-ima这个引擎做的，
貌似挺复杂，我们可以放弃IE 11 ，利用AudioContext来做
视频渲染是利用上一步的BroadwayJS解码后直接交给Canvas和WebGL（参考Player.min.js

## 关于同步
wss每5s发送一个同步命令 让audio同步video ：fiiser的指令：4.sync,13.1469504534037;
暂时不知道其含义 

## 关于性能
由于利用了WebWorker（可以理解为后台进程）
Emscripten 把C/C++开发的应用编译成JS 会进行js的优化，比本地js代码效率高2倍以上
（参考 http://ejohn.org/blog/asmjs-javascript-compile-target/
通过使用 use strict 和 use asm 来提高性能(简单来说就是让js写的严谨否则会报错)
