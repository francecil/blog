
浏览器缓存被清了，那些响应头也会被清，不存在有响应头然后没有实际缓存文件的情况

expires 到了则发送 if-modified-since 

如果 last-modified 后改了，请求新资源没有的话返回 304 告诉浏览器可以用浏览器中的缓存，会不会更新 expires？


last-modified 只精确到秒，内容没变但是最后修改时间变了，还是会重新请求

于是就有了 etag -- 根据实体内容的 hash

请求的时候 先判断 etag 再判断 last-modified

http://www.alloyteam.com/2016/03/discussion-on-web-caching/
