---
title: H5音频直播—探索历程、aurora.js源码解析、音频编码基本原理 
date: 2016/08/23 11:00:00
categories: 流媒体
    - HTML
---

上次讲解了H5的视频直播，这次我们要讲的就是H5的音频直播啦.有没有很期待= =

下面是我的探索历程，不感兴趣的可以直接看最后一个方案。

# 探索历程

注：本文使用的Server都是nodejs,如果不了解的请先看下基础教程

另外ffmpeg是必须的，不仅是用来测试，做流媒体开发的基本都要会用这个


<!--more-->


## PCM音频直播
流程：
### 1.Server端接收ffmpeg推送的PCM流(这里我们把MP3文件推成PCM流，当然输入源任意

**做法(1)**:Server开启一个端口如8088，ffmpeg执行该命令


    ffmpeg -re -i D://A.mp3 -ac 1 -f f32le http://localhost:8088
参数解析：
> **-re** 以MP3的实际帧率去转码输出 否则很快就传输完了
> **-ac channels**   音频通道数 这边指定为1，对应的web端解码时也应该指定(因为pcm是裸数据，没有传输音频头来初始化
> **-f f32le**  输出格式，pcm的 PCM 32-bit floating-point little-endian，对应的web端也要指定，后面会讲.更多格式请参考[这里][1]

**做法(2)**:nodejs直接利用命名把输出流通过管道输出，stdout监听数据传输事件
代码如下：


    var child_process = require("child_process");
    var ffmpeg = child_process.spawn("ffmpeg",[
        "-re","-i",
        "A.mp3",
        "-ac","1","-f",
        "f32le",
        "pipe:1"                     // Output to STDOUT
        ]);
    
     ffmpeg.stdout.on('data', function(data)
     {
        //处理数据.. 如输出到socket_client
     });

WebSocket获取到音频数据message

### 2.server将数据输出给socket_client.
当然，事先要先开启端口让web端连接


    var ws = require('websocket.io'), 
    //WebSocket 连接3000端口
    server = ws.listen(3000);
    server.on('connection', function (socket) 
    {
        //定义全局变量保存socket,在另开启的监听流媒体端口函数中将数据传给socket
        //或者这里一连上就用上面的做法(2)直接推流给他
        //两种方案按照自己选择
        console.log('New client connected');
    }

### 方案(2)完整代码


    var ws = require('websocket.io'), 
    server = ws.listen(3000);
    var child_process = require("child_process");
    var i = 0;
    server.on('connection', function (socket) 
    {
    
    console.log('New client connected');
    
    var ffmpeg = child_process.spawn("ffmpeg",[
        "-re","-i",
        "A.mp3",
        "-ac","1","-f",
        "f32le",
        "pipe:1"                     // Output to STDOUT
        ]);
    
     ffmpeg.stdout.on('data', function(data)
     {
        var buff = new Buffer(data);
    	//做了base64编码，非必要
        socket.send(buff.toString('base64'));
     });
    });

### 3.客户端WebSocket连接接收数据并处理
base64解码函数：


    var base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    			var base64DecodeChars = new Array(-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1);
    
    			//base64解码 
    			function base64decode(str) {
    				var c1, c2, c3, c4;
    				var i, len, out;
    				len = str.length;
    				i = 0;
    				out = "";
    				while(i < len) {
    					/* c1 */
    					do {
    						c1 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
    					}
    					while (i < len && c1 == -1);
    					if(c1 == -1)
    						break;
    					/* c2 */
    					do {
    						c2 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
    					}
    					while (i < len && c2 == -1);
    					if(c2 == -1)
    						break;
    					out += String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4));
    					/* c3 */
    					do {
    						c3 = str.charCodeAt(i++) & 0xff;
    						if(c3 == 61)
    							return out;
    						c3 = base64DecodeChars[c3];
    					}
    					while (i < len && c3 == -1);
    					if(c3 == -1)
    						break;
    					out += String.fromCharCode(((c2 & 0XF) << 4) | ((c3 & 0x3C) >> 2));
    					/* c4 */
    					do {
    						c4 = str.charCodeAt(i++) & 0xff;
    						if(c4 == 61)
    							return out;
    						c4 = base64DecodeChars[c4];
    					}
    					while (i < len && c4 == -1);
    					if(c4 == -1)
    						break;
    					out += String.fromCharCode(((c3 & 0x03) << 6) | c4);
    				}
    				return out;
    			}


初始化AudioContext

    var audio = document.querySelector('audio');
    			window.AudioContext = window.AudioContext || window.webkitAudioContext;
    			var context = new AudioContext();
    			var audioBuffer = null;
    			//var context = null;
    			window.addEventListener('load', init, false);
    
    			function init() {
    				try {
    					context = new AudioContext();
    				} catch(e) {
    					alert('Web Audio API is not supported in this browser');
    				}
    			}


将base64解码后的string转为ArrayBuffer

    function str2ab(str) {
    				var buf = new ArrayBuffer(str.length); // 2 bytes for each char
    				var bufView = new Uint8Array(buf);
    				for(var i = 0, strLen = str.length; i < strLen; i++) {
    					bufView[i] = str.charCodeAt(i);
    				}
    				return buf;
    			}

继续封装，作为context的数据源

    var d1 = str2ab(decs)
    				var d2 = new DataView(d1);
    				//PCM流为f32格式
    				var data = new Float32Array(d2.byteLength / Float32Array.BYTES_PER_ELEMENT);
    				for(var jj = 0; jj < data.length; ++jj) {
    					data[jj] = d2.getFloat32(jj * Float32Array.BYTES_PER_ELEMENT, true);
    				}
    
    				var audioBuffer = context.createBuffer(2, data.length, 44100);
    				audioBuffer.getChannelData(0).set(data);
    
    				var source = context.createBufferSource(); // creates a sound source
    				source.buffer = audioBuffer;
    				source.connect(context.destination); // connect the source to the context's destination (the speakers)
    				source.start(0);
客户端完整代码

    <!DOCTYPE html>
    <html>
    
    	<head>
    		<meta name="viewport" content="width=320, initial-scale=1" />
    		<title>jsmpeg streaming</title>
    		<style type="text/css">
    			body {
    				background: #333;
    				text-align: center;
    				margin-top: 10%;
    			}
    			
    			#videoCanvas {
    				/* Always stretch the canvas to 640x480, regardless of its
    			internal size. */
    				width: 640px;
    				height: 480px;
    			}
    		</style>
    		<script src='http://code.jquery.com/jquery-1.9.1.min.js'></script>
    	</head>
    
    	<body>
    		<!-- The Canvas size specified here is the "initial" internal resolution. jsmpeg will
    		change this internal resolution to whatever the source provides. The size the
    		canvas is displayed on the website is dictated by the CSS style.
    	-->
    
    		<audio controls autoplay>
    			<p>
    				Please use a browser that supports the Canvas Element, like
    				<a href="http://www.google.com/chrome">Chrome</a>,
    				<a href="http://www.mozilla.com/firefox/">Firefox</a>,
    				<a href="http://www.apple.com/safari/">Safari</a> or Internet Explorer 10
    			</p>
    		</audio>
    		<script type="text/javascript">
    			var base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    			var base64DecodeChars = new Array(-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1);

    			function base64decode(str) {
    				var c1, c2, c3, c4;
    				var i, len, out;
    				len = str.length;
    				i = 0;
    				out = "";
    				while(i < len) {
    					/* c1 */
    					do {
    						c1 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
    					}
    					while (i < len && c1 == -1);
    					if(c1 == -1)
    						break;
    					/* c2 */
    					do {
    						c2 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
    					}
    					while (i < len && c2 == -1);
    					if(c2 == -1)
    						break;
    					out += String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4));
    					/* c3 */
    					do {
    						c3 = str.charCodeAt(i++) & 0xff;
    						if(c3 == 61)
    							return out;
    						c3 = base64DecodeChars[c3];
    					}
    					while (i < len && c3 == -1);
    					if(c3 == -1)
    						break;
    					out += String.fromCharCode(((c2 & 0XF) << 4) | ((c3 & 0x3C) >> 2));
    					/* c4 */
    					do {
    						c4 = str.charCodeAt(i++) & 0xff;
    						if(c4 == 61)
    							return out;
    						c4 = base64DecodeChars[c4];
    					}
    					while (i < len && c4 == -1);
    					if(c4 == -1)
    						break;
    					out += String.fromCharCode(((c3 & 0x03) << 6) | c4);
    				}
    				return out;
    			}
    
    			var audio = document.querySelector('audio');
    			window.AudioContext = window.AudioContext || window.webkitAudioContext;
    			var context = new AudioContext();
    			var audioBuffer = null;
    			//var context = null;
    			window.addEventListener('load', init, false);
    
    			function init() {
    				try {
    					context = new AudioContext();
    				} catch(e) {
    					alert('Web Audio API is not supported in this browser');
    				}
    			}
    
    			function str2ab(str) {
    				var buf = new ArrayBuffer(str.length); // 2 bytes for each char
    				var bufView = new Uint8Array(buf);
    				for(var i = 0, strLen = str.length; i < strLen; i++) {
    					bufView[i] = str.charCodeAt(i);
    				}
    				return buf;
    			}
    			var ws = new WebSocket("ws://localhost:3000/");
    			//ws.binaryType = "arraybuffer";
    			ws.onmessage = function(message) {
    				//console.log(message);
    				var decs = base64decode(message.data);
    				//var obj = new Uint8Array();
    				//obj= decs.split("");
    				console.log(decs);
    				var d1 = str2ab(decs)
    				var d2 = new DataView(d1);
    				//PCM流为f32格式
    				var data = new Float32Array(d2.byteLength / Float32Array.BYTES_PER_ELEMENT);
    				for(var jj = 0; jj < data.length; ++jj) {
    					data[jj] = d2.getFloat32(jj * Float32Array.BYTES_PER_ELEMENT, true);
    				}
    
    				var audioBuffer = context.createBuffer(2, data.length, 44100);
    				audioBuffer.getChannelData(0).set(data);
    
    				var source = context.createBufferSource(); // creates a sound source
    				source.buffer = audioBuffer;
    				source.connect(context.destination); // connect the source to the context's destination (the speakers)
    				source.start(0);
    			};
    		</script>
    	</body>
    
    </html>

### 优缺点
数据量太大，不利于网络传输。
实现简单，当然并没有什么卵用，权当学习。
可能唯一有用的就是由于未压缩，音频无损。

## AAC/MP3/FLAC/ALAC 直播
上述编码格式压缩率高，适合网络传输。
自己做解码肯定是不靠谱的，当然我们后面可以对其进行定制，后话了。
网上找到了一个js音频解码框架aurora.js
**github wiki:**[https://github.com/audiocogs/aurora.js/wiki][2]
严格意义上来说，他只是用来初始化解码器和音频播放的。
传输过来的音频数据，第一包会带有这些音频编码信息的数据，交由aurora.js处理后，识别是哪一种音频编码格式后，再调用具体的JS解码器去做解码，解码后的数据交由aurora去渲染。

注：JS解码器需要另外添加文件，aurora中并没有，需要解什么数据就引入相应的JS文件
>这里是作者的[所有工程][3]，里面都可以找到src文件。
>当然，如果想直接用aac.js/mp3.js等，可以看这个[demo][4],复制里面的js文件即可

### 先来个用XHR访问服务器文件，进行解码播放的。
很简单，把test.aac文件放到HTTP服务器下
客户端这样写就可以了

    <!DOCTYPE html>
    <html>
    
    	<head>
    		<meta charset="UTF-8">
    		<title></title>
    		<script src="aurora.js"></script>
    		<script src="aac.js"></script>
    	</head>
    	
    	<body>
    		<script>
    			var player = AV.Player.fromURL('http://localhost/testAAC/test.aac');
    			player.play();
    		</script>
    		
    	</body>
    
    </html>

### 用XHR的怎么能算是直播呢！
有人对aurora的数据获取过程做了一个修改，改用websocket
见：[aurora-websocket][5]

流程相对上面那个复杂一点点。
1.server:D:\nodejs\projects\aurora_ws_aac\server.js
代码应该很好懂，是live_pcm的第一种做法
如下：

    var http = require('http');
    var connect = require('connect');
    var ws = require('ws');
    
    // Consume the ffmpeg audio stream
    var audio_consumer = http.createServer( function(req, res) {
        console.log('Audio Stream Connected: ' + req.socket.remoteAddress);
        req.on('data', function(data){
            //When video data arrives, send to all the producer's clients
            for (var i in audio_producer.clients){
                audio_producer.clients[i].send(data, {binary:true});
            };
        });
    
        req.on('end', function () {
            res.end("Thanks");
        }); 
    
        req.on('error', function(e) {
            console.log("ERROR ERROR: " + e.message);
        });
    }).listen(8081, "127.0.0.1");
    
    
    var audio_producer = new ws.Server({port: 8071});
    audio_producer.on('connection', function(socket) {
    
        console.log('Audio Client Connected'); 
    
        socket.on('close', function(code, message){
            console.log( 'Disconnected Audio WebSocket ('+audio_producer.clients.length+' total)' );
        });
    });
    
    console.log('Awaiting ws Audio Connections on http://127.0.0.1:8071/');

8071端口用于获取ffmpeg的推流**`[audio_producer]`**
8081端口用于通过websocket推送数据给Web端**`[audio_consumer]`**
Web端也是很简单的代码：

    <!DOCTYPE html>
    <html>
    
    	<head>
    		<meta charset="UTF-8">
    		<title></title>
    		<script src="jquery-1.11.1.min.js"></script>
    		<script src="aurora.js"></script>
    		<script src="aac.js"></script>
    		<script src="aurora-websocket.min.js"></script>
    		<script type="text/javascript">
    			//<![CDATA[
    			$(document).ready(function() {
    				var player=AV.Player.fromWebSocket('ws://localhost:8071');
    				player.play();
    			});
    			//]]>
    		</script>
    	</head>
    	
    	<body>
    		<!--<script>
    			var player = AV.Player.fromURL('http://localhost/testAAC/test.aac');
    			player.play();
    		</script>-->
    		
    	</body>
    
    </html>

好了，现在我们开启server，HTTP服务器，访问
http://localhost/testAAC/test.html 。
然后再进行ffmpeg推流

    ffmpeg -re -i d://test.aac http://127.0.0.1:8081/a.aac

**a.aac解释：**
反正要送到8081端口，后面可以指定一个a.aac，可以理解为文件容器吧。
否则由于前面不指定-f，直接送到http://127.0.0.1:8081/会报*`Invalid argument错误`*

### **测试结果：**
ffmpeg一进行推送，web端马上就可以播放。

### **优点：**
音频压缩率高，跨平台。这样应该算是绝对大的优势了吧。
### **存在的问题及解决方案：**
**问题1:不支持IE11。**
描述：IE11虽然支持WebSocket,但是不支持Web Audio API。所以也就不能通过AudioContext播放解码后的pcm数据。
**解决方案：** IE只存在于PC端，那么我们就没必要一定用H5的方案了，可以直接用flash的解决方案：rtmp


~~ **问题2：client必须先连接server再进行推流，不是先推流client随时连上都可以播放。** ~~
~~ 描述：先连上再推流，是为了获取前几包里面的数据用来初始化解码器。如果没有获取到的话，会自动报错。目前我们的应用场景是后推流的，所以这个问题对我来说不是问题。当然考虑以后的拓展，有以下解决方案。~~
~~ **解决方案：** ~~
~~(1)server获取ffmpeg推流的时候，保存前几包数据【当然这边需要了解编码格式】到内存。client connect连接后，server判断是否ffmpeg已经推流到server过了，推流过则补发编码信息包。~~
~~(2)js这边做一个限定，和live_pcm一样，编码信息都固定好，这样就比较没有可拓展性。~~
【20160825更新】

>  aac等编码有分带内传输还是带外传输。
> **带内传输**就是每一帧都会带有编码信息，适应编码不断编码的情况，相应携带的数据就会比较多；
> **带外传输**第一包就指定了编码信息，后面的帧都按这个编码信息来。不能适应编码修改情况，未处理情况下不能从流中间播放，相应的携带数据会比较少。
> 实验测试aurora都是支持的。

# aurora.js源码解析

  [1]: https://trac.ffmpeg.org/wiki/audio%20types
  [2]: https://github.com/audiocogs/aurora.js/wiki
  [3]: https://github.com/audiocogs
  [4]: http://audiocogs.org/codecs/flac/
  [5]: https://github.com/fabienbrooke/aurora-websocket