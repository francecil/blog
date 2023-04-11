## 前言

需要对 puppeteer api 的执行进行日志打点，尽量不要影响到原始方法执行逻辑

## aop 介绍

面向切面编程

切点、切面、增强

## 实现

3 种方式

### （1）返回一个新的原型方法
```js
xxx.prototype.xxx = aop(xxx.prototype.xxx, {
    before: ()=>{},
    after: ()=>{}
})
```
多个切入点使用一个原型方法，如果有多次 before ，应该在一个 before 方法里处理
```js
// 错误处理
xxx.prototype.xxx = aop(xxx.prototype.xxx, {
    before: ()=>{
    }
})
// 上面的处理会丢失
xxx.prototype.xxx = aop(xxx.prototype.xxx, {
    before: ()=>{
    }
})
// 正确
xxx.prototype.xxx = aop(xxx.prototype.xxx, {
    before: ()=>{
        before1();
        before2();
    }
})
```

缺点：不支持多次配置同类增强


### （2）内部保留上一次原型方法

另一种是无返回值，每次增强后都是一个新的原型对象，内部会保存上一次修改的原型方法。

原型方法调用后，是一个递归调用的过程

```js
aop.before(xxx,'xxxx', function(){

})
aop.after(xxx,'xxxx', function(){
    
})
```

缺点：配置不同类增强时，导致内部调用是一个递归回调的过程


### （3）组合了前两者的优点，内部保留上一次原型方法，支持同时配置多个增强

```js
aop(xxx, 'xxx', {
    before: ()=>{},
    after:()=>{}
})
aop(xxx, 'xxx', {
    before: ()=>{},
})
```

```ts
interface JoinPoint<T> {
    target: T;
    method: Function;
    args: any;
    self: any;
}
interface Options<T> {
    before?: (joinPoint: JoinPoint<T>) => void;
    after?: (joinPoint: JoinPoint<T>, result?: any, error?: Error) => void;
    afterReturn?: (joinPoint: JoinPoint<T>, result: any) => any;
    afterThrow?: (joinPoint: JoinPoint<T>, error: Error) => boolean;
    around?: (joinPoint: JoinPoint<T>, handle: (...args: any) => any) => void;
}


let findPointCut = (target: any, pointCut: string) => {
    if (typeof pointCut === 'string') {
        let func = target.prototype[pointCut];
        // 暂不支持属性的 aop
        if (typeof func === 'function') {
            return func;
        }
    }
    return null;
};

const advice = <T>(target: T, pointCut: string, advice: Options<T>) => {
    let oldPrototypeFunc = findPointCut(target, pointCut);
    if (!oldPrototypeFunc) {
        return;
    }
    (target as any).prototype[pointCut] = function(...args: any) {
        let self = this;
        let joinPoint: JoinPoint<T> = {
            target,
            method: oldPrototypeFunc,
            args,
            self
        };
        let { before, around, after, afterReturn, afterThrow } = advice;
        // 前置增强
        before && before.call(self, joinPoint);

        // 实际执行的函数
        let actual: any = () => {
            return oldPrototypeFunc.apply(self, args);
        };

        // 环绕增强
        let roundHandle;
        if (around) {
            // 使用增强方法替换原型方法
            actual = around;
            roundHandle = (...newArgs: any) => {
                // 若 handle 未传入参数，则采用原来参数
                return oldPrototypeFunc.apply(self, newArgs.length > 0 ? newArgs : args);
            };
        }

        const hasAfterAdvice = after || afterReturn || afterThrow;
        if (!hasAfterAdvice) {
            // 未定义任何后置增强，直接执行原方法
            return actual.call(self, joinPoint, roundHandle);
        }

        let result;
        let error: Error | undefined;
        try {
            result = actual.call(self, joinPoint, roundHandle);
            // 返回增强
            return (afterReturn && afterReturn.call(self, joinPoint, result)) || result;
        } catch (e) {
            error = e;
            // 异常增强，根据返回值看是否拦截异常
            let shouldIntercept = afterThrow && afterThrow.call(self, joinPoint, e);
            if (!shouldIntercept) {
                throw e;
            }
        } finally {
            // 后置增强，不影响返回结果
            after && after.call(self, joinPoint, result, error);
        }
    };
};

function aop<T>(target: T, pointCut: string, options: Options<T>) {
    advice(target, pointCut, options);
}
```

测试demo1
```ts
import { Page } from 'puppeteer';
const { Page } = require('puppeteer/lib/cjs/puppeteer/common/Page');
aop<Page>(Page, 'click', {
    before: ({ target }) => {},
    around:({},handle)=>{

    }
});
```
测试demo2
```ts
class A {
    say(){}
    eat(){}  
    async asyncFunc(){
        return new Promise((resolve)=>{
            console.log('start asyncFunc')
            setTimeout(()=>{
                console.log('end asyncFunc')
                resolve('hh')
            }, 3000)
        })
    }
}
let a = new A()
aop(A, 'say', {
    before:()=>console.log('b1'),
    after:()=>console.log('a1')
})
aop(A, 'asyncFunc', {
    before:()=>console.log('b2'),
    after:(point, result)=>console.log('a2', result)
})
```

## 拓展阅读

https://juejin.cn/post/6844903958301900807#heading-3

https://juejin.cn/post/6844903858649432078#heading-13