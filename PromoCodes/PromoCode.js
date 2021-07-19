export default class PromoCode {
  constructor(name, destinationId, code, type, value, universalValid) {
    this.name = name
    this.destinationId = destinationId
    this.code = code
    this.type = type
    this.value = value
    this.universalValid = universalValid
  }
  getName() {
    return this.name
  }
  getCode() {
    return this.code
  }
  getType() {
    return this.type
  }
  getValue() {
    return this.value
  }
  getValueAsString(vueCurrencyFilter) {
    if (this.getType() === 'absolute') {
      return vueCurrencyFilter(this.getValue())
    }
    return `${this.getValue()} %`
  }
}
