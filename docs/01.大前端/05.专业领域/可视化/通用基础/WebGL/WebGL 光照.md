---
title: WebGL 光照
date: 2020/03/17 11:00:00
tags: 
  - WebGL
permalink: /pages/723dab/
categories: 
  - 大前端
  - 专业领域
  - 可视化
  - 通用基础
  - WebGL
---

# 前言

本文来谈谈 WebGL 的光照

<!--more-->

# 光源类型

主要分为以下几种：

- 平行光
  
  也叫方向光。\
  无限远处（比如太阳）发出的平行光。\
  用一个方向和一个颜色（包含光照强度，下同）来定义

- 点光源

  一个点向周围所有方向发出的光，比如灯泡。\
  需要指定光源的位置和颜色

- 环境光

  又称间接光，只前两种类型的光源发出后经过墙壁等其他物体反射后的光。\
  可以理解为白天的室内，并没有感知太阳光线直射，但仍看得清物体。\
  环境光由各个角度照射物体，光照强度都是一致的。\
  只需指定颜色。

- 聚灯光

  在点光源的基础上，限定了照射方向和照射范围

# 反射类型

入射光的信息（方向、颜色）以及物体表面信息（物体基底色和反射特性）决定了反射光的方向和颜色

> 一般我们只计算反射光的颜色即可

反射的方式主要有以下几种：

## 漫反射

光线照射在物体粗糙的表面会无序地向四周反射的现象，是自然界更加普遍存在的反射型态。

所以漫反射在各个方向上是均匀的，任何角度看强度均相等

可以得到以下式子
```js
<漫反射光颜色> = <入射光颜色> x <表面基底色> x cosθ

// θ 为入射光与表面形成的入射角，利用向量点积公式，有

cosθ = <入射光方向> · <法线方向>
```

法向量就是描述面的朝向的单位向量，而法线方向就是法向量的方向

如图：

![法线方向](https://upload-images.jianshu.io/upload_images/9277731-3459f160e960d56b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

对于立方体来说，每个顶点对应三个法向量，就像之前每个顶点对应三个面的颜色一样。

所以我们可以用四个点（使用索引，否则需要6个点）来确定一个面的法向量（根据右手定则）

```js
// Create a cube
//    v6----- v5
//   /|      /|
//  v1------v0|
//  | |     | |
//  | |v7---|-|v4
//  |/      |/
//  v2------v3
// Coordinates
var vertices = new Float32Array([
  1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, // v0-v1-v2-v3 front
  1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, // v0-v3-v4-v5 right
  1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, // v0-v5-v6-v1 up
  -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, // v1-v6-v7-v2 left
  -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0, // v7-v4-v3-v2 down
  1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0  // v4-v7-v6-v5 back
]);

// Colors
var colors = new Float32Array([
  1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,     // v0-v1-v2-v3 front
  1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,     // v0-v3-v4-v5 right
  1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,     // v0-v5-v6-v1 up
  1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,     // v1-v6-v7-v2 left
  1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,     // v7-v4-v3-v2 down
  1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0　    // v4-v7-v6-v5 back
]);

// Normal
var normals = new Float32Array([
  0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
  1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
  0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
  -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
  0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,  // v7-v4-v3-v2 down
  0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0   // v4-v7-v6-v5 back
]);

// Indices of the vertices
var indices = new Uint8Array([
  0, 1, 2, 0, 2, 3,    // front
  4, 5, 6, 4, 6, 7,    // right
  8, 9, 10, 8, 10, 11,    // up
  12, 13, 14, 12, 14, 15,    // left
  16, 17, 18, 16, 18, 19,    // down
  20, 21, 22, 20, 22, 23     // back
]);
```

针对入射光方向，平行光的方向总是固定的，而点光源则与每个点的位置有关，我们分开讨论

- 平行光针对顶点处理
- 点光源针对像素点处理

**注意：** 
1. 本小节暂不考虑模型矩阵，在下一节 [运动物体的光照效果](#运动物体的光照效果) 会提到。
2. 由于聚光灯用的比较少，本文不涉及，可以看文末的参考资料

### 平行光的处理

我们在顶点着色器中计算每个顶点的反射光颜色
```js
// 顶点着色器
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  attribute vec4 a_Color;
  // 法向量
  attribute vec4 a_Normal;
  uniform mat4 u_MvpMatrix;
  // 光线颜色
  uniform vec3 u_LightColor;
  // 光线方向（归一化的世界坐标）
  uniform vec3 u_LightDirection;
  varying vec4 v_Color;
  void main() {
    gl_Position = u_MvpMatrix * a_Position;
    // 对法向量进行归一化
    vec3 normal = normalize(a_Normal.xyz);
    // 计算光线方向和法向量的点积
    float nDotL = max(dot(u_LightDirection, normal), 0.0);
    // 计算漫反射光的颜色
    vec3 diffuse = u_LightColor * a_Color.rgb * nDotL;
    v_Color = vec4(diffuse, a_Color.a);
  }`
// 片段着色器
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec4 v_Color;
  void main() {
    gl_FragColor = v_Color;
  }`
```

设置 `(0.5, 3.0, 4.0)` 方向（世界坐标系）的平行白光 `(1.0, 1.0, 1.0)`

```js
// 设置光线颜色
gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);
// 设置归一化的世界坐标的光线方向
let direction = normalize([0.5, 3.0, 4.0])
console.log(direction) // [0.1,0.6,0.8]
gl.uniform3fv(u_LightDirection, direction);

// 设置投影矩阵和视图矩阵，不影响光照
var mvpMatrix = new Matrix4();
mvpMatrix.setPerspective(30, canvas.width / canvas.height, 1, 100);
mvpMatrix.lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0);
```

效果如下

![LightedCube](https://upload-images.jianshu.io/upload_images/9277731-549399fb1e087eb3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


### 点光源的处理

根据物体中入射点位置与点光源位置得到入射光方向

与平行光不同的是，需要对每个点（在片段着色器中处理）计算光照效果，而不是对顶点
> 如果采用顶点计算，中间像素进行内插会导致光照有一些线条

![pointLight.jpg](https://upload-images.jianshu.io/upload_images/9277731-503bfeab93860b3a.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

根据公式
```js
<漫反射光颜色> = <入射光颜色> x <表面基底色> x (<入射光方向> · <法线方向>)
```

我们将顶点，法向量放入片段着色器中处理

```js
// 顶点着色器
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  attribute vec4 a_Color;
  attribute vec4 a_Normal;
  uniform mat4 u_MvpMatrix;

  varying vec4 v_Color;
  varying vec3 v_Normal;
  varying vec3 v_Position;
  void main() {
    gl_Position = u_MvpMatrix * a_Position;
    v_Position = a_Position.xyz;
    v_Normal = a_Normal.xyz;
    v_Color = a_Color;
  }`

// 片段着色器
var FSHADER_SOURCE = `
  precision mediump float;
  // Light color
  uniform vec3 u_LightColor;
  uniform vec3 u_LightPosition;

  varying vec3 v_Normal;
  varying vec3 v_Position;
  varying vec4 v_Color;
  void main() {
    // 对法线进行归一化，因为内插后长度不一定是 1.0
    vec3 normal = normalize(v_Normal);
    // 计算光线方向并归一化
    vec3 lightDirection = normalize(u_LightPosition - v_Position);
    // 计算光线方向与法向量的点积
    float nDotL = max(dot(lightDirection, normal), 0.0);
    // 计算漫反射颜色
    vec3 diffuse = u_LightColor * v_Color.rgb * nDotL;
    gl_FragColor = vec4(diffuse, v_Color.a);
  }`
```


设置 `(2.2, 2.2, 2.0)` 位置（世界坐标系）的点光源 `(1.0, 1.0, 1.0)`

```js
// 设置点光源颜色
gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);
// 设置点光源位置（世界坐标系）
gl.uniform3f(u_LightPosition, 2.2, 2.2, 2.0);

// 设置投影矩阵和视图矩阵，不影响光照
var mvpMatrix = new Matrix4();
mvpMatrix.setPerspective(30, canvas.width / canvas.height, 1, 100);
mvpMatrix.lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0);
```

效果如下

![PointLightedCube.png](https://upload-images.jianshu.io/upload_images/9277731-67ea797e41fbe700.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 环境反射

环境反射针对的是环境光

环境光与光源方向无关，在场景中是均匀分布的，对所有物体都有效

在程序中，环境光是**直接定义**的，而不是通过其他光源生成的。

所以可以调节环境光的颜色得到我们想要的效果，通常强度较弱

```
<环境反射光颜色> = <入射光颜色> x <表面基底色>
```
上面公式中的入射光颜色就是我们定义的环境光颜色

假设环境光为弱白光 `(0.2,0.2,0.2)` ，物体表面基底色为红色 `(1.0,0.0,0.0)`，由环境光产生的反射光颜色为暗红色 `(0.2,0.0,0.0)`

这里仅应用环境光，得到如下的效果

![ambientCube](https://upload-images.jianshu.io/upload_images/9277731-db1dd03510ec18d6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

其实就是所有顶点的 rgb 分量乘以环境光 rgb 分量
```c
vec3 ambient = u_AmbientLight * a_Color.rgb;
v_Color = vec4(ambient, a_Color.a);
```

## 镜面反射

光线照射到物体表面，部分被吸收，部分进行反射。反射角与入射角一致

![引自 csdn](https://upload-images.jianshu.io/upload_images/9277731-a3e02351e219ffd1.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

只有相机位于反射光的区域，光线才会可见

![引自 csdn](https://upload-images.jianshu.io/upload_images/9277731-e69f8549ce1223fd.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

镜面反射用的比较少，本文就不讨论了。

## 反射叠加

在渲染模型时可以对几种反射进行叠加，设置一定比例等等，得到想要的效果，比如
```
<表面的反射光颜色> = <漫反射光颜色> + <环境反射光颜色>
```

我们应用 `(0.2,0.2,0.2)` 的环境光，并设置 `(0.5, 3.0, 4.0)` 方向（世界坐标系）的平行白光 `(1.0, 1.0, 1.0)`
> 白光以左下前方向照向立方体 \

核心代码：
```js
vec3 diffuse = u_DiffuseLight * a_Color.rgb * nDotL;
vec3 ambient = u_AmbientLight * a_Color.rgb;
// 最终反射光颜色为漫反射和环境反射的叠加
v_Color = vec4(diffuse + ambient, a_Color.a);
```

得到如下效果

![LightedCube_ambient](https://upload-images.jianshu.io/upload_images/9277731-6d3b97538de36428.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

如果是上面点光源的例子也应用环境光的话
```js
vec3 diffuse = u_LightColor * v_Color.rgb * nDotL;
vec3 ambient = u_AmbientLight * v_Color.rgb;
gl_FragColor = vec4(diffuse + ambient, v_Color.a);
```
效果如下

![PointLightedCube_ambient.png](https://upload-images.jianshu.io/upload_images/9277731-a1a535ffee8ce334.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

点光源+环境光的组合比较常用

# 运动物体的光照效果

上文为了简单，一直没有提到模型矩阵，即对物体进行平移、旋转、缩放

所以局部空间坐标系和世界坐标系是一致的

物体应用了模型矩阵后，两个坐标系不一致了，那光照又该如何计算？

我们需对法向量进行变换，用法向量乘以模型矩阵的逆转置矩阵即可
> 逆转置矩阵表示对矩阵先求逆再转置

这样得到的就是法向量在世界空间的表示，相关证明可以查看 [渲染管线中的法线变换矩阵](https://zhuanlan.zhihu.com/p/72734738)


对于点光源的场景，我们还需要对顶点应用模型矩阵再传入片段着色器


将上一节 *点光源+环境光* 的例子进行小改造，应用模型矩阵

核心代码如下：
```js
// 顶点着色器
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  attribute vec4 a_Color;
  attribute vec4 a_Normal;
  uniform mat4 u_MvpMatrix;
  // 模型矩阵
  uniform mat4 u_ModelMatrix;
  // 用来变换法向量的矩阵（模型矩阵的逆转置矩阵）
  uniform mat4 u_NormalMatrix;  
  varying vec4 v_Color;
  varying vec3 v_Normal;
  varying vec3 v_Position;
  void main() {
    gl_Position = u_MvpMatrix * a_Position;
     // 计算顶点的世界坐标
    v_Position = vec3(u_ModelMatrix * a_Position);
    // 得到变换后的法向量
    v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));
    v_Color = a_Color;
  }`

// 片段着色器
var FSHADER_SOURCE = `
  precision mediump float;
  // Light color
  uniform vec3 u_LightColor;
  // Position of the light source
  uniform vec3 u_LightPosition;
  // Ambient light color
  uniform vec3 u_AmbientLight;
  varying vec3 v_Normal;
  varying vec3 v_Position;
  varying vec4 v_Color;
  void main() {
    // 对法线进行归一化，因为内插后长度不一定是 1.0
    vec3 normal = normalize(v_Normal);
    // 计算光线方向并归一化
    vec3 lightDirection = normalize(u_LightPosition - v_Position);
    // 计算光线方向与法向量的点积
    float nDotL = max(dot(lightDirection, normal), 0.0);
    // 计算漫反射和环境反射的最终颜色
    vec3 diffuse = u_LightColor * v_Color.rgb * nDotL;
    vec3 ambient = u_AmbientLight * v_Color.rgb;
    gl_FragColor = vec4(diffuse + ambient, v_Color.a);
  }`

// 省略部分代码

// 设置点光源颜色
gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);
// 设置点光源位置（世界坐标系）
gl.uniform3f(u_LightPosition, 2.3, 4.0, 3.5);
// 设置环境光
gl.uniform3f(u_AmbientLight, 0.2, 0.2, 0.2);

// 模型矩阵
var modelMatrix = new Matrix4();
// 模型、视图、投影 合成后的矩阵
var mvpMatrix = new Matrix4();
// 用来变换法向量的矩阵（模型矩阵的逆转置矩阵）
var normalMatrix = new Matrix4();

// 设置模型矩阵
modelMatrix.setRotate(90, 0, 1, 0);

mvpMatrix.setPerspective(30, canvas.width / canvas.height, 1, 100);
mvpMatrix.lookAt(6, 6, 14, 0, 0, 0, 0, 1, 0);
mvpMatrix.multiply(modelMatrix);

// 计算模型矩阵的逆转置矩阵
normalMatrix.setInverseOf(modelMatrix);
normalMatrix.transpose();
```




效果如下：

![modelLightCube](https://upload-images.jianshu.io/upload_images/9277731-5eaaf2a790c7d40e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

矩阵操作相关代码（来源于《WebGL 编程指南》）:

```js
/**
 * 矩阵转置
 * @return this
 */
Matrix4.prototype.transpose = function() {
  var e, t;

  e = this.elements;

  t = e[ 1];  e[ 1] = e[ 4];  e[ 4] = t;
  t = e[ 2];  e[ 2] = e[ 8];  e[ 8] = t;
  t = e[ 3];  e[ 3] = e[12];  e[12] = t;
  t = e[ 6];  e[ 6] = e[ 9];  e[ 9] = t;
  t = e[ 7];  e[ 7] = e[13];  e[13] = t;
  t = e[11];  e[11] = e[14];  e[14] = t;

  return this;
};

/**
 * 矩阵求逆
 * @param other The source matrix
 * @return this
 */
Matrix4.prototype.setInverseOf = function(other) {
  var i, s, d, inv, det;

  s = other.elements;
  d = this.elements;
  inv = new Float32Array(16);

  inv[0]  =   s[5]*s[10]*s[15] - s[5] *s[11]*s[14] - s[9] *s[6]*s[15]
            + s[9]*s[7] *s[14] + s[13]*s[6] *s[11] - s[13]*s[7]*s[10];
  inv[4]  = - s[4]*s[10]*s[15] + s[4] *s[11]*s[14] + s[8] *s[6]*s[15]
            - s[8]*s[7] *s[14] - s[12]*s[6] *s[11] + s[12]*s[7]*s[10];
  inv[8]  =   s[4]*s[9] *s[15] - s[4] *s[11]*s[13] - s[8] *s[5]*s[15]
            + s[8]*s[7] *s[13] + s[12]*s[5] *s[11] - s[12]*s[7]*s[9];
  inv[12] = - s[4]*s[9] *s[14] + s[4] *s[10]*s[13] + s[8] *s[5]*s[14]
            - s[8]*s[6] *s[13] - s[12]*s[5] *s[10] + s[12]*s[6]*s[9];

  inv[1]  = - s[1]*s[10]*s[15] + s[1] *s[11]*s[14] + s[9] *s[2]*s[15]
            - s[9]*s[3] *s[14] - s[13]*s[2] *s[11] + s[13]*s[3]*s[10];
  inv[5]  =   s[0]*s[10]*s[15] - s[0] *s[11]*s[14] - s[8] *s[2]*s[15]
            + s[8]*s[3] *s[14] + s[12]*s[2] *s[11] - s[12]*s[3]*s[10];
  inv[9]  = - s[0]*s[9] *s[15] + s[0] *s[11]*s[13] + s[8] *s[1]*s[15]
            - s[8]*s[3] *s[13] - s[12]*s[1] *s[11] + s[12]*s[3]*s[9];
  inv[13] =   s[0]*s[9] *s[14] - s[0] *s[10]*s[13] - s[8] *s[1]*s[14]
            + s[8]*s[2] *s[13] + s[12]*s[1] *s[10] - s[12]*s[2]*s[9];

  inv[2]  =   s[1]*s[6]*s[15] - s[1] *s[7]*s[14] - s[5] *s[2]*s[15]
            + s[5]*s[3]*s[14] + s[13]*s[2]*s[7]  - s[13]*s[3]*s[6];
  inv[6]  = - s[0]*s[6]*s[15] + s[0] *s[7]*s[14] + s[4] *s[2]*s[15]
            - s[4]*s[3]*s[14] - s[12]*s[2]*s[7]  + s[12]*s[3]*s[6];
  inv[10] =   s[0]*s[5]*s[15] - s[0] *s[7]*s[13] - s[4] *s[1]*s[15]
            + s[4]*s[3]*s[13] + s[12]*s[1]*s[7]  - s[12]*s[3]*s[5];
  inv[14] = - s[0]*s[5]*s[14] + s[0] *s[6]*s[13] + s[4] *s[1]*s[14]
            - s[4]*s[2]*s[13] - s[12]*s[1]*s[6]  + s[12]*s[2]*s[5];

  inv[3]  = - s[1]*s[6]*s[11] + s[1]*s[7]*s[10] + s[5]*s[2]*s[11]
            - s[5]*s[3]*s[10] - s[9]*s[2]*s[7]  + s[9]*s[3]*s[6];
  inv[7]  =   s[0]*s[6]*s[11] - s[0]*s[7]*s[10] - s[4]*s[2]*s[11]
            + s[4]*s[3]*s[10] + s[8]*s[2]*s[7]  - s[8]*s[3]*s[6];
  inv[11] = - s[0]*s[5]*s[11] + s[0]*s[7]*s[9]  + s[4]*s[1]*s[11]
            - s[4]*s[3]*s[9]  - s[8]*s[1]*s[7]  + s[8]*s[3]*s[5];
  inv[15] =   s[0]*s[5]*s[10] - s[0]*s[6]*s[9]  - s[4]*s[1]*s[10]
            + s[4]*s[2]*s[9]  + s[8]*s[1]*s[6]  - s[8]*s[2]*s[5];

  det = s[0]*inv[0] + s[1]*inv[4] + s[2]*inv[8] + s[3]*inv[12];
  if (det === 0) {
    return this;
  }

  det = 1 / det;
  for (i = 0; i < 16; i++) {
    d[i] = inv[i] * det;
  }

  return this;
};
```

# 总结

光照效果是在世界坐标系上计算的

通过应用光照效果，可以让场景变得更真实

有了光照，那么还有阴影，后面的文章我们将进行探讨~

# 参考文档

1. 《WebGL 编程指南》
2. [MDN-Lighting in WebGL](https://developer.mozilla.org/zh-CN/docs/Web/API/WebGL_API/Tutorial/Lighting_in_WebGL)
3. [WebGL 三维聚光灯](https://webglfundamentals.org/webgl/lessons/zh_cn/webgl-3d-lighting-spot.html)
4. [Phong着色法](https://zh.wikipedia.org/wiki/Phong%E8%91%97%E8%89%B2%E6%B3%95)