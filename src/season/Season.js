import ProductSeason from '@/classes/season/ProductSeason'

export default class Season {
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
    if (singleSeason.productSeason)
      this.parseProductSeasons(singleSeason.productSeason)
  }

  parseProductSeasons(rawProductSeasons) {
    for (let rawProductSeason of rawProductSeasons) {
      this.productSeasons.push(new ProductSeason(rawProductSeason))
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
