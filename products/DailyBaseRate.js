/**
 * Model for Daily Base Rate responses
 */

export default class DailyBaseRate {
  constructor(params) {
    this.customBaseRate = params?.customBaseRate
    this.customBaseRateId = params?.customBaseRateId
    this.maxDailyBaseRate = params?.maxDailyBaseRate
    this.minDailyBaseRate = params?.minDailyBaseRate
    this.dailyBaseRate = params?.dailyBaseRate
    this.date = params?.date
    this.productId = params?.productId
  }

  /**
   * check if the user set a custom
   * base rate for this product id and
   * date
   * @returns {boolean}
   */
  isOverwritten() {
    return 0 <= parseInt(this.customBaseRate)
  }

  /**
   * get the current base rate
   * respects overwritten base
   * rates
   * @returns int
   */
  currentBaseRate() {
    if (this.isOverwritten()) {
      return this.customBaseRate
    }

    return this.dailyBaseRate
  }
}
