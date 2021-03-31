/*
Model class which represents the pe product season class
 */
import Product from '@/classes/products/Product'

export default class ProductSeason extends Product {
  constructor(params) {
    super(params.product)
    this.productSeasonId = params.id
    this.extAxessTarifBlattGuelt = params.extAxessTarifBlattGuelt
    this.extAxessSeasonCreated = params.extAxessSeasonCreated
  }
}
