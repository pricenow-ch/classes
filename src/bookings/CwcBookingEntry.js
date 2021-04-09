/**
 * cause we care as booking entry for printing tickets
 */
import Vats from '../vats/Vats'
import Vat from '../vats/Vat'

export default class CwcBookingEntry {
  constructor(price, user) {
    this.price = price
    this.user = user
    this.vats = new Vats()

    // add vat rates
    let vatPrice = (7.7 * this.price) / 107.7
    this.vats.getVats().push(new Vat({ rate: 7.7, price: vatPrice }))
  }

  getPrice() {
    return this.price
  }

  getUser() {
    return this.user
  }

  getVatsArray() {
    return this.vats.getVats()
  }

  getRequiredEntry() {
    return null
  }
}
