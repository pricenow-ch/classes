import GroupDiscount from './GroupDiscount'

export default class GroupDiscounts {
  constructor() {
    this.groupDiscounts = []
  }

  parseApiData(groupDiscounts) {
    this.groupDiscounts = []
    for (let i = 0; i < groupDiscounts.length; i++) {
      this.groupDiscounts.push(new GroupDiscount(groupDiscounts[i]))
    }
    return true
  }

  getGroupDiscounts() {
    return this.groupDiscounts
  }
}
