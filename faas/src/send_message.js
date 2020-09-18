// 发送模版消息，发送对象为 lastLogin 时间在一小时之内的用户，发送完成之后更新 status 为已发送 / 发送失败
const {BAAS_TABLE_ID, MESSAGE_STATUS, MESSAGE_TEMPLATE_ID} = require('./constants')
const {getDatabaseTimeStamp} = require('./utils/time')
const {messageCanSend} = require('./utils/message')
const getMessageTableObject = () => new BaaS.TableObject(BAAS_TABLE_ID.message)
const getUserProfileTableObject = () => new BaaS.User()
const ONE_HOUR = 60 * 60 * 1000

function getMessageById(messageId) {
  return getMessageTableObject()
    .get(messageId)
    .then(res => res.data)
}

function updateMessageStatus(messageId, status) {
  const message = getMessageTableObject().getWithoutData(messageId)
  let data = {
    status,
  }
  if (status === MESSAGE_STATUS.SENT || status === MESSAGE_STATUS.FAIL) {
    data['sending_time'] = getDatabaseTimeStamp(new Date())
  }
  return message.set(data).update()
}

function getUserList() {
  const query = new BaaS.Query()
  query.compare('last_login', '>=', getDatabaseTimeStamp(new Date().getTime() - ONE_HOUR))
  return getUserProfileTableObject()
    .setQuery(query)
    .find()
    .then(res => res.data.objects)
}

async function send({title, content, userList}) {
  return BaaS.wechat.sendSubscribeMessage({
    recipient_type: 'user_list',
    user_list: userList,
    template_id: MESSAGE_TEMPLATE_ID,
    page: 'pages/index/index',
    can_send_subscription_message: true,
    keywords: {
      thing1: {
        value: title,
      },
      thing2: {
        value: content,
      },
    },
  })
}

module.exports = async function(event, callback) {
  const {messageId} = event.data
  console.log('messageId:', messageId)
  try {
    let message = await getMessageById(messageId)
    if (messageCanSend(message)) {
      try {
        await updateMessageStatus(messageId, MESSAGE_STATUS.SENDING)
        const userList = await getUserList()
        await send({
          title: message.title,
          content: message.content,
          userList: userList.map(item => item.id),
        })
        await updateMessageStatus(messageId, MESSAGE_STATUS.SENT)
        callback(null, message)
      } catch (err) {
        await updateMessageStatus(messageId, MESSAGE_STATUS.FAIL)
        callback(err)
      }
    } else {
      callback(Error('message can not send'))
    }
  } catch (err) {
    callback(err)
  }
}
