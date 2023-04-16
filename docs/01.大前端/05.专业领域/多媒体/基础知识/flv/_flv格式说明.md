---
title: flv格式说明
date: 2018-09-11 17:17:12
permalink: /pages/8bbb2d/
categories: 
  - 大前端
  - 专业领域
  - 多媒体
  - 基础知识
  - flv
tags: 
  - 
titleTag: 草稿
---
## 总体结构
说明：`举例` 表示值为不固定，仅举例一个符合取值范围的值

- Header[`9B`]
  - Signature[`3B`]:文件标识，固定FLV三个字符(0x464C56)
  - Version[`1B`]:FLV版本号
  - Flags[`1B`]:第0位和第2位分别表示video与audio的存在情况（1存在0不存在）；0x05表示都存在
  - DataOffset[`4B`]:表示FLV的Header长度，固定为0x00000009（个人感觉这边可以改进


<!--more-->


- Body
  >  格式说明：
  >- PreviousTagSize[`4B`]:表示前一个Tag的size。
  > - Tag[`11B+xB`]
  >   - TagType[`1B`]:0x08:audio,0x09:video,0x12:scripts
  >   - TagDataSize[`3B`]:TagData的数据长度
  >   - Timestamp[`3B`]:时间戳
  >   - TimestampExtended[`1B`]:时间戳拓展字段
  >   - StreamId[`3B`]:总是0x000000
  >   - TagData[`xB`]:scripts数据部分说明
  >     - AMF1：Action Message Format，通用数据封装格式，由DataType[`1B`]+(DataSize)+DataValue组成，不定长度类型时才需要指定Size，所以后面的DataSize不一定存在。具体说明见下表1
  >     - AMF2
  >     - ...
  
  - PreviousTagSize0[`4B`]前面没有tag这边默认为0x00000000
  - Tag1[`11B+xB`]:scripts tag
    - TagType[`1B`]:0x12表示这是scripts
      > 一般只有一个script，是flv的第一个tag,用于存放flv基本信息：如duration、height、videodatarate、videocodecid等等
    - TagDataSize[`3B`]:TagData的数据长度，举例0x000125
    - Timestamp[`3B`]:scripts的时间戳为0x000000
    - TimestampExtended[`1B`]:0x00
    - StreamId[`3B`]:总是0x000000
    - TagData[`xB`]:scripts数据部分
      - AMF1:
        - DataType[`1B`]:0x02对应String type
        - DataSize[`2B`]:0x000A 表示数据长度为10
        - DataValue[`10B`]:`onMetaData`正好10个字节
      - AMF2:
        - DataType[`1B`]:0x08对应ECMA array type
        - DataSize[`4B`]:举例0x0000000D 表示数组长度为13，其后跟着13个键值对；
        - DataValue[`xB`]:
          - key1:keySize[`2B`]+keyName[`keySize B`]
          - value1:AMF
          - key(举例):0x0008,0x6475726174696F6E,表示`duration`
          - value(举例):0x00,0x4073A7851E8851EC,表示值为number类型，长度8B,值为4644239830933852000
          - ...
  - PreviousTagSize1[`4B`]：举例0x000125+0x0B=0x00000130
  - Tag2[`11B+xB`]:Video Config Tag
    - TagType[`1B`]:0x09表示这是video
    - TagDataSize[`3B`]:TagData的数据长度，这里是0x000030
    - Timestamp[`3B`]:0x000000
    - TimestampExtended[`1B`]:0x00
    - StreamId[`3B`]:总是0x000000
    - TagData[`xB`]:video数据部分,这里x是48
        - VideoTagHeader[`1B+(4B)`]:视频信息
          - 前四位为帧类型(FrameType)
            >| 值 | 类型 |
            >|--|--|
            >|1|keyframe (for AVC, a seekable frame) 关键帧|
            >|2|inter frame (for AVC, a non-seekable frame)|
            >|3|disposable inter frame (H.263 only)|
            >|4|generated keyframe (reserved for server use only)|
            >|5|video info/command frame|
          - 后四位为编码ID(CodecID)
            >| 值 | 类型 |
            >|--|--|
            >|1|JPEG (currently unused)|
            >|2| H.263|
            >|3|Screen video|
            >|4|On2 VP6|
            >|5|On2 VP6 with alpha channel|
            >|6|Screen video version 2|
            >|7|AVC|
            
            >当CodecID=7时，VideoTagHeader还需要再使用以下4个字节信息。一般来说现在都是7
          - AVCPacketType[`1B`]：H.264包类型，第一个video tag这里值为0x00
            >| 值 | 类型 |
            >|--|--|
            >|0|AVCDecoderConfigurationRecord(AVC sequence header)
            >|1|AVC NALU
            >|2|AVC end of sequence (lower level NALU sequence ender is not required or supported)

            >AVCDecoderConfigurationRecord 包含H.264解码相关的sps和pps信息，在给解码器送数据流前发送。
          - CompositionTime[`3B`]：这里值为0x000000
            >AVCPacketType!=1时取值为0，否则为 Composition time offset
        - Config 数据部分[`(x-5)B`]：sps、pps,这里是43B
          `0x01+sps[1]+sps[2]+sps[3]+0xFF+0xE1+spsSize(2B)+sps+01+ppsSize(2B)+pps`
          > 举例：
          >
          > 01 64 00 0D FF E1 00 1B 67 64 00 0D AC D9 41 61
          >
          > FB FF 0E 5B 0E 5A 10 00 00 06 40 00 01 76 A0 F1
          >
          > 42 99 60 01 00 05 68 EB EC B2 2C
          >
          > 得到:
          > spsSize=0x001B=27B、
          > sps=0x6764000DACD94161FBFF0E5B0E5A1000000640000176A0F142996001、
          > ppsSize=0x0005=5B、
          > pps=0x68EBECB22C、
  - PreviousTagSize2[`4B`]：举例0x000030+0x0B=0x0000003B
  - Tag3[`11B+xB`]:audio tag
    - TagType[`1B`]:0x08表示这是audio
    - TagDataSize[`3B`]:TagData的数据长度，这里是0x000007
    - Timestamp[`3B`]:0x000000
    - TimestampExtended[`1B`]:0x00
    - StreamId[`3B`]:总是0x000000
    - TagData[`xB`]:audio数据部分,这里x是7
      - 基本信息[`1B`]
        - 前4位：音频格式
          > | 值 | 类型 |
          >|--|--|
          >|0|Linear PCM, platform endian
          >|1|ADPCM
          >|2|MP3
          >|3|Linear PCM, little endian
          >|4|Nellymoser 16-kHz mono
          >|5|Nellymoser 8-kHz mono
          >|6|Nellymoser
          >|7|G.711 A-law logarithmic PCM
          >|8|G.711 mu-law logarithmic PCM
          >|9|reserved
          >|10|AAC
          >|11|Speex
          >|14|MP3 8-Khz
          >|15|Device-specific sound
        - 5~6位：采样率
          > | 值 | 类型 |
          >|--|--|
          >|0|5.5-kHz
          >|1|11-kHz
          >|2|22-kHz
          >|3|44-kHz
          > AAC格式这里值为3
        - 7位：采样长度
          > | 值 | 类型 |
          >|--|--|
          >|0|snd8Bit
          >|1|snd16Bit
          > 压缩音频都是16bit
        - 8位：音频类型
          > | 值 | 类型 |
          >|--|--|
          >|0|sndMono
          >|1|sndStereo
          > AAC格式这里值为1
      - 音频数据：举例，这里是6B
  - ...
  - Tag[`11B+xB`]:Video Data Tag
    - TagType[`1B`]:0x09表示这是video
    - TagDataSize[`3B`]:TagData的数据长度，距离这里是0x000330，即816B
    - Timestamp[`3B`]:举例0x000038
    - TimestampExtended[`1B`]:0x00
    - StreamId[`3B`]:总是0x000000
    - TagData[`xB`]:video数据部分,这里x是816
      - VideoTagHeader[`1B+(4B)`]:视频信息
        > 这里举例0x17 即 keyframe、AVC
        - AVCPacketType[`1B`],这里取值0x01,即AVC NALU
        - CompositionTime[`3B`]：举例这里值为0x000043
      - NALU 数据部分[`(x-5)B`]：这里是811B

## sps pps详解

### sps - 序列参数集

### pps - 图像参数集
 


## 附表

### 表1:AMF数据类型说明

| 值  | 类型              | 说明              |
| --- | ----------------- | ----------------- |
| 0   | Number type       | 8 Bypte Double    |
| 1   | Boolean type      | 1 Bypte bool      |
| 2   | String type       | 后面2个字节为长度 |
| 3   | Object type       |
| 4   | MovieClip type    |
| 5   | Null type         |
| 6   | Undefined type    |
| 7   | Reference type    |
| 8   | ECMA array type   | 数组,类似Map      |
| 10  | Strict array type |
| 11  | Date type         |
| 12  | Long string type  | 后面4个字节为长度 |

### 视频信息Frame Type表

| 值 | 类型 |
|--|--|
|1|keyframe (for AVC, a seekable frame) 关键帧|
|2|inter frame (for AVC, a non-seekable frame)|
|3|disposable inter frame (H.263 only)|
|4|generated keyframe (reserved for server use only)|
|5|video info/command frame|

### 视频信息编码ID表


| 值 | 类型 |
|--|--|
|1|JPEG (currently unused)|
|2| H.263|
|3|Screen video|
|4|On2 VP6|
|5|On2 VP6 with alpha channel|
|6|Screen video version 2|
|7|AVC|

### AVCPacketType H.264包类型

| 值 | 类型 |
|--|--|
|0|AVCDecoderConfigurationRecord(AVC sequence header)
|1|AVC NALU
|2|AVC end of sequence (lower level NALU sequence ender is not required or supported)

### 音频格式表
| 值 | 类型 |
|--|--|
|0|Linear PCM, platform endian
|1|ADPCM
|2|MP3
|3|Linear PCM, little endian
|4|Nellymoser 16-kHz mono
|5|Nellymoser 8-kHz mono
|6|Nellymoser
|7|G.711 A-law logarithmic PCM
|8|G.711 mu-law logarithmic PCM
|9|reserved
|10|AAC
|11|Speex
|14|MP3 8-Khz
|15|Device-specific sound

参考：

<a href="https://www.jianshu.com/p/7ffaec7b3be6">flv格式详解+实例剖析</a>