import DateHelper from '../utils/DateHelper'

/**
 * Representation of a single price from the api. For example includes a eventually custom price
 */

export default class Price {
  constructor(params) {
    this.availableTickets = params.hasOwnProperty('availableTickets')
      ? params.availableTickets
      : null
    this.customPrice = params.hasOwnProperty('customPrice')
      ? params.customPrice
      : null
    this.price = params.hasOwnProperty('price') ? params.price : null
    this.validAt = null
    if (params.hasOwnProperty('validAt')) {
      let priceTime = new Date(params.validAt)
      this.validAt = DateHelper.shiftUtcToLocal(priceTime)
    }
  }

  // if we have, return the custom price. else the default price
  getRealPrice() {
    if (this.customPrice !== null) return this.customPrice
    return this.price
  }
  // alias for getRealPrice()
  getPrice() {
    return this.getRealPrice()
  }

  getValidAt() {
    return this.validAt
  }

  isCustomPrice() {
    return !!this.customPrice || this.customPrice === 0
  }
}
