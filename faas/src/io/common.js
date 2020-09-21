const {ACCESS_TOKEN_RECORD_ID} = require('../config')
const io = require('./base')

module.exports = {
  getCurrentActivity() {
    const query = io.query
    const now = Math.floor(Date.now() / 1000)
    query.compare('starts_at', '<=', now)
    query.compare('ends_at', '>', now)

    return io.activity
      .setQuery(query)
      .orderBy('-ends_at')
      .find()
      .then(res => {
        const {objects = []} = res.data
        return objects[0]
      })
  },

  getUserByUnionid(unionid) {
    const query = io.query
    query.compare('unionid', '=', unionid)
    return io.userprofile
      .setQuery(query)
      .find()
      .then(res => {
        const {objects = []} = res.data
        return objects[0]
      })
  },

  getActivityUser(activityId, unionid) {
    const query = io.query
    query.compare('activity_id', '=', activityId)
    query.compare('unionid', '=', unionid)

    return io.activityUser
      .setQuery(query)
      .expand(['created_by', 'inviter'])
      .find()
      .then(res => {
        const {objects = []} = res.data
        return objects[0]
      })
  },

  getAccessToken() {
    return io.accessToken.get(ACCESS_TOKEN_RECORD_ID).then(res => {
      console.log('getAccessToken', res.data)
      return res.data
    })
  },

  createExportTask() {
    return io.exportTask
      .create()
      .set({download_link: ''})
      .save()
      .then(res => res.data.id)
  },

  updateExportTask(id, data = {}) {
    const record = io.exportTask.getWithoutData(id)
    for (const key in data) {
      record.set(key, data[key])
    }
    return record.update()
  },
}
