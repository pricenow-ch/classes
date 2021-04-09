/**
 * admin sales endpoint model
 */
import Sale from '@/classes/products/Sale'

export default class ProductDefinitionSale {
  constructor(params) {
    this.id = params.id ? params.id : null
    this.sales = {}
    if (params.sales) {
      params.sales.forEach((sale) => {
        this.sales[sale.date] = new Sale(sale)
      })
    }
  }
}
