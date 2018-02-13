//单例基础实现
var Singleton = (function(){
  let instance
  let init = function(name){
    return {
      name:name
    }
  }
  return {
    getInstance:function(name){
      return instance||(instance=init(name))
    }
  }
})()
Singleton.getInstance()===Singleton.getInstance()