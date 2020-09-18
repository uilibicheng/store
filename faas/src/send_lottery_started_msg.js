// 发送开奖模板消息给中奖用户
const moment = require('moment-timezone')
const constants = require('./constants')
const appid = 'wxdc10b0aab890a622'

let lotteryActive = {}
const time = moment().unix()

async function sendTemplateMsg(offset) {
  try {
    const MyUser = new BaaS.User()
    const userQuery = new BaaS.Query()
    userQuery.compare('updated_at', '>=', time - 60 * 60 * 24 * 7)
    const targetUserRes = await MyUser.setQuery(userQuery)
      .limit(500)
      .offset(offset)
      .find()

    console.log('targetUserRes===', offset, targetUserRes)

    if (targetUserRes.data.objects.length === 0) {
      return '没有可发送消息的用户'
    }
    const targetUser = targetUserRes.data.objects.map(item => {
      return item.id
    })

    console.log('targetUser===', offset, targetUser)

    const msgParams = {
      recipient_type: 'user_list',
      user_list: targetUser,
      // user_list: [71556226, 71688903],
      template_id: 'qKPC7qAEjFcUBOBfWv8bkCPITPEUjpXVABe-_pqu7Dk',
      page: `pages/lottery/lottery?lottery_id=${lotteryActive.id}`,
      can_send_subscription_message: true,
      keywords: {
        thing1: {
          value: lotteryActive.title,
        },
        date2: {
          value: moment(lotteryActive.ends_at * 1000).format('YYYY-MM-DD HH:mm'),
        },
        thing3: {
          value: '点击参与抽奖',
        },
      },
    }

    console.log('msgParams===', offset, msgParams)

    const res = await BaaS.wechat.sendSubscribeMessage(msgParams)

    console.log('single res===', offset, res)

    if (targetUserRes.data.meta.next !== null) sendTemplateMsg(offset + 500)
    else {
      const tableId = constants.BAAS_TABLE_ID.lottery
      const Table = new BaaS.TableObject(tableId)
      const record = Table.getWithoutData(lotteryActive.id)
      record.set('sent_tpl_msg', 1)
      const sent = await record.update()

      console.log('sent===', sent)

      return '全部发送成功'
    }
  } catch (err) {
    console.log('发送失败', err)
    throw new Error(err)
  }
}

module.exports = async function(event, callback) {
  try {
    const tableId = constants.BAAS_TABLE_ID.lottery
    const Table = new BaaS.TableObject(tableId)
    const query = new BaaS.Query()
    query.compare('appid', '=', appid)
    query.compare('status', '=', 'active')
    query.compare('starts_at', '<=', time)
    query.compare('ends_at', '>=', time)
    query.compare('sent_tpl_msg', '!=', 1)
    const lotteryRes = await Table.setQuery(query).find()

    console.log('lotteryRes===', lotteryRes)

    if (lotteryRes.data.objects.length === 0) {
      callback(null, '没有正在进行的抽奖活动')
      return
    }
    lotteryActive = lotteryRes.data.objects[0]
    const res = await sendTemplateMsg(0)
    callback(null, res)
  } catch (err) {
    console.log('操作失败', err)
    callback(err)
  }
}
