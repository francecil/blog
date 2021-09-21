

# Jest

https://jestjs.io/docs/zh-Hans/22.x/cli

## 清除模块缓存，每次 require 都重新创建

一般用来测试导出模块是否为单例，存在全局，命中缓存
```js
const ExtensionBridge1 = require(pkg).default;
jest.resetModules();
const ExtensionBridge2 = require(pkg).default;
expect(ExtensionBridge1).toStrictEqual(ExtensionBridge2)
```

试了 `delete require.cache[require.resolve(module)];` 貌似不可行，需要分享下 resetModule 的原理

### resetModules 原理解析

## toBe toEqual toStrictEqual 的区别