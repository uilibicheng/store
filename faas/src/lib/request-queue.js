const CONCURRENCE_LIMIT = 5
const queue = []
let count = 0

const wait = callback => new Promise(resolve => queue.push(resolve)).then(callback)

const release = () => {
  if (count > 0) count -= 1 // 释放一个请求
  // 调用队列中的请求
  if (queue.length > 0) {
    queue.shift()()
  }
}

function push(request) {
  if (count < CONCURRENCE_LIMIT) {
    count += 1 // 占用一个请求
    return request().then(next, next)
  } else {
    return wait(() => push(request))
  }
}

/**
 * 释放请求并返回结果
 */
function next(res) {
  release()
  return res
}

/**
 * 工具函数，fn 请求方法加入到请求队列中，fn 的返回值必须是 Promise
 */
function hoc(fn) {
  return (...args) => push(() => fn.apply(null, args))
}

module.exports = {push, hoc}
