---
title: cookie
date: 2021-09-21 21:02:37
permalink: /pages/ba63a6/
categories: 
  - 通用技术
  - 网络基础
tags: 
  - 
titleTag: 笔记
---

保障 Cookie 安全的三种配置：
1. HttpOnly: js api 无法访问到带有 HttpOnly 属性的 Cookie，避免 XSS 攻击
2. Secure: 请求非 https 不会携带有 Secure 属性的 Cookie，避免中间人攻击
3. SameSite: 控制 Cookie 发送的场景，避免 CSRF 攻击，包含 Strict、Lax、None 三种值，Chrome 80 后默认值为 Lax。
  - Strict: 仅允许[同站请求](https://www.gahing.top/pages/de0dee/)发送 Cookie
  - Lax: 允许同站请求和部分跨站请求（a 链接的点击跳转，预加载请求，GET 表单）发送 Cookie
  - None: 设置 Secure 的情况下，无论是否跨站都会发送；否则视为 Lax 策略


## SameSite 常用配置

- 公开图片：SameSite=None，允许第三方域名 CDN 
- 隐私图片：SameSite=Lax/Strict，使用同站域名 CDN
- ...

隐私图片配置 Lax ，第三方网站无法通过 `<img> 、fetch` 等请求获取。

虽然可以使用 Get form 表单请求携带 Cookie，但是提交表单跳转的其他页面，第三方站点无法获取到数据，影响不大
```html
<form method="GET" action="https://p0-image-private.ixigua.com/tos-cn-i-0004/xx~noop.webp">
  <input type="hidden" name="policy" value="teyJ2bSI6MywidWlkIjoiODUxNjYyOTY0MTIifQ==">
  <input type="hidden" name="x-orig-authkey" value="f32326d3454f2ac7e96d3d06cdbb035152127018">
  <input type="hidden" name="x-orig-expires" value="2008687430">
  <input type="hidden" name="x-orig-sign" value="kigjEv7vGLMrzBWY8WXMV4sp/Hro=">
</form>
```


## 参考

- [HTTP Cookie - MDN](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Cookies)
- [SameSite cookie 的说明](https://web.dev/samesite-cookies-explained/?hl=zh-cn)