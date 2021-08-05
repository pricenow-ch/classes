import PromoCode from './PromoCode'

export default class PromoCodes {
  constructor() {
    this.promoCodes = []
  }

  /**
   * Parse raw promo codes from api
   * @param promoCodes
   */
  parseApiData(promoCodes) {
    this.promoCodes = []
    for (let i = 0; i < promoCodes.length; i++) {
      const rawPromoCode = promoCodes[i]
      const name = rawPromoCode.promoType.name
      const destinationId = rawPromoCode.promoType.destinationId
      const code = rawPromoCode.code
      const type = rawPromoCode.promoType.type
      const value = rawPromoCode.promoType.value
      const universalValid = rawPromoCode.promoType.universalValid
      const promoCode = new PromoCode(
        name,
        destinationId,
        code,
        type,
        value,
        universalValid
      )
      this.promoCodes.push(promoCode)
    }
    return this
  }

  getPromoCodes() {
    return this.promoCodes
  }
}
