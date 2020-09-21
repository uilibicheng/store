const io = require('../io')
const {LOTTERY_CHANCE_TYPE} = require('../config')

module.exports = async function sendLotteryChance({activityId, type, weelyRankingSaveLogId = null}) {
  try {
    const {data: activity} = await io.activity.expand(['lottery']).get(activityId)
    if (!activity) throw Error('该活动不存在')

    const {lottery} = activity
    if (!(lottery && lottery.id)) throw Error('该抽奖不存在')

    const {chance_threshold} = lottery
    console.log('chance_threshold', chance_threshold)
    const sorted = chance_threshold.sort((a, b) => b.ranking_until - a.ranking_until)
    const maxRanking = sorted[0].ranking_until

    let rankingList = []
    if (LOTTERY_CHANCE_TYPE.WEEKLY === type) {
      rankingList = await getWeelyRanking(weelyRankingSaveLogId, maxRanking)
    } else {
      rankingList = await getRanking(activityId, maxRanking)
    }

    const {data: lotteryChanceSaveLog} = await io.lotteryChanceSaveLog
      .create()
      .set({
        type,
        lottery_id: lottery.id,
      })
      .save()

    sorted.reverse()

    const records = []
    rankingList.forEach((item, index) => {
      const ranking = index + 1
      for (const threshold of sorted) {
        if (ranking >= threshold.ranking_from && ranking <= threshold.ranking_until) {
          records.push({
            lottery_chance_save_log_id: lotteryChanceSaveLog.id,
            lottery_id: lottery.id,
            chance_count: threshold.chance,
            used_count: 0,
            user_info: item.user_info,
            created_by: item.created_by,
          })
          break
        }
      }
    })

    console.log('records', records)
    const {data: lotteryChance} = await io.lotteryChance.createMany(records, {enableTrigger: false})

    console.log('发放抽奖资格成功', lotteryChanceSaveLog.id)
    return Promise.resolve(lotteryChance)
  } catch (e) {
    console.log('发放抽奖资格失败')
    return Promise.reject(e)
  }
}

function getWeelyRanking(saveLogId, limit) {
  const query = io.query
  query.compare('weekly_ranking_save_log_id', '=', saveLogId)

  return io.weeklyRanking
    .setQuery(query)
    .limit(limit)
    .orderBy('-total_points')
    .find()
    .then(res => res.data.objects)
}

function getRanking(activityId, limit) {
  const query = io.query
  query.compare('activity_id', '=', activityId)

  return io.ranking
    .setQuery(query)
    .limit(limit)
    .orderBy('-ranking_points')
    .find()
    .then(res => res.data.objects)
}
