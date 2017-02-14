# 先给出一些基本知识

## 触摸点位置

    clientX / clientY：// 触摸点相对于浏览器窗口viewport的位置  参照点会随着浏览器的滚动而变化
    pageX / pageY：// 触摸点相对于页面的位置  参照点不会随着浏览器的滚动而变化
    screenX /screenY：// 触摸点相对于屏幕的位置 

所以如果要算鼠标在当前div的相对位置 
通过获取`var offset = $("#mainScreen").offset();`后
当前鼠标的绝对位置要用**`pageX/Y`**去拿 否则浏览器页面滚动后会少算一段

## 触摸事件
### PC

    onmousemove	script	当鼠标指针移动到元素上时触发。
    onmouseout	script	当鼠标指针移出元素时触发。
    onmouseup 属性在松开鼠标按钮时触发。
    提示：相对于 onmouseup 事件的事件次序（限于鼠标左/中键）：
    onmousedown
    onmouseup
    onclick
    onmouseup 事件的事件次序（限于鼠标右键）：
    onmousedown
    onmouseup
    oncontextmenu
    onMouseover和onMousemove有什么区别?
    区别是进入后onmousemove鼠标每动一下都会执行事件，onmouseover只在鼠标进入时执行一次

### Mobile
基本事件如下，其他的都是对这些事件的组合封装

    mainScreen.addEventListener("touchmove", touchMove, false);//手指在屏幕上移动时触发[不动但停留太久也会触发]
    mainScreen.addEventListener("touchstart", touchStart, false);//手指一触摸屏幕就触发
    mainScreen.addEventListener("touchend", touchEnd, false);//手指离开屏幕触发


<!--more-->

## 全屏
### 进入全屏

    function launchFullScreen(element) {
    				if(element.requestFullscreen) {
    					element.requestFullscreen();
    				} else if(element.mozRequestFullScreen) {
    					element.mozRequestFullScreen();
    				} else if(element.webkitRequestFullscreen) {
    					element.webkitRequestFullscreen();
    				} else if(element.msRequestFullscreen) {
    					element.msRequestFullscreen();
    				}
    			}

### 退出全屏

    function cancelFullScreen() {
    				if(document.cancelFullScreen) {
    					document.cancelFullScreen();
    				} else if(document.mozCancelFullScreen) {
    					document.mozCancelFullScreen();
    				} else if(document.webkitCancelFullScreen) {
    					document.webkitCancelFullScreen();
    				}
    			}

### 判断是否全屏


    //反射調用
    			var invokeFieldOrMethod = function(element, method) {
    					var usablePrefixMethod;
    					["webkit", "moz", "ms", "o", ""].forEach(function(prefix) {
    						if(usablePrefixMethod) return;
    						if(prefix === "") {
    							// 无前缀，方法首字母小写
    							method = method.slice(0, 1).toLowerCase() + method.slice(1);
    						}
    						var typePrefixMethod = typeof element[prefix + method];
    						if(typePrefixMethod + "" !== "undefined") {
    							if(typePrefixMethod === "function") {
    								usablePrefixMethod = element[prefix + method]();
    							} else {
    								usablePrefixMethod = element[prefix + method];
    							}
    						}
    					});
    
    					return usablePrefixMethod;
    				}
    				//判断是否是全屏
    			function isFullScreen() {
    				return invokeFieldOrMethod(document, 'FullScreen') || invokeFieldOrMethod(document, 'IsFullScreen') || document.IsFullScreen;
    			}

## 监听手机横竖屏状态


    var mOrientation = 0;
    				$(window).on("orientationchange", function() {
    					mOrientation = window.orientation;
    					if(window.orientation == 0) // Portrait
    					{
    						console.log("竖屏状态");
    					} else // Landscape
    					{
    						console.log("横屏状态");
    					}
    				});

### 竖屏0 横屏 90（正常横放） -90 （手机顶部在右侧）
## CSS3旋转元素

    .trans90 {
    				/* Rotate div */
    				transform: rotate(9deg);
    				-ms-transform: rotate(90deg);
    				/* Internet Explorer */
    				-moz-transform: rotate(90deg);
    				/* Firefox */
    				-webkit-transform: rotate(90deg);
    				/* Safari 和 Chrome */
    				-o-transform: rotate(90deg);
    				/* Opera */
    			}
    
    function transfVideo() {
    				$("#remoteVideo").addClass("trans90");
    			}

### 注意：全屏状态下元素的旋转效果无效
## video元素

    <video id="remoteVideo" autoplay width="100%" height="100%">
    	<p>您的浏览器不支持该标签</p>
    </video>

### 属性详解
**autoplay** ：自动播放
**width="100%" height="100%"** ：设置元素的宽高，**`非源数据的宽高`**
不指定controls 属性，则不会显示默认的播放，进度条等样式
但是全屏时又会显示，怎么去掉？
参考[https://segmentfault.com/a/1190000000380064][1]

    /*伪元素，设置全屏时不显示控件*/
    			video::-webkit-media-controls-enclosure {
    				display: none;
    			}
    			
    			video::-moz-media-controls-enclosure {
    				display: none;
    			}
    			
    			video::media-controls-enclosure {
    				display: none;
    			}

**`videoWidth,videoHeight属性`**:指的是视频源数据，不会改变，也不能修改。
**`width,height属性`**：video容器大小，当其值设置的与视频源数据不同时，会将视频源数据进行一定比例(videoWidth,videoHeight的比例)的缩放，**使得视频数据尽量充满video容器**


## body在移动端显示时左侧会留出一定宽度的竖条，设置100%页没有用
移动端会留与滚动条有关，改margin就行

    body {
    				width: 100%;
    				height: 100%;
    				margin: 0px;
    				background-color: white;
    			}

# Touch事件捕获
## 基本方法

    function touchMove(event) {
    					event.preventDefault();
    					if(!event.touches.length) return;
    					var touch = event.touches[0];
    					sendTouchEvent(touch, "TOUCH_MOVE");
    				};
    
    function touchStart(event) {
    					event.preventDefault();
    					if(!event.touches.length) return;
    					var touch = event.touches[0];
    					sendTouchEvent(touch, "TOUCH_START");
    
    				};

    function touchEnd() {
    					console.log("type:end");
    				}

    mainScreen.addEventListener("touchmove", touchMove, false);
    mainScreen.addEventListener("touchstart", touchStart, false);
    mainScreen.addEventListener("touchend", touchEnd, false);

## 屏幕分辨率

    <script>
    		console.log(" 屏幕分辨率的高：" + window.screen.height + "\n" + " 屏幕分辨率的宽：" + window.screen.width + "\n")
    	</script>
### 横屏下 `window.screen.width`得到的 手机的高度的那个分辨率而不是宽度
## 发送touch事件方法——sendTouchEvent
如果要考虑完全的话，需要考虑12种情况
3种屏幕方向\*是否全屏2种情况\*源数据横竖屏情况(宽高比)2种情况=12
### 为什么考虑源数据横竖屏情况？
进行坐标映射、归一化的时候你就知道了

是否全屏下，video都要自动充满屏幕(videoWidth:videoHeight不变)
其video容器的宽度要保持和window.screen.width一致

代码如下 目前只考虑`以下6种情况`，其他情况为非法操作
**1.竖屏\*是否全屏(2种)\*源数据横竖屏(2种)
2.横屏(90和-90两种情况)\*全屏\*源数据横屏**

    function sendTouchEvent(touch, eventType) {
    					//videoWidth、videoHeight、width和height的大小切屏不会改变大小
    					//暂不考虑非全屏时横屏坐标 0 90（正常横放） -90 （机顶在右侧）
    					//全屏模式下 touch.pageX/Y 不用参考offset
    					trace(mOrientation);
    					var remoteVideo=document.getElementById("remoteVideo");
    					//暂不考虑videoWidth>videoHeight时mOrientation == 0的全屏情况
    					if(mOrientation == 0) {
    						var currentWidth = remoteVideo.width;
    						var currentHeight = (remoteVideo.width / remoteVideo.videoWidth * remoteVideo.videoHeight);
    //						trace("当前总宽度" + currentWidth + "当前总高度:" + currentHeight);
    						var relativeX = (touch.pageX - offset.left);
    						var relativeY = (touch.pageY - offset.top);
    						//判断是否为全屏 全屏下位置为 touch.pageY-(window.screen.height-currentWidth)/2
    						var posX = relativeX;
    						if(isFullScreen()) {
    							//全屏情况下要考虑videoWidth>videoHeigh
    							if(remoteVideo.videoWidth<=remoteVideo.videoHeight){
    								//console.log("touch.pageY:"+touch.pageY+" window.screen.height:"+window.screen.height+" remoteVideo.videoHeight:"+remoteVideo.videoHeight+" relativeY:"+relativeY);
    								var posY = (touch.pageY - (window.screen.height - currentHeight) / 2);
    								//console.log("x:" + relativeX + " y:" + posY+ " type:"+eventType+" full");
    								var floatX = posX < 0 ? 0 : (posX > currentWidth ? 1 : posX / currentWidth);
    								var floatY = posY < 0 ? 0 : (posY > currentHeight ? 1 : posY / currentHeight);
    								console.log("发送结果：横坐标：" + floatX + " 纵坐标" + floatY + "类型:" + eventType);
    								trace("发送结果：横坐标：" + floatX + " 纵坐标" + floatY + "类型:" + eventType);
    							}else{
    								var posY = relativeX;
    								var posX = currentHeight-(touch.pageY-(window.screen.height - currentHeight) / 2);
    								var floatX = posX < 0 ? 0 : (posX > currentHeight ? 1 : posX / currentHeight);
    								var floatY = posY < 0 ? 0 : (posY > currentWidth ? 1 : posY / currentWidth);
    								console.log("发送结果：横坐标：" + floatX + " 纵坐标" + floatY + "类型:" + eventType);
    								trace("发送结果：横坐标：" + floatX + " 纵坐标" + floatY + "类型:" + eventType);
    							}
    						} else {
    							//console.log("x:" + relativeX + " y:" + relativeY + " type:"+eventType+" nofull");
    							if(remoteVideo.videoWidth<=remoteVideo.videoHeight){
    								var posY = relativeY;
    								var floatX = posX < 0 ? 0 : (posX > currentWidth ? 1 : posX / currentWidth);
    								var floatY = posY < 0 ? 0 : (posY > currentHeight ? 1 : posY / currentHeight);
    								console.log("发送结果：横坐标：" + floatX + " 纵坐标" + floatY + "类型:" + eventType);
    								trace("发送结果：横坐标：" + floatX + " 纵坐标" + floatY + "类型:" + eventType);
    							}else{
    								var posY = relativeX;
    								var posX = currentHeight-relativeY;
    								var floatX = posX < 0 ? 0 : (posX > currentHeight ? 1 : posX / currentHeight);
    								var floatY = posY < 0 ? 0 : (posY > currentWidth ? 1 : posY / currentWidth);
    								console.log("发送结果：横坐标：" + floatX + " 纵坐标" + floatY + "类型:" + eventType);
    								trace("发送结果：横坐标：" + floatX + " 纵坐标" + floatY + "类型:" + eventType);
    							}
    							
    						}
    						
    					} else if(mOrientation == 90) {
    						//目前只考虑全屏的情况
    						//width和height说法还是和手机保持一致 不受影响
    						//videoWidth、videoHeight、width和height的大小与横屏时保持一致 640 480
    						var currentWidth = remoteVideo.width;
    						var currentHeight = ( remoteVideo.videoWidth / remoteVideo.videoHeight)*remoteVideo.width;
    //						trace("当前总宽度" + currentWidth + "当前总高度:" + currentHeight);//360 480
    //						trace("touch.pageX:"+touch.pageX+" touch.pageY:"+touch.pageY);
    						var posX = currentWidth-touch.pageY;
    						//横屏下 window.screen.width得到的 手机的高度的那个分辨率而不是宽度
    						var posY = touch.pageX-(window.screen.width-currentHeight)/2;
    						//还得考虑videoHeight>videoWidth，非全屏的情况 这边不写了
    						if(isFullScreen()) {
    //							trace("posX:"+posX+" posY"+posY);
    //							trace("touch.pageX:"+touch.pageX+" window.screen.width:"+window.screen.width+" currentHeight:"+currentHeight);
    							var floatX = posX < 0 ? 0 : (posX > currentWidth ? 1 : posX / currentWidth);
    							var floatY = posY < 0 ? 0 : (posY > currentHeight ? 1 : posY / currentHeight);
    							console.log("发送结果：横坐标：" + floatX + " 纵坐标" + floatY + "类型:" + eventType);
    							trace("发送结果：横坐标：" + floatX + " 纵坐标" + floatY + "类型:" + eventType);
    						}
    					} else if(mOrientation == -90) {
    						var currentWidth = remoteVideo.width;
    						var currentHeight = ( remoteVideo.videoWidth / remoteVideo.videoHeight)*remoteVideo.width;
    						var posX = currentWidth-touch.pageY;
    						//需要window.screen.width去减
    						var posY = touch.pageX-(window.screen.width-currentHeight)/2; 
    						//还得考虑videoHeight>videoWidth的情况 这边不写了
    						if(isFullScreen()) {
    //							trace("posX:"+posX+" posY"+posY);
    //							trace("touch.pageX:"+touch.pageX+" window.screen.width:"+window.screen.width+" currentHeight:"+currentHeight);
    							var floatX = posX < 0 ? 0 : (posX > currentWidth ? 1 : posX / currentWidth);
    							var floatY = posY < 0 ? 0 : (posY > currentHeight ? 1 : posY / currentHeight);
    							console.log("发送结果：横坐标：" + floatX + " 纵坐标" + floatY + "类型:" + eventType);
    							trace("发送结果：横坐标：" + floatX + " 纵坐标" + floatY + "类型:" + eventType);
    						} 
    					}
    
    				}

  [1]: https://segmentfault.com/a/1190000000380064