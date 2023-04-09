---
title: WebGL 纹理
date: 2020/03/18 11:00:00
categories: 大前端
tags: 
  - WebGL
---

# 前言

对一个几何图形进行贴图，所贴的图就叫**纹理**(texture)，或**纹理图像**(texture image)

贴图的过程叫做**纹理映射**

组成纹理图像的像素成为 **纹素**(texels, texture elements) 

光栅化时每个片元会涂上纹素

纹理和光照一样，都是作用于世界坐标系的，不受投影和视图矩阵的影响

<!--more-->

下面说说纹理映射的具体过程

# 纹理映射

主要分为 4 步：
1. 初始化纹理信息
2. 加载纹理图像
3. 配置并使用纹理
4. 着色器处理

## 1. 初始化纹理信息

这一步主要是设置纹理坐标，通过 buffer 绑定属性

首先需要确定纹理的坐标系，采用 s-t 坐标系，见下图查看映射关系

![texture_coord](https://upload-images.jianshu.io/upload_images/9277731-fda445428710a7b7.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


```js
function initVertexBuffers(){
  const verticesTexCoords = new Float32Array([
    // 顶点坐标,    纹理坐标
    -0.5,  0.5,   0.0, 1.0,
    -0.5, -0.5,   0.0, 0.0,
     0.5,  0.5,   1.0, 1.0,
     0.5, -0.5,   1.0, 0.0,
  ]);
  
  // ... 省略顶点坐标的处理

  const FSIZE = verticesTexCoords.BYTES_PER_ELEMENT;
  var a_TexCoord = gl.getAttribLocation(program, "a_texCoord");
  var texcoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesTexCoords, gl.STATIC_DRAW);
  // 每次迭代运行运动 4 FSIZE 内存到下一个数据开始点
  // 初始读取的偏移量为 2 FSIZE
  gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2);
  
}
```

## 2. 加载纹理图像

加载的纹理图像不能对 canvas 造成污染。也就是说，对纹理的加载同样需要遵循跨域访问规则
> 具体原因请看 [面试官问：什么是 canvas 污染](https://juejin.im/post/5e64f811e51d4526e807fefa)

本文采用的纹理图片地址为 `https://webglfundamentals.org/webgl/resources/leaves.jpg`

为了进行跨域访问，还需要设置 `crossOrigin = "Anonymous"`

```js
function loadImage (url, callback) {
  let img = new Image();
  img.crossOrigin = "Anonymous"
  img.src = url;
  img.onload = () => {
    callback(img)
  }
}
loadImage("https://webglfundamentals.org/webgl/resources/leaves.jpg", (img) => {
  // 对 img 进行下一步处理
  loadTexture(img)
})

```





## 3. 配置并使用纹理

### 处理图像（可选）

有以下用法
```js
// 对图像进行 Y 轴反转，第二个参数未 0 值表示 true ，下同
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
// 对图像的 RGB 每个分量都乘以 A
gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);
```

### 创建纹理对象
```js
var texture = gl.createTexture();
```

### 激活并绑定纹理单元
```js
// 默认绑定到 0 号单元，如果只有一张纹理，无需进行 activeTexture
gl.activeTexture(gl.TEXTURE0);
gl.bindTexture(gl.TEXTURE_2D, texture);
```
`gl.TEXTURE_2D` 表示二维纹理，`gl.TEXTURE_CUBE_MAP` 为立方体纹理，后面会提到

### 配置纹理对象参数

利用 texParameter 设置纹理图像映射到图形上的具体方式，包括放大、缩小、水平填充、垂直填充

具体用法详见 [texParameter](https://developer.mozilla.org/zh-CN/docs/Web/API/WebGLRenderingContext/texParameter)

举例
```js
// 使用 LINEAR 缩小纹理图像
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
```

需要注意的是，如果纹理宽高有一个非 2 的幂，则显示纹理失败，通常进行以下处理
```js
// 检查每个维度是否是 2 的幂
if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
  // 是 2 的幂，一般用贴图
  gl.generateMipmap(gl.TEXTURE_2D);
} else {
  // 不是 2 的幂，关闭贴图并设置包裹模式（不需要重复）为到边缘
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
}
```

### 配置纹理图像

```js
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
```

更多用法详见 [WebGLRenderingContext.texImage2D()](https://developer.mozilla.org/zh-CN/docs/Web/API/WebGLRenderingContext/texImage2D)

### 将纹理单元传递给片段着色器

获取取样器索引，取样器用于从纹理图像中获取纹素（该步骤也可以在初始化时进行）
```js
var u_Sampler = gl.getUniformLocation(program, 'u_Sampler');
```
为取样器指定纹理单元(gl.TEXTUREn)编号，GL 最多可同时注册 32 张纹理
```js
// 未指定 u_Sampler 的值时默认设置为 0
// 因此单张纹理也可以不进行 u_Sampler 的赋值
gl.uniform1i(u_Sampler, 0);
```

## 4. 着色器处理

执行绘制时，着色器的运行过程如下：

首先是顶点着色器向片段着色器传输纹理坐标，该纹理坐标是可变量，在片段着色器中会进行插值

然后在片段着色器中获取纹素，并将其颜色赋予片元

```js
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  attribute vec2 a_TexCoord;
  varying vec2 v_TexCoord;
  void main() {
    gl_Position = a_Position;
    v_TexCoord = a_TexCoord;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform sampler2D u_Sampler;
  // 纹理坐标插值
  varying vec2 v_TexCoord;
  void main() {
    // 获取纹素
    gl_FragColor = texture2D(u_Sampler, v_TexCoord);
  }`
```
其中采用了 GLSL ES 内置函数 texture2D 来抽取纹素

## 实例

绘制一个 400x400 的正方形，并将 240x180 的图像作为纹理渲染在上面，采用包裹模式

完整代码如下：

```html
<!DOCTYPE HTML>
<html>

<head>
</head>

<body>
  <canvas id="canvas" width="400" height="400"></canvas>
  <script>
    // 工具方法
    function isPowerOf2(value) {
      return (value & (value - 1)) === 0;
    }
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
    // 创建着色器程序
    function createProgramFromSources(gl, vertexShader, fragmentShader) {
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

    // 初始化顶点和纹理数据，并绑定 buffer
    function initVertexBuffers(gl, program) {
      var verticesTexCoords = new Float32Array([
        // 顶点坐标, 纹理坐标
        -1.0, 1.0, 0.0, 1.0,
        -1.0, -1.0, 0.0, 0.0,
        1.0, 1.0, 1.0, 1.0,
        1.0, -1.0, 1.0, 0.0,
      ]);
      var n = 4; // The number of vertices

      // 为 WebGL 指定着色程序
      gl.useProgram(program);

      // Create the buffer object
      var vertexTexCoordBuffer = gl.createBuffer();
      if (!vertexTexCoordBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
      }

      gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoordBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, verticesTexCoords, gl.STATIC_DRAW);

      var FSIZE = verticesTexCoords.BYTES_PER_ELEMENT;
      var a_Position = gl.getAttribLocation(program, 'a_Position');
      if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return -1;
      }
      gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 4, 0);
      gl.enableVertexAttribArray(a_Position);

      var a_TexCoord = gl.getAttribLocation(program, 'a_TexCoord');
      if (a_TexCoord < 0) {
        console.log('Failed to get the storage location of a_TexCoord');
        return -1;
      }
      gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2);
      gl.enableVertexAttribArray(a_TexCoord);
      return n;
    }

    // 初始化纹理，加载图像
    function initTextures(gl, program, url, callback) {
      var texture = gl.createTexture();   // Create a texture object
      if (!texture) {
        console.log('Failed to create the texture object');
        return false;
      }

      // Get the storage location of u_Sampler
      var u_Sampler = gl.getUniformLocation(program, 'u_Sampler');
      if (!u_Sampler) {
        console.log('Failed to get the storage location of u_Sampler');
        return false;
      }
      let image = new Image();
      image.crossOrigin = "Anonymous"
      image.src = url;
      image.onload = () => {
        callback(image, texture, u_Sampler)
      }
    }

    // 配置并使用纹理
    function loadTexture(gl, image, texture, u_Sampler, n) {
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);

      if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
        // 是 2 的幂，一般用贴图
        gl.generateMipmap(gl.TEXTURE_2D);
      } else {
        // 不是 2 的幂，关闭贴图并设置包裹模式（不需要重复）为到边缘
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      }
      // Set the texture image
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

      // Set the texture unit 0 to the sampler
      gl.uniform1i(u_Sampler, 0);

      gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw the rectangle
    }

    function main() {
      // Get A WebGL context
      /** @type {HTMLCanvasElement} */
      var canvas = document.getElementById("canvas");
      var gl = canvas.getContext("webgl");
      if (!gl) {
        return;
      }
      const VSHADER_SOURCE = `
        attribute vec4 a_Position;
        attribute vec2 a_TexCoord;
        varying vec2 v_TexCoord;
        void main() {
          gl_Position = a_Position;
          v_TexCoord = a_TexCoord;
        }`

      // Fragment shader program
      const FSHADER_SOURCE = `
        precision mediump float;
        uniform sampler2D u_Sampler;
        // 纹理坐标插值
        varying vec2 v_TexCoord;
        void main() {
          // 获取纹素
          gl_FragColor = texture2D(u_Sampler, v_TexCoord);
        }`
      var vertexShader = createShader(gl, gl.VERTEX_SHADER, VSHADER_SOURCE);
      var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, FSHADER_SOURCE);
      var program = createProgramFromSources(gl, vertexShader, fragmentShader)
      if (!program) {
        console.log('Failed to intialize shaders.');
        return;
      }
      var n = initVertexBuffers(gl, program);
      if (n < 0) {
        console.log('Failed to set the vertex information');
        return;
      }

      gl.clearColor(0.0, 0.0, 0.0, 1.0);


      initTextures(gl, program, "https://webglfundamentals.org/webgl/resources/leaves.jpg", (image, texture, u_Sampler) => {
        // 对 image 进行下一步处理
        loadTexture(gl, image, texture, u_Sampler, n)
      })
    }

    main();
  </script>
</body>

</html>
```

效果以及原图

![leaves-canvas.jpg](https://upload-images.jianshu.io/upload_images/9277731-79378db006dfc180.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![leaves.jpg](https://upload-images.jianshu.io/upload_images/9277731-44fac941dee56f32.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


# 加载多个纹理

有些场景需要加载多个纹理，并共同作用于同一个片元

```c
precision mediump float;

// our textures
uniform sampler2D u_image0;
uniform sampler2D u_image1;

// the texCoords passed in from the vertex shader.
varying vec2 v_texCoord;

void main() {
   vec4 color0 = texture2D(u_image0, v_texCoord);
   vec4 color1 = texture2D(u_image1, v_texCoord);
   gl_FragColor = color0 * color1;
}
```
和处理单个纹理类似，我们需要为每个纹理单元进行配置，设置纹理单元对应的纹理
```js
// 设置每个纹理单元对应一个纹理
gl.activeTexture(gl.TEXTURE0);
gl.bindTexture(gl.TEXTURE_2D, textures[0]);
gl.activeTexture(gl.TEXTURE1);
gl.bindTexture(gl.TEXTURE_2D, textures[1]);
```

限于篇幅，详细例子可以参考 [WebGL 使用多个纹理](https://webglfundamentals.org/webgl/lessons/zh_cn/webgl-2-textures.html)

# 分次绘制

纹理资源通常为网络资源，如果需要等所有纹理都加载完毕才开始绘制，用户需要等待非常久的时间才能看到渲染的模型，有时候分次绘制是一个更好的选择

实现的方式也很简单，我们增加一个全局变量，通过纹理加载状态确定是否绘制纹理
```js
const FSHADER_SOURCE = `
  precision mediump float;
  uniform bool textureLoaded;
  uniform sampler2D u_Sampler;
  // 纹理坐标插值
  varying vec2 v_TexCoord;
  void main() {
    if(textureLoaded){
      // 获取纹素
      gl_FragColor = texture2D(u_Sampler, v_TexCoord);
    } else {
      // 使用默认颜色，这里也可以使用颜色可变量
      gl_FragColor = vec4(1, 0, 0.5, 1);
    }
  }`

function render(gl, program, state, n) {
  gl.uniform1i(gl.getUniformLocation(program, 'textureLoaded'), state)
  gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw the rectangle
}

// 初始执行
render(gl, program, false, n)

// 图片加载完再次执行
render(gl, program, true, n)
```

不过这种方法控制台一开始会输出警告
```
RENDER WARNING: there is no texture bound to the unit 0
```

不知道还有其他方式没，欢迎探讨~

# 立方体纹理(gl.TEXTURE_CUBE_MAP)

立方体纹理并不是说单一纹理图像是立体的（想想也知道不是，图像只能是二维的），而是说将多个面的纹理共同组成一个立方体

片段着色器通过法向量去获取纹素

首先为立方体的每个面配置纹理图像
```js
gl.texImage2D(target, level, internalFormat, format, type, img[i]);
// target 的取值有
gl.TEXTURE_CUBE_MAP_POSITIVE_X
gl.TEXTURE_CUBE_MAP_NEGATIVE_X
gl.TEXTURE_CUBE_MAP_POSITIVE_Y
gl.TEXTURE_CUBE_MAP_NEGATIVE_Y
gl.TEXTURE_CUBE_MAP_POSITIVE_Z
gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
```


片段着色器中，根据每个片元对应的法向量（可变量）确定应该使用的面


```c
gl_FragColor = textureCube(u_texture, normalize(v_normal));
```

内部通过片元像素坐标自己去确定纹理图像的纹素

常用来做 [环境贴图](https://webglfundamentals.org/webgl/lessons/zh_cn/webgl-environment-maps.html)

本文不做拓展，更多信息请参考 [WebGL 立方体贴图](https://webglfundamentals.org/webgl/lessons/zh_cn/webgl-cube-maps.html)

# 总结

本文探讨了绘制纹理的基本流程，并简单提及多纹理的处理以及立方体纹理的概念，最后给出了一些例子的链接，感兴趣的可以点击查看



