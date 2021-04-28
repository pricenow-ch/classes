export default class BasketCondition {
  constructor(params = {}) {
    this.id = params.id ? params.id : null
    this.productId = params.productId ? params.productId : null
    this.condition = params.condition ? params.condition : null
    this.attributeKey = params.attributeKey ? params.attributeKey : null
    this.attributeValue = params.attributeValue ? params.attributeValue : null
    this.count = params.count ? params.count : null
  }

  getId() {
    return this.id
  }

  getProductId() {
    return this.productId
  }

  getAttributeKey() {
    return this.attributeKey
  }

  getAttributeValue() {
    return this.attributeValue
  }

  getCount() {
    return this.count
  }

  getCondition() {
    return this.condition
  }
}
