/**
 * Model for product Target Prices
 */
export default class ProductTargetPrice {
  constructor(params) {
    this.productTargetPrice = params?.productTargetPrice
    this.productDefinitionId = params?.productDefinitionId
    this.date = params?.date
  }

  getChartFormattedTargetPrice() {
    return (this.productTargetPrice / 100).toFixed(2)
  }
}
