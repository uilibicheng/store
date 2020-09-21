import moment from 'moment'

export default {
  createRange(startsAt, endsAt) {
    if (!startsAt || !endsAt) return []
    return [moment.unix(startsAt), moment.unix(endsAt)]
  },

  formatRange(range = []) {
    return [
      moment(range[0])
        .second(0)
        .unix(),
      moment(range[1])
        .second(0)
        .unix(),
    ]
  },

  startOfDay(unix) {
    return moment.unix(unix).startOf('day')
  },

  endOfDay(unix) {
    return moment.unix(unix).endOf('day')
  },
}
