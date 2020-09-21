export default class Where {
  /**
   * 查询对象
   * @param {string} relation 联合其它查询的关联关系，支持 and 和 or
   */
  constructor(relation = 'and') {
    this.relation = relation
    this.queryList = []

    const methods = ['eq', 'ne', 'lt', 'lte', 'gt', 'gte', 'in', 'nin', 'isnull', 'contains', 'range']
    methods.forEach(method => {
      this[method] = (key, value) => {
        const queryItem = {}
        queryItem[key] = {[`$${method}`]: value}
        this.queryList.push(queryItem)
        return this
      }
    })
  }

  /**
   * 联合其它查询
   * @param {Where} query
   */
  addQuery(query) {
    this.queryList.push(query)
    return this
  }

  /**
   * 设置联合其它查询的关联关系
   * @param {string} relation
   */
  setRelation(relation = 'and') {
    this.relation = relation
    return this
  }

  export() {
    let query = {}
    if (this.queryList.length > 1) {
      query[`$${this.relation}`] = this.queryList
    } else {
      query = this.queryList[0]
    }
    return query
  }
}
