import DateHelper from '../utils/DateHelper'

export default class AvailabilityRange {
  constructor(singleSeason, destinationInstance = null) {
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
    // parse product season links
    // todo: rename and avoid circular structure
    if (singleSeason.ProductAvailabilityRange)
      this.parseProductSeasons(singleSeason.ProductAvailabilityRange)
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

  getDateList() {
    return DateHelper.getDateList(this.from, this.to)
  }

  // todo
  getProductSeasons() {
    return this.productSeasons
  }
}
