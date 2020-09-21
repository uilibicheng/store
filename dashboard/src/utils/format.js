export default {
  /**
   * 把错误的数据转正 strip(0.09999999999999998)=0.1
   * @param {Number} num 目标数字
   * @param {Number} precision 精度值，默认12
   */
  fixPrecision(num, precision = 12) {
    if (typeof num !== 'number') return 0
    return +parseFloat(num.toPrecision(precision))
  },

  camelCaseTo_(name) {
    return name.replace(/([A-Z])/g, '_$1').toLowerCase()
  },

  _ToCamelCase(name) {
    return name.replace(/_(\w)/g, (match, letter) => letter.toUpperCase())
  },
}
