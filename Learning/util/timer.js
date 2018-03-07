/**
 *
 * 仿android定时器
 *
 * @export
 */
var Timer = function Timer () {
  this.timer = null
}
/**
 * delay:延时执行时间 默认值：0,参数异常时赋值0
 * period:周期执行时间 为空或参数异常时则只执行一次
 * 单位：ms
 */
Timer.prototype.schedule = function (func, delay = 0, period) {
  this.cancel()
  // exam:undefined,null,'imstr',0.2
  if (!delay || typeof delay !== 'number' || parseInt(delay) <= 0) {
    delay = 0
  }
  delay = parseInt(delay)
  if (!period || typeof period !== 'number' || parseInt(period) <= 0) {
    // 单次计时
    period = parseInt(period)
    this.timer = window.setTimeout(func, delay)
  } else {
    // 定时计时
    period = parseInt(period)
    if (delay === period) {
      this.timer = window.setInterval(func, period)
    } else {
      this.timer = window.setTimeout(() => {
        // 立即执行一次func
        func()
        this.timer = window.setInterval(func, period)
      }, delay)
    }
  }
}
Timer.prototype.cancel = function () {
  if (this.timer === null) return
  try {
    window.clearInterval(this.timer)
  } catch (error) {
    console.error(error)
  } finally {
    this.timer = null
  }
}
export default Timer
