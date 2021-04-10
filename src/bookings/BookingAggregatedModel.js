import Event from '../events/Event'
import ProductCapacity from '../products/ProductCapacity'

export default class BookingAggregatedModel {
  constructor(params) {
    this.pe_productId = params.pe_productId ? params.pe_productId : null
    this.translation_product = params.translation_product
      ? params.translation_product
      : null
    this.totalPeopleCount = params.totalPeopleCount
      ? params.totalPeopleCount
      : null
    this.capacity = params.capacity ? new ProductCapacity(params.capacity) : {}
    this.event = params.event ? new Event(params.event) : null
  }

  getTitle() {
    // consider events
    if (this.event) return this.event.title
    return i18n.t(this.translation_product)
  }
}
