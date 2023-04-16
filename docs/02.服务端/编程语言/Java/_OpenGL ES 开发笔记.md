---
title: OpenGL ES 开发笔记
date: 2020-06-29 22:18:37
permalink: /pages/aef43f/
categories: 
  - 服务端
  - 编程语言
  - Java
tags: 
  - 
titleTag: 草稿
---
---------

## **2016/04/14**

-----------
HelloOpenGlES
- 先建项目,MainActivity


    public class MainActivity extends AppCompatActivity {
        private GLSurfaceView glSurfaceView;
        private boolean rendererSet = false;
        @Override
        protected void onCreate(Bundle savedInstanceState) {
            super.onCreate(savedInstanceState);
            //用GLSurfaceView 初始化OpenGL 为显示GL surface
            glSurfaceView=new GLSurfaceView(this);
            /*
            * 检查OpenGl ES版本
            * */
            final ActivityManager activityManager = (ActivityManager)getSystemService(Context.ACTIVITY_SERVICE);
            final ConfigurationInfo configurationInfo = activityManager.getDeviceConfigurationInfo();
            final boolean supportEs2 =configurationInfo.reqGlEsVersion >=0x20000;
            Log.i("zjx",configurationInfo.reqGlEsVersion+";;;");//输出196608 16进制=0x30000 3.0版本
            if(supportEs2){
                //为了兼容2.0版本的 这边不设置Version为3
                glSurfaceView.setEGLContextClientVersion(2);
                //传入一个自定义Renderer渲染器
                glSurfaceView.setRenderer(new FirstRenderer());
                rendererSet = true ;
                //显示在屏幕上
                setContentView(glSurfaceView);
            }
        }
        @Override
        protected void onPause() {
            super.onPause();
            //暂停surfaceView,释放OpenGl上下文
            if(rendererSet){
                glSurfaceView.onPause();
            }
        }
    
        @Override
        protected void onResume() {
            super.onResume();
            //继续后台渲染线程，续用OpenGL上下文
            if(rendererSet){
                glSurfaceView.onResume();
            }
        }
    }


<!--more-->


- 先建FirstRenderer


    import android.opengl.GLSurfaceView;
    import android.util.Log;
    
    import static android.opengl.GLES20.*;
    import javax.microedition.khronos.egl.EGLConfig;
    import javax.microedition.khronos.opengles.GL10;
    
    /**
     * Created by Administrator on 2016/3/29.
     * 采用静态import GLES20 所以下面的glClearColor等静态方法/变量 无需写类名
     * GLSurfaceView 会在单独的线程调用渲染器的方法
     * 后台渲染线程和主线程(UI线程)通信可以用runOnUIThread()来传递event
     */
    public class FirstRenderer implements GLSurfaceView.Renderer {
        /*
        * surface创建时调用
        * @parem gl10: 1.0遗留 为向下兼容
        * ps:横竖屏切换时，会调用，重新获得OpenGL 上下文会再调用(pause->resume)
        * */
        @Override
        public void onSurfaceCreated(GL10 gl10, EGLConfig eglConfig) {
            Log.i("zjx1","onSurfaceCreated");
            glClearColor(1.0f,1.0f,0.0f,0.5f);
        }
    
        /*
        * surface尺寸变化时调用,
        * ps:横竖屏切换时，surface尺寸会发生变化
        * */
        @Override
        public void onSurfaceChanged(GL10 gl10, int width, int height) {
            //设置视口尺寸，渲染surface的大小
            Log.i("zjx2","onSurfaceChanged");
            glViewport(0,0,width/2,height/2);
        }
        /*
        *每绘制一帧，都会被GLSurfaceView调用，所以在该方法一定要绘制东西，即使只是clear screen
        * because after this method, 渲染缓冲区会被交换显示到屏幕上，
        * 否则会出现闪屏效果
        * */
        @Override
        public void onDrawFrame(GL10 gl10) {
            Log.i("zjx3","onDrawFrame");
            glClear(GL_COLOR_BUFFER_BIT);
        }
    }


效果：黄色的screen,旋转屏幕/回到Activity 打印相应log

-------------
## 2016/04/15

------------
## 定义顶点和着色器

### 定义顶点，且复制到本地内存

    public class AirHockeyRenderer implements GLSurfaceView.Renderer {
        private static final int POSITION_COMPONENT_COUNT = 2;
        private static final int BYTES_PER_FLOAT = 4;
        private final FloatBuffer vertexData;//本地内存存储数据
        /*
        * surface创建时调用
        * @parem gl10: 1.0遗留 为向下兼容
        * ps:横竖屏切换时，会调用，重新获得OpenGL 上下文会再调用(pause->resume)
        * */
        public AirHockeyRenderer(){
            //逆时针 两个三角形去拼接为矩形
            float[] tableVerticesWithTriangles ={
                    //Triangle1
                    0f,0f,
                    9f,14f,
                    0f,14f,
                    //Triangle2
                    0f,0f,
                    9f,0f,
                    9f,14f,
                    //line
                    0f,7f,
                    9f,7f,
                    //Mallets
                    4.5f,2f,
                    4.5f,12f
            };
            vertexData = ByteBuffer.allocateDirect(tableVerticesWithTriangles.length * BYTES_PER_FLOAT)//分配本地内存
                    .order(ByteOrder.nativeOrder())//保证一个平台使用同样的排序：按照本地字节序组织内容
                    .asFloatBuffer();//不操作字节 而是希望调用浮点数
            vertexData.put(tableVerticesWithTriangles);//把数据从Dalvik内存复制到本地内存 进程结束时释放内存
    
    
        }

### 顶点着色器：生成每个顶点的对应位置，每个顶点都会执行一次，最终位置确定后组装为点线三角形
### 片段着色器：为组成点 直线 三角形每个片段(超小单一颜色，类似像素)生成最终的颜色，每个片段调用一次。

*颜色生成后，OpenGL将其写入帧缓冲区(frame buffer) 然后Android将该缓冲区显示到屏幕上。*

> 过程：读取顶点数据->执行顶点着色器->组装图元->光栅化图元->执行片段着色器->写入帧缓冲区->显示到屏幕上
> cookbook:https://www.khronos.org/files/opengles20-reference-card.pdf

### 创建第一个顶点着色器
res/raw下新建simple_vertex_shader.glsl

    //类似c语言
    attribute vec4 a_Position;
    //着色器入口
    void main(){
        gl_Position = a_Position;//OpenGL会把gl_Position中存储的值作为当前顶点的最终位置。
    }


### 创建第一个片段着色器
#### 光栅化技术

> OpenGL通过光栅化技术把每个点，直线及三角形分解为大量的小片段，如图2-7
![FUL[{SAR9]74$1KAABMH3AA.jpg][1]


> 通常一个片段对应一个像素，高分屏的可能片段较大较少CPU负荷

>simple_fragment_shader.glsl

    //定义浮点数精度：lowp/mediumn/highp 低/中/高 精度 精度越高性能越低
    //顶点着色器默认是highp:顶点位置精度重要
    precision mediump float;
    uniform vec4 u_Color;
    
    void main(){
        gl_FragColor = u_Color;//OpenGL会把gl_FragColor中存储的这个颜色作为当前片段的最终颜色
    }

### OpenGl颜色模型
(R,G,B,Alpha)

---------------------

## 编译着色器及在屏幕上绘图
### 加载着色器
#### 新建工具类 TextResourceReader 
    /**
     * Created by Administrator on 2016/4/15.
     * 从资源中加载文本
     */
    public class TextResourceReader {
        public static String readTextFileFromResource(Context context, int resourceId){
            StringBuilder body = new StringBuilder();//不考虑同步写入，用Builder
            try{
                InputStream inputStream = context.getResources().openRawResource(resourceId);
                InputStreamReader inputStreamReader=new InputStreamReader(inputStream);
                BufferedReader bufferedReader=new BufferedReader(inputStreamReader);
                String nexttLine;
                while((nexttLine=bufferedReader.readLine())!=null){
                    body.append(nexttLine);
                    body.append('\n');
                }
            }catch (IOException e){
                throw new RuntimeException("不能打开资源："+resourceId,e);
            }catch (Resources.NotFoundException nfe){
                throw new RuntimeException("资源不存在："+resourceId,nfe);
            }
            return body.toString();
        }
    }

#### 读入着色器代码

修改AirHockeyRenderer为如下

    public class AirHockeyRenderer implements GLSurfaceView.Renderer {
        private static final int POSITION_COMPONENT_COUNT = 2;
        private static final int BYTES_PER_FLOAT = 4;
        private final FloatBuffer vertexData;//本地内存存储数据
        private final Context context;
        /*
        * surface创建时调用
        * @parem gl10: 1.0遗留 为向下兼容
        * ps:横竖屏切换时，会调用，重新获得OpenGL 上下文会再调用(pause->resume)
        * */
        public AirHockeyRenderer(Context context){
            this.context=context;
            //逆时针 两个三角形去拼接为矩形
            float[] tableVerticesWithTriangles ={
                   //不变 略
            };
            vertexData = ByteBuffer.allocateDirect(tableVerticesWithTriangles.length * BYTES_PER_FLOAT)//分配本地内存
                    .order(ByteOrder.nativeOrder())//保证一个平台使用同样的排序：按照本地字节序组织内容
                    .asFloatBuffer();//不操作字节 而是希望调用浮点数
            vertexData.put(tableVerticesWithTriangles);//把数据从Dalvik内存复制到本地内存 进程结束时释放内存
    
    
        }
        @Override
        public void onSurfaceCreated(GL10 gl10, EGLConfig eglConfig) {
    
            Log.i("zjx1","onSurfaceCreated");
            glClearColor(1.0f,1.0f,0.0f,0.5f);
            String vertexShaderSource = TextResourceReader.readTextFileFromResource(context,R.raw.simple_vertex_shader);
            String fragmentShaderSource = TextResourceReader.readTextFileFromResource(context,R.raw.simple_fragment_shader);
        }

Activity修改

     //传入一个自定义Renderer渲染器
                glSurfaceView.setRenderer(new AirHockeyRenderer(this));
                rendererSet = true ;

### 编译着色器
#### 新建工具类ShaderHelper

    import android.util.Log;
    
    import static android.opengl.GLES20.*;
    public class ShaderHelper {
        private static final String TAG = "ShaderHelper";
        public static int compileVertexShader(String shaderCode){
            return compileShader(GL_VERTEX_SHADER,shaderCode);
        }
        public static int compileFragmentShader(String shaderCode){
            return compileShader(GL_FRAGMENT_SHADER,shaderCode);
        }
        /**
         * 编译着色器, 返回 OpenGL object ID.
         */
        private static int compileShader(int type, String shaderCode) {
            // new 着色器对象
            //shaderObjectId 是OpenGL对象的引用
            final int shaderObjectId = glCreateShader(type);
            //内部实现是返回0而不是抛异常
            if(shaderObjectId == 0){
                Log.w(TAG,"没有创建着色器对象");
                return 0;
            }
            //把着色器源代码传到着色器对象中
            glShaderSource(shaderObjectId,shaderCode);
            //编译着色器
            glCompileShader(shaderObjectId);////shaderObjectId 保持着对OpenGL对象(该着色器对象)的引用
            //得到编译状态
            final int[] compileStatus = new int[1];
            //存入compileStatus数组的第0个元素
            glGetShaderiv(shaderObjectId,GL_COMPILE_STATUS,compileStatus,0);
            //也可以选择获得更多的编译信息
            Log.v(TAG, "Results of compiling source:" + "\n" + shaderCode + "\n:"
                    + glGetShaderInfoLog(shaderObjectId));
            if (compileStatus[0] == 0) {
                // 编译失败，删除对象
                glDeleteShader(shaderObjectId);
                Log.w(TAG, "Compilation of shader failed.");
                return 0;
            }
            //编译成功
            return shaderObjectId;
        }
    }

修改Renderer

    @Override
        public void onSurfaceCreated(GL10 gl10, EGLConfig eglConfig) {
    
            Log.i("zjx1","onSurfaceCreated");
            glClearColor(1.0f,1.0f,0.0f,0.5f);
            String vertexShaderSource = TextResourceReader.readTextFileFromResource(context,R.raw.simple_vertex_shader);
            String fragmentShaderSource = TextResourceReader.readTextFileFromResource(context,R.raw.simple_fragment_shader);
            int vertexShader = ShaderHelper.compileVertexShader(vertexShaderSource);
            int fragmentShader = ShaderHelper.compileFragmentShader(fragmentShaderSource);
        }

> 此时该渲染器已经获得了OpenGL对象(这里是着色器)的引用

### 链接顶点和片段着色器成为单个对象
修改ShaderHelper,加入linkProgram方法

    public static int linkProgram(int vertexShaderId, int fragmentShaderId) {
            //新建一个program对象，用于后面链接2个着色器
            final int programObjectId = glCreateProgram();
            if (programObjectId == 0) {
                Log.w(TAG, "Could not create new program");
                return 0;
            }
            //附上着色器
            glAttachShader(programObjectId,vertexShaderId);
            glAttachShader(programObjectId,fragmentShaderId);
            //链接
            glLinkProgram(programObjectId);
            final int[] linkStatus = new int[1];
            glGetProgramiv(programObjectId, GL_LINK_STATUS, linkStatus, 0);
            Log.v(TAG, "Results of linking program:\n"
                        + glGetProgramInfoLog(programObjectId));
            if (linkStatus[0] == 0) {
                glDeleteProgram(programObjectId);
                Log.w(TAG, "Linking of program failed.");
                return 0;
            }
            return programObjectId;
        }

修改AirHockeyRenderer

    private int program;
    //onSurfaceCreated(){中
            program=ShaderHelper.linkProgram(vertexShader,fragmentShader);

### 最后的拼接
#### 验证OpenGL对象是否是有效的：低效率/无法运行
ShaderHelper加入

    public static boolean validateProgram(int programObjectId) {
            //检查是否有效
            glValidateProgram(programObjectId);
    
            final int[] validateStatus = new int[1];
            glGetProgramiv(programObjectId, GL_VALIDATE_STATUS, validateStatus, 0);
            Log.v(TAG, "Results of validating program: " + validateStatus[0]
                    + "\nLog:" + glGetProgramInfoLog(programObjectId));
    
            return validateStatus[0] != 0;
        }

> onSurfaceOnCreated()加入 

    ShaderHelper.validateProgram(program);
    //告诉OpenGL绘制东西要屏幕上要使用这里的program
    glUseProgram(program);

#### 获取uniform和attribute位置
渲染器AirHockeyRenderer头部加入

    private static final String U_COLOR = "u_Color";
    private static final String A_POSITION = "a_Position";
    private int uColorLocation;//U_COLOR在OpenGL程序对象中位置的变量
    private int aPositionLocation;

> onSurfaceOnCreated()加入

    //获取uniform和attribute的位置
            uColorLocation = glGetUniformLocation(program, U_COLOR);
            aPositionLocation = glGetAttribLocation(program, A_POSITION);

> onSurfaceOnCreated如下

    @Override
        public void onSurfaceCreated(GL10 gl10, EGLConfig eglConfig) {
    
            Log.i("zjx1","onSurfaceCreated");
            glClearColor(1.0f,1.0f,0.0f,0.5f);
            String vertexShaderSource = TextResourceReader.readTextFileFromResource(context,R.raw.simple_vertex_shader);
            String fragmentShaderSource = TextResourceReader.readTextFileFromResource(context,R.raw.simple_fragment_shader);
            //获取引用
            int vertexShader = ShaderHelper.compileVertexShader(vertexShaderSource);
            int fragmentShader = ShaderHelper.compileFragmentShader(fragmentShaderSource);
            program=ShaderHelper.linkProgram(vertexShader,fragmentShader);
            ShaderHelper.validateProgram(program);
            //告诉OpenGL绘制东西要屏幕上要使用这里的program
            glUseProgram(program);
            //获取uniform和attribute在program的位置
            uColorLocation = glGetUniformLocation(program, U_COLOR);
            aPositionLocation = glGetAttribLocation(program, A_POSITION);
            //关联attribute(aPositionLocation)与顶点数据vertexData
            vertexData.position(0);//确保本地内存的vertexData从数组头开始读取
            /**
             * glVertexAttribPointer (int index, int size, int type, boolean normalized, int stride, Buffer ptr)
             * @param index :我们把数据传入attribute位置，指向glGetAttribLocation中获取的位置
             * @param size:这里我们只用了2个分量(x,y)，注意在着色器中a_Pointion被定义为vec4
             * @param type:数据类型
             * @param normalized:只要使用整形该参数才有意义
             * @param stride:暂时忽略
             * @param ptr:去哪读数据              
             * 注意传入正确的参数，否则难以调试
             */
            glVertexAttribPointer(aPositionLocation, POSITION_COMPONENT_COUNT, GL_FLOAT,
                    false, 0, vertexData);
            //告诉OpenGL去aPositionLocation寻找数据,可以从vertexData找到属性为a_Position的数据
            glEnableVertexAttribArray(aPositionLocation);
        }

### 绘制
**读入顶点数据后，点着色器得到赋值，值如何寻找在onSurfaceCreated 有定义，然后进入glsl的main函数**
**光栅化后有些属性传入片着色器(如下一章讲的用到的varying vec4 v_Color)**
**然后最后绘制到屏幕上**

    public void onDrawFrame(GL10 gl10) {
            Log.i("zjx3","onDrawFrame");
            glClear(GL_COLOR_BUFFER_BIT);
            //更新着色器中u_Color中的值(在onSurfaceCreated中我们已经获取到uniform的位置并存入uColorLocation)
            // uniform没有默认值 所以这里我们必须指定
            //先随便设置个RGBA
            glUniform4f(uColorLocation,1.0f,1.0f,1.0f,1.0f);
            /*
            * glDrawArrays (int mode, int first, int count)
            * mode:我们要画的类型
            * first:从顶点数组vertexData那个位置开始找
            * count:读入一个顶点 这里读6个 画出两个三角形
            * */
            glDrawArrays(GL_TRIANGLES,0,6);
            //一些其他的绘制
            // Draw the center dividing line.
            glUniform4f(uColorLocation, 1.0f, 0.0f, 0.0f, 1.0f);
            glDrawArrays(GL_LINES, 6, 2);
    
            // Draw the first mallet blue.        
            glUniform4f(uColorLocation, 0.0f, 0.0f, 1.0f, 1.0f);
            glDrawArrays(GL_POINTS, 8, 1);
    
            // Draw the second mallet red.
            glUniform4f(uColorLocation, 1.0f, 0.0f, 0.0f, 1.0f);
            glDrawArrays(GL_POINTS, 9, 1);
        }

先运行看下效果：
![tu][2]

先

    public void onSurfaceCreated(GL10 gl10, EGLConfig eglConfig) {
    
            Log.i("zjx1","onSurfaceCreated");
            glClearColor(0.0f,0.0f,0.0f,0.0f);

坐标映射到屏幕
更新

    float[] tableVerticesWithTriangles = {
                // Triangle 1
                -0.5f, -0.5f, 
                 0.5f,  0.5f,
                -0.5f,  0.5f,
    
                // Triangle 2
                -0.5f, -0.5f, 
                 0.5f, -0.5f, 
                 0.5f,  0.5f,
    
                // Line 1
                -0.5f, 0f, 
                 0.5f, 0f,
    
                // Mallets
                0f, -0.25f, 
                0f,  0.25f
            };

指定点的大小

> simple_vertex_shader.glsl

    void main(){
        gl_Position = a_Position;//OpenGL会把gl_Position中存储的值作为当前顶点的最终位置。
        gl_PointSize = 10.0;//OpenGL将点分解为一些以gl_Position为中心的四边形，每个四边形长度为 gl_PointSize
    }

ok 最后的结果
![QQ截图20160415133352.png][3]

截图有误... 手机上实际显示中间是有一条红线的

-----------------------
## 增加颜色和着色
> 把每个点定义为一个顶点属性,而不是整个对象都是一个颜色 如上面的一块大白色 

> 若利用绘制大量的三角形，性能内存开销大

> **解决方案：平滑地混合一条直线或一个三角形表面每个顶点的颜色**

### 引入三角形扇

将原来的两个三角形再分，即出现的是矩形被两条对角线平分为4块三角形

OpenGL 自带该类型`GL_TRIANGLE_FAN` 所以不用每个三角形再定义一次坐标


    float[] tableVerticesWithTriangles = {
                // Triangle Fan
                   0,     0,            
                -0.5f, -0.5f,             
                 0.5f, -0.5f,
                 0.5f,  0.5f,
                -0.5f,  0.5f,            
                -0.5f, -0.5f,



    6个点分边是
    5——————4
    | \  / |
    |——1——-|
    | /  \ |
    2/6————3

    onDrawFrame中修改为
    glDrawArrays(GL_TRIANGLE_FAN, 0, 6);

运行后效果一致

### 给顶点增加颜色属性

更新

    float[] tableVerticesWithTriangles = {   
                // Order of coordinates: X, Y, R, G, B
                
                // Triangle Fan
                   0f,    0f,   1f,   1f,   1f,         
                -0.5f, -0.5f, 0.7f, 0.7f, 0.7f,            
                 0.5f, -0.5f, 0.7f, 0.7f, 0.7f,
                 0.5f,  0.5f, 0.7f, 0.7f, 0.7f,
                -0.5f,  0.5f, 0.7f, 0.7f, 0.7f,
                -0.5f, -0.5f, 0.7f, 0.7f, 0.7f,
    
                // Line 1
                -0.5f, 0f, 1f, 0f, 0f,
                 0.5f, 0f, 1f, 0f, 0f,
    
                // Mallets
                0f, -0.25f, 0f, 0f, 1f,
                0f,  0.25f, 1f, 0f, 0f
            };

更新着色器,我们不需要再用uniform
### 插值计算
    

> simple_vertex_shader.glsl

    attribute vec4 a_Position;  
    attribute vec4 a_Color;
    
    varying vec4 v_Color;//三角形中的变量会被混合 越接近顶点出现的颜色与顶点颜色越相近
    
    void main()                    
    {                            
        v_Color = a_Color;
    	  
        gl_Position = a_Position;    
        gl_PointSize = 10.0;          
    }  


> simple_fragment_shader.glsl


    precision mediump float; 				
    varying vec4 v_Color;   //代替了uniform   	   								
      
    void main()                    		
    {                              	
        gl_FragColor = v_Color;                                  		
    }



更新渲染器常量

    private static final String A_POSITION = "a_Position";
        private static final String A_COLOR = "a_Color";    
        private static final int POSITION_COMPONENT_COUNT = 2;
        private static final int COLOR_COMPONENT_COUNT = 3;    
        private static final int BYTES_PER_FLOAT = 4;
        //跨距告诉OpenGL每两个顶点在本地内存需要跳过的数据长度
        private static final int STRIDE = 
            (POSITION_COMPONENT_COUNT + COLOR_COMPONENT_COUNT) * BYTES_PER_FLOAT;
        
        private final FloatBuffer vertexData;
        private final Context context;
    
        private int program;
        private int aPositionLocation;
        private int aColorLocation;

更新onSurfaceCreated

    //uColorLocation = glGetUniformLocation(program, U_COLOR); 改为
            aColorLocation = glGetAttribLocation(program,A_COLOR);

    ...

    /**
             * glVertexAttribPointer (int index, int size, int type, boolean normalized, int stride, Buffer ptr)
             * @param index :我们把数据传入attribute位置，指向glGetAttribLocation中获取的位置
             * @param size:这里我们只用了2个分量(x,y)，注意在着色器中a_Pointion被定义为vec4
             * @param type:数据类型
             * @param normalized:只要使用整形该参数才有意义
             * @param stride:跨距
             * @param ptr:去哪读数据
             * 注意传入正确的参数，否则难以调试
             */
    //        glVertexAttribPointer(aPositionLocation, POSITION_COMPONENT_COUNT, GL_FLOAT,
    //                false, 0, vertexData); 改为
            glVertexAttribPointer(aPositionLocation,POSITION_COMPONENT_COUNT,GL_FLOAT,false,STRIDE,vertexData);
    ...函数末尾加入
    //把顶点数据和a_Color关联起来
        vertexData.position(POSITION_COMPONENT_COUNT);
        //顶点数据的颜色值从2位置开始，有3个，GL_FLOAT类型,跨距STRIDE,
        glVertexAttribPointer(aColorLocation,COLOR_COMPONENT_COUNT,GL_FLOAT,false,STRIDE,vertexData);
        //告诉OpenGL去aColorLocation寻找颜色数据
        glEnableVertexAttribArray(aColorLocation);


#### 更新onDrawFrame
删除glUniform4f调用即可

    public void onDrawFrame(GL10 gl10) {
            Log.i("zjx3","onDrawFrame");
            glClear(GL_COLOR_BUFFER_BIT);
            //更新着色器中u_Color中的值(在onSurfaceCreated中我们已经获取到uniform的位置并存入uColorLocation)
            // uniform没有默认值 所以这里我们必须指定
            //先随便设置个RGBA
            /*
            * glDrawArrays (int mode, int first, int count)
            * mode:我们要画的类型
            * first:从顶点数组vertexData那个位置开始找
            * count:读入一个顶点 这里读6个 画出三角形扇
            * */
            glDrawArrays(GL_TRIANGLE_FAN, 0, 6);
            //一些其他的绘制
            // Draw the center dividing line.
            glDrawArrays(GL_LINES, 6, 2);
    
            // Draw the first mallet blue.
            glDrawArrays(GL_POINTS, 8, 1);
    
            // Draw the second mallet red.
            glDrawArrays(GL_POINTS, 9, 1);
        }



//如果运行的时候界面全黑，看调试信息应该我glsl文件还没更新,clean project就可以了。
运行效果
![QQ截图20160415183202.png][4]






-----------

----------------
## 2016/04/15
----------------
## 调整屏幕宽高比(旋转屏幕的时候

(x,y,z,w)
### 平移矩阵

    1 0 0 x-offset
    0 1 0 y-offset
    0 0 1 z-offset
    0 0 0 1

### 正交投影(概念自习百度)



左右手坐标系统





更新点着色器

    uniform mat4 u_Matrix;//4x4的矩阵
    
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    
    varying vec4 v_Color;
    
    void main()                    
    {                            
        v_Color = a_Color;
    	  
        //gl_Position = a_Position;
        gl_Position = u_Matrix * a_Position;  //进行正交投影
        gl_PointSize = 10.0;          
    }      

更新渲染器

    public class AirHockeyRenderer implements GLSurfaceView.Renderer {
        private static final String U_MATRIX = "u_Matrix";
        private final float[] projectionMatrix = new float[16];//用于存储矩阵
        private int uMatrixLocation;//u_Matrix uniform位置 

>  onSurfaceCreated加入 
uMatrixLocation = glGetUniformLocation(program,U_MATRIX);

### 创建正交投影矩阵(与横竖屏相关)
>import static android.opengl.Matrix.*;

      final float aspectRatio = width > height ? 
                (float) width / (float) height : 
                (float) height / (float) width;
    
            if (width > height) {
                // Landscape
                orthoM(projectionMatrix, 0, -aspectRatio, aspectRatio, -1f, 1f, -1f, 1f);
            } else {
                // Portrait or square
                orthoM(projectionMatrix, 0, -1f, 1f, -aspectRatio, aspectRatio, -1f, 1f);
            }   

>

    @Override
    public void onDrawFrame(GL10 gl10) {
        glClear(GL_COLOR_BUFFER_BIT);
        // 加入这句 使uMatrixLocation被赋值
        glUniformMatrix4fv(uMatrixLocation, 1, false, projectionMatrix, 0);

运行后横竖屏一样(横屏不被压缩)这里不展示效果了

本章重点掌握该函数

     /*
        * @param m:目标数组存储后面生成的矩阵
        * @param mOffset：起始偏移值
        * @param left/right:x轴的最小/大范围 ..后面的类似
        * */
    public static void orthoM (float[] m, int mOffset, float left, float,right, float bottom, float top, float near, float far)


产生如下的正交投影矩阵

    2/(right-left)    0               0        -(right+left)/(right-left)
    0             2/(top-bottom)      0        -(top+bottom)/(top-bottom)
    0                 0         -2/(far-near)  -(far+near)/(far-near)
    0                 0               0                  1


------------
## 三维
### 着色器到屏幕的坐标
> `gl_Position`->(透视除法)->`归一化设备坐标`->(窗口变换)->`窗口坐标`

**2次变换步骤,3个坐标空间**
- **`gl_Position`**：即(x,y,z,w)，我们定义在顶点坐标中的数据,x,y,z属于[-1,1];
- **`透视除法`**：为了创建三维幻象,OpenGL 会把每个gl_Position 的x,y,z分量除于它的w分量
    举例：两个坐标(1,1,1,1),(1,1,1,2)，归一化设备坐标之前，做透视除法
    所以变成(1/1,1/1,1/1),(1/2,1/2,1/2) 所以具有较大w值的被移动到离(0,0,0)更近的位置
    看火车铁轨的这张图,原来大家都是(-1,-1,0)，(1,-1,0),图中的红圈处,除于w后位置都变了
    ![9DTXVFE%4379Q2HK3R`0CG3.png][5]

    - 同质化坐标：(1,1,1,1),(2,2,2,2),(3,3,3,3)透视除法后归一化到同一坐标，成为同质化
    - 除于w而不是除于z:解耦,保留z便于正交投影和透视投影的切换，z用于深度缓冲区

- **`窗口(viewport)变换`**:通过glViewport()调用告诉OpenGL做变换，
    把(-1,-1,-1)到(1,1,1)之间的范围映射到屏幕上，
    **范围之外会被裁剪掉**


### 添加w分量创建三维图
修改渲染器`AirHockeyRenderer`

    private static final int POSITION_COMPONENT_COUNT = 4;
>
    float[] tableVerticesWithTriangles = {   
                // Order of coordinates: X, Y, Z, W, R, G, B
                
                // Triangle Fan
                   0f,    0f, 0f, 1.5f,   1f,   1f,   1f,         
                -0.5f, -0.8f, 0f,   1f, 0.7f, 0.7f, 0.7f,            
                 0.5f, -0.8f, 0f,   1f, 0.7f, 0.7f, 0.7f,
                 0.5f,  0.8f, 0f,   2f, 0.7f, 0.7f, 0.7f,
                -0.5f,  0.8f, 0f,   2f, 0.7f, 0.7f, 0.7f,
                -0.5f, -0.8f, 0f,   1f, 0.7f, 0.7f, 0.7f,            
    
                // Line 1
                -0.5f, 0f, 0f, 1.5f, 1f, 0f, 0f,
                 0.5f, 0f, 0f, 1.5f, 1f, 0f, 0f,
    
                // Mallets
                0f, -0.4f, 0f, 1.25f, 0f, 0f, 1f,
                0f,  0.4f, 0f, 1.75f, 1f, 0f, 0f
            };
clean工程之后(AS2.0支持热代码修改，但是有些代码还是没被更新过去)运行效果(没截全)如下
![QQ截图20160416112253.png][6]

PS:上面的w是手动指定，硬编码，实际应该是通过透视投影矩阵自动生成w的值

-------------------
## 16-04-28
code:https://pragprog.com/titles/kbogla/source_code

---------------------
## 增加纹理
纹理可以是图像或数学算法生成的数据
注意纹理的方向性
### 把纹理加载进OpenGL中

    public static int loadTexture(Context context, int resourceId) {
            final int[] textureObjectIds = new int[1];
              //生成纹理ID存入textureObjectIds[0]
            glGenTextures(1, textureObjectIds, 0);

### 加载位图数据并与纹理绑定
OpenGL不能直接读取PNG 需要解压缩 利用`BitmapFactory.decodeResource`
 

    final BitmapFactory.Options options = new BitmapFactory.Options();
            options.inScaled = false;
    
            // Read in the resource
            final Bitmap bitmap = BitmapFactory.decodeResource(
                context.getResources(), resourceId, options);

 

    //GL_TEXTURE_2D:表示这是2D纹理 textureObjectIds[0]：表示告诉OpenGL要绑定到哪个纹理对象的ID
      glBindTexture(GL_TEXTURE_2D, textureObjectIds[0]); 

#### **纹理过滤**：

> 我们的纹理在渲染表面绘制，缩放时纹理元素可能无法精确映射到OpenGL生成的片段
- 最近邻过滤：为每个OpenGL片段选择最近的纹理元素
    - 放大：OpenGL片段相对过多，一些片段多出来的会选择最近的，故出现锯齿，
    - 缩小：OpenGL片段不够，一些片段选择原来的，一些片段少掉，故会丢失细节
- **双线性过滤**：使用双线性插值平滑像素之间的过渡，故**适合处理放大** 
- MIP贴图：生成一组优化过的不同大小的纹理，为每个片段选择最合适的级别
        占用更多内存，但渲染更快，用于下面的三线性过滤
- **三线性过滤**：使用MIP贴图级别之间插值的双线性过滤*(注意与使用MIP贴图的双线性过滤区分，后者与双线性无异，只是作用对象是MIP贴图而不是原纹理图)*
当使用双线性过滤切换MIP贴图级别，会出现明显跳跃或线条，我们可以切换到三线性过滤
即：OpenGL在**最邻近的MIP贴图级别之间也要插值**，故每个片段用8个纹理元素插值，消除过渡

故，一般是缩小用三线性，放大用双线性。



    // 放大GL_TEXTURE_MAG_FILTER双线性GL_LINEAR
    // 缩小GL_TEXTURE_MIN_FILTER三线性GL_LINEAR_MIPMAP_LINEAR.
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR_MIPMAP_LINEAR);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);




**OpenGL纹理过滤模式**

    GL_NEAREST----------------------最近邻过滤
    GL_NEAREST_MIPMAP_NEAREST-------使用MIP贴图的最近邻过滤
    GL_NEAREST_MIPMAP_LINEAR--------使用MIP贴图级别之间插值的最近邻过滤
    GL_LINEAR-----------------------双线性插值
    GL_LINEAR_MIPMAP_NEAREST--------使用MIP贴图的双线性插值
    GL_LINEAR_MIPMAP_LINEAR---------三线性插值（使用MIP贴图级别之间插值的双线性过滤）

**每种情况允许的纹理过滤模式**
**缩小**	

    GL_NEAREST
    GL_NEAREST_MIPMAP_NEAREST
    GL_NEAREST_MIPMAP_LINEAR
    GL_LINEAR
    GL_LINEAR_MIPMAP_NEAREST
    GL_LINEAR_MIPMAP_LINEAR

**放大**	

    GL_NEAREST
    GL_LINEAR

#### 加载纹理到OPENGL并返回ID

    // 加载bitmap到OpenGL，并复制到当前绑定的纹理对象(之前glBindTexture)
    texImage2D(GL_TEXTURE_2D, 0, bitmap, 0);
    bitmap.recycle();//bitmap使用后直接释放，省的GC
    // Note: Following code may cause an error to be reported in the
        // ADB log as follows: E/IMGSRV(20095): :0: HardwareMipGen:
        // Failed to generate texture mipmap levels (error=3)
        // No OpenGL error will be encountered (glGetError() will return
        // 0). If this happens, just squash the source image to be
        // square. It will look the same because of texture coordinates,
        // and mipmap generation will work.
        //生成MIP贴图
        glGenerateMipmap(GL_TEXTURE_2D);
      // 完成纹理加载后 最后解除纹理和纹理对象(OpenGL对象)的绑定
        glBindTexture(GL_TEXTURE_2D, 0);
    return textureObjectIds[0];//返回纹理对象ID

### 创建新的着色器集合
#### 顶点

    uniform mat4 u_Matrix;
    
    attribute vec4 a_Position;  
    attribute vec2 a_TextureCoordinates;//2个分量：S坐标和T坐标 传递给插值的v_TextureCoordinates
    
    varying vec2 v_TextureCoordinates;
    
    void main()                    
    {                            
        v_TextureCoordinates = a_TextureCoordinates;	  	  
        gl_Position = u_Matrix * a_Position;    
    }    

      

#### 片段着色器

    precision mediump float; 
          	 				
    uniform sampler2D u_TextureUnit;  //二维纹理数据的数组    	 								
    varying vec2 v_TextureCoordinates;      	   								
      
    void main()                    		
    {           // 被插值的纹理数据和纹理坐标传递给texture2D着色器函数
               //即读入纹理中特定坐标的颜色值 把结果赋值给gl_FragColor 设置片段的颜色       	
        gl_FragColor = texture2D(u_TextureUnit, v_TextureCoordinates);                           		
    }

### 将顶点数据按物品分离为类
#### 裁剪纹理
...

  [1]: https://www.hongweipeng.com/usr/uploads/2016/04/3916412237.jpg
  [2]: https://www.hongweipeng.com/usr/uploads/2016/04/2367850130.png
  [3]: https://www.hongweipeng.com/usr/uploads/2016/04/2746729.png
  [4]: https://www.hongweipeng.com/usr/uploads/2016/04/1269235446.png
  [5]: https://www.hongweipeng.com/usr/uploads/2016/04/1878902394.png
  [6]: https://www.hongweipeng.com/usr/uploads/2016/04/2275896847.png