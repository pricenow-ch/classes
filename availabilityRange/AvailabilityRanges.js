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

  // update validity dates with api data
  setValidityDates(validityDates) {
    this.availabilityRanges.forEach((availabilityRange) => {
      availabilityRange.initValidityDates(validityDates)
    })
  }

  getAvailabilityRanges() {
    return this.availabilityRanges
  }

  doesAnyAvailabilityRangeHasValidityDates() {
    return !!this.availabilityRanges.find((availabilityRange) => {
      return availabilityRange.getValidityDates()?.length
    })
  }

  /**
   * Returns a list of dates inside the availability ranges (taking into account validityDates and availabilityRange)
   * if any validity dates are available: return them. else get a merged list of dates from the availability ranges
   */
  getDateList(type = 'date') {
    if (this.doesAnyAvailabilityRangeHasValidityDates()) {
      return this.getValidityDates(type)
    }
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

  /**
   * Get only the validity dates
   * @param type
   * @returns {string[]|Array}
   */
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
    // this sort function is crucial. Other function depending on them, searching for the next higher date to book
    // e.g. Products.getNextDateFromList()
    validityDates.sort((a, b) => {
      return a - b
    })
    if (type === 'dateString') {
      return validityDates.map((validityDate) =>
        moment(validityDate).format('YYYY-MM-DD')
      )
    }
    return validityDates
  }
}
