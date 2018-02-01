/**
 * TODO :怎么解决data每个属性只监听相关的textNode
 */
var myData = {
  name: 'gahing',
  age: 18
}

let el = null
  ; (function () {
    el = document.createElement('div')
    el.appendChild(document.createTextNode('{{name}}'))
    let docChild = document.createElement('div')
    docChild.appendChild(document.createTextNode('{{age}}'))
    el.appendChild(docChild)
  })()

let target = null //watcher 的临时副本

class Watcher {
  constructor(node, data) {
    this.data = data
    this.node = node;
    this.nodeValue = node.nodeValue //保存原始值 ，虚拟dom的概念？
    target = this
    for (let key in data) {
      data[key]
    }
    target = null
  }
  update() {
    //console.log(this.data)
    let newValue = this.nodeValue.replace(/{{(.*?)}}/g, (exp) => {
      exp = exp.replace(/{{|}}/g, '')
      return new Function(...Object.keys(this.data), `return ${exp}`)(...Object.values(this.data))
    })
    //console.log('newValue:'+newValue)
    this.node.nodeValue = newValue
  }
}
class Dep {
  constructor() {
    this.watchers = []
  }
  pushWatcher(watcher) {
    this.watchers.push(watcher)
  }
  notify() {
    setTimeout(() => {
      this.watchers.map((watcher) => {
        watcher.update()
      })
    }, 0);
  }
}
const bindViewToData = (el, data) => /* TODO */ {
  //console.log(data)
  //data的每个属性绑定了一个dep[] dep数组存的是所有watcher监听器 每个watcher监听了textNode，其中含有>=0个{{}}标签 （可优化 较难
  for (let key in data) {
    defineProxy(data, key, data[key]);
  }
  //模板解析
  resolveTemplet(el, data)
  for (let key in data) {
    data[key] = data[key]
  }

}
function defineProxy(data, key, val) {
  var dep = new Dep()
  Object.defineProperty(data, key, {
    get: function () {
      if (target) {
        dep.pushWatcher(target)
      }
      return val
    },
    set: function (newVal) {
      val = newVal //不能用data[key] 否则会栈溢出
      dep.notify()
    }
  })
}
const resolveTemplet = (el, data) => {
  [...el.childNodes].forEach(child => {
    if (!(child instanceof Text)) {
      resolveTemplet(child, data)
    }
    //这里监听了所有的text节点，应该做一层判断，只监听包含对象属性的文本节点（可优化）
    else new Watcher(child, data)
  })
}
bindViewToData(el, myData)