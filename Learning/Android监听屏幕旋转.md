需求：监听屏幕旋转，不重建Activity

大前提：Activity已经限定屏幕竖屏

	android:screenOrientation="portrait"



方法一【结论不可行】：

要想监听屏幕旋转，需要：

1.权限声明

	<uses-permission android:name="android.permission.CHANGE_CONFIGURATION"></uses-permission>

2.声明activity要捕获的事件类型

	 android:configChanges="orientation"
	 

keyboardHidden表示键盘辅助功能隐藏，如果你的开发API等级等于或高于13，还需要设置screenSize，因为screenSize会在屏幕旋转时改变；

一般这样设

	android:configChanges="keyboardHidden|orientation|screenSize"

优点：我们可以随时监听屏幕旋转变化，并对应做出相应的操作；

缺点：它只能一次旋转90度，如果一下子旋转180度，onConfigurationChanged函数不会被调用。

3.重写Activity中的onConfigurationChanged方法

	@Override
	public void onConfigurationChanged(Configuration newConfig) {
	// 当新设置中，屏幕布局模式为横排时
		if(newConfig.orientation == ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE)
		{
		//TODO 某些操作 
		}
		super.onConfigurationChanged(newConfig);
	}
	


前提：未开启方向锁定 or 未设置 android:screenOrientation 方向固定or忽视传感器

与大前提不符

做法二：

利用重力传感器【可拓展性好】

	package com.ws.tryplay.util;
	
	import android.content.Context;
	import android.content.pm.ActivityInfo;
	import android.util.Log;
	import android.view.OrientationEventListener;
	
	/**
	 * Created by zhengjx on 2016/12/14.
	*/
	
	public class ScreenOrientationUtil {
    private OrientationEventListener mOrientationListener;
    private boolean mScreenPortrait = true;
    private boolean mCurrentOrient = false;
    private static final String TAG = "ScreenOrientationUtil";
    private OrientationEvent event;
    private Context mContext;
    public interface OrientationEvent{
        void orientationChanged(int orientation);
    }
    public ScreenOrientationUtil(OrientationEvent event, Context mContext) {
        this.event = event;
        this.mContext = mContext;
    }
    public void startOrientationChangeListener() {
        mOrientationListener = new OrientationEventListener(this.mContext) {
            @Override
            public void onOrientationChanged(int rotation) {
                if (((rotation >= 0) && (rotation <= 45)) || (rotation >= 315)||((rotation>=135)&&(rotation<=225))) {//portrait
                    mCurrentOrient = true;
                    if(mCurrentOrient!=mScreenPortrait)
                    {
                        mScreenPortrait = mCurrentOrient;
                        event.orientationChanged(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
                        Log.d(TAG, "Screen orientation changed from Landscape to Portrait!");
                    }
                }
                else if (((rotation > 45) && (rotation < 135))||((rotation>225)&&(rotation<315))) {//landscape
                    mCurrentOrient = false;
                    if(mCurrentOrient!=mScreenPortrait)
                    {
                        mScreenPortrait = mCurrentOrient;
                        event.orientationChanged(ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE);
                        Log.d(TAG, "Screen orientation changed from Portrait to Landscape!");
                    }
                }
            }
        };
        mOrientationListener.enable();
    }
	}
	
	


Activity中去注册监听

    private ScreenOrientationUtil.OrientationEvent orientationEvent=new ScreenOrientationUtil.OrientationEvent() {
        @Override
        public void orientationChanged(int orientation) {
            Log.d(TAG, "orientationChanged() called with: orientation = [" + orientation + "]");
        }
    };


	new ScreenOrientationUtil(orientationEvent,GameActivity.this).startOrientationChangeListener();




