import moment from 'moment'

export default {
  createRange(startsAt, endsAt) {
    if (!startsAt || !endsAt) return []
    return [moment.unix(startsAt), moment.unix(endsAt)]
  },

  formatRange(range = []) {
    return [
      moment(range[0])
        .startOf('day')
        .unix(),
      moment(range[1])
        .endOf('day')
        .unix(),
    ]
  },

  momentTimeStamp(stamp = []) {
    return [
      moment(stamp[0] * 1000),
      moment(stamp[1] * 1000),
    ]
  },

  startOfDay(unix) {
    return moment.unix(unix).startOf('day')
  },

  endOfDay(unix) {
    return moment.unix(unix).endOf('day')
  },
}
