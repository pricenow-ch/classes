/**
 * Model for product Cash Desk prices
 */
export default class CashDeskPrice {
  constructor(params) {
    this.id = params?.id
    this.date = new Date(params?.date)
    this.productDefinitionId = params?.productDefinitionId
    this.price = params?.price
    this.createdAt = params?.createdAt
    this.updatedAt = params?.updatedAt
  }

  getChartFormattedPrice() {
    return (this.price / 100).toFixed(2)
  }
}
