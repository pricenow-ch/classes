/**
 * admin sale endpoint model
 */
export default class Sale {
  constructor(params) {
    this.date = params.date ? params.date : null
    this.sold = params.sold ? params.sold : 0
  }
}
