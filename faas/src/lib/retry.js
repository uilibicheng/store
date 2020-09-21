module.exports = function retry(fn, limit = 2, failCallback = () => null) {
  return (...args) => {
    try {
      const result = fn.apply(null, args)
      // 处理 Promise
      if (result instanceof Promise) {
        return result.catch(err => {
          if (limit > 0) {
            limit -= 1
            return retry(fn, limit, failCallback).apply(null, args)
          } else {
            throw err
          }
        })
      }

      return result
    } catch (e) {
      // 处理非 Promise
      if (limit > 0) {
        limit -= 1
        retry(fn, limit, failCallback).apply(null, args)
      } else {
        return typeof failCallback === 'function' ? failCallback(e) : null
      }
    }
  }
}
