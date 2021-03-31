export default class GroupDiscount {
  constructor(params) {
    this.id = params.id
    this.basketid = params.basketId
    this.type = params.kind
    this.amount = params.amount
    this.description = params.description
  }

  getId() {
    return this.id
  }

  getType() {
    return this.type
  }

  getAmount() {
    return this.amount
  }

  getDescription() {
    return this.description
  }
}
