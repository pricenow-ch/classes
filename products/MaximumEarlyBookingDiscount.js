export default class MaximumEarlyBookingDiscount {
  constructor(raw) {
    this.maxEarlyBookingDiscount = raw?.maxEarlyBookingDiscount
    this.earlyBookingDiscount = raw?.earlyBookingDiscount
    this.customMaxEarlyBookingDiscount = raw?.customMaxEarlyBookingDiscount
    this.customMaxEarlyBookingDiscountId = raw?.customMaxEarlyBookingDiscountId
    this.date = raw?.date
    this.productDefinitionId = raw?.productDefinitionId
    this.customPostedPrice = raw?.customPostedPrice
    this.postedPrice = raw?.postedPrice
    this.dailyBaseRate = raw?.dailyBaseRate
    this.productTargetPrice = raw?.productTargetPrice
    this.valdemFactor = raw?.valdemFactor
    this.multiDayDiscountFactor = raw?.multiDayDiscountFactor
    this.cashDeskPrice = raw?.cashDeskPrice
  }

  hasCustomPostedPrice() {
    return 0 <= parseInt(this.customPostedPrice)
  }

  hasCustomEarlyBookingDiscount() {
    return 0 <= parseFloat(this.customMaxEarlyBookingDiscount)
  }

  getCurrentPostedPrice() {
    if (this.hasCustomPostedPrice()) {
      return this.customPostedPrice
    }

    return this.postedPrice
  }

  getChartFormattedPostedPrice() {
    return this.getCurrentPostedPrice() / 100
  }

  getCurrentEarlyBookingDiscount() {
    if (this.hasCustomEarlyBookingDiscount()) {
      return this.customMaxEarlyBookingDiscount
    }

    return this.earlyBookingDiscount
  }
}
