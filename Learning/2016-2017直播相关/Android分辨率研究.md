## 获取屏幕大小和状态栏高度

ref: http://blog.csdn.net/yanzi1225627/article/details/17199323

http://blog.csdn.net/innost/article/details/47660591

	private int getStatusBarHeight() {
        int result = 0;
        int resourceId = getResources().getIdentifier("status_bar_height", "dimen", "android");
        if (resourceId > 0) {
            result = getResources().getDimensionPixelSize(resourceId);
        }
        return result;
    }
    

	//获取屏幕宽高 密度
        DisplayMetrics metric = new DisplayMetrics();
        getWindowManager().getDefaultDisplay().getMetrics(metric);
        screenWidth = metric.widthPixels;     // 屏幕宽度（像素）
        screenHeight = metric.heightPixels;   // 屏幕高度（像素）
        int screenDpi=metric.densityDpi;
        Log.d(TAG, "screen:"+screenWidth+"x"+screenHeight+",screenDpi");
        

//
//    /**
//     * 两种获取状态栏大小的方式 可在onCreate中获取
//     *
//     * @param context
//     * @return 60
//     */
//    private int getStatusBarHeight(Context context) {
//        Class<?> c = null;
//        Object obj = null;
//        Field field = null;
//        int x = 0, statusBarHeight = 0;
//        try {
//            c = Class.forName("com.android.internal.R$dimen");
//            obj = c.newInstance();
//            field = c.getField("status_bar_height");
//            x = Integer.parseInt(field.get(obj).toString());
//            statusBarHeight = context.getResources().getDimensionPixelSize(x);
//        } catch (Exception e1) {
//            e1.printStackTrace();
//        }
//        return statusBarHeight;
//    }
//
//    private int getStatusBarHeight() {
//        int result = 0;
//        int resourceId = getResources().getIdentifier("status_bar_height", "dimen", "android");
//        if (resourceId > 0) {
//            result = getResources().getDimensionPixelSize(resourceId);
//        }
//        return result;
//    }


得到的数据为 1080x1920(480):60px

开启开发者选项的“指针位置” 测试，发现下拉退出全屏的初始触摸点Y<60 说明系统级判断手势也是基于状态栏的高度

### 现在的场景是：已知模拟器的全部数据：屏幕宽高,dpi,状态栏高度

首先一定要获取全部的数据吗？是否 状态栏高度px和dpi有关呢？是否`=dpi/160 * 20px` ?

一些测试数据：

> 720x1280(320):50px,480x800(240):36

发现并无关系.故还是全部获取.

得到模拟器状态栏高度和屏幕高度后的比例`60/1920 [0,0.032]`，客户端这边将video的该y区间设为下拉区间

### 算法流程

issue:之前以为是多指时其中一指下拉不会触发 下拉事件。

多次测试后发现是：多指，其中其他手指稳定不动，一指下拉 还是会触发下拉事件。

猜想可以是底层的B协议 如果坐标不变 不会重新发送事件过去，在全部事务的结果中 最后只有一指下拉 那么将会触发状态栏下拉。

所以状态栏下拉应该采取类系统级的方法去判断，不能纯粹的过滤多指.

//由于比较复杂，我们先仅考虑单指的情况：

onTouch中每次获取一次事件

0.等到原始Touch事件，进行归一化（由于捕获是在video上做的，不会出现越界情况。
//1.如果当前事件是TOUCH_DOWN不位于下拉区间，则往后的事件都不过滤。否则2.
//2.将TOUCH_DOWN事件带时间戳放入buffer。添加进VelocityTracker。接下来3
//3.如果TOUCH_MOVE事件在下拉区间，添加进VelocityTracker，计算速度
//4.






## 基础知识


作者：刘钰
链接：https://www.zhihu.com/question/19793577/answer/41143529
来源：知乎
著作权归作者所有，转载请联系作者获得授权。

先说一下安卓手机调取资源的方式，
一般资源文件存在****/res/ 目录中，APK文件解压出来就可以看到。
* 如果各个资源都有，系统会自动识别手机的屏幕密度，并调取相对应的资源文件夹里的资源文件。比如手机是HDPI的，而HDPI资源文件里有，就调取HDPI的资源。
* 如果相对应资源文件没有，会调取接近的大资源并按比例缩小来适配（缩小损失微小，只是边缘会产生模糊像素，用户没有设计师的像素眼，影响并不大）。
* 如果大资源也没有，会调取接近的小资源并按比例放大来适配。（放大损失大，模糊，和图片放大一个道理）。

看个表格，屏幕密度倍数关系，资源适配时缩放比例关系。

![1](https://pic4.zhimg.com/e8e786ab4258390cc5a46d54be96859b_b.jpg)


再看一份数据，安卓手机屏幕尺寸与屏幕密度覆盖率（谷歌官方数据，截止到2015.1.5）

<img src="https://pic2.zhimg.com/3a3f570496a2ee9ac25992530126a101_b.jpg" />

楼主提到的三个分辨率对应屏幕密度分布是：
800x480（HDPI），480X320（MDPI）、320X240（LDPI）

发现楼主去适配的机器只占了 38.4% + 17.9% + 5.4% = 61.7%。
即使你全部提供这3套资源，也只能适配好61.7%。

到时候会出现这样的情况：
楼主最大的资源只有HDPI的，
XHDPI（720P）机器适配的时候，调用HDPI资源，放大1.333倍显示，还好，能忍受
XXHDPI（1080P）机器适配的时候，调用HDPI资源，放大2倍显示，。。。。糊
更别说现在的2K屏手机了（虽然还比较少），就无法直视了。


给楼主3个问题的回答：

1. 800x480、480X320、320X240分辨率的手机需要不同的图片资源；
答：不一定要3种资源都提供，提供一个高的就好。
当然如果你设计开发资源充足，对安装包大小又不在乎，那么你可以全做出来，没有什么不可以的，但这样性价比真的好吗？

2. 如何设计三套图片资源来满足这3种分辨率的手机，这三套图片资源之间有什么样的大小比例关系？
答：大小比例请看第一个表格。

3. 美工设计图片的时候有没有技巧？可否先设计一套，然后按照比率缩放呢？
答：最有性价比的方案是
设计师用1080x1920（XXHDPI）做设计，提供一套XXHDPI切图资源。其他密度不需要提供，让系统自适配。
为什么是XXHDPI，因为大分辨率趋势，现在XXHDPI已经占比16.3%（2015.1.5）。
如果各种资源都提供，成本大，
1. 前期开发设计成本大，特别是设计。。
2. 用户下载成本大，如果你的用户达到了一定量，你的安装包大几百K，将会影响你的下载安装量。

****** PS：请不要叫设计师为美工，建议让你们公司HR把“美工”的title改成“设计师” ******


对安卓开发团队建议：

* 设计师和开发人员都把Android design精读一遍，并举行一次交流分享会议。
* 设计师和开发人员都把dp（安卓里的长度单位）搞清楚，设计师提供给开发人员的标注单位最好是dp（长度）、sp（字体），而不是px，因为你标px的话，说明还没弄懂Android，如果没弄懂，结果就会出现很多问题。

