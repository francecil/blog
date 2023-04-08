---
title: adblockplus.js源码解析
date: 2018-09-15 10:18:32
permalink: /pages/b0d61f/
categories: 
  - 随笔
tags: 
  - null
sidebar: auto
---

# 前言

本次分析的是 `adblockplus` 的 3.3.2_0 版本，

源码见 <a href="https://github.com/adblockplus/adblockpluschrome">adblockplus</a> 

<!--more-->


# 说明

每个模块的写法大致都是以下这样的
```js
require.scopes.xxx = function(){
  var obj =  {}
  obj.Xxx = {
    //公有方法
  }
  return obj
}()
```

其他模块使用
```js
var xxx = require("xxx").Xxx
```

# 模块解析

## 过滤器模块

核心代码，从 fromText 入手

在 fromText 中，对规则进行分类，构造相应的过滤器

```js
/**
 * Cache for known filters, maps string representation to filter objects.
 * @type {Map.<string,Filter>}
 */
Filter.knownFilters = new Map();

/**
 * Regular expression that content filters should match
 * 匹配内容过滤器，会继续细分 元素隐藏 等过滤器
 * @type {RegExp}
 */
Filter.contentRegExp = /^([^/*|@"!]*?)#([@?$])?#(.+)$/;
/**
 * Regular expression that RegExp filters specified as RegExps should match
 * 匹配正则形式的规则
 * @type {RegExp}
 */
Filter.regexpRegExp = /^(@@)?\/.*\/(?:\$~?[\w-]+(?:=[^,\s]+)?(?:,~?[\w-]+(?:=[^,\s]+)?)*)?$/;
/**
 * Regular expression that options on a RegExp filter should match
 * 匹配过滤规则选项，这些选项放在$后 并以,分割
 * @type {RegExp}
 */
Filter.optionsRegExp = /\$(~?[\w-]+(?:=[^,]*)?(?:,~?[\w-]+(?:=[^,]*)?)*)$/;
/**
 * Regular expression that matches an invalid Content Security Policy
 * 匹配无效的csp
 * @type {RegExp}
 */
Filter.invalidCSPRegExp = /(;|^) ?(base-uri|referrer|report-to|report-uri|upgrade-insecure-requests)\b/i;

/**
 * Creates a filter of correct type from its text representation - does the
 * basic parsing and calls the right constructor then.
 * 解析单行字符串，构造相应过滤器
 * @param {string} text   as in Filter()
 * @return {Filter}
 */
Filter.fromText = function(text)
{
  // 判断字符串是否已被解析成过滤器
  let filter = Filter.knownFilters.get(text);
  if (filter)
    return filter;

  let match = text.includes("#") ? Filter.contentRegExp.exec(text) : null;
  //匹配内容过滤器
  if (match)
  {
    let propsMatch;
    if (!match[2] &&
        (propsMatch = /\[-abp-properties=(["'])([^"']+)\1\]/.exec(match[3])))
    {
      // This is legacy CSS properties syntax, convert to current syntax
      // 转化遗留css语法到当前语法--引号形式变成括号形式，例[-abp-properties='width:300px;height:250px;'] will be converted to :-abp-properties(width:300px;height:250px;)
      // 括号中内容表示赋值这些属性给元素style ; match[3] ：选择器及-abp-properties内容
      // 
      let prefix = match[3].substr(0, propsMatch.index);
      let expression = propsMatch[2];
      let suffix = match[3].substr(propsMatch.index + propsMatch[0].length);
      return Filter.fromText(`${match[1]}#?#` +
          `${prefix}:-abp-properties(${expression})${suffix}`);
    }

    filter = ContentFilter.fromText(text, match[1], match[2], match[3]);
  }
  //匹配注释规则
  else if (text[0] == "!")
    filter = new CommentFilter(text);
  //匹配正则形式规则
  else
    filter = RegExpFilter.fromText(text);
  //缓存
  Filter.knownFilters.set(filter.text, filter);
  return filter;
};
```

### 内容过滤器-ContentFilter

```js
match = /^([^/*|@"!]*?)#([@?$])?#(.+)$/.exec(text)
ContentFilter.fromText(text, match[1], match[2], match[3])
```

```js
/**
 * Creates a content filter from a pre-parsed text representation
 *
 * @param {string} text         same as in Filter()
 * @param {string} [domains]
 *   domains part of the text representation
 * @param {string} [type]
 *   rule type, either:
 *     <li>"" for an element hiding filter</li>
 *     <li>"@" for an element hiding exception filter</li>
 *     <li>"?" for an element hiding emulation filter</li>
 *     <li>"$" for a snippet filter</li>
 * @param {string} body
 *   body part of the text representation, either a CSS selector or a snippet
 *   script
 * @return {ElemHideFilter|ElemHideException|
 *          ElemHideEmulationFilter|SnippetFilter|InvalidFilter}
 */
ContentFilter.fromText = function(text, domains, type, body)
{
  // We don't allow content filters which have any empty domains.
  // Note: The ContentFilter.prototype.domainSeparator is duplicated here, if
  // that changes this must be changed too.
  // 存在空的域名，即 'a.com,,b.com' 逗号中间为空，故该规则无效
  if (domains && /(^|,)~?(,|$)/.test(domains))
    // 无效过滤器
    return new InvalidFilter(text, "filter_invalid_domain");

  if (type == "@")
    //元素隐藏例外过滤器，即匹配规则的不进行元素隐藏
    return new ElemHideException(text, domains, body);

  if (type == "$")
    // script片段过滤器，目前仅找到该条规则
    // e.g. ipv6.baidu.com,xueshu.baidu.com,www.baidu.com,www1.baidu.com#$#hide-if-contains 广告 .c-container '.f13 > .m'
    return new SnippetFilter(text, domains, body);

  if (type == "?")
  {
    // Element hiding emulation filters are inefficient so we need to make sure
    // that they're only applied if they specify active domains
    // 元素隐藏拓展选择器过滤器。可以使用拓展语法，但是有性能影响,需要指定域名使用
    //e.g. 58.com#?#.ac_item:-abp-has(.jingpin) 规则用到了-abp-has拓展选择器
    if (!/,[^~][^,.]*\.[^,]/.test("," + domains))
      //未设置域名
      return new InvalidFilter(text, "filter_elemhideemulation_nodomain");

    return new ElemHideEmulationFilter(text, domains, body);
  }
  //默认元素隐藏过滤器
  return new ElemHideFilter(text, domains, body);
};
```

### 注释过滤器-CommentFilter

不做处理

### 正则过滤器-RegExpFilter

### 无效过滤器-InvalidFilter


## 匹配器 Matcher

规则匹配过滤器的过程

1. 将url分割成关键字候选列表
```js
/**
 * Tests whether the URL matches any of the known filters
 * @param {string} location
 *   URL to be tested
 * @param {number} typeMask
 *   bitmask of content / request types to match
 * @param {string} docDomain
 *   domain name of the document that loads the URL
 * @param {boolean} thirdParty
 *   should be true if the URL is a third-party request
 * @param {string} sitekey
 *   public key provided by the document
 * @param {boolean} specificOnly
 *   should be true if generic matches should be ignored
 *   非通用匹配，即含有css拓展选择器
 * @return {?RegExpFilter}
 *   matching filter or null
 */
matchesAny(location, typeMask, docDomain, thirdParty, sitekey, specificOnly)}{
  let candidates = location.toLowerCase().match(/[a-z0-9%]{3,}/g);
  if (candidates === null)candidates = [];
  candidates.push("");
  //2.
}

```
2. 遍历关键字候选列表，判断该url属于哪个过滤器
```js
let blacklistHit = null;
for (let i = 0, l = candidates.length; i < l; i++) {
  let substr = candidates[i];
  //在白名单列表中，直接返回
  let result = this.whitelist._checkEntryMatch(
    substr, location, typeMask, docDomain, thirdParty, sitekey
  );
  if (result)
    return result;
  if (blacklistHit === null) {
    blacklistHit = this.blacklist._checkEntryMatch(
      substr, location, typeMask, docDomain, thirdParty, sitekey,
      specificOnly
    );
    //这里命中黑名单不直接返回原因是为了确保没有关键字候选命中白名单
  }
}
return blacklistHit;
```

- _checkEntryMatch 过程

```js
_checkEntryMatch(keyword, location, typeMask, docDomain, thirdParty, sitekey, specificOnly) {
          //获取关键字对应的过滤器列表
          let list = this.filterByKeyword.get(keyword);
          if (typeof list == "undefined") { return null; }
          for (let i = 0; i < list.length; i++) {
            let filter = list[i];
            // 属于css拓展规则，而该过滤器匹配通用规则且不在白名单（例外规则过滤器）中，则跳过
            if (specificOnly && filter.isGeneric() &&
              !(filter instanceof WhitelistFilter))
              continue;

            if (filter.matches(location, typeMask, docDomain, thirdParty, sitekey))
              return filter;
          }
          return null;
        },
```

- 过滤器匹配

```js
/**
         * Tests whether the URL matches this filter
         * URL是否匹配该过滤器
         * @param {string} location URL to be tested
         * @param {number} typeMask bitmask of content / request types to match
         * @param {string} [docDomain] domain name of the document that loads the URL
         * @param {boolean} [thirdParty] should be true if the URL is a third-party
         *                               request
         * @param {string} [sitekey] public key provided by the document
         * @return {boolean} true in case of a match
         */
        matches(location, typeMask, docDomain, thirdParty, sitekey) {
          if (this.contentType & typeMask &&
            (this.thirdParty == null || this.thirdParty == thirdParty) &&
            this.isActiveOnDomain(docDomain, sitekey) && this.regexp.test(location)) {
            return true;
          }
          return false;
        }
```

- 关键字添加过滤器过程

> 下载规则库，url分析，初始化

未完待续...