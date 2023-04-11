//单例基础实现
var Singleton = (function(){
  let instance
  let init = function(fn){
    const one = new fn()
    return one
  }
  return {
    getInstance:function(fn){
      return instance||(instance=init(fn))
    }
  }
})()
Singleton.getInstance()===Singleton.getInstance()