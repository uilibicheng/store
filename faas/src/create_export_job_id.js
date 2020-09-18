const constants = require('./constants')
const {BAAS_TABLE_ID, CLOUD_FUNCTION_NAME} = constants

function getTotalCount(tableId) {
  let Schame = new BaaS.TableObject(tableId)

  return Schame.count().then(
    num => {
      return num
    },
    err => {
      console.log('获取数据总数失败:', err)
      throw err
    }
  )
}

function createRecord(tableId, count) {
  let Schame = new BaaS.TableObject(tableId)
  let schame = Schame.create()
  schame.set('job_id', ++count)
  return schame.save()
}

module.exports = async function(event, callback) {
  const params = event.data
  const count = await getTotalCount(BAAS_TABLE_ID.export_task)
  createRecord(BAAS_TABLE_ID.export_task, count)
    .then(res => {
      BaaS.invoke(CLOUD_FUNCTION_NAME.EXPORT_DATA, {...params, jobId: res.data.id}, false)
        .then(() => {
          callback(null, {
            message: 'success',
            jobId: res.data.id,
          })
        })
        .catch(err => {
          console.log(`调用云函数 ${CLOUD_FUNCTION_NAME.EXPORT_DATA} 失败:`, err)
          callback(err)
        })
    })
    .catch(err => {
      console.log('创建 job_id 记录失败:', err)
      callback(err)
    })
}
