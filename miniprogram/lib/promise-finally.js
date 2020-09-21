/* eslint no-extend-native: ["error", { "exceptions": ["Promise"] }] */

Promise.prototype.finally = function finallyPolyfill(callback) {
  const constructor = this.constructor

  return this.then(
    value => constructor.resolve(callback()).then(() => value),
    reason =>
      constructor.resolve(callback()).then(() => {
        throw reason
      })
  )
}
