export default class Payment {
  constructor(params) {
    this.paidAt = params?.date || null
  }

  /**
   * GETTERS
   */

  getTimeOfPay() {
    return this.paidAt
  }
}
