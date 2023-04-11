---
title: 基于 opencv.js 实现图像内矩形物品的自动提取
date: 2020/01/17 00:00:00
tags: 
  - OpenCV
permalink: /pages/ae4e49/
---

## 前言

大学的时候研究了一段时间的 OpenCV ，当时做了一个这样的小工具 [RunFace](https://github.com/francecil/RunFace)：

<!-- more -->

有两张照片，第一张照片带白纸，通过合成会将第二张照片转换到第一张照片的白纸处

![物品替换](https://upload-images.jianshu.io/upload_images/9277731-f4c330edac89029a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

正好最近看到 OpenCV 在前端有对应的实现库，就想着做个纯前端版本，这次我们实现反向效果，将合成图中的矩形图像提取出来


![rectangle-extract](https://upload-images.jianshu.io/upload_images/9277731-a65795c8ec1f9735.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


已开源，详见 [rectangle-extract-opencvjs](https://github.com/francecil/rectangle-extract-opencvjs) 


[在线地址](https://francecil.github.io/rectangle-extract-opencvjs/)

主要的应用场景有：去除身份证照背景得到扫描件

> 当然，这些用 ps 很容易实现

## 实现要点

### 一、生成 opencv.js

可以选择自己编译，用的是 LLVM 那套工具链

详见 [Build OpenCV.js](https://docs.opencv.org/4.2.0/d4/da1/tutorial_js_setup.html)

我是直接用的现成的 js 文件，大概 8M 

有个疑问，自己编译的话不知是否可以选择仅编译某些模块，这样生成的包就比较小了

### 二、算法流程

![矩形抽离流程图](https://upload-images.jianshu.io/upload_images/9277731-7f8c188b0b79fbdf.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

我们以下面原图为例

![原图](https://user-gold-cdn.xitu.io/2020/1/21/16fc6b8a3bef2cb0?w=1334&h=1000&f=jpeg&s=156315)

#### 预处理

分为尺寸调整和滤波

尺寸调整是将图片宽高等比例缩小到 200px 以内，目的是为了提高处理效率，且让滤波效果更好

滤波的作用是保边（边缘锐化）去噪（去除纹理），方便后续目标图像的提取

滤波可以用 双边滤波 或者 meanshift 滤波

![预处理](https://upload-images.jianshu.io/upload_images/9277731-996a1fdd15be6a67.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


#### 提取前景图

在当前应用场景，目标矩形图像占比较大，我们可以直接取中点进行漫水填充

即通过应用 floodFill 算法得到灰度图

![漫水填充](https://upload-images.jianshu.io/upload_images/9277731-b168ca6699ab95a5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

应用中值滤波去噪

![中值去噪](https://upload-images.jianshu.io/upload_images/9277731-38ac88389cd3472e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

这样我们就得到一个二值图像了

后续考虑更通用的场景，可以引入用户交互：以用户触碰点进行漫水填充

#### 直线检测

先利用 Canny 算子进行边缘检测

![边缘检测](https://upload-images.jianshu.io/upload_images/9277731-367c71d9b042722b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


然后通过 HoughLines 变换得到直线

![直线检测](https://upload-images.jianshu.io/upload_images/9277731-31257448062a25fa.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

这里不选用 HoughLinesP 检测线段，主要原因是得到的线段都是短线段且方向变化较大，不利于后续的计算；还有一个原因是不能处理图像部分缺失的情况

当然这里的场景也不需要考虑目标图像部分缺失的情况。

#### 顶点坐标计算

计算所有直线的交点

过滤掉坐标不在范围的

![交点.png](https://upload-images.jianshu.io/upload_images/9277731-8142299b4497fc4f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

本来打算打算通过 kmeans 进行聚类，发现 opencv 自带的不太好用(也可能是我姿势不对)

取巧，先计算中点，然后根据极坐标对所有交点进行排序，欧式距离在一定范围内的属于同一类

我们得到了多个聚类，取元素最多的四个分类，并得到四个均值坐标

最后以左上角（横纵坐标均小于中点）为第一个点，进行顺时针排序

#### 矩阵变换

将原图的四个坐标变换到目标图片的四个新的点

这里存在一个问题，就是新的目标图片的宽高应该是多少，这里我们直接取原图的宽高

后续有时间的话再研究下自动识别目标图宽高的算法

最后再横纵缩放一半（压缩），得到最后的结果

![结果](https://upload-images.jianshu.io/upload_images/9277731-a1ebc28e8965fd62.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

### 三、界面布局

借鉴了该文章的代码 [[OpenCV Web] Should You Use OpenCV JS?](https://blog.theodo.com/2019/02/computer-vision-web-opencv-js/) 

用的 bootstrap 进行布局

### 四、代码实现

接口的使用方式基本上和其他语言相同

不清楚的话可以查看 [api 文档](https://docs.opencv.org/4.2.0/)

或者先玩玩这些[图像处理相关demo](https://docs.opencv.org/4.2.0/d2/df0/tutorial_js_table_of_contents_imgproc.html) 

总的来说，文档较为匮乏，很多接口没有说明，只能通过其他语言的 api 进行类推


代码如下，更多的请查看 github 仓库
```js
const g_nLowDifference = 35
const g_nUpDifference = 35; //负差最大值、正差最大值 
const UNCAL_THETA = 0.5;
class Line {
  constructor(rho, theta) {
    this.rho = rho
    this.theta = theta
    let a = Math.cos(theta);
    let b = Math.sin(theta);
    let x0 = a * rho;
    let y0 = b * rho;
    this.startPoint = { x: x0 - 400 * b, y: y0 + 400 * a };
    this.endPoint = { x: x0 + 400 * b, y: y0 - 400 * a };
  }
}
/**
 * @param {Object} srcMat
 */
function itemExtract (srcMat, name) {
  let scale = getScale(Math.max(srcMat.rows, srcMat.cols))
  let preMat = preProcess(srcMat, scale)
  let grayMat = getSegmentImage(preMat)
  let lines = getLinesWithDetect(grayMat)
  let points = getFourVertex(lines, scale, { height: srcMat.rows, width: srcMat.cols })
  let result = getResultWithMap(srcMat, points)
  cv.imshow(name, result);
  preMat.delete()
  grayMat.delete()
  srcMat.delete()
  result.delete()
}
/**
 * 获取缩放比例
 * @param {*} len 
 */
function getScale (len) {
  let scale = 1
  while (len > 200) {
    scale /= 2
    len >>= 1
  }
  return scale
}
/**
 * 预处理
 * @param {*} src 
 */
function preProcess (src, scale) {
  let smallMat = resize(src, scale)
  let result = filter(smallMat)
  smallMat.delete()
  return result
}
/**
 * 调整至指定宽高
 * @param {*} src 
 * @param {*} scale 缩放比例 
 */
function resize (src, scale = 1) {
  let smallMat = new cv.Mat();
  let dsize = new cv.Size(0, 0);
  cv.resize(src, smallMat, dsize, scale, scale, cv.INTER_AREA)
  return smallMat
}
/**
 * 滤波：保边去噪
 * @param {*} mat 
 */
function filter (src) {
  let dst = new cv.Mat();
  cv.cvtColor(src, src, cv.COLOR_RGBA2RGB, 0);
  // 双边滤波
  cv.bilateralFilter(src, dst, 9, 75, 75, cv.BORDER_DEFAULT);
  return dst
}
/**
 * 通过分割图像获取前景灰度图
 * @param {*} src 
 */
function getSegmentImage (src) {
  const mask = new cv.Mat(src.rows + 2, src.cols + 2, cv.CV_8U, [0, 0, 0, 0])
  const seed = new cv.Point(src.cols >> 1, src.rows >> 1)
  let flags = 4 + (255 << 8) + cv.FLOODFILL_FIXED_RANGE
  let ccomp = new cv.Rect()
  let newVal = new cv.Scalar(255, 255, 255)
  // 选取中点，采用floodFill漫水填充
  cv.threshold(mask, mask, 1, 128, cv.THRESH_BINARY);
  cv.floodFill(src, mask, seed, newVal, ccomp, new cv.Scalar(g_nLowDifference, g_nLowDifference, g_nLowDifference), new cv.Scalar(g_nUpDifference, g_nUpDifference, g_nUpDifference), flags);
  // 再次执行一次滤波去除噪点
  cv.medianBlur(mask, mask, 9);
  return mask
}


function getLinesFromData32F (data32F) {
  let lines = []
  let len = data32F.length / 2
  for (let i = 0; i < len; ++i) {
    let rho = data32F[i * 2];
    let theta = data32F[i * 2 + 1];
    lines.push(new Line(rho, theta))
  }
  return lines
}
/**
 * 直线检测
 * @param {*} mat 
 */
function getLinesWithDetect (src) {
  let dst = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
  let lines = new cv.Mat();
  // Canny 算子进行边缘检测
  cv.Canny(src, src, 50, 200, 3);
  cv.HoughLines(src, lines, 1, Math.PI / 180,
    30, 0, 0, 0, Math.PI);
  // draw lines
  for (let i = 0; i < lines.rows; ++i) {
    let rho = lines.data32F[i * 2];
    let theta = lines.data32F[i * 2 + 1];
    let a = Math.cos(theta);
    let b = Math.sin(theta);
    let x0 = a * rho;
    let y0 = b * rho;
    let startPoint = { x: x0 - 400 * b, y: y0 + 400 * a };
    let endPoint = { x: x0 + 400 * b, y: y0 - 400 * a };
    cv.line(dst, startPoint, endPoint, [255, 0, 0, 255]);
  }
  let lineArray = getLinesFromData32F(lines.data32F)
  // drawLineMat(src.rows, src.cols, lineArray)
  return lineArray
}
/**
 * 计算两直线间的交点
 * @param {*} l1 
 * @param {*} l2 
 */
function getIntersection (l1, l2) {
  //角度差太小 不算，
  let minTheta = Math.min(l1.theta, l2.theta)
  let maxTheta = Math.max(l1.theta, l2.theta)
  if (Math.abs(l1.theta - l2.theta) < UNCAL_THETA || Math.abs(minTheta + Math.PI - maxTheta) < UNCAL_THETA) {
    return;
  }
  //计算两条直线的交点
  let intersection;
  //y = a * x + b;
  let a1 = Math.abs(l1.startPoint.x - l1.endPoint.x) < Number.EPSILON ? 0 : (l1.startPoint.y - l1.endPoint.y) / (l1.startPoint.x - l1.endPoint.x);
  let b1 = l1.startPoint.y - a1 * (l1.startPoint.x);
  let a2 = Math.abs((l2.startPoint.x - l2.endPoint.x)) < Number.EPSILON ? 0 : (l2.startPoint.y - l2.endPoint.y) / (l2.startPoint.x - l2.endPoint.x);
  let b2 = l2.startPoint.y - a2 * (l2.startPoint.x);
  if (Math.abs(a2 - a1) > Number.EPSILON) {
    let x = (b1 - b2) / (a2 - a1)
    let y = a1 * x + b1
    intersection = { x, y }
  }
  return intersection
}
/**
 * 计算所有交点
 * @param {*} lines 
 */
function getAllIntersections (lines) {
  let points = []
  for (let i = 0; i < lines.length; i++) {
    for (let j = i + 1; j < lines.length; j++) {
      let point = getIntersection(lines[i], lines[j])
      if (point) {
        points.push(point)
      }
    }
  }
  return points
}
/**
 * 聚类取均值
 * @param {*} points 
 * @param {*} param1 
 */
function getClusterPoints (points, { width, height }) {
  points.sort((p1, p2) => {
    if (p1.x !== p2.x) {
      return p1.x - p2.x
    } else {
      return p1.y - p2.y
    }
  })
  const distance = Math.max(40, (width + height) / 20)
  const isNear = (p1, p2) => Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y) < distance
  let clusters = [[points[0]]]
  for (let i = 1; i < points.length; i++) {
    if (isNear(points[i], points[i - 1])) {
      clusters[clusters.length - 1].push(points[i])
    } else {
      clusters.push([points[i]])
    }
  }
  // 除去量最少的，仅保留四个聚类
  clusters = clusters.sort((c1, c2) => c2.length - c1.length).slice(0, 4)
  const result = clusters.map(cluster => {
    const x = ~~(cluster.reduce((sum, cur) => sum + cur.x, 0) / cluster.length)
    const y = ~~(cluster.reduce((sum, cur) => sum + cur.y, 0) / cluster.length)
    return { x, y }
  })
  return result
}
/**
 * 顺时针排序，以中心点左上角为第一个点
 * @param {*} points 
 */
function getSortedVertex (points) {
  let center = {
    x: points.reduce((sum, p) => sum + p.x, 0) / 4,
    y: points.reduce((sum, p) => sum + p.y, 0) / 4
  }
  let sortedPoints = []
  sortedPoints.push(points.find(p => p.x < center.x && p.y < center.y))
  sortedPoints.push(points.find(p => p.x > center.x && p.y < center.y))
  sortedPoints.push(points.find(p => p.x > center.x && p.y > center.y))
  sortedPoints.push(points.find(p => p.x < center.x && p.y > center.y))
  return sortedPoints
}

/**
 * 根据聚类获得四个顶点的坐标
 */
function getFourVertex (lines, scale, { width, height }) {
  // 缩放 + 过滤
  let allPoints = getAllIntersections(lines).map(point => ({
    x: ~~(point.x / scale), y: ~~(point.y / scale)
  })).filter(({ x, y }) => !(x < 0 || x > width || y < 0 || y > height))
  const points = getClusterPoints(allPoints, { width, height })
  const sortedPoints = getSortedVertex(points)
  return sortedPoints
}
/**
 * 抠图，映射
 * @param {*} src 
 * @param {*} points 
 */
function getResultWithMap (src, points) {
  let array = []
  points.forEach(point => {
    array.push(point.x)
    array.push(point.y)
  })
  console.log(points, array)
  let dst = new cv.Mat();
  let dsize = new cv.Size(0, 0);
  let dstWidth = src.cols
  let dstHeight = src.rows
  let srcTri = cv.matFromArray(4, 1, cv.CV_32FC2, array);
  let dstTri = cv.matFromArray(4, 1, cv.CV_32FC2, [0, 0, dstWidth, 0, dstWidth, dstHeight, 0, dstHeight]);
  let M = cv.getPerspectiveTransform(srcTri, dstTri);
  cv.warpPerspective(src, dst, M, dsize);
  let resizeDst = resize(dst, 0.5)
  M.delete(); srcTri.delete(); dstTri.delete(); dst.delete()
  return resizeDst
}
function drawLineMat (rows, cols, lines) {
  let dst = cv.Mat.zeros(rows, cols, cv.CV_8UC3);
  let color = new cv.Scalar(255, 0, 0);
  for (let line of lines) {
    cv.line(dst, line.startPoint, line.endPoint, color);
  }
  cv.imshow("canvasOutput", dst);
}
```

**注意：** 使用完的 Mat 对象记得手动清空，否则会耗尽 WebAssembly 的内存

## 总结

通过一个简单的例子，接触了 opencv.js 的使用

opencv 提供了很多接口，使得在前端进行图像处理变得很方便，未来或许有更多的应用场景

## 未来展望

性能上：尝试使用 AssemblyScript 编写相关的算法模块，生成 wasm 并替换掉这个 8M 的 opencv.js 文件

功能上：增加触控交互，更智能的识别目标矩形；目标图片宽高校正；

编码上：借鉴中间件的思想进行重构

后续优化完再写一篇文章

也欢迎试用，以及提 pr

## 参考文档

1. [官方 demo](https://docs.opencv.org/4.2.0/d5/d10/tutorial_js_root.html)
2. [利用OpenCV检测图像中的长方形画布或纸张并提取图像内容](https://www.cnblogs.com/frombeijingwithlove/p/4226489.html)
3. [How can you use K-Means clustering to posterize an image using opencv javascript?](https://answers.opencv.org/question/206557/how-can-you-use-k-means-clustering-to-posterize-an-image-using-opencv-javascript/)