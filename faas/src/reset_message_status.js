// 重置所有定时消息的发送状态为 未发送
const {BAAS_TABLE_ID, MESSAGE_STATUS} = require('./constants')
const getMessageTableObject = () => new BaaS.TableObject(BAAS_TABLE_ID.message)

function getTimingMessageList() {
  const query = new BaaS.Query()
  query.compare('type', '=', 'timing')
  query.compare('is_active', '=', true)
  return getMessageTableObject()
    .setQuery(query)
    .find()
    .then(res => res.data.objects)
}

function resetMessage(messageId) {
  const message = getMessageTableObject().getWithoutData(messageId)
  message.set({
    status: MESSAGE_STATUS.UNSENT,
  })
  message.unset('sending_time')
  return message.update()
}

module.exports = async function(event, callback) {
  try {
    const messageList = await getTimingMessageList()
    console.log(messageList)
    for (let i = 0; i < messageList.length; i++) {
      await resetMessage(messageList[i].id)
    }
    callback(null)
  } catch (err) {
    callback(err)
  }
}