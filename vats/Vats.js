import Vat from './Vat'

export default class Vats {
  constructor(params = []) {
    this.vats = []
    if (params.length) this.parseVats(params)
  }

  parseVats(vats) {
    for (let i = 0; i < vats.length; i++) {
      this.vats.push(new Vat(vats[i]))
    }
  }

  getVats() {
    return this.vats
  }

  // get total price of all vat rates
  getTotalPrice() {
    return this.vats.reduce((accumulator, vat) => accumulator + vat.price, 0)
  }
}
