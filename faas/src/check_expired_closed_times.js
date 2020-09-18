const constants = require('./constants')
const moment = require('moment-timezone')
const settingTableId = constants.BAAS_TABLE_ID.settings
const SettingTable = new BaaS.TableObject(settingTableId)

// 闭园日期
function getClosedTimesSetting() {
  const query = new BaaS.Query()
  query.compare('label', '=', 'default')
  return SettingTable.limit(1)
    .offset(0)
    .setQuery(query)
    .find()
    .then(res => {
      return res.data.objects[0] || []
    })
    .catch(err => {
      console.log('获取闭园日期出错')
      throw err
    })
}

function updateClosedTimesSetting(array, id = '') {
  const settingRecord = SettingTable.getWithoutData(id)
  const now = moment.tz(constants.TIMEZONE).unix()
  const index = array.findIndex(item => {
    return item > now
  })
  array.splice(0, index)
  settingRecord.set({
    closed_times: array
  })
  return settingRecord.update()
}

module.exports = async function(event, callback) {
  try {
    let closedTimesSetting = await getClosedTimesSetting()
    let {id, closed_times} = closedTimesSetting

    updateClosedTimesSetting(closed_times, id)
      .then(res => {
        if (res.status === 200) {
          callback(null, {status: 'success', message: '更新日期成功'})
        } else {
          throw new Error('更新日期失败')
        }
      })
      .catch(err => {
        callback(err)
      })
  } catch (err) {
    callback(err)
  }
}