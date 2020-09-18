module.exports = function round(num, count) {
  if (isNaN(num) || isNaN(count) || count << 0 !== count) {
    throw new Error('参数错误')
  }
  const numStr = num.toFixed(count)
  if (/\.00$/.test(numStr)) {
    return parseInt(numStr)
  } else {
    return parseFloat(numStr)
  }
}
