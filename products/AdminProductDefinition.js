import ProductDefinition from './ProductDefinition'

/**
 * Additional methods (e.g. api endpoint calls) and class variables (e.g. color) for admin purposes only
 * todo: this class is not in use yet
 * todo: create AdminProduct child class from Product class
 */

export default class AdminProductDefinition extends ProductDefinition {
  constructor(params) {
    super(params)

    this.color = params.color ? params.color : null
  }

  // todo: admin overrides prices here, not in the ProductDefinition class

  /**
   * GETTERS
   */
  getColor() {
    return this.color
  }
}
