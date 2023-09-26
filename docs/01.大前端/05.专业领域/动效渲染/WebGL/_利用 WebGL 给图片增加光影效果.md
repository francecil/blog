---
title: 利用 WebGL 给图片增加光影效果
date: 2020/03/09 03:00:00
categories: 
  - 大前端
  - 专业领域
  - 动效渲染
  - WebGL
tags: 
  - WebGL
permalink: /pages/9ff70b/
titleTag: 草稿
---

如何使用纹理

顶点着色器中，利用属性接收纹理坐标，并使用可变量将坐标传递给片段着色器

在片段着色器中利用可变量与纹理进行运算，得到一个最后的渲染

```html
<!DOCTYPE HTML>
<html>

<head>
  <style>
  </style>
</head>

<body>
  <canvas id="canvas" width="400" height=300></canvas>
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
    function bindTexture(gl, image) {
      // Create a texture.
      var texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);

      // Set the parameters so we can render any size image.
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

      // Upload the image into the texture.
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    }
    function isPowerOf2(value) {
      return (value & (value - 1)) === 0;
    }
    function setRectangle(gl, x, y, width, height) {
      var x1 = x;
      var x2 = x + width;
      var y1 = y;
      var y2 = y + height;
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        x1, y1,
        x2, y1,
        x1, y2,
        x1, y2,
        x2, y1,
        x2, y2,
      ]), gl.STATIC_DRAW);
    }
    function main() {
      var image = new Image();
      image.crossOrigin = "Anonymous"
      image.src = "https://webglfundamentals.org/webgl/resources/leaves.jpg";  // MUST BE SAME DOMAIN!!!
      image.onload = function () {
        render(image);
      };
    }
    function render(image) {
      // Get A WebGL context
      var canvas = document.getElementById("canvas");
      var gl = canvas.getContext("webgl");
      if (!gl) {
        return;
      }
      // 步骤1~2，编写顶点着色器和片段着色器
      var vertexShaderSource = `
        attribute vec2 a_position;
        attribute vec2 a_texCoord;
        uniform vec2 u_resolution;

        varying vec2 v_texCoord;

void main() {
   // convert the rectangle from pixels to 0.0 to 1.0
   vec2 zeroToOne = a_position / u_resolution;

   // convert from 0->1 to 0->2
   vec2 zeroToTwo = zeroToOne * 2.0;

   // convert from 0->2 to -1->+1 (clipspace)
   vec2 clipSpace = zeroToTwo - 1.0;

   gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);

   // pass the texCoord to the fragment shader
   // The GPU will interpolate this value between points.
   v_texCoord = a_texCoord;
}`

      var fragmentShaderSource = `
      precision mediump float;
    // our texture
uniform sampler2D u_image;

// the texCoords passed in from the vertex shader.
varying vec2 v_texCoord;

void main() {
   gl_FragColor = texture2D(u_image, v_texCoord);
}`

      // 步骤3：对两个着色器进行编译得到着色器对象
      var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
      var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

      // 步骤4：将两个着色器对象链接到同一着色程序
      var program = createProgram(gl, vertexShader, fragmentShader);

      // 步骤5：获取属性值位置
      var positionLocation = gl.getAttribLocation(program, "a_position");
      var texcoordLocation = gl.getAttribLocation(program, "a_texCoord");
      var resolutionLocation = gl.getUniformLocation(program, "u_resolution");


      // 步骤7：设置 WebGL 裁剪空间与 Canvas 画布尺寸间的映射
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

      // 清除画板
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      // 步骤8：为 WebGL 指定着色程序
      gl.useProgram(program);

      // 绑定纹理数据
      bindTexture(gl, image)

      gl.enableVertexAttribArray(positionLocation);
      // 绑定顶点属性
      var positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      setRectangle(gl, 0, 0, image.width, image.height);
      // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
      var size = 2;          // 2 components per iteration
      var type = gl.FLOAT;   // the data is 32bit floats
      var normalize = false; // don't normalize the data
      var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
      var offset = 0;        // start at the beginning of the buffer
      gl.vertexAttribPointer(
        positionLocation, size, type, normalize, stride, offset);

      gl.enableVertexAttribArray(texcoordLocation);

      // Bind the position buffer.
      gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
      // 绑定纹理属性数据
      var texcoordBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        0.0, 0.0,
        1.0, 0.0,
        0.0, 1.0,
        0.0, 1.0,
        1.0, 0.0,
        1.0, 1.0,
      ]), gl.STATIC_DRAW);
      // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
      var size = 2;          // 2 components per iteration
      var type = gl.FLOAT;   // the data is 32bit floats
      var normalize = false; // don't normalize the data
      var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
      var offset = 0;        // start at the beginning of the buffer
      gl.vertexAttribPointer(
        texcoordLocation, size, type, normalize, stride, offset);

      // set the resolution
      gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);

      // 步骤10：指定绘制的图元类型，运行多次顶点着色器，得到图元，并利用片段着色器进行图元绘制
      var primitiveType = gl.TRIANGLES;
      var offset = 0;
      var count = 6;
      gl.drawArrays(primitiveType, offset, count);
    }

    main();

  </script>
</body>

</html>
```

