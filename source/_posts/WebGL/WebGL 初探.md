---
title: WebGL 初探
date: 2020/03/05 03:00:00
categories: 大前端
tags: 
  - WebGL
---

## 前言

本篇将介绍常用的概念及工作流程，达到快速入门的效果

<!-- more -->

## 程序运行流程

先简单描述一下编写 WebGL 程序的流程

1. 编写顶点着色器，该着色器用于获取顶点位置，进而生成点， 线和三角形在内的一些图元
2. 编写片段着色器，该着色器将对图元进行光栅化处理，得到绘制图元中每个像素的颜色值
3. 对两个着色器进行编译得到着色器对象
4. 将两个着色器对象链接到同一着色程序
5. 获取属性值位置
6. 绑定缓冲并存入数据。以上为初始化阶段，之后进行循环渲染阶段。
7. 设置 WebGL 裁剪空间与 Canvas 画布尺寸间的映射
8. 为 WebGL 指定着色程序
9. 从之前准备的缓冲中获取数据，并赋值给着色器中的属性（需要指定属性值位置以及读取数据方式）
10. 指定绘制的图元类型，运行多次顶点着色器，得到图元，并利用片段着色器进行图元绘制

## 工作原理

运行次数表示顶点着色器的执行次数，每次生成的顶点存储在 gl_Position 中

![](https://webglfundamentals.org/webgl/lessons/resources/vertex-shader-anim.gif)


## 概念


### GLSL

着色器语言，内建的数据类型有：

- vec2, vec3和 vec4分别代表两个值，三个值和四个值，可以理解为列矩阵

- mat2, mat3 和 mat4 分别代表 2x2, 3x3 和 4x4 矩阵

还可以使用数组和结构体

分量选择器
```
v.x 和 v.s 以及 v.r ， v[0] 表达的是同一个分量。
v.y 和 v.t 以及 v.g ， v[1] 表达的是同一个分量。
v.z 和 v.p 以及 v.b ， v[2] 表达的是同一个分量。
v.w 和 v.q 以及 v.a ， v[3] 表达的是同一个分量。
```

`v.yyyy` 等价于 `vec4(v.y, v.y, v.y, v.y)`

多个属性，如何从 buffer 读取数据？


```js
var vertexShaderSource = `
  attribute vec2 a_position;
  attribute vec2 a_offset;

  void main() {
    gl_Position = vec4(a_position + a_offset, 0, 1);
  }
`
```

可以分次设置 buffer
> 每次执行 bufferData 上一次的 buffer 将被清空

```js
var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
var offsetAttributeLocation = gl.getAttribLocation(program, "a_offset");

gl.enableVertexAttribArray(positionAttributeLocation);
var positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
var positions = [
  0, 0,
  0, 0.5,
  0.7, 0,
];
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
var size = 2;          // 每次迭代运行提取两个单位数据
var type = gl.FLOAT;   // 每个单位的数据类型是32位浮点型
var normalize = false; // 不需要归一化数据
var stride = 0;
var offset = 0;
gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

gl.enableVertexAttribArray(offsetAttributeLocation);
var offsetBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, offsetBuffer);
var offsets = [
  0.1, 0.1,
  0, 0,
  0, 0.1,
];
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(offsets), gl.STATIC_DRAW);
gl.vertexAttribPointer(offsetAttributeLocation, size, type, normalize, stride, offset);
```

或者一次设置 buffer 每次指定 buffer 偏移量 offset

```js
var buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

var buffer = [
  0, 0,
  0, 0.5,
  0.7, 0,
  0.1, 0.1,
  0, 0,
  0, 0.1,
];
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(buffer), gl.STATIC_DRAW);

gl.enableVertexAttribArray(positionAttributeLocation);
var size = 2;          // 每次迭代运行提取两个单位数据
var type = gl.FLOAT;   // 每个单位的数据类型是32位浮点型
var normalize = false; // 不需要归一化数据
var stride = 0;        // 0 = 移动单位数量 * 每个单位占用内存（sizeof(type)）
var offset = 0;        // 从缓冲起始位置开始读取
gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);
gl.enableVertexAttribArray(offsetAttributeLocation);
var size = 2;          // 每次迭代运行提取两个单位数据
var type = gl.FLOAT;   // 每个单位的数据类型是32位浮点型
var normalize = false; // 不需要归一化数据
var stride = 0;        // 0 = 移动单位数量 * 每个单位占用内存（sizeof(type)）
var offset = 3*2*4;        // 从缓冲第三组开始读取
gl.vertexAttribPointer(offsetAttributeLocation, size, type, normalize, stride, offset);
```

注意，如果是两个 vec4 变量相加，如 `[1,1,0,1]+[0,1,0,1]=[1,2,0,2]` 等价于 `[0.5,1,0,1]`

如果想要得到 `[1,2,0,1]`，可以手动设置 vec4 变量的 w 为 1 ：
```c
vec4 tmp = a_position + a_offset;
tmp.w = 1.0;
gl_Position = tmp;
```

### 数据

属性(attribute)和缓冲(buffer)
> 着色器运行时属性将从缓冲中按指定规则读取值

全局变量 uniform
> 运行过程中全局有效

纹理 texture
> 借助全局变量，通过 texture2D 方法提取纹理信息并赋值给 gl_FragColor。需要指定纹理所绑定的图元

可变量 varying
> 一种顶点着色器给片断着色器传值的方式。
> 依照渲染的图元是点， 线还是三角形，顶点着色器中设置的可变量会在片断着色器运行中获取不同的插值。
> 使用方法为两个着色器定义一个同名变量。

### 着色器

#### 顶点着色器

每个顶点调用一次顶点着色器，每次调用都需要设置一个特殊的全局变量gl_Position， 该变量的值就是裁减空间坐标值。

所需数据获取方式：
- Attributes 属性
- Uniforms 全局变量
- Textures 纹理


#### 片段着色器

每个像素都将调用一次片断着色器，每次调用需要从你设置的特殊全局变量gl_FragColor中获取颜色信息。

中间像素会采用插值方式设置

所需数据获取方式：
- Uniforms 全局变量
- Textures 纹理
- Varyings 可变量 

## hello world demo

根据上文的**程序运行流程**，实现一个简单的 demo

```html
<!DOCTYPE HTML>
<html>

<head>
  <style>
    canvas {
      width: 100vw;
      height: 100vh;
      display: block;
    }
  </style>
</head>

<body>
  <canvas id="canvas"></canvas>
  <script>
    function createShader(gl, type, source) {
      var shader = gl.createShader(type); // 创建着色器对象
      gl.shaderSource(shader, source); // 提供数据源
      gl.compileShader(shader); // 编译 -> 生成着色器
      var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
      if (success) {
        return shader;
      }

      console.log(gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
    }

    function createProgram(gl, vertexShader, fragmentShader) {
      var program = gl.createProgram();
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      var success = gl.getProgramParameter(program, gl.LINK_STATUS);
      if (success) {
        return program;
      }

      console.log(gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
    }

    function main() {
      // Get A WebGL context
      var canvas = document.getElementById("canvas");
      var gl = canvas.getContext("webgl");
      if (!gl) {
        return;
      }
      // 步骤1~2，编写顶点着色器和片段着色器
      var vertexShaderSource = `
      // attribute 将从 buffer 中获取数据
      attribute vec4 a_position;

      // 所有着色器都有一个 main 方法
      void main() {
        // gl_Position 是一个顶点着色器主要设置的变量
        gl_Position = a_position;
      }
      `

      var fragmentShaderSource = `
      // 片断着色器没有默认精度，所以我们需要设置一个精度
      // mediump是一个不错的默认值，代表“medium precision”（中等精度）
      precision mediump float;

      void main() {
        // gl_FragColor是一个片断着色器主要设置的变量
        // 本例中我们直接指定颜色属性，也可以通过其他方式赋值
        gl_FragColor = vec4(1, 0, 0.5, 1);
      }
      `

      // 步骤3：对两个着色器进行编译得到着色器对象
      var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
      var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

      // 步骤4：将两个着色器对象链接到同一着色程序
      var program = createProgram(gl, vertexShader, fragmentShader);

      // 步骤5：获取属性值位置
      var positionAttributeLocation = gl.getAttribLocation(program, "a_position");

      // 步骤6：绑定缓冲并存入数据
      var positionBuffer = gl.createBuffer();

      // 绑定点为 ARRAY_BUFFER
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

      var positions = [
        0, 0,
        0, 0.5,
        0.7, 0,
      ];
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);


      // 进行渲染阶段的代码处理


      // 步骤7：设置 WebGL 裁剪空间与 Canvas 画布尺寸间的映射
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

      // 清除画板
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      // 步骤8：为 WebGL 指定着色程序
      gl.useProgram(program);

      // 启用顶点着色器属性
      gl.enableVertexAttribArray(positionAttributeLocation);

      // 步骤9：从之前准备的缓冲中获取数据，并赋值给着色器中的属性

      // 告诉属性怎么从positionBuffer中读取数据 (ARRAY_BUFFER)
      var size = 2;          // 每次迭代运行提取两个单位数据
      var type = gl.FLOAT;   // 每个单位的数据类型是32位浮点型
      var normalize = false; // 不需要归一化数据
      var stride = 0;        // 0 = 移动单位数量 * 每个单位占用内存（sizeof(type)）
      // 每次迭代运行运动多少内存到下一个数据开始点
      var offset = 0;        // 从缓冲起始位置开始读取
      gl.vertexAttribPointer(
        positionAttributeLocation, size, type, normalize, stride, offset);

      // 步骤10：指定绘制的图元类型，运行多次顶点着色器，得到图元，并利用片段着色器进行图元绘制
      var primitiveType = gl.TRIANGLES;
      var offset = 0;
      var count = 3;
      gl.drawArrays(primitiveType, offset, count);
    }

    main();

  </script>
</body>

</html>
```

可以看到页面中渲染了一个三角形，并且边缘带有一些锯齿，这是为什么呢？

这些锯齿与顶点数据转为片段的方式有关，之后的文章会提到抗锯齿的方法。


## 拓展阅读

1. [WebGL 理论基础](https://webglfundamentals.org/webgl/lessons/zh_cn/)
2. [WebGL 教程](https://developer.mozilla.org/zh-CN/docs/Web/API/WebGL_API/Tutorial)