/**
 * 将date对象按fmt格式输出字符串
 * 
 * @param {any} date 
 * @param {string} [fmt='yyyy/MM/dd hh:mm:ss-S'] 
 * @returns 
 */
function format(date, fmt = 'yyyy/MM/dd hh:mm:ss-S') {
  var o = {
    "M+": date.getMonth() + 1, //月份 
    "d+": date.getDate(), //日 
    "h+": date.getHours(), //小时 
    "m+": date.getMinutes(), //分 
    "s+": date.getSeconds(), //秒 
    "q+": Math.floor(date.getMonth() / 3) + 1, //季度 
    "S": date.getMilliseconds() //毫秒 
  };
  /(y+)/.test(fmt) && (fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length)))
  for (var k in o) {
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  }
  return fmt;
}

/**
 * 简单计时器，精度低
 * 
 */
function Count() {
  let startTime = 0
  let lastStartTime = 0
  Count.prototype.start = function () {
    startTime = Date.now()
    lastStartTime = startTime
  }
  /**
   * 获取与start调用之间的时间间隔
   */
  Count.prototype.stop = function () {
    lastStartTime = Date.now()
    return startTime ? lastStartTime - startTime : 0
  }
  /**
   * 获取距离上一次方法调用的时间间隔
   */
  Count.prototype.getLastInterval = function () {
    let dn = Date.now()
    let result = lastStartTime ? dn - lastStartTime : 0
    lastStartTime = dn
    return result
  }
}

export {
  format, Count
}