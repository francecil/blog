function EventEmitter() {
  this.events = {}
}
EventEmitter.prototype.on = function (eventName, callback) {
  this.events[eventName] = this.events[eventName] || []
  this.events[eventName].push(callback)
}
EventEmitter.prototype.off = function (eventName, callback) {
  for (var i = 0, len = this.events[eventName].length; i < len; i++) {
    if (this.events[eventName][i] === callback) {
      this.events[eventName].splice(i, 1);
    }
  }
}
Node.prototype.emit = function (eventName, _) {
  var events = this.events[eventName]
  var args = Array.prototype.slice.call(arguments, 1)

  if (!events) {
    return
  }
  for (var i = 0, m = events.length; i < m; i++) {
    events[i].apply(null, args)
  }
}