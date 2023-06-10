---
title: XSS 防护组件
date: 2023-06-07 19:20:50
permalink: /pages/830983/
categories: 
  - 大前端
  - 应用基础
  - 前端安全
tags: 
  - 
titleTag: 草稿
---


## [XSS 防护] - SafeInnerHtml 组件

目标：方便安全的使用 innerHTML 属性，避免 xss 问题

<!-- more -->

## 功能特性

- 支持表情展示，自动监听表情资源加载
- 支持特定文本高亮及自定义配置
- 支持自定义的 html 文本映射配置
- 支持对富文本进行默认防护，自动过滤任何可能执行脚本的标签和属性 - 基于 [xss 模块](https://github.com/leizongmin/js-xss)的默认过滤能力
- 支持指定白名单允许的 HTML 标记及其属性 - [基于 xss 模块的拓展能力](https://github.com/leizongmin/js-xss#custom-filter-rules)

## 使用示例

### 1. 展示带表情文本

```tsx
<EmojiText html={'[捂脸]test'} wrapperTag="span" />
```

此时组件生成的 html 内容为：

```html
<span>
  <img
    class="emoji_icon"
    src="emoji_icon.jpg"
    alt="[捂脸]" />test
</span>
```

### 2. 高亮关键字

```tsx
<HighlightText html={'测试a和b'} highlightCls="keyword" highlightTag="span" words={['a', 'b']} />
```

此时组件生成的 html 片段为：

```html
<div>测试<span class="keyword">a</span>和<span class="keyword">b</span></div>
```

### 3. 普通富文本

内容通常由服务端下发，比如运营配置的富文本描述

支持展示图片、链接、文本，需要禁用脚本执行，此时仅需要开启 `enableXssPrevent` 配置即可

> 注：未避免漏配， enableRichtextXssPrevent 默认值为 true

```tsx
<RichText
    html={"<a title='test' href="javascript:alert(1)">hack</a>test<img src='./a.jpg' onerror='console.log'/>"}
    // 或者不配置
    enableXssPrevent={true}
/>
```

此时组件生成的 html 片段为：

```html
<div><a title="test" href>hack</a>test<img src="./a.jpg" /></div>
```

### 4. 自定义富文本

明确指定富文本的元素和属性范围，可以采用 `customXssPreventOptions` 配置，具体配置见 [xss github 项目](https://github.com/leizongmin/js-xss)

```tsx
<RichText
    html={"<a title='test' href="javascript:alert(1)">hack</a>test<img src='a.jpg' onerror='console.log'/>"}
    enableXssPrevent={true}
    xssOptions={{
        whiteList: {
            a: ["href", "title", "target"],
        },
    }}
/>
```

此时组件生成的 html 片段为：

```html
<a title="test" href>hack</a>test&lt;img src='a.jpg' onerror='console.log'/&gt;
```

