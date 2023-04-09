

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

- toBe 使用 Object.is 进行比较；基础类型需要值相同，引用类型需要引用相同；相比 === 对数值类型做了一些处理

- toEqual 递归比较（深比较）

- toStrictEqual 对象结构相同比较，不考虑值是否相同

demo：
```js
const can1 = {
  flavor: 'grapefruit',
  ounces: 12,
};
const can2 = {
  flavor: 'grapefruit',
  ounces: 12,
};

describe('the La Croix cans on my desk', () => {
  test('have all the same properties', () => {
    expect(can1).toEqual(can2);
  });
  test('are not the exact same can', () => {
    expect(can1).not.toBe(can2);
  });
});
```