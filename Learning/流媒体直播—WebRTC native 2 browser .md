关于browser 2 browser的网上文章很多，我就不介绍了。
可以参考我的这篇文章[流媒体直播——资料整理、你想要了解的都在这][1]
里面给的链接可以去看看
这边我要讲的是**WebRTC编译后的执行文件**和**Web端**进行交互。

**首先要明确的是**，browser 2 browser的应用场景太狭小了：视频通话...
而编译WebRTC我们就可以做更多的事：屏幕共享.. 录播.. 远程教育【切换通话和屏幕】..
因为视频源我们是可控的，不像Web. 【其实b2b也可以做屏幕共享，不过c2b会比较可控】

编译WebRTC是一件麻烦的事，可以参考上面那篇文章。
这里我直接给出两个可运行程序
> 下载地址：[http://pan.baidu.com/s/1bVpx9O][2]

如果网盘挂了请提醒我( 说的好像是什么不健康的东西是的= =


<!--more-->


# 流程
先用起来吧，虽然js有注释，不过我后面还是会详细解析的。
## 构架Web端
1. 新建一个文件夹作为该web项目的根目录，就叫WebrtcTEST吧
2. 在根目录下新建js文件夹
3. 下载[所需js文件.rar][3]并解压，把得到的文件放入js文件夹中。
4. 根目录下新建test.html文件，代码如下


    <!DOCTYPE html>
    <html>
    
    	<head>
    		<meta charset="utf-8" />
    		<title>游戏</title>
    		<script type="text/javascript" src="./jquery-1.11.1.min.js"></script>
    		<script type="text/javascript" src="./adapter.js"></script>
    		<!--<script type="text/javascript" src="./adapter_no_global.js"></script>-->
    		<script>
    			var request = null;
    			var hangingGet = null;
    			var localName;
    			var server;
    			var my_id = -1;
    			//记录其他peer
    			var other_peers = {};
    			var message_counter = 0;
    
    			// added stuff start 
    			var pc;
    			//constraints for desktop browser 
    			var desktopConstraints = {
    
    				video: {
    					mandatory: {
    						maxWidth: 800,
    						maxHeight: 600
    					}
    				},
    
    				audio: true
    			};
    
    			//constraints for mobile browser 
    			var mobileConstraints = {
    
    				video: {
    					mandatory: {
    						maxWidth: 480,
    						maxHeight: 320,
    					}
    				},
    
    				audio: true
    			}
    
    			//if a user is using a mobile browser 
    			if(/Android|iPhone|iPad/i.test(navigator.userAgent)) {
    				var constraints = mobileConstraints;
    			} else {
    				var constraints = desktopConstraints;
    			}
    			var remoteStream;
    
    			function trace(txt) {
    				var elem = document.getElementById("debug");
    				elem.innerHTML += txt + "<br>";
    			}
    
    			function sendToPeer(peer_id, data) {
    				if(my_id == -1) {
    					alert("Not connected");
    					return;
    				}
    				if(peer_id == my_id) {
    					alert("Can't send a message to oneself :)");
    					return;
    				}
    				var r = new XMLHttpRequest();
    				r.open("POST", server + "/message?peer_id=" + my_id + "&to=" + peer_id,
    					false);
    				r.setRequestHeader("Content-Type", "text/plain");
    				r.send(data);
    				console.log(peer_id, " Send ", data);
    				trace(peer_id + " Send :" + data);
    				var dataJson = JSON.parse(data);
    				console.log(peer_id, " send ", data);
    				r = null;
    			}
    			var onSessionConnecting = function(message) {
    
    				console.log("Session connecting.");
    				trace("Session connecting.");
    			}
    
    			var onSessionOpened = function(message) {
    				console.log("Session opened.");
    				trace("Session opened.");
    			}
    
    			var onRemoteStreamRemoved = function(event) {
    					console.log("Remote stream removed.");
    					trace("Remote stream removed.");
    				}
    				//This function 
    			var createPeerConnection = function(connectionId) {
    				var pc_config = {
    					"iceServers": [{
    						"url": "stun:stun.l.google.com:19302"
    					}]
    				};
    				try {
    					console.log(pc_config);
    					trace(pc_config);
    					// 创建PeerConnection实例 (参数为null则没有iceserver，即使没有stunserver和turnserver，仍可在局域网下通讯)
    					pc = new RTCPeerConnection(pc_config);
    					// 发送ICE候选到其他客户端
    					pc.onicecandidate = function(event) {
    						if(event.candidate) {
    							var msgCANDIDATE = {};
    							msgCANDIDATE.sdpMLineIndex = event.candidate.sdpMLineIndex;
    							msgCANDIDATE.sdpMid = event.candidate.sdpMid;
    							msgCANDIDATE.candidate = event.candidate.candidate;
    							sendToPeer(connectionId, JSON.stringify(msgCANDIDATE));
    						} else {
    							console.log("End of candidates.");
    							trace("End of candidates.");
    						}
    					};
    					pc.onconnecting = onSessionConnecting;
    					pc.onopen = onSessionOpened;
    					// 如果检测到媒体流连接到本地，将其绑定到一个video标签上输出
    					pc.onaddstream = function(event) {
    						console.log("Remote stream added.");
    						trace("Remote stream added.");
    						document.getElementById('remoteVideo').src = URL.createObjectURL(event.stream);
    					}
    					pc.onremovestream = onRemoteStreamRemoved;
    					console.log("Created RTCPeerConnnection with config \"" + JSON.stringify(pc_config) + "\". for ");
    					trace("Created RTCPeerConnnection with config \"" + JSON.stringify(pc_config) + "\". for ");
    					//setLocalStream(connectionId);//解除注释将可以双端通信 不过延迟就高了
    				} catch(e) {
    					console.log("Failed to create PeerConnection with " + connectionId + ", exception: " + e.message);
    					trace("Failed to create PeerConnection with " + connectionId + ", exception: " + e.message);
    				}
    
    			}
    
    			function setLocalStream(connectionId) {
    				// 获取本地音频和视频流
    				navigator.getUserMedia(constraints, function(stream) {
    					//绑定本地媒体流到video标签用于输出
    					document.getElementById('localVideo').src = URL.createObjectURL(stream);
    					//向PeerConnection中加入需要发送的流
    					pc.addStream(stream);
    					//如果是发起方则发送一个offer信令
    					pc.createOffer(function sendOfferFn(desc) {
    						pc.setLocalDescription(desc);
    						var data = JSON.stringify(desc);
    						sendToPeer(connectionId, data);
    					}, function(error) {
    						console.log('Failure callback: ' + error);
    						trace('Failure callback: ' + error);
    					});
    				}, function(error) {
    					//处理媒体流创建失败错误
    					console.log('getUserMedia error: ' + error);
    					trace('getUserMedia error: ' + error);
    				});
    
    			}
    			//添加新加入的peer到本地
    			function handleServerNotification(data) {
    				console.log("Server notification: " + data);
    				trace("Server notification: " + data);
    				var parsed = data.split(',');
    				if(parseInt(parsed[2]) != 0)
    					other_peers[parseInt(parsed[1])] = parsed[0];
    			}
    			//如果是一个ICE的候选，则将其加入到PeerConnection中，否则设定对方的session描述为传递过来的描述
    			function handlePeerMessage(peer_id, data) {
    				var dataJson = JSON.parse(data);
    				if(data.search("offer") != -1) {
    					//json:{"sdp":xxx,type:"offer"}
    					createPeerConnection(peer_id);
    					pc.setRemoteDescription(new RTCSessionDescription(dataJson));
    					pc.createAnswer(function(sessionDescription) {
    						var answerData = JSON.stringify(sessionDescription);
    						console.log("answer:" + answerData);
    						trace("answer:" + answerData);
    						pc.setLocalDescription(sessionDescription);
    						sendToPeer(peer_id, answerData);
    					}, function(error) {
    						console.log('Failure callback: ' + error);
    						trace('Failure callback: ' + error);
    					});
    				} else {
    					//It is a candidate
    					var candidate = new RTCIceCandidate({
    						sdpMLineIndex: dataJson.sdpMLineIndex,
    						candidate: dataJson.candidate
    					});
    					pc.addIceCandidate(candidate);
    				}
    			}
    
    			function GetIntHeader(r, name) {
    				var val = r.getResponseHeader(name);
    				return val != null && val.length ? parseInt(val) : -1;
    			}
    			//等待服务器返回，当出现以下情况或超时才会返回 
    			//1.其他peer连接上server会返回peer的数据{peerName,peerID,xx};用于本地添加
    			//本地响应handleServerNotification
    			//2.其他peer点击my_name(即发送 发送-接收视频 请求)，返回 一个ice的候选或者offer
    			//	{
    			// "candidate" : "candidate:1918330882 1 udp 2122260223 192.168.253.1 55710 typ host generation 0 ufrag YUtt network-id 4 network-cost 50",
    			// "sdpMLineIndex" : 0,
    			// "sdpMid" : "audio"
    			//} this is ice
    			//本地响应handlePeerMessage
    			function hangingGetCallback() {
    				try {
    					if(hangingGet.readyState != 4)
    						return; //why?
    					if(hangingGet.status != 200) {
    						console.log("server error: " + hangingGet.statusText);
    						trace("server error: " + hangingGet.statusText);
    						disconnect();
    					} else {
    						var peer_id = GetIntHeader(hangingGet, "Pragma");
    
    						if(peer_id == my_id) {
    							console.log("handleServerNotification:" + hangingGet.responseText);
    							trace("handleServerNotification:" + hangingGet.responseText);
    							handleServerNotification(hangingGet.responseText);
    						} else {
    							console.log("handlePeerMessage:" + hangingGet.responseText);
    							trace("handlePeerMessage:" + hangingGet.responseText);
    							handlePeerMessage(peer_id, hangingGet.responseText);
    						}
    					}
    
    					if(hangingGet) {
    						hangingGet.abort();
    						hangingGet = null;
    					}
    
    					if(my_id != -1)
    						window.setTimeout(startHangingGet, 0);
    				} catch(e) {
    					console.log("Hanging get error: " + e.description);
    					trace("Hanging get error: " + e.description);
    				}
    			}
    			//继续把my_id发给server 当其他peer连接服务器的时候其他peer就可以获取my_id
    			function startHangingGet() {
    				try {
    					hangingGet = new XMLHttpRequest();
    					hangingGet.onreadystatechange = hangingGetCallback;
    					hangingGet.ontimeout = onHangingGetTimeout;
    					hangingGet.open("GET", server + "/wait?peer_id=" + my_id, true);
    					hangingGet.send();
    				} catch(e) {
    					console.log("error" + e.description);
    					trace("error" + e.description);
    				}
    			}
    			//如果超时则继续发送startHangingGet请求
    			function onHangingGetTimeout() {
    				console.log("hanging get timeout. issuing again.");
    				trace("hanging get timeout. issuing again.");
    				hangingGet.abort();
    				hangingGet = null;
    				if(my_id != -1)
    					window.setTimeout(startHangingGet, 0);
    			}
    			//server返回my_id(服务器已递增的方式生成id)和远端peer的id
    			//那如果browser先连接，没有其他peer，该方法返回时没有远端peer的id 后面是哪里获取的呢？
    			//所以它又做了一个startHangingGet();
    			//通过handleServerNotification 得到,log:Server notification: zhengjx@X-CDN-zhengjx,2,1
    			function signInCallback() {
    				try {
    					console.log("request.readyState:" + request.readyState);
    					trace("request.readyState:" + request.readyState);
    					if(request.readyState == 4) {
    						if(request.status == 200) {
    							var peers = request.responseText.split("\n");
    							my_id = parseInt(peers[0].split(',')[1]);
    							console.log("My id: " + my_id); //My id 1
    							trace("My id: " + my_id); //My id 1
    							//Peer 1: zhengjx@X-CDN-zhengjx,2,parsed[2]没用到 
    							for(var i = 1; i < peers.length; ++i) {
    								if(peers[i].length > 0) {
    									console.log("Peer " + i + ": " + peers[i]);
    									trace("Peer " + i + ": " + peers[i]);
    									var parsed = peers[i].split(',');
    									other_peers[parseInt(parsed[1])] = parsed[0];
    								}
    							}
    							startHangingGet();
    							request = null;
    						}
    					}
    				} catch(e) {
    					console.log("error: " + e.description);
    					trace("error: " + e.description);
    				}
    			}
    			//注册，把自己的localName发给server
    			function signIn() {
    				try {
    					request = new XMLHttpRequest();
    					request.onreadystatechange = signInCallback;
    					request.open("GET", server + "/sign_in?" + localName, true);
    					request.send();
    				} catch(e) {
    					console.log("error: " + e.description);
    					trace("error: " + e.description);
    				}
    			}
    
    			function connect() {
    				localName = document.getElementById("local").value.toLowerCase();
    				server = document.getElementById("server").value.toLowerCase();
    				if(localName.length == 0) {
    					alert("I need a name please.");
    					document.getElementById("local").focus();
    				} else {
    					document.getElementById("connect").disabled = true;
    					document.getElementById("disconnect").disabled = false;
    					//document.getElementById("send").disabled = false;
    					signIn();
    				}
    			}
    
    			function disconnect() {
    				if(request) {
    					request.abort();
    					request = null;
    				}
    
    				if(hangingGet) {
    					hangingGet.abort();
    					hangingGet = null;
    				}
    
    				if(my_id != -1) {
    					request = new XMLHttpRequest();
    					request.open("GET", server + "/sign_out?peer_id=" + my_id, false);
    					request.send();
    					request = null;
    					my_id = -1;
    				}
    
    				document.getElementById("connect").disabled = false;
    				document.getElementById("disconnect").disabled = true;
    				//document.getElementById("send").disabled = true;
    			}
    		</script>
    	</head>
    
    	<body>
    		Local: <br>
    		<video id="localVideo" autoplay></video><br> Remote: <br>
    		<video id="remoteVideo" autoplay style="width:400px;height:300px;"></video>
    
    		Server: <input type="text" id="server" value="http://172.27.35.1:8888" /><br> Your name: <input type="text" id="local" value="my_name" />
    		<button id="connect" onclick="connect();">Connect</button>
    		<button disabled="true" id="disconnect" onclick="disconnect();">Disconnect</button>
    		<pre id="debug">
    		</pre>
    	</body>
    
    </html>

将WebrtcTEST项目放入HTTP服务器
访问 http://localhost/WebrtcTEST/test.html
# 服务器端
下载百度云的那个rar并解压得到
`peerconnection_client.exe` 和 `peerconnection_server.exe`
`peerconnection_client.exe`的网络运行环境任意，可局域网可公网。
但`peerconnection_server.exe`网络运行环境必须保证能让`peerconnection_client`和`Web端localhost`所在网络运行环境访问到。
也就是说，**要么`peerconnection_server`处于公网，要么三者均处于局域网。**
> PS:测试时为了方便选择局域网，并让peerconnection_client和peerconnection_server处于同一台PC
## 测试流程如下：
1. 服务器端运行`peerconnection_server`
2. 服务器端运行`peerconnection_client`，并直接点击`connect`
3. 另一Client的Web端设置`Server IP`地址和`Your name`【name随意】,点击`connect`
4. 服务器端peerconnection_client显示Web端连接上了，列表上出现name，对其进行点击;
5. 现在就可以在Web端看到服务器端摄像头的画面了，延迟小于200ms.
6. 如果想让服务器端看到Web端用户摄像头画面，将test.html的第132行注释去掉


    //setLocalStream(connectionId);//解除注释将可以双端通信 不过延迟就高了

# JS具体流程分析
## 从`function connect()` 开始分析
##  调用signIn()函数
将自己的localName【填写的Your name】发给server,响应结束将调用signInCallback
## 分析signInCallback()
server返回my_id(服务器已递增的方式生成id)和远端peer的id
**那如果browser先连接，没有其他peer，该方法返回时没有远端peer的id 后面是哪里获取的呢？**
所以它又做了一个startHangingGet();
返回的peer数据格式：peer_name,peer_id,第三个参数没有用到我也不知道是什么。
## 执行startHangingGet();
不管上一步有没有获取到peer该步骤都会进行的。
#### 该步骤是把my_id发送给server.
当其他peer进行操作**[1.连接服务器的时候其他peer就可以获取my_id;2.发送播流指令]**XHR请求将成功响应,并且自己将执行hangingGetCallback。
如果请求超时的话将回调onHangingGetTimeout，其结果是重新执行startHangingGet
## 执行hangingGetCallback
正如刚刚说的，有两种情况，服务器将响应返回
### 1.其他peer连接上server会返回peer的数据{peerName,peerID,xx};用于本地添加
本地响应`handleServerNotification`
log打印：


    handleServerNotification:zhengjx@X-CDN-zhengjx,4,1
    Server notification: zhengjx@X-CDN-zhengjx,4,1

### 2.其他peer点击my_name(即发送 播流 请求)，返回 一个ice的候选或者offer
本地响应`handlePeerMessage`
## 这里我们直接分析peer发送播流请求
### 远端peer先发送了一个携带音视频信息sdp的offer

    handlePeerMessage:{
       "sdp" : "v=0\r\no=- 1915807044938492152 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE audio video\r\na=msid-semantic: WMS stream_label\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111 103 104 9 102 0 8 106 105 13 127 126\r\nc=IN IP4 0.0.0.0\r\na=rtcp:9 IN IP4 0.0.0.0\r\na=ice-ufrag:s+rj\r\na=ice-pwd:JZspr0P/+RWnF3WFF7H2njf+\r\na=fingerprint:sha-256 DC:1B:45:26:86:B0:51:E1:2C:84:F6:04:83:1F:13:87:5F:54:9D:9F:4C:8D:04:33:E3:2F:69:BC:69:23:51:D5\r\na=setup:actpass\r\na=mid:audio\r\na=extmap:1 urn:ietf:params:rtp-hdrext:ssrc-audio-level\r\na=extmap:3 http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time\r\na=sendrecv\r\na=rtcp-mux\r\na=rtpmap:111 opus/48000/2\r\na=rtcp-fb:111 transport-cc\r\na=fmtp:111 minptime=10;useinbandfec=1\r\na=rtpmap:103 ISAC/16000\r\na=rtpmap:104 ISAC/32000\r\na=rtpmap:9 G722/8000\r\na=rtpmap:102 ILBC/8000\r\na=rtpmap:0 PCMU/8000\r\na=rtpmap:8 PCMA/8000\r\na=rtpmap:106 CN/32000\r\na=rtpmap:105 CN/16000\r\na=rtpmap:13 CN/8000\r\na=rtpmap:127 red/8000\r\na=rtpmap:126 telephone-event/8000\r\na=ssrc:1946889360 cname:oeS68Tdb4Ls6Qz2u\r\na=ssrc:1946889360 msid:stream_label audio_label\r\na=ssrc:1946889360 mslabel:stream_label\r\na=ssrc:1946889360 label:audio_label\r\nm=video 9 UDP/TLS/RTP/SAVPF 100 101 116 117 96 97 98\r\nc=IN IP4 0.0.0.0\r\na=rtcp:9 IN IP4 0.0.0.0\r\na=ice-ufrag:s+rj\r\na=ice-pwd:JZspr0P/+RWnF3WFF7H2njf+\r\na=fingerprint:sha-256 DC:1B:45:26:86:B0:51:E1:2C:84:F6:04:83:1F:13:87:5F:54:9D:9F:4C:8D:04:33:E3:2F:69:BC:69:23:51:D5\r\na=setup:actpass\r\na=mid:video\r\na=extmap:2 urn:ietf:params:rtp-hdrext:toffset\r\na=extmap:3 http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time\r\na=extmap:4 urn:3gpp:video-orientation\r\na=sendrecv\r\na=rtcp-mux\r\na=rtcp-rsize\r\na=rtpmap:100 VP8/90000\r\na=rtcp-fb:100 ccm fir\r\na=rtcp-fb:100 nack\r\na=rtcp-fb:100 nack pli\r\na=rtcp-fb:100 goog-remb\r\na=rtcp-fb:100 transport-cc\r\na=rtpmap:101 VP9/90000\r\na=rtcp-fb:101 ccm fir\r\na=rtcp-fb:101 nack\r\na=rtcp-fb:101 nack pli\r\na=rtcp-fb:101 goog-remb\r\na=rtcp-fb:101 transport-cc\r\na=rtpmap:116 red/90000\r\na=rtpmap:117 ulpfec/90000\r\na=rtpmap:96 rtx/90000\r\na=fmtp:96 apt=100\r\na=rtpmap:97 rtx/90000\r\na=fmtp:97 apt=101\r\na=rtpmap:98 rtx/90000\r\na=fmtp:98 apt=116\r\na=ssrc-group:FID 1010645505 1298682012\r\na=ssrc:1010645505 cname:oeS68Tdb4Ls6Qz2u\r\na=ssrc:1010645505 msid:stream_label video_label\r\na=ssrc:1010645505 mslabel:stream_label\r\na=ssrc:1010645505 label:video_label\r\na=ssrc:1298682012 cname:oeS68Tdb4Ls6Qz2u\r\na=ssrc:1298682012 msid:stream_label video_label\r\na=ssrc:1298682012 mslabel:stream_label\r\na=ssrc:1298682012 label:video_label\r\n",
       "type" : "offer"
    }

### createPeerConnection，设定对方的sdp为传递过来的描述
执行

    createPeerConnection(peer_id);
    pc.setRemoteDescription(new RTCSessionDescription(dataJson));				                    pc.createAnswer(function(sessionDescription)  {
    		var answerData = JSON.stringify(sessionDescription);
    		console.log("answer:" + answerData);
    		trace("answer:" + answerData);
		    pc.setLocalDescription(sessionDescription);
    		sendToPeer(peer_id, answerData);
    					}, function(error) {
    						console.log('Failure callback: ' + error);
    						trace('Failure callback: ' + error);
    					});


创建PeerConnection实例 (参数为null则没有iceserver，即使没有stunserver和turnserver，仍可在局域网下通讯)
这里我们设置了`onicecandidate`：

    {"iceServers":[{"url":"stun:stun.l.google.com:19302"}]}

通过执行sendToPeer函数发送ICE候选到其他客户端，该过程会慢于RTCPeerConnection.onaddstream。

当上面做的pc.setRemoteDescription成功执行时，pc.onaddstream将调用。
官网原话:

    RTCPeerConnection.onaddstream：
    The event is sent immediately after the call RTCPeerConnection.setRemoteDescription() 

回复的answer sdp 如下：

    answer:{"type":"answer","sdp":"v=0\r\no=- 681837714082552550 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE audio video\r\na=msid-semantic: WMS\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111 103 104 9 0 8 106 105 13 126\r\nc=IN IP4 0.0.0.0\r\na=rtcp:9 IN IP4 0.0.0.0\r\na=ice-ufrag:XNSrC9DEJco2wMEV\r\na=ice-pwd:PhP5CUsS6P8wxnCZZa5aZ5nD\r\na=fingerprint:sha-256 F8:93:41:5C:50:E9:EF:11:66:0F:2F:64:F7:CE:C4:BB:C5:57:D8:3C:C3:04:19:27:33:B7:93:DE:58:9F:DF:74\r\na=setup:active\r\na=mid:audio\r\na=extmap:1 urn:ietf:params:rtp-hdrext:ssrc-audio-level\r\na=extmap:3 http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time\r\na=recvonly\r\na=rtcp-mux\r\na=rtpmap:111 opus/48000/2\r\na=rtcp-fb:111 transport-cc\r\na=fmtp:111 minptime=10;useinbandfec=1\r\na=rtpmap:103 ISAC/16000\r\na=rtpmap:104 ISAC/32000\r\na=rtpmap:9 G722/8000\r\na=rtpmap:0 PCMU/8000\r\na=rtpmap:8 PCMA/8000\r\na=rtpmap:106 CN/32000\r\na=rtpmap:105 CN/16000\r\na=rtpmap:13 CN/8000\r\na=rtpmap:126 telephone-event/8000\r\na=maxptime:60\r\nm=video 9 UDP/TLS/RTP/SAVPF 100 101 116 117 96 97 98\r\nc=IN IP4 0.0.0.0\r\na=rtcp:9 IN IP4 0.0.0.0\r\na=ice-ufrag:XNSrC9DEJco2wMEV\r\na=ice-pwd:PhP5CUsS6P8wxnCZZa5aZ5nD\r\na=fingerprint:sha-256 F8:93:41:5C:50:E9:EF:11:66:0F:2F:64:F7:CE:C4:BB:C5:57:D8:3C:C3:04:19:27:33:B7:93:DE:58:9F:DF:74\r\na=setup:active\r\na=mid:video\r\na=extmap:2 urn:ietf:params:rtp-hdrext:toffset\r\na=extmap:3 http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time\r\na=extmap:4 urn:3gpp:video-orientation\r\na=recvonly\r\na=rtcp-mux\r\na=rtcp-rsize\r\na=rtpmap:100 VP8/90000\r\na=rtcp-fb:100 ccm fir\r\na=rtcp-fb:100 nack\r\na=rtcp-fb:100 nack pli\r\na=rtcp-fb:100 goog-remb\r\na=rtcp-fb:100 transport-cc\r\na=rtpmap:101 VP9/90000\r\na=rtcp-fb:101 ccm fir\r\na=rtcp-fb:101 nack\r\na=rtcp-fb:101 nack pli\r\na=rtcp-fb:101 goog-remb\r\na=rtcp-fb:101 transport-cc\r\na=rtpmap:116 red/90000\r\na=rtpmap:117 ulpfec/90000\r\na=rtpmap:96 rtx/90000\r\na=fmtp:96 apt=100\r\na=rtpmap:97 rtx/90000\r\na=fmtp:97 apt=101\r\na=rtpmap:98 rtx/90000\r\na=fmtp:98 apt=116\r\n"}

### 接下来的过程
上一步提到的，本地发送ICE候选到其他客户端

    " Send " "{"sdpMLineIndex":0,"sdpMid":"audio","candidate":"candidate:3604340130 1 udp 2122260223 192.168.216.1 50938 typ host generation 0 ufrag XNSrC9DEJco2wMEV network-id 4"}"

该过程会执行多次，每次携带的candidate都不一致，直到打印`console.log("End of candidates.");`
与此同时，本地通过handlePeerMessage获取到ICE的候选，并将其加入到PeerConnection中。
这样两端就都有各自的ICE候选了，那么就可以进行通信。

pc.onaddstream在前一步调用，那么接下来peer就应该开始传流。
本地通过handlePeerMessage获取的音视频数据部分如下


    handlePeerMessage:{
       "candidate" : "candidate:2013099291 2 udp 2122194686 10.8.146.177 54148 typ host generation 0 ufrag s+rj network-id 3 network-cost 50",
       "sdpMLineIndex" : 0,
       "sdpMid" : "audio"
    }
    
    VM122 phone_frame.html:450 handlePeerMessage:{
       "candidate" : "candidate:2719042630 1 udp 2122260223 172.27.35.1 54149 typ host generation 0 ufrag s+rj network-id 4 network-cost 50",
       "sdpMLineIndex" : 1,
       "sdpMid" : "video"
    }

**[注意之间建立了的candidate会在传输时用到，所以可以理解candidate是一种管道，我们创建了多个candidate就是多个管道，视音频数据就是通过这些管道来传输]**
当然，再具体的原理就不探讨了，涉及穿透等高深的知识= =。

由于研究未深，如有错误，烦请指正，谢谢。

  [1]: https://www.hongweipeng.com/index.php/archives/835/
  [2]: http://pan.baidu.com/s/1bVpx9O
  [3]: https://www.hongweipeng.com/usr/uploads/2016/08/2467397271.rar