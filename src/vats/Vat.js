export default class Vat {
  constructor(params) {
    this.rate = params.rate || null
    this.price = params.price || params.value || null
  }

  getRate() {
    return this.rate
  }

  getPrice() {
    return this.price
  }
}
