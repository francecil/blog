---
title: WebGL 矩阵处理
date: 2020/03/11 13:00:00
categories: 大前端
tags: 
  - WebGL
---

# 前言

通过本文，可以了解 WebGL 中平移、旋转、缩放、视角的矩阵运算，最终实现一个立方体变换的效果

<!--more-->

# 构建立方体

先绘制一个基础的立方体



采用右手定理确定笛卡尔坐标系的位置，见下图右边

![](https://upload-images.jianshu.io/upload_images/9277731-54d1c3d28a49ec09.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

所以我们的立方体顶点坐标为

```js
[
  v0,v1,v2,
  v0,v2,v3,
  v0,v3,v4
  ...
]
```
每个面需要6个顶点，一共需要传入 36 个顶点

每个面都要独立渲染一个颜色的话，颜色可变量对应每个顶点，故这里也需要传入 6 * 6 个 vec4 类型的颜色值
```js
[
  c0,c1,c2,
  c0,c2,c3,
  c0,c3,c4
  ...
]
```

> 这里是不是在想立方体本来才 8 个点，我们这里却传了 36个点。

可以利用 drawElements 减少**定义**的顶点个数

```js
  // Create a cube
  //    v6----- v5
  //   /|      /|
  //  v1------v0|
  //  | |     | |
  //  | |v7---|-|v4
  //  |/      |/
  //  v2------v3
  var vertices = new Float32Array([   // Vertex coordinates
     1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,  // v0-v1-v2-v3 front
     1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0,  // v0-v3-v4-v5 right
     1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,  // v0-v5-v6-v1 up
    -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,  // v1-v6-v7-v2 left
    -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,  // v7-v4-v3-v2 down
     1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0   // v4-v7-v6-v5 back
  ]);

  var colors = new Float32Array([     // Colors
    0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // v0-v1-v2-v3 front(blue)
    0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  // v0-v3-v4-v5 right(green)
    1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  // v0-v5-v6-v1 up(red)
    1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  // v1-v6-v7-v2 left
    1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  // v7-v4-v3-v2 down
    0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0   // v4-v7-v6-v5 back
  ]);

  var indices = new Uint8Array([       // Indices of the vertices
     0, 1, 2,   0, 2, 3,    // front
     4, 5, 6,   4, 6, 7,    // right
     8, 9,10,   8,10,11,    // up
    12,13,14,  12,14,15,    // left
    16,17,18,  16,18,19,    // down
    20,21,22,  20,22,23     // back
  ]);
  // 设置 buffer 与绑定

  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_BYTE, 0);
```

若只采用 8 个顶点呢？

```js
  // Create a cube
  //    v6----- v5
  //   /|      /|
  //  v1------v0|
  //  | |     | |
  //  | |v7---|-|v4
  //  |/      |/
  //  v2------v3

var vertices = new Float32Array([
  // v0-v1-v2-v3 front
  1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,    
  // v4-v7-v6-v5 back
  1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0     
]);

// colors 不变

// 定义绘制时顶点的索引
var indices = new Uint8Array([
  0, 1, 2,   0, 2, 3,    // front
  0, 3, 4,   0, 4, 7,    // right
  0, 7, 6,   0, 6, 1,    // up
  1, 6, 5,   1, 5, 2,    // left
  6, 4, 3,   6, 3, 3,    // down
  4, 5, 6,   4, 6, 7     // back
]);
```

会发现该立方体只有两个颜色 blue 和 green 以及颜色插值

这是由于共用顶点导致的，所以如果同一顶点有参与多次不同多个颜色片元处理的话，不能共用。


着色器代码

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

# 矩阵运算

主要分为模型矩阵(moel)、视图矩阵(view)、投影矩阵(projection)

其中**模型矩阵**表示对观察目标的组合变换，包括旋转、平移、缩放

先定义一些工具函数


```js
/**
 * 创建4阶单位矩阵
 */
function createMat4 () {
  let out = new Float32Array(16);
  out[0] = 1;
  out[5] = 1;
  out[10] = 1;
  out[15] = 1;
  return out;
}
/**
 * 获取矩阵 a 乘 矩阵 b 的结果矩阵
 * @param {Mat4} a 
 * @param {Mat4} b 
 */
function multiply(a, b) {
  let out = new Float32Array(16);
  var a00 = a[0],
      a01 = a[1],
      a02 = a[2],
      a03 = a[3];
  var a10 = a[4],
      a11 = a[5],
      a12 = a[6],
      a13 = a[7];
  var a20 = a[8],
      a21 = a[9],
      a22 = a[10],
      a23 = a[11];
  var a30 = a[12],
      a31 = a[13],
      a32 = a[14],
      a33 = a[15];

  // Cache only the current line of the second matrix
  var b0 = b[0],
      b1 = b[1],
      b2 = b[2],
      b3 = b[3];
  out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

  b0 = b[4];b1 = b[5];b2 = b[6];b3 = b[7];
  out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

  b0 = b[8];b1 = b[9];b2 = b[10];b3 = b[11];
  out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

  b0 = b[12];b1 = b[13];b2 = b[14];b3 = b[15];
  out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  return out;
}
```

## 旋转

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

工具函数如下
```js
/**
 * 按 x 轴旋转的变换矩阵
 * @param {Number} angleInRadians 逆时针旋转的弧度
 */
function rotateX (angleInRadians) {
  let c = Math.cos(angleInRadians);
  let s = Math.sin(angleInRadians);
  return new Float32Array([
    1, 0, 0, 0,
    0, c, -s, 0,
    0, s, c, 0,
    0, 0, 0, 1,
  ]);
}
/**
 * 按 y 轴旋转的变换矩阵
 * @param {Number} angleInRadians 逆时针旋转的弧度
 */
function rotateY (angleInRadians) {
  let c = Math.cos(angleInRadians);
  let s = Math.sin(angleInRadians);
  return new Float32Array([
    c, 0, s, 0,
    0, 1, 0, 0,
    -s, 0, c, 0,
    0, 0, 0, 1,
  ]);
}
/**
 * 按 z 轴旋转的变换矩阵
 * @param {Number} angleInRadians 逆时针旋转的弧度
 */
function rotateZ (angleInRadians) {
  let c = Math.cos(angleInRadians);
  let s = Math.sin(angleInRadians);
  return new Float32Array([
    c, -s, 0, 0,
    s, c, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
  ]);
}
```

## 平移


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

工具函数如下
```js
/**
 * 生成平移矩阵
 * @param {Number} tx x 轴方向的偏移量
 * @param {Number} ty y 轴方向的偏移量
 * @param {Number} tz z 轴方向的偏移量
 */
function translation (tx, ty, tz) {
  return new Float32Array([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    tx, ty, tz, 1,
  ]);
}
```

## 缩放

x,y,z 按三个方向进行缩放，缩放因子分别为 Sx,Sy,Sz 

对应的缩放矩阵为

```
[ x' ]   [ Sx 0  0 0 ]   [ x ]    [ x * Sx ]
[ y' ] = [ 0  Sy 0 0 ] x [ y ] =  [ y * Sy ]
[ z' ]   [ 0  0 Sz 0 ]   [ z ]    [ z * Sz ]
[ 1  ]   [ 0  0  0 1 ]   [ 1 ]    [   1    ]
```
工具函数如下
```js
/**
 * 生成缩放矩阵
 * @param {Number} sx x 轴方向的缩放值
 * @param {Number} sy y 轴方向的缩放值
 * @param {Number} sz z 轴方向的缩放值
 */
function scaling (sx, sy, sz) {
  return new Float32Array([
    sx, 0, 0, 0,
    0, sy, 0, 0,
    0, 0, sz, 0,
    0, 0, 0, 1,
  ]);
};
```

## 视图

在三维空间中，视角也是一个重要的要素，决定我们以哪个方向观察目标

![引自《交互式计算机图形学》](https://upload-images.jianshu.io/upload_images/9277731-8de1b2a4d7385949.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

视角由三部分组成：
- 视点：视线起点，观察者（相机）所在位置，(eyeX,eyeY,eyeZ)
- 观察目标点：被观察目标点，视点透过观察目标点形成视线，(atX,atY,atZ)
- 上方向：最终绘制在屏幕中的影像的向上方向。由于观察者可能以视线为轴旋转，故还需要上方向固定视角。向量 (upX,upY,upZ)


默认视角为 z 轴负半轴，即指向屏幕内部。其中
- 视点：位于坐标原点 (0,0,0)
- 观察目标点: 视线为Z轴负方向，因此观察目标点为 `(0,0,z) z < 0`
- 上方向：Y 轴正方向 (0,1,0)

三者的信息构成一个视图矩阵，用于世界空间到视图空间的转换，那视图矩阵如何确定？

### 一、 构建相机空间坐标系

1. 根据 at 和 eye 两点确定视线 forward 基向量

    首先计算视线方向 `forwrad =(at-eye)` \
    并归一化 `forward=forward/|forwrad|`

```js
fx = centerX - eyeX;
fy = centerY - eyeY;
fz = centerZ - eyeZ;

rlf = 1 / Math.sqrt(fx*fx + fy*fy + fz*fz);
fx *= rlf;
fy *= rlf;
fz *= rlf;
```

2. 根据 up 向量和 forward 确定相机的 side 基向量\

    方向根据右手定则确定，垂直于两个向量构建的面

    归一化 up 向量： `up=up/|up|`；叉积：`side=cross(forward,up)` 或者\
    叉积：`side=cross(forward,up)`；归一化 side 向量： `side=side/|side|`；

```js
sx = fy * upZ - fz * upY;
sy = fz * upX - fx * upZ;
sz = fx * upY - fy * upX;

rls = 1 / Math.sqrt(sx*sx + sy*sy + sz*sz);
sx *= rls;
sy *= rls;
sz *= rls;
```

3. 根据 forward 和 side 计算 up 向量
    
    叉积：`up = cross(side,forward)`

    此 up 向量垂直于 forward 和 side 构成的平面

```js
ux = sy * fz - sz * fy;
uy = sz * fx - sx * fz;
uz = sx * fy - sy * fx;
```

这样， eye 位置以及 forward、side、up 三个基向量构建成一个新的坐标系

需要注意的是，这个坐标系是左手坐标系，在实际使用中需要对 forward 进行翻转
> side 对应 x, up 对应 y, -forward 对应 z

利用 eye 和 side、up、-forward 来构成一个右手坐标系

接下来我们将进行坐标转换，计算世界坐标系中的物体在相机坐标系下的坐标

### 二、利用旋转和平移矩阵求逆矩阵

将世界坐标系旋转+平移至相机坐标系重合，旋转 R 和平移 T 构成组合矩阵 `M=T*R` 

该变换矩阵将相机坐标系中坐标变换到世界坐标系

相对应的，视图矩阵(世界坐标系转换到相机坐标系) `view = M﹣¹`
> 世界坐标系中的顶点通过 M 映射到相机坐标系，根据相对运动，该顶点在相机坐标系中实际为 view * 原顶点位置

平移矩阵 T
```
[ 0 0 0 eyeX ]
[ 0 0 0 eyeY ]
[ 0 0 0 eyeZ ]
[ 0 0 0   1  ]
```

已知

`x(1,0,0),y(0,1,0),z(0,0,1)` 为世界坐标系的基\
`u(sx,sy,sz),v(ux,uy,uz),n(-fx,-fy,-fz)` 为相机坐标系的基

求相机坐标系中顶点变换到世界坐标系的变换矩阵 R

解：

根据[定理](https://baike.baidu.com/item/%E5%9F%BA%E5%8F%98%E6%8D%A2) 

若 `(u,v,n) = (x,y,z) * C`\
则矩阵 C 为从基 `(x,y,z)` 到基 `(u,v,n)` 的过渡矩阵

设向量空间中某个向量的坐标在基 `(x,y,z)` 和基 `(u,v,n)` 下分别表示为 X、Y，\
根据坐标变换公式有 `X = C * Y`

故所求 C 正好为相机坐标系顶点到世界坐标系顶点的变换矩阵 R

> t 表示转置矩阵，下同


```
u = (sx,sy,sz)t = sx * x + sy * y + sz * z
v = (ux,uy,uz)t = ux * x + uy * y + uz * z
n = (-fx,-fy,-fz)t = -fx * x - fy * y - fz * z

(u,v,n) 
= (x,y,z) * R
= (x,y,z) * ( (sx,sy,sz)t ,(ux,uy,uz)t, (-fx,-fy,-fz)t )
```


故旋转矩阵 R 为

```
[ sx ux -fx 0 ]
[ sy uy -fy 0 ]
[ sz uz -fz 0 ]
[ 0  0   0  1 ]
```


最终所求矩阵 view = `(T * R)﹣¹` = `R﹣¹ * T﹣¹` = `Rt * T﹣¹`
> 旋转矩阵为正交矩阵，其逆矩阵等于它的转置矩阵

故
```
view = 
[  sx  sy  sz 0 ]   [ 1 0 0 -eyeX ]
[  ux  uy  uz 0 ] x [ 0 1 0 -eyeY ]
[ -fx -fy -fz 0 ]   [ 0 0 1 -eyeZ ]
[  0   0   0  1 ]   [ 0 0 0    1  ]
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

工具函数如下
```js
function setLookAt (eyeX, eyeY, eyeZ, centerX, centerY, centerZ, upX, upY, upZ) {
  fx, fy, fz, rlf, sx, sy, sz, rls, ux, uy, uz;

  fx = centerX - eyeX;
  fy = centerY - eyeY;
  fz = centerZ - eyeZ;

  // Normalize f.
  rlf = 1 / Math.sqrt(fx * fx + fy * fy + fz * fz);
  fx *= rlf;
  fy *= rlf;
  fz *= rlf;

  // Calculate cross product of f and up.
  sx = fy * upZ - fz * upY;
  sy = fz * upX - fx * upZ;
  sz = fx * upY - fy * upX;

  // Normalize s.
  rls = 1 / Math.sqrt(sx * sx + sy * sy + sz * sz);
  sx *= rls;
  sy *= rls;
  sz *= rls;

  // Calculate cross product of s and f.
  ux = sy * fz - sz * fy;
  uy = sz * fx - sx * fz;
  uz = sx * fy - sy * fx;

  var Rt = new Float32Array(16);
  Rt[0] = sx;
  Rt[1] = ux;
  Rt[2] = -fx;
  Rt[3] = 0;

  Rt[4] = sy;
  Rt[5] = uy;
  Rt[6] = -fy;
  Rt[7] = 0;

  Rt[8] = sz;
  Rt[9] = uz;
  Rt[10] = -fz;
  Rt[11] = 0;

  Rt[12] = 0;
  Rt[13] = 0;
  Rt[14] = 0;
  Rt[15] = 1;
  var inverseT = multiply(translation(-eyeX, -eyeY, -eyeZ), createMat4())
  return multiply(Rt, inverseT)
};
```

## 投影

当从不同视图进行观察时，会发现部分被裁剪，这是由于 WebGL 只显示可视范围的区域

我们可以移动相机位置使得看到更多的空间

有两类可视空间：
- 长方体可视空间，由正射投影产生
- 金字塔可视空间，由透视投影产生

### 正视投影

![Ortho](https://upload-images.jianshu.io/upload_images/9277731-9e33cdbd1dc4b60a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

相当于对原 canvas 盒子进行长方体裁剪，再做缩放

用到的参数有：left, right, bottom, top, near, far

![OrthoMatrix](https://upload-images.jianshu.io/upload_images/9277731-fda5271027fe6be2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

工具函数
```js
/**
 * 设置正射投影矩阵 
 * 以下是立方体裁截面的坐标
 * @param {Number} left 
 * @param {Number} right 
 * @param {Number} bottom 
 * @param {Number} top 
 * @param {Number} near 
 * @param {Number} far 
 */
function setOrtho (left, right, bottom, top, near, far) {
  let rw, rh, rd;

  rw = 1 / (right - left);
  rh = 1 / (top - bottom);
  rd = 1 / (far - near);

  let out = new Float32Array(16);

  out[0] = 2 * rw;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;

  out[4] = 0;
  out[5] = 2 * rh;
  out[6] = 0;
  out[7] = 0;

  out[8] = 0;
  out[9] = 0;
  out[10] = -2 * rd;
  out[11] = 0;

  out[12] = -(right + left) * rw;
  out[13] = -(top + bottom) * rh;
  out[14] = -(far + near) * rd;
  out[15] = 1;

  return out;
};
```

### 透视投影(Perspective)

效果就是让远处的物体看起来更小，使场景更有深度感，接近真实世界

![Perspective](https://upload-images.jianshu.io/upload_images/9277731-77e59e5324d3f74f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

相等于对所有裁剪面进行缩放+平移

用到的参数有： 
- fov 垂直视角
- aspect 近裁剪面的宽高比
- near,far 近裁剪面与远裁剪面的位置

对应的矩阵为

![PerspectiveMatrix](https://upload-images.jianshu.io/upload_images/9277731-b4129ca838cbf69e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

工具函数如下
```js
/**
 * 设置透视投影矩阵 
 * @param {*} fovy 垂直视角
 * @param {*} aspect 近裁剪面的宽高比
 * @param {*} near 近裁剪面位置
 * @param {*} far 远裁剪面
 */
function setPerspective (fovy, aspect, near, far) {
  let rd, s, ct;

  if (near === far || aspect === 0) {
    throw 'null frustum';
  }
  if (near <= 0) {
    throw 'near <= 0';
  }
  if (far <= 0) {
    throw 'far <= 0';
  }

  fovy = Math.PI * fovy / 180 / 2;
  s = Math.sin(fovy);
  if (s === 0) {
    throw 'null frustum';
  }

  rd = 1 / (far - near);
  ct = Math.cos(fovy) / s;

  let out = new Float32Array(16);

  out[0]  = ct / aspect;
  out[1]  = 0;
  out[2]  = 0;
  out[3]  = 0;

  out[4]  = 0;
  out[5]  = ct;
  out[6]  = 0;
  out[7]  = 0;

  out[8]  = 0;
  out[9]  = 0;
  out[10] = -(far + near) * rd;
  out[11] = -1;

  out[12] = 0;
  out[13] = 0;
  out[14] = -2 * near * far * rd;
  out[15] = 0;

  return out;
};
```


## 复合变换

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


## 注意点

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

# 示例

采用最开始定义的顶点数据，并进行以下矩阵变换

设置透视投影
```js
setPerspective(30, 1, 1, 100)
```
设置视角
```js
lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0);
```

最终效果

![cube-demo](https://upload-images.jianshu.io/upload_images/9277731-7d3ac250d5321f85.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 参考文献

1. [视图矩阵推导过程](https://blog.csdn.net/weixin_37683659/article/details/79830278)
2. 《WebGL编程指南》