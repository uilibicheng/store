import {BAAS_SCHEMA_ID} from '../config/constants'

const getTableObject = () => new wx.BaaS.TableObject(BAAS_SCHEMA_ID.article)

export default {
  getIndexWiki(offset) {
    const query = new wx.BaaS.Query()
    query.in('type', ['outfit', 'product'])
    query.compare('active', '=', true)
    query.compare('is_recommend', '=', true)
    return getTableObject()
      .setQuery(query)
      .offset(offset)
      .orderBy('-created_at')
      .find()
  },

  getArticleCategory(type) {
    const getTable = () => new wx.BaaS.TableObject(BAAS_SCHEMA_ID.article_category)
    const query = new wx.BaaS.Query()
    query.compare('type', '=', type)
    query.compare('active', '=', true)
    return getTable()
      .setQuery(query)
      .limit(1000)
      .orderBy('-created_at')
      .find()
  },

  getArticleList(params) {
    const {limit = 20, offset = 0, type, category} = params
    const query = new wx.BaaS.Query()
    query.compare('type', '=', type)
    query.compare('active', '=', true)
    if (category && category.length > 0) {
      query.arrayContains('category', category)
    }
    return getTableObject()
      .setQuery(query)
      .offset(offset)
      .limit(limit)
      .orderBy('-created_at')
      .find()
  },

}
