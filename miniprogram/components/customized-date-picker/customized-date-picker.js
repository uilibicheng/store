// components/customized-date-picker/customized-date-picker.js
import io from '../../io/index'
import moment from '../../lib/moment-timezone.js'
import { TIMEZONE } from '../../config/constants'
import lodash from '../../lib/lodash.js'

let closedTimes = []

let nowDate // [YYYY, MM, DD]
const YYYY = 0
const MM = 1
const DD = 2

let yearArray = []
let monthArray = []
let dayArray = []
let initYear = 0
let initMonth = 0
let initDay = 0

Component({

  properties: {},

  data: {
    rangeArray: [yearArray, monthArray, dayArray],
    dateValue: [],
  },

  lifetimes: {
    attached() {
      this.getSettings()
    }
  },

  methods: {
    getSettings() {
      return io
        .getSettings()
        .then(res => {
          closedTimes = res.data.closed_times.map(item => {
            return moment(item * 1000).tz(TIMEZONE).format('YYYY-MM-DD').split('-')
              .map(v => { return v *= 1 })
          })
          console.log('closedTimes==', closedTimes)
          this.initDateRange()
        })
    },

    getMaxDay(year, month) {
      return [1, 3, 5, 7, 8, 10, 12].includes(month)
        ? 31
        : [4, 6, 9, 11].includes(month)
          ? 30
          : year % 4 === 0 ? 29 : 28
    },

    initDateRange() {
      nowDate = moment(new Date()).tz(TIMEZONE).format('YYYY-MM-DD').split('-')
        .map(v => { return v *= 1 })

      yearArray = [nowDate[YYYY], nowDate[YYYY] + 1]
      initYear = nowDate[YYYY]

      monthArray = []
      for(let i = nowDate[MM]; i < 13; i++) {
        monthArray.push(i)
      }
      initMonth = nowDate[MM]

      this.getInitDay()

      this.setData({
        rangeArray: [yearArray, monthArray, dayArray],
        dateValue: [0, 0, 0],
      })

    },

    getInitDay() {
      const dayLimit = this.getMaxDay(initYear, initMonth)
      dayArray = []
      for(let j = initMonth === nowDate[MM] ? nowDate[DD] : 1; j <= dayLimit; j++) {
        let canPush = true
        for(let x = 0; x < closedTimes.length; x++) {
          if (lodash.isEqual([initYear, initMonth, j], closedTimes[x])) {
            canPush = false
            break
          }
        }
        if (canPush) {
          dayArray.push(j)
          if (initDay === 0) initDay = j
        }
      }
      if (dayArray.length === 0) {
        if (initMonth === 12) {
          initMonth = 1
          monthArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
          initYear += 1
          yearArray.shift()
        } else {
          monthArray.shift()
          initMonth += 1
        }
        this.getInitDay()
      } else return initDay
    },

    bindColumnChange(e) {
      if (e.detail.column === YYYY) this.handleYearChange(e.detail.value)
      else if (e.detail.column === MM) this.handleMonthChange(e.detail.value)
    },

    handleYearChange(index) {
      if (index === 0) this.initDateRange()
      else if (index === 1) {
        monthArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
        dayArray = []
        for (let i = 1; i <= 31; i++) {
          let canPush = true
          for(let x = 0; x < closedTimes.length; x++) {
            if (lodash.isEqual([yearArray[index], 1, i], closedTimes[x])) {
              canPush = false
              break
            }
          }
          if (canPush) {
            dayArray.push(i)
          }
        }
        this.setData({
          rangeArray: [yearArray, monthArray, dayArray],
          dateValue: [index, 0, 0],
        })
      }
    },

    handleMonthChange(index) {
      const yearIndex = this.data.dateValue[0]
      const dayLimit = this.getMaxDay(yearArray[yearIndex], monthArray[index])
      dayArray = []
      for (let i = 1; i <= dayLimit; i++) {
        let canPush = true
        for(let x = 0; x < closedTimes.length; x++) {
          if (lodash.isEqual([yearArray[yearIndex], monthArray[index], i], closedTimes[x])) {
            canPush = false
            break
          }
        }
        if (canPush) {
          dayArray.push(i)
        }
      }
      this.setData({
        rangeArray: [yearArray, monthArray, dayArray],
        dateValue: [yearIndex, index, 0],
      })
    },

    handleSubmit(e) {
      const indexList = e.detail.value
      const year = yearArray[indexList[0]] + ''
      const month = monthArray[indexList[1]] < 10 ? '0' + monthArray[indexList[1]] : monthArray[indexList[1]] + ''
      const day = dayArray[indexList[2]] < 10 ? '0' + dayArray[indexList[2]] : dayArray[indexList[2]] + ''

      const value = year + '-' + month + '-' + day

      this.triggerEvent('onChange', {value})
    }


  }
})
