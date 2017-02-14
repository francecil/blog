Android4.1+  代码中设置

	getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_FULLSCREEN
                        //沉浸模式 在全屏下操作 不会离开全屏，只有两侧往内滑动时触发
                        // IMMERSIVE_STICKY 状态栏导航栏在一段时间自动隐藏（有操作会马上隐藏） 不触发监听器，IMMERSIVE则不隐藏会触发监听器
                        | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);

