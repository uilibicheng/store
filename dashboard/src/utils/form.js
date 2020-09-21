export default {
  setRules(params = {}) {
    const {type = 'string', required = true, whitespace = true, message = '请填写必填项'} = params
    return [{...params, required, type, whitespace, message}]
  },

  // 格式化提交数据的字段
  formatFields(data) {
    for (const field in data) {
      // 删除所有双下划线开头的辅助字段
      if (/^__\w.+/.test(field)) delete data[field]
      // 去除所有 string 类型的前后空格
      if (typeof data[field] === 'string') data[field] = data[field].trim()

      if (Object.prototype.toString.call(data[field]) === '[object Object]') {
        for (const key in data[field]) {
          this.formatFields(data[field][key])
        }
      }
    }
  },
}
