---
title: useEffect 如何处理 async
date: 2020-08-26 15:12:40
categories: 大前端
tags: 
  - React
---

## 背景

```
Argument of type '() => Promise<void>' is not assignable to parameter of type 'EffectCallback'.
```

<!-- more -->

## 不需要返回值的情况

```js
const MyFunctionnalComponent: React.FC = props => {
  useEffect(() => {
    // Create an scoped async function in the hook
    async function anyNameFunction() {
      await loadContent();
    }
    // Execute the created function directly
    anyNameFunction();
  }, []);
return <div></div>;
};
```

or iife

```js
const MyFunctionnalComponent: React.FC = props => {
  useEffect(() => {
    // Using an IIFE
    (async function anyNameFunction() {
      await loadContent();
    })();
  }, []);
  return <div></div>;
};
```

## 如果有返回值的情况

```js
const MyFunctionnalComponent: React.FC = props => {
  const tmp = useRef(null)
  useEffect(() => {
    // Using an IIFE
    (async function anyNameFunction() {
      tmp.current = await loadContent();
    })();
    return {
        if(tmp.current){
            console.log(tmp.current)
        }
    }
  }, []);
  return <div></div>;
};
```

## 参考文献

- [How to use async function in React hooks useEffect (Typescript/JS)?](https://medium.com/javascript-in-plain-english/how-to-use-async-function-in-react-hook-useeffect-typescript-js-6204a788a435)
