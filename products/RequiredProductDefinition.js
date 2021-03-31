// cannot extend class with ProductDefinition.js because it would lead to an circular structure which leads to a js error
export default class RequiredProductDefinition {
  constructor(params) {
    // Attention: Cannot be Type ProductDefinition as this would lead to circular JSON structure (console error)
    this.productId = params?.requiredProductDefinition?.productId || null
    this.productDefinitionId = params?.requiredProductDefinition?.id || null
    this.autoAddToBasket = params.autoAddToBasket || false
    this.count = params.hasOwnProperty('count') ? params.count : null
  }

  getId() {
    return this.productDefinitionId
  }
  getProductId() {
    return this.productId
  }
  getProductDefinitionId() {
    return this.productDefinitionId
  }
  getAutoAddtoBasket() {
    return this.autoAddToBasket
  }
}
