import AvailabilityRange from './AvailabilityRange'
import _ from 'lodash'
import moment from 'moment'

export default class AvailabilityRanges {
  constructor(availabilityRanges = []) {
    // Type: AvailabilityRange[]
    this.availabilityRanges = availabilityRanges
  }

  parseApiData(apiData, validityDates = []) {
    if (!apiData) return this
    this.availabilityRanges = []
    // expecting data structure from api: [{availabilityRange: {}}, {availabilityRange: {}}]
    apiData.forEach((availabilityRange) => {
      this.availabilityRanges.push(
        new AvailabilityRange(
          availabilityRange.availabilityRange,
          null,
          validityDates
        )
      )
    })
    return this
  }

  getAvailabilityRanges() {
    return this.availabilityRanges
  }

  /**
   * Returns a list of dates inside the availability ranges
   */
  getDateList(type = 'date') {
    let dateList = []
    this.availabilityRanges.forEach((availabilityRange) => {
      dateList = [...dateList, ...availabilityRange.getDateList()]
    })
    // remove double entries
    dateList = _.uniq(dateList)
    // sort by date
    dateList.sort((a, b) => {
      return new Date(a) - new Date(b)
    })
    if (type === 'moment') return dateList.map((dateList) => moment(dateList))
    if (type === 'dateString')
      return dateList.map((dateList) => moment(dateList).format('YYYY-MM-DD'))
    return dateList
  }

  getValidityDates(type = 'date') {
    let validityDates = []
    this.getAvailabilityRanges().forEach((availabilityRange) => {
      validityDates = [
        ...validityDates,
        ...availabilityRange.getValidityDates(),
      ]
    })
    validityDates = _.uniqBy(validityDates, (validityDate) =>
      new Date(validityDate).getTime()
    )
    if (type === 'dateString') {
      return validityDates.map((validityDate) =>
        moment(validityDate).format('YYYY-MM-DD')
      )
    }
    return validityDates
  }
}
