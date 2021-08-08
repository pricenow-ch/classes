import DateHelper from '../utils/DateHelper'
import moment from 'moment'

export default class AvailabilityRange {
  constructor(singleSeason, destinationInstance = null, validityDates = []) {
    this.id = singleSeason.id
    this.identifier = singleSeason.identifier
    this.from = DateHelper.shiftUtcToLocal(new Date(singleSeason.from))
    this.to = DateHelper.shiftUtcToLocal(new Date(singleSeason.to))
    this.name = singleSeason.name
    this.suppSeasonalities = singleSeason.suppSeasonalities
    this.destinationInstance = destinationInstance
    this.extAxessTarifBlattGueltCreated =
      singleSeason.extAxessTarifBlattGueltCreated
    this.productSeasons = []
    // Type: Date
    this.validityDates = this.initValidityDates(validityDates)
    // parse product season links
    // todo: rename and avoid circular structure
    if (singleSeason.ProductAvailabilityRange)
      this.parseProductSeasons(singleSeason.ProductAvailabilityRange)
  }

  // parse validity dates to date instances
  // only add validity dates which are in the range of the current availability range
  initValidityDates(validityDates) {
    validityDates = validityDates.map(
      (validityDate) => new Date(new Date(validityDate).setHours(0, 0, 0, 0))
    )
    return validityDates.filter((validityDate) => {
      return (
        validityDate.getTime() >= this.from.getTime() &&
        validityDate.getTime() <= this.to.getTime()
      )
    })
  }

  // todo
  parseProductSeasons(rawProductSeasons) {
    for (let rawProductSeason of rawProductSeasons) {
      // this.productSeasons.push(new ProductAvailabilityRange(rawProductSeason))
    }
  }

  getId() {
    return this.id
  }

  getDestination() {
    return this.destinationInstance
  }

  getName() {
    return this.name
  }

  getDescription() {
    const from = moment(this.from).format('DD.MM.YYYY')
    const to = moment(this.to).format('DD.MM.YYYY')
    return `${this.getName()} | ${from} - ${to}`
  }

  getFrom() {
    return this.from
  }

  getTo() {
    return this.to
  }

  getValidityDates(type = 'date') {
    if (type === 'dateString') {
      return this.validityDates.map((validityDate) =>
        moment(validityDate).format('YYYY-MM-DD')
      )
    }
    return this.validityDates
  }

  setValidityDates(validityDates) {
    this.validityDates = validityDates.map(
      (validityDate) => new Date(new Date(validityDate).setHours(0, 0, 0, 0))
    )
  }

  getDateList() {
    return DateHelper.getDateList(this.from, this.to)
  }

  // todo
  getProductSeasons() {
    return this.productSeasons
  }
}
