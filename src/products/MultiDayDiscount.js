export default class MultiDayDiscount {
  constructor(raw) {
    this.customMultiDayDiscountFactor = raw?.customMultiDayDiscountFactor
    this.customMultiDayDiscountId = raw?.customMultiDayDiscountId
    this.multiDayDiscountFactor = raw?.multiDayDiscountFactor
    this.productTargetPrice = raw?.productTargetPrice
    this.date = raw?.date
    this.productDefinitionId = raw?.productDefinitionId
    this.valdemFactor = raw?.valdemFactor
    this.dailyBaseRate = raw?.dailyBaseRate
    this.maxMultiDayDiscount = raw?.maxMultiDayDiscount
    this.minMultiDayDiscount = raw?.minMultiDayDiscount
  }

  isCustomMultiDayFactor() {
    return 0 <= parseFloat(this.customMultiDayDiscountFactor)
  }

  getMultiDayDiscount() {
    if (this.isCustomMultiDayFactor()) {
      return this.customMultiDayDiscountFactor
    }
    return this.multiDayDiscountFactor
  }

  getChartFormattedTargetProductPrice() {
    return Math.round(this.productTargetPrice) / 100
  }
}
