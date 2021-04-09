import Salutation from './Salutation'

export default class Salutations {
  constructor() {
    // available salutations
    this.salutations = []
    // the selected salutation
    this._salutation = null
    this.initSalutations()
  }

  initSalutations() {
    this.salutations.push(new Salutation('f'))
    this.salutations.push(new Salutation('m'))
  }

  get salutation() {
    return this._salutation
  }

  set salutation(salutation) {
    this._salutation = salutation
  }
}
