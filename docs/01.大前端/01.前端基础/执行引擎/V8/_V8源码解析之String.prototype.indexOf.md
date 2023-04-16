---
title: V8源码解析之String.prototype.indexOf
date: 2020/03/24 00:00:00
categories: 大前端
tags: 
  - ECMAScript
  - V8
permalink: /pages/8c69ac/
titleTag: 草稿
---

## 前言

我们经常利用 `"abstbsb".indexOf("sb")` 去检测目标串是否存在模式串

那么你知道内部算法用的是什么吗？效率又是如何呢？

本文将从规范入手，，
<!--more-->

## 使用

MDN https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/indexOf

## 规范定义

我们先看规范

ECMAScript 2015中的定义:<a href="https://www.ecma-international.org/ecma-262/6.0/#sec-string.prototype.indexof"> String.prototype.indexOf</a>

## v8 源码实现

https://github.com/v8/v8/blob/master/src/strings/string-search.h

1. 参数检查

```js
Object* String::IndexOf(Isolate* isolate, Handle<Object> receiver,
                        Handle<Object> search, Handle<Object> position) {
  if (receiver->IsNullOrUndefined(isolate)) {
    THROW_NEW_ERROR_RETURN_FAILURE(
        isolate, NewTypeError(MessageTemplate::kCalledOnNullOrUndefined,
                              isolate->factory()->NewStringFromAsciiChecked(
                                  "String.prototype.indexOf")));
  }
  Handle<String> receiver_string;
  ASSIGN_RETURN_FAILURE_ON_EXCEPTION(isolate, receiver_string,
                                     Object::ToString(isolate, receiver));

  Handle<String> search_string;
  ASSIGN_RETURN_FAILURE_ON_EXCEPTION(isolate, search_string,
                                     Object::ToString(isolate, search));

  ASSIGN_RETURN_FAILURE_ON_EXCEPTION(isolate, position,
                                     Object::ToInteger(isolate, position));

  uint32_t index = receiver_string->ToValidIndex(*position);
  return Smi::FromInt(
      String::IndexOf(isolate, receiver_string, search_string, index));
}
```
2. 确定字符编码对应的查找方法

```js
int String::IndexOf(Isolate* isolate, Handle<String> receiver,
                    Handle<String> search, int start_index) {
  DCHECK_LE(0, start_index);
  DCHECK(start_index <= receiver->length());

  uint32_t search_length = search->length();
  if (search_length == 0) return start_index;

  uint32_t receiver_length = receiver->length();
  if (start_index + search_length > receiver_length) return -1;

  receiver = String::Flatten(isolate, receiver);
  search = String::Flatten(isolate, search);

  // 不开gc vectors保持有效
  DisallowHeapAllocation no_gc;  // ensure vectors stay valid
  // Extract flattened substrings of cons strings before getting encoding.
  // 获取扁平字串？
  String::FlatContent receiver_content = receiver->GetFlatContent();
  String::FlatContent search_content = search->GetFlatContent();

  // dispatch on type of strings
  // 根据字符串编码类型
  if (search_content.IsOneByte()) {
    Vector<const uint8_t> pat_vector = search_content.ToOneByteVector();
    return SearchString<const uint8_t>(isolate, receiver_content, pat_vector,
                                       start_index);
  }
  Vector<const uc16> pat_vector = search_content.ToUC16Vector();
  return SearchString<const uc16>(isolate, receiver_content, pat_vector,
                                  start_index);
}
```

我们进到`src/string-search.h`中来，

```js
template <typename SubjectChar, typename PatternChar>
int SearchString(Isolate* isolate,
                 Vector<const SubjectChar> subject,
                 Vector<const PatternChar> pattern,
                 int start_index) {
  StringSearch<PatternChar, SubjectChar> search(isolate, pattern);
  return search.Search(subject, start_index);
}
```

里面定义了几种搜索算法

1. LinearSearch
2. BoyerMooreSearch
3. BoyerMooreHorspoolSearch
4. InitialSearch
5. SingleCharSearch

具体使用哪种，是由初始化StringSearch时定义的
```js
StringSearch(Isolate* isolate, Vector<const PatternChar> pattern)
      : isolate_(isolate),
        pattern_(pattern),
        start_(Max(0, pattern.length() - kBMMaxShift)) {
    if (sizeof(PatternChar) > sizeof(SubjectChar)) {
      if (!IsOneByteString(pattern_)) {
        strategy_ = &FailSearch;
        return;
      }
    }
    int pattern_length = pattern_.length();
    if (pattern_length < kBMMinPatternLength) {
      if (pattern_length == 1) {
        strategy_ = &SingleCharSearch;
        return;
      }
      strategy_ = &LinearSearch;
      return;
    }
    strategy_ = &InitialSearch;
  }

  int Search(Vector<const SubjectChar> subject, int index) {
    return strategy_(this, subject, index);
  }
```

有空再介绍里面每种算法..
