// 检查 message 表，有符合发送条件的消息则调用 send_message 发送
const {BAAS_TABLE_ID, MESSAGE_STATUS, HOURS_OFFSET_BEIJING, CLOUD_FUNCTION_NAME, MESSAGE_TEMPLATE_ID} = require('./constants')
const {messageCanSend} = require('./utils/message')
const getMessageTableObject = () => new BaaS.TableObject(BAAS_TABLE_ID.message)

module.exports = async function(event, callback) {
  try {
    const messageList = await getCanSendMessageList()
    if (messageList.length > 0) {
      await sendMessageList(messageList)
      callback(null, 'sending finished')
    } else {
      callback(null, 'not massage waiting for sending')
    }
  } catch (err) {
    console.log(err)
    callback(err)
  }
}

function getCanSendMessageList() {
  const currentTime = new Date()
  const currentHours = currentTime.getHours() + HOURS_OFFSET_BEIJING
  const currentMinutes = currentTime.getMinutes()
  const query = new BaaS.Query()
  query.compare('is_active', '=', true)
  query.compare('type', '=', 'timing')
  // orQuery1: status = unsent or fail
  const query1 = new BaaS.Query()
  query1.compare('status', '=', MESSAGE_STATUS.UNSENT)
  const query2 = new BaaS.Query()
  query2.compare('status', '=', MESSAGE_STATUS.FAIL)
  const orQuery1 = BaaS.Query.or(query1, query2)
  // orQuery2: timing_hours < currentHours or (timing_hours === currentHours && timing_minutes <= currentMinutes)
  const query3 = new BaaS.Query()
  query3.compare('timing_hours', '<', currentHours)
  const query4 = new BaaS.Query()
  query4.compare('timing_hours', '=', currentHours)
  query4.compare('timing_minutes', '<=', currentMinutes)
  const orQuery2 = BaaS.Query.or(query3, query4)
  return getMessageTableObject()
    .setQuery(BaaS.Query.and(query, orQuery1, orQuery2))
    .find()
    .then(res => res.data.objects)
}

async function sendMessageList(messageList) {
  for (let i = 0; i < messageList.length; i++) {
    const message = messageList[i]
    if (messageCanSend(message)) {
      console.log('wainting for sending:', message.title)
      await BaaS.invoke(CLOUD_FUNCTION_NAME.SEND_MESSAGE, {messageId: message.id, templateId: MESSAGE_TEMPLATE_ID}, false)
    }
  }
}
