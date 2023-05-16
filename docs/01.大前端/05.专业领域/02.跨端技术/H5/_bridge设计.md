---
title: bridge设计
date: 2022-07-03 15:06:57
permalink: /pages/aa7ebf/
categories: 
  - 大前端
  - 专业领域
  - 跨端技术
  - H5
tags: 
  - 
titleTag: 草稿
---

## 需求

- 支持插件
- 类型提示完善且正确

## 代码
主要模块
```ts
import Debug from 'debug';
import promiseCallback, {
  CallbackWithPromise,
} from '../utils/promise-callback';
import { callNative, pushEventQueue } from './call-native';
import NetworkEventManager from './EventManager';
import BridgePlugin, { IBridgePlugin } from './plugins/plugin';
import Request, { TriggerRequest } from './Request';
import Response from './Response';

const debug = Debug('base-bridge');
/**
 * 客户端像服务端传递的结果
 */
export interface Result {
  code: number; // 状态码
  msg?: string; // 错误原因，如有
  data?: any; // 可选，抛出异常时可能没有 data 值
}

export interface CallbackResponse {
  result: Result;
  /** 端能力回调的关联 id ，前端透传给 native */
  callbackId: string;
}

export interface EventResponse {
  result: Result;
  /** 监听的客户端事件 */
  event: string;
}

export type CallbackMapValue =
  | BridgeCallback
  | CallbackWithPromise
  | Array<BridgeCallback>;

export type BridgeCallback = (result: Result) => void;

export class Bridge {
  _networkEventManager: NetworkEventManager;

  private _plugins: IBridgePlugin[] = [];

  constructor() {
    this._networkEventManager = new NetworkEventManager();
  }

  /**
   * 处理端能力回调
   * @param res
   * @returns
   */
  async _handleCallbackFromNative(res: CallbackResponse) {
    const { callbackId, result } = res;

    const requestResult = this._networkEventManager.getRequest(callbackId);
    if (!requestResult) {
      return;
    }
    const { request, callback } = requestResult;
    const response = new Response(this, request, result);
    request._response = response;
    await this.callPlugins('afterCall', response);

    // call 处理
    this._networkEventManager.forgetEvent(callbackId);
    (callback as BridgeCallback)(response.result);
  }

  /**
   * 处理事件监听的回调
   * @param res
   * @returns
   */
  async _handleEventFromNative(
    res: EventResponse,
    triggerRequest?: TriggerRequest,
  ) {
    const { event } = res;
    let { result } = res;
    result = await this.callPluginsWithValue(
      'on',
      result,
      event,
      triggerRequest,
    );
    const handlers = this._networkEventManager.getEventListeners(event);
    if (!handlers) {
      return;
    }
    handlers.forEach(handler => {
      handler(result);
    });
  }

  call(event: string, params?: any): Promise<Result>;
  call(event: string, params: any, handler: BridgeCallback): void;
  /**
   * web: 主动调用
   * @param event
   * @param params
   * @param callback
   */
  // eslint-disable-next-line consistent-return
  async call(event: string, params?: any, callback?: BridgeCallback) {
    const res = await this.callPluginsWithValue('beforeCall', {
      params,
      event,
    });
    // eslint-disable-next-line no-param-reassign
    params = res.params ?? params;
    // eslint-disable-next-line no-param-reassign
    event = res.event ?? event;

    // 若传递 callback 参数，则不使用 promise
    const usePromise = !callback;
    let handler: CallbackMapValue;
    if (usePromise) {
      handler = promiseCallback();
    } else {
      handler = callback;
    }

    const request = new Request(this, event, params);
    const { requestId } = request;
    this._networkEventManager.storeRequest(requestId, request, handler);

    await this.callPlugins('call', request);

    // 若未被拦截，继续调用端能力
    if (!request.isIntercepted) {
      callNative(request.event, {
        callbackId: requestId,
        params: request.params,
      });
    }

    if (usePromise) {
      return (handler as CallbackWithPromise).promise;
    }
  }

  /**
   * 自定义事件和回调
   * @param {string} event Event name.
   * @param {Function} listener
   */
  on(event: string, listener: BridgeCallback) {
    this._networkEventManager.storeEvent(event, listener);
    return this;
  }

  /**
   * 和on相对，解除注册
   * @param {string} event Event name.
   * @param {Function} listener
   */
  off(event: string, listener?: BridgeCallback) {
    this._networkEventManager.forgetEvent(event, listener);
    return this;
  }

  /**
   * @param {string} event
   * @param {Object} params
   */
  async trigger(event: string, result: Result) {
    const res = await this.callPluginsWithValue('beforeTrigger', {
      result,
      event,
    });
    // eslint-disable-next-line no-param-reassign
    result = res.result ?? result;
    // eslint-disable-next-line no-param-reassign
    event = res.event ?? event;

    const triggerRequest = new TriggerRequest(this, event, result);

    await this.callPlugins('trigger', triggerRequest);

    if (!triggerRequest.isTriggerUseLocal) {
      // 未进行本地转发，则将事件推送至客户端处理
      pushEventQueue(event, result);
    }
  }

  use(plugin: BridgePlugin) {
    if (typeof plugin !== 'object' || !plugin._isBridgePlugin) {
      console.error(
        `Warning: Plugin is not derived from BridgePlugin, ignoring.`,
        plugin,
      );
      return this;
    }
    if (!plugin.name) {
      console.error(
        `Warning: Plugin with no name registering, ignoring.`,
        plugin,
      );
      return this;
    }
    this._plugins.push(plugin);
    debug('plugin registered', plugin.name);
    return this;
  }

  eject(plugin: BridgePlugin) {
    const index = this._plugins.findIndex(p => p === plugin);
    if (index === -1) {
      debug('plugin not found', plugin.name);
    } else {
      debug('plugin eject', plugin.name);
      this._plugins.splice(index, 1);
    }
    return this;
  }

  /**
   * Call plugins sequentially with the same values.
   * Plugins that expose the supplied property will be called.
   *
   * @param prop - The plugin property to call
   * @param values - Any number of values
   * @private
   */
  private async callPlugins(prop: string, ...values: any[]) {
    for (const plugin of this.getPluginsByProp(prop)) {
      await plugin[prop](...values);
    }
  }

  private async callPluginsWithValue(
    prop: string,
    value: any,
    ...extra: any[]
  ) {
    for (const plugin of this.getPluginsByProp(prop)) {
      const newValue = await plugin[prop](value, ...extra);
      if (newValue) {
        // eslint-disable-next-line no-param-reassign
        value = newValue;
      }
    }
    return value;
  }

  /**
   * Get all plugins that feature a given property/class method.
   *
   * @private
   */
  private getPluginsByProp(prop: string): IBridgePlugin[] {
    return this._plugins.filter(plugin => prop in plugin);
  }
}

```
导出模块
```ts
import Debug from 'debug';
import { Bridge } from './BaseBridge';

// const prefix = `d.`;

// const BridgeEvent = {
//   getAppInfo: `${prefix}getAppInfo`,
//   getUserInfo: `${prefix}getUserInfo`,
// };
// const as = Object.keys(BridgeEvent);
const debug = Debug('core');

export type IBridge = Pick<
  Bridge,
  'call' | 'on' | 'off' | 'trigger' | 'use' | 'eject'
>;

function singleton(): IBridge {
  if (typeof window !== 'undefined' && window.JSBridge) {
    debug('hit cache');
    return window.JSBridge;
  }
  const bridge = new Bridge();

  const singletonBridge: IBridge = {
    call: bridge.call.bind(bridge),
    on: bridge.on.bind(bridge),
    off: bridge.off.bind(bridge),
    trigger: bridge.trigger.bind(bridge),
    use: bridge.use.bind(bridge),
    eject: bridge.eject.bind(bridge),
  };

  debug('create');

  window.JSBridge = singletonBridge;

  window.JSBridge._handleCallbackFromNative =
    bridge._handleCallbackFromNative.bind(bridge);
  window.JSBridge._handleEventFromNative =
    bridge._handleEventFromNative.bind(bridge);
  return singletonBridge;
}
const bridge = singleton();

export default bridge;
```