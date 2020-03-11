---
title: WebGL 矩阵处理
date: 2020/03/11 13:00:00
categories: 大前端
tags: 
  - WebGL
---

## 前言

通过文本，可以了解 WebGL 中平移、旋转、缩放、视角的矩阵运算，最终实现一个立方体变换的效果

<!--more-->

## 构建立方体

先绘制一个基础的立方体



采用右手定理确定笛卡尔坐标系的位置，见下图右边

![](https://farm8.staticflickr.com/7117/7419361874_f5d16fb101.jpg)

所以我们的立方体顶点坐标为

```js
const positions = [
      // Front face
      -1.0, -1.0, 1.0,
      1.0, -1.0, 1.0,
      1.0, 1.0, 1.0,
      -1.0, 1.0, 1.0,

      // Back face
      -1.0, -1.0, -1.0,
      -1.0, 1.0, -1.0,
      1.0, 1.0, -1.0,
      1.0, -1.0, -1.0,

      // Top face
      -1.0, 1.0, -1.0,
      -1.0, 1.0, 1.0,
      1.0, 1.0, 1.0,
      1.0, 1.0, -1.0,

      // Bottom face
      -1.0, -1.0, -1.0,
      1.0, -1.0, -1.0,
      1.0, -1.0, 1.0,
      -1.0, -1.0, 1.0,

      // Right face
      1.0, -1.0, -1.0,
      1.0, 1.0, -1.0,
      1.0, 1.0, 1.0,
      1.0, -1.0, 1.0,

      // Left face
      -1.0, -1.0, -1.0,
      -1.0, -1.0, 1.0,
      -1.0, 1.0, 1.0,
      -1.0, 1.0, -1.0,
];
```

每个面都要独立渲染一个颜色的话，颜色可变量对应每个顶点，故需要 4 * 6 个 vec4 类型的颜色值

```js
const faceColors = [
      [1.0, 1.0, 1.0, 1.0],    // Front face: white
      [1.0, 0.0, 0.0, 1.0],    // Back face: red
      [0.0, 1.0, 0.0, 1.0],    // Top face: green
      [0.0, 0.0, 1.0, 1.0],    // Bottom face: blue
      [1.0, 1.0, 0.0, 1.0],    // Right face: yellow
      [1.0, 0.0, 1.0, 1.0],    // Left face: purple
].map(arr => [arr, arr, arr, arr]).flat(2);
```

利用着色器，即可绘制出一个立方体

```js
      var vertexShaderSource = `
        attribute vec4 aVertexPosition;
        attribute vec4 aVertexColor;

        varying lowp vec4 vColor;
        void main(void) {
          gl_Position = aVertexPosition;
          vColor = aVertexColor;
        }
      `

      var fragmentShaderSource = `
        varying lowp vec4 vColor;
        void main(void) {
          gl_FragColor = vColor;
        }
      `
```

最后渲染出来的话，我们只能看到背面一面

这是由于视角的原因，下文将描述如何进行矩阵变换

## 矩阵运算

主要分为模型矩阵(moel)、视图矩阵(view)、投影矩阵(projection)

其中**模型矩阵**表示对观察目标的组合变换，包括旋转、平移、缩放

### 旋转

绕 z 轴旋转，修改的是 x,y 的坐标，可以理解为每个 xy 平面都在绕 xy 轴原点旋转

b 为逆时针旋转的弧度
> 你可能会看到有些教程中的运算矩阵不太一样，那就是 b 取的顺时针旋转弧度。因为 `sin-b = -sinb; cos-b = cos b`

```c
// x' = x cosb - y sinb
// y' = x sinb + y cosb
// z' = z
attribute vec4 a_Position;
uniform float u_CosB,u_SinB;
void main(){
  gl_Position.x = a_Position.x * u_CosB - a_Position.y * u_SinB;
  gl_Position.y = a_Position.x * u_SinB + a_Position.y * u_CosB;
  gl_Position.z = a_Position.z;
  gl_Position.w = 1.0;
}
```
化为矩阵运算为(这里补齐为4阶矩阵是为了方便后面同阶矩阵的运算)
```
[ x' ]   [ cosb -sinb 0  0 ]   [ x ]    [ x * cosb - y * sinb ]
[ y' ] = [ sinb  cosb 0  0 ] x [ y ] =  [ x * sinb + y * cosb ]
[ z' ]   [   0    0   1  0 ]   [ z ]    [          z          ]
[ 1  ]   [   0    0   0  1 ]   [ 1 ]    [          1          ]
```

采用的这个矩阵称为旋转矩阵

类似的，绕 x 轴旋转的话，利用右手定理（翻转坐标系，x轴指向自己），相比绕z轴，其实 z 相当于刚刚的 y ，y 相当于 x ，故旋转矩阵为
```
[ x' ]   [  1   0    0   0 ]   [ x ]    [         x           ]
[ y' ] = [  0 cosb -sinb 0 ] x [ y ] =  [ y * cosb - z * sinb ]
[ z' ]   [  0 sinb  cosb 0 ]   [ z ]    [ y * sinb + z * cosb ]
[ 1  ]   [  0   0    0   1 ]   [ 1 ]    [          1          ]
```

绕 y 轴旋转的话，旋转矩阵为
```
[ x' ]   [  cosb 0  sinb 0 ]   [ x ]    [ x * cosb + z * sinb ]
[ y' ] = [   0   1   0   0 ] x [ y ] =  [        y            ]
[ z' ]   [ -sinb 0  cosb 0 ]   [ z ]    [ z * cosb - x * sinb ]
[ 1  ]   [   0   0   0   1 ]   [ 1 ]    [          1          ]
```


顶点着色器中修改如下即可
```c
attribute vec4 a_Position;
uniform mat4 u_xformMatrix;
void main(){
  gl_Position = u_xformMatrix * a_Position;
}
```

### 平移


```c
attribute vec4 a_Position;
uniform vec4 u_Translation;
void main(){
  gl_Position = a_Position + u_Translation;
}
```
两个 vec4 分量相加即可，注意第二个分量 u_Translation 的 w 为 0

利用矩阵的话则变为

```
[ x' ]   [ 1 0 0 Tx ]   [ x ]    [ x + Tx ]
[ y' ] = [ 0 1 0 Ty ] x [ y ] =  [ y + Ty ]
[ z' ]   [ 0 0 1 Tz ]   [ z ]    [ z + Tz ]
[ 1  ]   [ 0 0 0 1  ]   [ 1 ]    [   1    ]
```

该矩阵称为平移矩阵

矩阵在 js 中利用类型化数组，并采用列主序表示，比如上面这个平移矩阵在 js 中表示为
```js
new Float32Array([
  1.0,0.0,0.0,0.0,
  0.0,1.0,0.0,0.0,
  0.0,0.0,1.0,0.0,
  Tx, Ty, Tz, 1.0
])
```

### 缩放

x,y,z 按三个方向进行缩放，缩放因子分别为 Sx,Sy,Sz 

对应的缩放矩阵为

```
[ x' ]   [ Sx 0  0 0 ]   [ x ]    [ x * Sx ]
[ y' ] = [ 0  Sy 0 0 ] x [ y ] =  [ y * Sy ]
[ z' ]   [ 0  0 Sz 0 ]   [ z ]    [ z * Sz ]
[ 1  ]   [ 0  0  0 1 ]   [ 1 ]    [   1    ]
```


### 视图

在三维空间中，视角也是一个重要的要素，决定我们以哪个方向观察目标

视角由三部分组成：
- 视点：视线起点，观察者所在位置，(eyeX,eyeY,eyeZ)
- 观察目标点：被观察目标点，视点透过观察目标点形成视线，(atX,atY,atZ)
- 上方向：最终绘制在屏幕中的影像的向上方向。由于观察者可能以视线为轴旋转，故还需要上方向固定视角。向量 (upX,upY,upZ)

三者的信息构成一个视图矩阵

默认视角为 z 轴负半轴，即指向屏幕内部。其中
- 视点：位于坐标原点 (0,0,0)
- 观察目标点: 视线为Z轴负方向，因此观察目标点为 `(0,0,z) z < 0`
- 上方向：Y 轴正方向 (0,1,0)

视图矩阵就是用于世界空间到视图空间的转换，那视图矩阵如何确定？

计算视点的坐标空间的三个基向量 f,s,u

定义 `(fx,fy,fz)` 为视线(由视点指向观察目标点)的单位方向向量

```js
fx = centerX - eyeX;
fy = centerY - eyeY;
fz = centerZ - eyeZ;

rlf = 1 / Math.sqrt(fx*fx + fy*fy + fz*fz);
fx *= rlf;
fy *= rlf;
fz *= rlf;
```

定义 `(sx,sy,sz)` 为视线单位向量与上方向的叉积 `f x up`

```js
sx = fy * upZ - fz * upY;
sy = fz * upX - fx * upZ;
sz = fx * upY - fy * upX;

rls = 1 / Math.sqrt(sx*sx + sy*sy + sz*sz);
sx *= rls;
sy *= rls;
sz *= rls;
```

定义 `(ux,uy,uz)` 为上一步得到的叉积与视线单位向量的叉积 `s x f`

```js
ux = sy * fz - sz * fy;
uy = sz * fx - sx * fz;
uz = sx * fy - sy * fx;
```

对旋转矩阵和平移矩阵求逆即可，即
> 这里省略了一些步骤，感兴趣的自行百度

```
[ x' ]     [ 1 0 0 -eyeX ]   [  sx  sy  sz 0 ]     [ x ]
[ y' ] = ( [ 0 1 0 -eyeY ] x [  ux  uy  uz 0 ] ) x [ y ]
[ z' ]     [ 0 0 1 -eyeZ ]   [ -fx -fy -fz 0 ]     [ z ]
[ 1  ]     [ 0 0 0    1  ]   [  0   0   0  1 ]     [ 1 ]
```


“改变观察者的状态” 与 “对整个世界进行变换” 本质是一样的，运用哪个矩阵就看变动哪个主体更方便

将视图矩阵乘以顶点坐标将得到新的视图

```c
attribute vec4 a_Position;
uniform mat4 u_ViewMatrix;
void main(){
  gl_Position = u_ViewMatrix * a_Position;
}
```

### 投影

当从不同视图进行观察时，会发现部分被裁剪，这是由于 WebGL 只显示可视范围的区域

我们可以移动相机位置使得看到更多的空间

有两类可视空间：
- 长方体可视空间，由正射投影产生
- 金字塔可视空间，由透视投影产生

#### 正视投影

相当于对原 canvas 盒子进行长方体裁剪，再做坐标映射

用到的参数有：left, right, bottom, top, near, far


```
rw = 1 / (right - left);
rh = 1 / (top - bottom);
rd = 1 / (far - near);
[ 2/rw 0 0 0 ]
[ 0 2/rh 0 0 ] 
[ 0 0 -2/rd 0 ]
[-(right + left) * rw, -(top + bottom) * rh, -(far + near) * rd, 1 ]   
```

#### 透视投影(Perspective)

效果就是让远处的物体看起来更小

![Perspective.png](https://upload-images.jianshu.io/upload_images/9277731-77e59e5324d3f74f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

用到的参数有： 
- fov 垂直视角
- aspect 近裁剪面的宽高比
- near,far 近裁剪面与远裁剪面的位置

对应的矩阵为

```
fovy = Math.PI * fovy / 180 / 2;
s = Math.sin(fovy);
rd = 1 / (far - near);
ct = Math.cos(fovy) / s;
[ct / aspect 0 0 0]
[    0      ct 0 0]
[0 0 -(far + near) * rd -1]
[0 0 -2 * near * far * rd 0]
```

### 复合变换

实现先平移再旋转的变换

矩阵乘法满足结合律，且自右向左计算
```
<“平移后旋转”坐标> = <旋转矩阵> x (<平移矩阵> x <原始坐标>)
= (<旋转矩阵> x <平移矩阵>) x <原始坐标>
= (“平移后旋转”矩阵) x <原始坐标>
```

上面 `“平移后旋转”矩阵` 就是一个复合变换矩阵，就叫模型矩阵

通常我们还会运用视图矩阵和投影矩阵，即

```c
gl_Position = u_ProjectionMatrix  * u_ViewMatrix * u_ModelMatrix * a_Position;
```

### 注意点

WebGL 没有提供自带的矩阵运算方法，所以日常开发中应该封装一套自己的矩阵运算库，或者使用开源项目

实现动画时利用 rAF API ,并通过渲染时间差判断动画所进行的程度

WebGL 按照顶点在缓冲区的位置来进行绘制的，不会考虑远近，导致远处的图像会绘制在近处图像上面。此时可以开启隐藏面消除功能。这样片段着色器在绘制完后会进行深度检测并将结果缓存在深度缓冲区
```js
// 开启隐藏面消除功能
gl.enable(gl.DEPTH_TEST);
// 在绘制前清除颜色缓冲区以及深度缓冲区
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
```

当两个图元深度接近时，会产生深度冲突，此时可以采用多边形偏移机制解决
> 原理请参考其他文献
```js
// 启用多边形偏移
gl.enable(gl.POLYGON_OFFSET_FILL);
// 绘制三角形1
gl.drawArrays(gl.TRIANGLES, 0, n/2); 
// 设置多边形偏移
gl.polygonOffset(1.0, 1.0); 
// 绘制三角形2
gl.drawArrays(gl.TRIANGLES, n/2, n/2);
```

最后，回到一开始立方体的定义，我们也可以不需要使用这么多顶点，而是采用 `gl.drawElements`

