// 发送开奖模板消息给所有抽奖参与用户
const moment = require('moment-timezone')
const constants = require('./constants')
const time = moment().format('YYYY-MM-DD HH:mm')

async function sendTemplateMsg(event, offset) {
  try {
    const tableId = constants.BAAS_TABLE_ID.lottery_log
    const Table = new BaaS.TableObject(tableId)
    const query = new BaaS.Query()
    query.compare('lottery_id', '=', event.data.lottery_id)
    const lotteryRes = await Table.setQuery(query)
      .limit(500)
      .offset(offset)
      .find()
    if (lotteryRes.data.objects.length === 0) {
      return '没人参加抽奖'
    }
    const filterLotteryRes = lotteryRes.data.objects.filter(item => {
      return item.unionid
    })

    console.log('POINT：lotteryRes 正常')

    const unionid_list = filterLotteryRes.map(item => {
      return item.unionid
    })
    const MyUser = new BaaS.User()
    const query2 = new BaaS.Query()
    query2.in('unionid', unionid_list)
    const user = await MyUser.setQuery(query2).find()
    if (user.data.objects.length === 0) {
      return '没有 user'
    }

    console.log('POINT：user 正常')

    const user_id_list = user.data.objects.map(item => {
      return item.id
    })
    const msgParams = {
      recipient_type: 'user_list',
      user_list: user_id_list,
      template_id: '4RBWC9cvI1VdxrLaa0TV0N2hz-ZSajq3953OiBUJ_2A',
      submission_type: 'form_id',
      page: `pages/lottery/lottery?lottery_id=${event.data.lottery_id}`,
      can_send_subscription_message: true,
      keywords: {
        thing1: {
          value: event.data.prize_name,
        },
        date2: {
          value: time,
        },
        thing3: {
          value: '点击查看开奖结果',
        },
      },
    }
    const res = await BaaS.wechat.sendSubscribeMessage(msgParams)
    console.log('single res===', offset, res)

    if (lotteryRes.data.meta.next !== null) sendTemplateMsg(event, offset + 500)
    else return '全部发送成功'
  } catch (err) {
    console.log('发送失败', err)
    throw new Error(err)
  }
}

module.exports = async function(event, callback) {
  try {
    const res = await sendTemplateMsg(event, 0)
    callback(null, res)
  } catch (err) {
    console.log('操作失败', err)
    callback(err)
  }
}
