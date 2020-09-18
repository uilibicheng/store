import moment from 'moment-timezone'
import {TIMEZONE, DATE_FORMAT, ANOTHER_DATE_FORMAT} from '../config/constants'

export const timeWithTimeZone = time => moment(time).tz(TIMEZONE)

export const timeWithFormated = time => timeWithTimeZone(time).format(DATE_FORMAT)
export const timeWithJPYFormated = time => timeWithTimeZone(time).format(ANOTHER_DATE_FORMAT)

// 将当前的日期转化成对应时区的日期，格式为ISO 8601
export const dateWithFormated = date => moment.tz(date, TIMEZONE).format()

export const valueWithTimeZone = date => moment.tz(date, TIMEZONE).valueOf()