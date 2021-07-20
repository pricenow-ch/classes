import ProductAvailabilityRange from '@/classes-shared/season/ProductAvailabilityRange'

export default class AvailabilityRange {
  constructor(singleSeason, destinationInstance = null) {
    this.id = singleSeason.id
    this.identifier = singleSeason.identifier
    this.from = new Date(singleSeason.from)
    this.to = new Date(singleSeason.to)
    this.name = singleSeason.name
    this.createdAt = new Date(singleSeason.createdAt)
    this.updatedAt = new Date(singleSeason.updatedAt)
    this.suppSeasonalities = singleSeason.suppSeasonalities
    this.destinationInstance = destinationInstance
    this.extAxessTarifBlattGueltCreated =
      singleSeason.extAxessTarifBlattGueltCreated
    this.productSeasons = []
    // parse product season links
    if (singleSeason.ProductAvailabilityRange)
      this.parseProductSeasons(singleSeason.ProductAvailabilityRange)
  }

  parseProductSeasons(rawProductSeasons) {
    for (let rawProductSeason of rawProductSeasons) {
      this.productSeasons.push(new ProductAvailabilityRange(rawProductSeason))
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

  getProductSeasons() {
    return this.productSeasons
  }
}
