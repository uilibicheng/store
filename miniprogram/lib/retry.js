export default function retry(fn, limit = 2, failCallback = () => null) {
  return (...args) => {
    try {
      return fn.apply(null, args)
    } catch (e) {
      if (limit > 0) {
        limit -= 1
        retry(fn, limit, failCallback).apply(null, args)
      } else {
        typeof failCallback === 'function' && failCallback()
        return null
      }
    }
  }
}
