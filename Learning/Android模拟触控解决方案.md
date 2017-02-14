[TOC]

# 数据采集
## Android端
重写onTouchEvent,收集event数据,以一定的编码传输

	public boolean onTouchEvent(MotionEvent event){
		String rec="";
        int pointerCount = event.getPointerCount();
        if (pointerCount > MAX_TOUCHPOINTS) {
            pointerCount = MAX_TOUCHPOINTS;
        }
        int opt=event.getAction();
        boolean isFirst=true;
        if(opt==2){
            for (int i = 0; i < pointerCount; i++) {
                int id = event.getPointerId(i);
                int x = (int) event.getX(i);
                int y = (int) event.getY(i);
                if(isFirst){isFirst=false;}
                else rec+=";";
                rec+=id+",2,"+x+","+y;
            }
        }else if(opt==0||(opt-5)%256==0){
            //为了简化，我们假设这过程不会进行MOVE
            int ind=(event.getAction()-5)/256;
            for (int i = 0; i < pointerCount; i++) {
                if(i==ind){
                    int id = event.getPointerId(i);
                    int x = (int) event.getX(i);
                    int y = (int) event.getY(i);
                    if(isFirst){isFirst=false;}
                    else rec+=";";
                    rec+=id+",0,"+x+","+y;
                    break;
                }
            }
        }else if(opt==1||(opt-6)%256==0){
            int ind=(event.getAction()-6)/256;
            for (int i = 0; i < pointerCount; i++) {
                if(i==ind){
                    int id = event.getPointerId(i);
                    if(isFirst){isFirst=false;}
                    else rec+=";";
                    rec+=id+",1";
                    break;
                }
            }
        }
		return true;
	}

## Web
见另一篇文章[video标签下触摸坐标归一化](http://hongweipeng.com/index.php/archives/838/)

## 嵌入式设备

待研究

# 数据编码
最后数据以`ID,OPTION,X,Y`这样的字符串传输,多指操作通过`;`隔开
**OPTION:**`0:DOWN`; `1:UP`;` 2:MOVE`
**ID:**触点ID 通过`event.getPointerId` 获取， 对应服务器的`0x2f`
**X,Y**按道理范围应该在`[0,1]`;即本机分辨率的百分比。服务端再以该系数模拟。这边我们先假设两边机器一样，直接传实际int

# 数据传输
## socket
### 客户端
1.在子线程中初始化`socket`和`Handler mHandler`
2.UI线程收到编码数据后，执行`mHandler.sendMessage(message)`操作
3.`Looper`在子线程的`mHandler`将会回调`handleMessage`，在这里进行socket传输

代码：

	Socket socket = null;
	private static BufferedWriter writer = null;
	private static BufferedReader reader = null;
	private static class MyHandler extends Handler {
        //这边这个looper参数是否应该软引用？
        public MyHandler(Looper looper) {
            super(looper);
        }
        @Override
        public void handleMessage(Message msg) {
            //子线程收到数据，进行socket send data
            super.handleMessage(msg);
            Log.i("RECEIVE", "子线程收到:" + msg.obj);
            try {
                writer.write(msg.obj + "\n");//必须加上换行
                writer.flush();
            } catch (IOException e) {
            }
        }
    }
    class SockRunnable implements Runnable {
         @Override
         public void run() {
             Log.i("THREAD", "START");
             try {
                 socket = new Socket("192.168.191.1", 12345);
                 writer = new BufferedWriter(new OutputStreamWriter(
                         socket.getOutputStream(), "utf-8"));
                 reader = new BufferedReader(new InputStreamReader(
                         socket.getInputStream(), "utf-8"));
                 Log.i("CONNECT", "连接成功");
             } catch (IOException e) {
                 e.printStackTrace();
             }
             try {
                 Looper.prepare();
                 //让MyHandle为子线程服务
                 mHandler = new MyHandler(Looper.myLooper());
                 Looper.loop();
             } catch (Exception e) {
                 Log.e("zjx", "error");
                 e.printStackTrace();
             }
         }
     }
     @Override
     protected void onDestroy() {
         super.onDestroy();
         if (mHandler != null) {
             mHandler.removeCallbacksAndMessages(null);
         }
         if (writer != null) {
             try {
                 writer.close();
                 reader.close();
             } catch (IOException e) {
                 e.printStackTrace();
             }
         }
     }
     onCreate{
     	super.onCreate(savedInstanceState);
        new Thread(new SockRunnable()).start();
        ReceiveData rd=new ReceiveData() {
            @Override
            public void receive(String json) {
                Log.i("SEND",json);
                //ADD 时间轴
                //MOVE数据的过滤 平方和<12
                //SOCKET数据发送
                Message message=new Message();
                message.obj=json;
                if(mHandler!=null){
                    mHandler.sendMessage(message);
                }
            }
        };
     
    }

### 服务端

	public class ServerListener extends Thread {  
    	@Override  
    	public void run() {  
        	try {  
            	ServerSocket serverSocket = new ServerSocket(12345);  
        	    // 循环的监听  
            	while (true) {  
                	Socket socket = serverSocket.accept();// 阻塞  
                	JOptionPane.showMessageDialog(null, "有客户端连接到本机的12345端口！");  
                	// 将socket传给新的线程  
                	ChatSocket cs = new ChatSocket(socket);  
                	cs.start();  
                	//把socket加入ChatManager  
                	ChatManager.getChatManager().add(cs);  
            	}  
        	} catch (IOException e) {  
            	e.printStackTrace();  
        	}  
    	}  
	}
	

## DataChannel

略



# 数据解码

	void decodeData(String json) {
		String ls[] = json.split(";");
		for (String s : ls) {
			String cs[] = s.split(",");
			int id = Integer.valueOf(cs[0]);
			int opt = Integer.valueOf(cs[1]);
			switch (opt) {
			case 0:
				sendDown(id, cs[2], cs[3]);
				break;
			case 1:
				sendUp(id);
				break;
			case 2:
				sendMove(id, cs[2], cs[3]);
				break;
			}
		}
	}

# 数据模拟

以下方式凡是利用sendevent的，都可以通过getevent回去到对应的指令

而传入MotionEvent.obtain的，只能通过开启开发者选择的触点显示


## 1. adb shell

在`system/core/include/private/android_filesystem_config.h`中定义了Android的用户和组

	#define AID_SHELL 2000 /* adb and debug shell user UID=2000*/
	即
	root uid 0 gid0 
	system uid 1000 gid1000
	shell uid 2000 gid2000
	app uid >10000 gid >10000

同时我们执行以下命令（[ls -l命令详解](http://www.linuxidc.com/Linux/2012-09/70492.htm)


	shell@android:/dev/input $ ls -l
	crw-rw---- root     	input     	13,  64 2016-11-18 08:17 event0
	crw-rw---- root     	input     	13,  65 2016-11-18 08:17 event1
	crw-rw---- root     	input     	13,  66 2016-11-18 08:17 event2
	crw-rw---- root     	input     	13,  67 2016-11-18 08:17 event3
	文件属性	   文件拥有者     拥有者所在主组							    文件名

我们发现input组是拥有rw-权限的。

通过运行id命令得到如下：

	shell@android:/ $ id
	uid=2000(shell) gid=2000(shell) groups=1003(graphics),1004(input),1007(log),1009
	(mount),1011(adb),1015(sdcard_rw),1028(sdcard_r),3001(net_bt_admin),3002(net_bt)
	,3003(inet),3006(net_bw_stats)

shell属于input组，那么shell也就拥有`rw-`的权限,意思就是说shell用户(or其运行的程序)可以对eventX文件进行读写

那么读写的形式就有以下两种了：
 
### 1.1 server端执行shell脚本
#### **大致流程：**
Java的话可采用Runtime

			process = Runtime.getRuntime().exec("adb shell");
			// 获取输出流
			outputStream = process.getOutputStream();
			dataOutputStream = new DataOutputStream(outputStream);
			// 执行cmd指令，例： cmd="sendevent /dev/input/event3 0 0 0";
			dataOutputStream.writeBytes(cmd + "\n");
			

####**实现难度：5/5**
实现简单，代码量少。多种语言均支持执行shell命令
####**维护拓展： 1/5** 
Runtime会间接性出问题(原因未明)

dataOutputStream操作会堵塞本地IO通道，不适合多开。

Java执行跨平台，易迁移，给1星。
####**需要root？**否
####**效率延迟：1/5**
效率极差，**`指令组`**（单指move,down,up等操作称为指令组，包含多条sendevent基础指令）**`响应时间`**(指令执行时间间隔)>200ms
####**推荐指数：**1/5
### 1.2 android端执行adb shell用户启动的程序
#### **大致流程：**
1.编写C socket程序`minitouch`，并放到`/data/local/tmp/` 目录(`user,group=shell`)下

2.chmod 777该文件后，run它

3.执行以下命令：

	adb forward tcp:1111 localabstract:minitouch

表示server本地的1111端口会映射到minitouch上

4.本地利用socket通信发送数据到1111端口，minitouch进一步处理

*以上只是大致流程，minitouch还涉及到abi和sdk的版本的处理*

[开源实现minitouch](https://github.com/openstf/minitouch)

[minitouch使用流程，minitap开源项目类似 也可采用](https://testerhome.com/topics/4400)

####**实现难度：4/5**
需要编写两端程序：放于android的socket程序，本地发送数据程序。

相对简单，且有开源实现。
####**维护拓展： 4/5** 
分配本地端口并转发到android socket程序上，端口是足够用的，只要设置规范不会产生冲突

####**需要root？**否
`sdk 10-21` 无需root,`21+`需要root,`sdk 20 Android Wear` 需要root

####**效率延迟：5/5**
**`指令组响应时间`**<10ms

####**推荐指数：**4.5/5

## 2. Android端 root sendevent
###2.1 Runtime.getRuntime().exec("su")
####大致流程：
Android端获取su权限后，利用Runtime执行sendevent命令

这里的cmds 可以是`sendevent` 也可以是`input swipe` 

注：input swipe 即提供两点坐标 然后move且只能单指

也就是说要等一个完整的DOWN-MOVE-UP过程 然后发送起始-终点位置。

与其这样 还不如用sendevent 优化move间隔

getevent获取不到触控信息。

	private void execShellCmd(String[] cmds) throws Exception {
        Process process = Runtime.getRuntime().exec("su");
        DataOutputStream os = new DataOutputStream(process.getOutputStream());
        for (String tmpCmd : cmds) {
            os.writeBytes(tmpCmd + "\n");
        }
        os.writeBytes("exit\n");
        os.flush();
        os.close();
        process.waitFor();
    }

####**实现难度：5/5**
实现简单，代码量少。
####**维护拓展：1/5** 
同1.1,区别只是程序运行与Android端。

####**需要root？**是

####**效率延迟：1/5**
**`指令组响应时间`**>200ms

####**推荐指数：**1/5

### 2.2 linux c 

由于我们是自己编译Android系统，所以我们可以写个linux C socket程序放在Android里

linux C socket编程这边不提及，我们假设取得解码的值了

编写如下文件

	#include <string>
	#include <jni.h>
	#include <android/log.h>
	#include <string.h>
	#include <errno.h>
	#include <stdio.h>
	#include <sys/types.h>
	#include <sys/stat.h>
	#include <fcntl.h>
	#include <linux/input.h>
	#include <sys/time.h>
	#include <sys/types.h>
	#include <unistd.h>
	#define LOG_TAG "ZJX"
	#define ABS_MT_SLOT 0x2f
	#define ABS_MT_TOUCH_MAJOR 0x30
	/* WARNING: DO NOT EDIT, AUTO-GENERATED CODE - SEE TOP FOR INSTRUCTIONS */
	#define ABS_MT_TOUCH_MINOR 0x31
	#define ABS_MT_WIDTH_MAJOR 0x32
	#define ABS_MT_WIDTH_MINOR 0x33
	#define ABS_MT_ORIENTATION 0x34
	/* WARNING: DO NOT EDIT, AUTO-GENERATED CODE - SEE TOP FOR INSTRUCTIONS */
	#define ABS_MT_POSITION_X 0x35
	#define ABS_MT_POSITION_Y 0x36
	#define ABS_MT_TOOL_TYPE 0x37
	#define ABS_MT_BLOB_ID 0x38
	/* WARNING: DO NOT EDIT, AUTO-GENERATED CODE - SEE TOP FOR INSTRUCTIONS */
	#define ABS_MT_TRACKING_ID 0x39
	
	int finger_count=0;
	int fd_touch=0;
	int finger_id=520;
	
	void sendEvent(__u16 type,__u16 code,int value){
	    struct input_event event;
	    event.type = type;
	    event.code = code;
	    event.value = value;
		//    gettimeofday(&event.time,0);
		write(fd_touch, &event, sizeof(event));
	}
	
	void touchMove(int finger_index,int x,int y){
	    sendEvent( EV_ABS,ABS_MT_SLOT,finger_index);
	    sendEvent( EV_ABS, ABS_MT_POSITION_X, x);
	    sendEvent( EV_ABS, ABS_MT_POSITION_Y, y);
	    sendEvent( EV_SYN, SYN_REPORT, 0);
	}
	void touchDown(int finger_index,int x,int y){
	    finger_count++;
	    sendEvent( EV_ABS, ABS_MT_SLOT, finger_index);
    	//需要指定ABS_MT_TRACKING_ID，否则sendevent( EV_ABS, ABS_MT_TRACKING_ID, -1);不会生效
    	sendEvent( EV_ABS, ABS_MT_TRACKING_ID, finger_id++);
    	sendEvent( EV_ABS, ABS_MT_POSITION_X, x);
    	sendEvent( EV_ABS, ABS_MT_POSITION_Y, y);
    	if(finger_count==1){
    	    sendEvent( EV_KEY, BTN_TOUCH, 1);
    	}
    	sendEvent( EV_SYN, SYN_REPORT, 0);
	}
	void touchUp(int finger_index) {
    	finger_count--;
    	sendEvent( EV_ABS, ABS_MT_SLOT, finger_index);
    	sendEvent( EV_ABS, ABS_MT_TRACKING_ID, -1);
    	if(finger_count==0){
    	    sendEvent( EV_KEY, BTN_TOUCH, 0);
    	}
    	sendEvent( EV_SYN, SYN_REPORT, 0);
	}

在main写个测试

	void main(){
		fd_touch = open("/dev/input/event3", O_RDWR);
    	if(fd_touch<=0) {
        	return env->NewStringUTF(strerror(errno));
    	}
     	touchDown(0,380,400);
	//     touchDown(1,250,250);
	
	     touchMove(0,300,300);
	//     touchMove(1,350,350);
	     touchMove(0,200,400);
	//     touchMove(1,300,500);
	     touchMove(0,350,250);
	//     touchMove(1,250,250);
	     touchMove(0,200,600);
	
	     touchUp(0);
	//     touchUp(1);
    	close(fd_touch);
		
	}
	


> 这边我们是一接受到socket传来的值后，就进行处理，那么需要给inpue_event赋值time属性吗？


不用赋值。做了下测试，感觉没赋值的话写入时默认就是当前时间，具体event文件读写原理有空再看。或者懂的大牛告诉我下。




> 如果是自己写的程序想模拟长按，是通过赋值time还是Thread.sleep?


如果想做延迟，要在上一层去做，而不是赋值time或者在本层堵塞线程,上一层做更安全。


> 测试的时候，打印了onTouch(MotionEvent ev)中ev的值，发现部分move事件没找到，是被丢弃了吗？



并不是，打印getevent就找到是都会响应的。

只是由于指令太快 Move会进行合并，onTouch中打印getHistorySize就明白了

所以不要因为测试的时候画板画出来的不是我们想要的路线就以为是数据被丢掉了- -

####**实现难度：4.5/5**
实现简单，代码量少。只要懂C Socket编程就可以了。

####**维护拓展：3.5/5** 
需要在自编译的android系统上，以input组用户运行

或者在非自编译系统采用1.2的做法

####**需要root？**不确定
自编译的系统，可以以shell用户写eventX文件

当然最方便还是直接用root啦

####**效率延迟：5/5**
**`指令组响应时间`**<10ms

####**推荐指数：**4.7/5

### 2.3  jni

数据处理与**2.2**一致，只是socket是Android Service去做的，通过jni调用

做法：

1.先修改文件权限

							
	shell@android:/ $ su			
	root@android:/ # chmod 777 /dev/input/event3  注 Android 5.x 由于SELinux?还是权限受限

2.然后往`/dev/input/eventX`写数据就好了



	extern "C"
	jstring Java_com_example_zhengjx_myapplication_MainActivity_sendEvent2(
        JNIEnv* env,
        jobject obj,jint type,jint a,jint b,jint c) {
    	char *hello = "Hello from C++";
    	fd_touch = open("/dev/input/event3", O_RDWR);
    	if(fd_touch<=0) {
    	    return env->NewStringUTF(strerror(errno));
    	}
    	//将系统当前时间以结构体形式返回给cur,初始时间戳
    	struct timeval cur;
    	gettimeofday(&cur, NULL);
    	switch (type){
    	    case 0:touchDown(a,b,c);break;
    	    case 1:touchUp(a);break;
    	    case 2:touchMove(a,b,c);break;
    	}
    	close(fd_touch);
    	return env->NewStringUTF(hello);
	}

TEST:

                            sendEvent2(0,0,380,400);
                            sendEvent2(2,0,300,300);
                            sendEvent2(2,0,200,400);
                            sendEvent2(2,0,350,250);
                            sendEvent2(2,0,400,600);
                            sendEvent2(1,0,0,0);


> 与2.2相比就是多了一个jni调用的耗时(该部分耗时<10ms)

为了不让eventX 做move优化，该部分耗时反而是好的,测试的时候每条move指令都会响应，基本不会进行move合并。

另外记得把event3文件开成全局的，防止每次都要创建 关闭流的耗时- -，而且不知道会不会有什么影响

> 5.x chmod 777 后权限受限问题

按解决问题的想法，不用root的方法我们用adb shell不会出现这问题，需要root的我们直接linux C，这方法没有什么价值。


####**实现难度：5/5**
实现简单，代码量少。

####**维护拓展：4/5** 
5.X 的 权限受限问题，正在研究解决方案。。

####**需要root？**需要

需要root用户先将eventX文件属性改为777

####**效率延迟：5/5**
**`指令组响应时间`**≈10ms

####**推荐指数：**4.7/5

### 2.4  RootTools

RootTools是一个用于执行linux指令的[开源工具](https://github.com/Stericson/RootTools)

用法：

	CommandCapture cmd = new CommandCapture(0, "sendevent /dev/input/event3 0 0 ");
	RootTools.getShell(true).add(cmd);
	

大致研究了下，是通过线程池顺序执行指令，效率又比Rumtime高那么一点点


####**实现难度：5/5**
实现简单，代码量少。

####**维护拓展：5/5** 

####**需要root？**是

####**效率延迟：2/5**
**`指令组响应时间`** :指令组中指令数量：1条100ms 2条120-200ms 3+:200+ms

####**推荐指数：**2/5

## 3. MotionEvent.obtain
### 3.1 Instrumentation

#### 大致流程

	Instrumentation m_Instrumentation = new Instrumentation();
	long downTime = SystemClock.uptimeMillis();
	long eventTime = SystemClock.uptimeMillis() + 100;
	long eventTime2 = SystemClock.uptimeMillis() + 200;
	float x=200.0f;
	float y=280.0f;
	m_Instrumentation.sendPointerSync(MotionEvent.obtain(downTime,
	downTime,MotionEvent.ACTION_DOWN,x, y, 0));
	for(int i=1;i<=50;i++){
	    m_Instrumentation.sendPointerSync(MotionEvent.obtain(downTime,
			SystemClock.uptimeMillis(),MotionEvent.ACTION_MOVE,x+i, y, 0));
	}
	for(int i=1;i<=50;i++){
		m_Instrumentation.sendPointerSync(MotionEvent.obtain(downTime,
			SystemClock.uptimeMillis(),MotionEvent.ACTION_MOVE,x+50, y+i, 0));
	}
	for(int i=50;i>=1;i--){
		m_Instrumentation.sendPointerSync(MotionEvent.obtain(downTime,
			SystemClock.uptimeMillis(),MotionEvent.ACTION_MOVE,x+i, y+50, 0));
	}
	for(int i=50;i>=1;i--){
		m_Instrumentation.sendPointerSync(MotionEvent.obtain(downTime,
			SystemClock.uptimeMillis(),MotionEvent.ACTION_MOVE,x, y+i, 0));
	}
	m_Instrumentation.sendPointerSync(MotionEvent.obtain(downTime,
		eventTime2,MotionEvent.ACTION_UP,550, 550, 0));

API是开放的

在其他应用上使用会出现这样的提示：

`java.lang.SecurityException: Injecting to another application requires INJECT_EVENTS permission`

`http://stackoverflow.com/questions/22163424/android-java-lang-securityexception-injecting-to-another-application-requires` 无解

添加权限无效，必须将该应用置为system应用.

底层还是基于IwindowManager 去做的，这边我们不再分析直接讨论3.2

### 3.2 IWindowManager

monkey，Robotium就是基于它做的

	IWindowManager.Stub.asInterface(ServiceManager
                   .getService("window"))).injectPointerEvent(event, true);
                   

从API 8开始IWindowManager接口就被屏蔽掉了，没有这个API直接调用。

可以源码编译生成jar包 root权限下降jar导入	`/system/framework/`下，或者直接用反射(效率差点) 

如何跳出进程间限制？[该篇译文给出了链接](http://blog.csdn.net/zhubaitian/article/details/40430053)

####**实现难度：4/5**

主要是多指的代码会比较多和复杂，不易封装。

没有提供内部接口的问题解决方案也给出了，或者直接用`Instrumentation`。

####**维护拓展：4/5** 

研究的不深，可能有些坑存在

####**需要root？**否

但是应用需要拥有system权限

####**效率延迟：3.5/5**
**`指令组响应时间`**20~50ms

####**推荐指数：**4/5

## Accessibilityservice

借助Android提供的无障碍服务
在`res/xml`目录下新建一个`accessibility_service_config.xml`文件

	<intent-filter>
    	<action android:name="android.accessibilityservice.AccessibilityService" />
	</intent-filter>

`http://blog.csdn.net/sinyu890807/article/details/47803149`

实现要各种判断:

	窗口名太多 手动生成accessibility_service_config再service手动Intent注入action不太合适
	然后操作节点等又是很麻烦的一件事：适合对已知节点操作，不适合模拟

**(弃**

其他：非root方法

通过hook方法绕过权限验证

	//http://blog.sina.com.cn/s/blog_151b043850102wiv9.html

以后有空再研究

#附录
sendevent.c 
http://www.netmite.com/android/mydroid/system/core/toolbox/sendevent.c
http://androidxref.com/4.4.4_r1/xref/system/core/toolbox/getevent.c

#防退出全屏

目前比较简单的定义是：
当TOUCH_DOWN处于 纵坐标0.9-1.0区域时，将此时的事件放入buffer,
接下来的操作，如果为TOUCH_MOVE,且其坐标在TOUCH_DOWN的坐标上方，都将放入buffer。

# 捕获基本知识

        //ACTION_POINTER_i_DOWN:5 261 517 773 存在触点的情况下 DOWN
        //ACTION_POINTER_i_UP:6 262 518 774   存在触点的情况下 UP
        //每次UP时返回index后，再次UP时系统会重做填充，
        //即按顺序1 2 3 4 DOWN后， UP了1 返回6 此时UP 2 返回的还是6 说明再次UP时会把触点INDEX往前填充
        //多个触点时，UP第一个返回的是6，但是只有一个触点时返回的是2
        //按顺序1 2 3 4 DOWN后，UP 1返回6，此时再DOWN 5返回的是5，说明再次DOWN会从头找开始填充
        //UP时，通过event.getPointerCount()得到的数量不会变，只有再次才会更新，因为我们需要得到UP点的x,y等信息
        // DOWN 0 1 2 后 UP 了 1 此时剩 0 2 getPointerId(1)可以返回index=1的点id为2
        //需要理清的是pointerIndex与pointerID非等同
        //非MOVE事件，触点坐标也可能改变。例：1 2指按，1指抬，ACTION=6 此时获取2指的x,y可能会与1指未抬时的位置不一致
        //因为触摸屏是按一定时间间隔的，在这很小的时间间隔内，同时出现了MOVE和UP,优先UP,所以ACTION=UP 但是位置还是会移动
        //压力 等传感器 暂时不考虑，触摸点直径也暂时不考虑
        //出现哪些事件需要发数据，发什么数据？与sendEvent对应
        //0.(重)进游戏界面时，发送清空所有触点的指令
        //1.DOWN  or UP 发其位置 SENDEVENT 1 or 0 具体数据 同时更新 删除数组数据
        //2.MOVE  按ID得到新的位置 与之前进行比较


#捕获时异常

单指下：
在GameView中滑动时(DOWN在GameView中) 能够捕获到touch信息，滑动到GameView外也能捕获到MOVE,UP信息。
而从GameView外滑进GameView(down在GameView外)捕获不到touch信息

多指：
若已有一个触点在GameView内（可以捕获到touch信息），另一个触点从GameView外滑入。也是可以捕获得到另一个触点的touch信息。
因为第二个触点的down不是TOUCH_DOWN 而是 TOUCH_POINTER_DOWN

总的来说，只要有touchdown事件，直接对屏幕的操作都能被捕获到



如果从画面外开始的touch都过滤的话 操作如下：

onTouch放在GameView上监听

if(opt=touch_down){
	正常发送
}
else if(opt=touch_up){
	正常发送
}
else if(opt=touch_move){
	for(){
		if(ID处于黑名单)该id的move不发送
		else 正常发送
	}
}else if(opt=touch_pointer_down){
	if(down坐标处于GameView之外)将该id放入黑名单
	else 正常发送
}else if(opt=touch_pointer_up){
	if(id处于黑名单)则该id的up不发送
	else 正常发送
}


如果要保留从画面外开始的touch,直到画面内才开始捕获：

onTouch放在GameView的外层GameViewLayout上去监听

if(opt=touch_down||touch_pointer_down){
	if(!位于GameView)将该id放入灰名单
	else 发送
}
else if(opt=touch_up||touch_pointer_up){
	if(id处于灰名单){
		if(已发送down_event)正常发送
		灰名单中去除
	}
	else 发送
}
else if(opt=touch_move){
	list grayList;
	list whiteList;
	for(){
		if(ID处于灰名单){
			if(位于GameView){
				if(未发送过down_event){
					将down_event(point=move_event)发送	
				}
			}else 不发送 
		else 将event放入whiteList
	}
	for(event:grayList){
		发送(event);
	}
	发送(whiteList);
}

void 发送(event){
	归一化(event)；
	if(down||up)发送sync_event
	发送(event)
}
boolean 位于GameView(point){
	return ...
}
void 将该id放入灰名单(id){
	map.put(id,false);
}
boolean id处于灰名单(id){
	return map.hasValue(id);
}
boolean 是否发送过down_event(id){
	return map.getValue(id);
}
void 发送down_event(id){
	发送;
	return map[id]=true;
}

