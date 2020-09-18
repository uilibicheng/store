const {MESSAGE_STATUS, HOURS_OFFSET_BEIJING} = require('../constants')

function messageCanSend(message) {
  if (
    message.type === 'timing' &&
    message.is_active &&
    (message.status === MESSAGE_STATUS.UNSENT || message.status === MESSAGE_STATUS.FAIL)
  ) {
    // 条件1: 是否属于定时任务，且状态符合发送条件
    console.log('条件1: 属于定时任务，且状态符合发送条件')
    const currentTime = new Date()
    const hours = currentTime.getHours() + HOURS_OFFSET_BEIJING // 日本属于东九区
    const minute = currentTime.getMinutes()
    if (hours > message.timing_hours || (hours === message.timing_hours && minute >= message.timing_minutes)) {
      // 条件2: 当前时间是否大于定时时间
      console.log('条件2: 当前时间大于定时时间')
      const updatedDate = new Date(message.updated_at * 1000)
      const updatedHours = updatedDate.getHours() + HOURS_OFFSET_BEIJING === 24 ? 0 :updatedDate.getHours() + HOURS_OFFSET_BEIJING
      const updateMinutes = updatedDate.getMinutes()
      console.log('message',message)
      console.log('updatedHours',updatedHours, updateMinutes)
      if (
        updatedHours < message.timing_hours ||
        (updatedHours === message.timing_hours && updateMinutes <= message.timing_minutes)
      ) {
        // 定时时间要大于更新时间，否则设置的是明天的定时任务
        console.log('条件3:定时时间要大于更新时间，否则设置的是明天的定时任务')
        return true
      } else {
        return false
      }
    } else {
      return false
    }
  } else if (message.type === 'immediate') {
    return true
  }
  return false
}

module.exports = {
  messageCanSend,
}
