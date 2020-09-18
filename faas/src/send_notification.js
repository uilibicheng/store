const moment = require('moment-timezone')

// 发送模版消息，发送对象为 lastLogin 时间在一天之内的用户，发送完成之后更新 status 为已发送 / 发送失败
const {BAAS_TABLE_ID, MESSAGE_STATUS, MESSAGE_TEMPLATE_ID} = require('./constants')
const {getDatabaseTimeStamp} = require('./utils/time')
const {messageCanSend} = require('./utils/message')
const getNotificationTableObject = () => new BaaS.TableObject(BAAS_TABLE_ID.notification)
const getUserProfileTableObject = () => new BaaS.User()
const ONE_DAY = 24 * 60 * 60 * 1000

function getNotificationById(notificationId) {
  return getNotificationTableObject()
    .get(notificationId)
    .then(res => res.data)
}

function updateNotificationStatus(notificationId, status) {
  const message = getNotificationTableObject().getWithoutData(notificationId)
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
  query.compare('last_login', '>=', getDatabaseTimeStamp(new Date().getTime() - ONE_DAY))
  return getUserProfileTableObject()
    .setQuery(query)
    .find()
    .then(res => res.data.objects)
}

async function sendNotification({title, content, time, userList}) {
  return BaaS.wechat.sendSubscribeMessage({
    recipient_type: 'user_list',
    user_list: userList,
    template_id: 'qKPC7qAEjFcUBOBfWv8bkCPITPEUjpXVABe-_pqu7Dk',
    page: 'pages/index/index',
    can_send_subscription_message: true,
    keywords: {
      thing1: {
        value: title,
      },
      date2: {
        value: time,
      },
      thing3: {
        value: content,
      },
    },
  })
}

module.exports = async function(event, callback) {
  const {notificationId} = event.data
  console.log('notificationId:', notificationId)
  try {
    let message = await getNotificationById(notificationId)
    if (messageCanSend(message)) {
      try {
        await updateNotificationStatus(notificationId, MESSAGE_STATUS.SENDING)
        const userList = await getUserList()
        await sendNotification({
          title: message.title,
          content: message.content,
          time: moment.unix(message.updated_at).format('YYYY.MM.DD HH:mm:ss'),
          userList: userList.map(item => item.id),
        })
        await updateNotificationStatus(notificationId, MESSAGE_STATUS.SENT)
        callback(null, message)
      } catch (err) {
        await updateNotificationStatus(notificationId, MESSAGE_STATUS.FAIL)
        callback(err)
      }
    } else {
      callback('message can not send')
    }
  } catch (err) {
    callback(err)
  }
}
