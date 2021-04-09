export default class Salutation {
  constructor(salutationKey) {
    this._salutationKey = salutationKey || null
  }

  checkSalutation() {
    if (
      this._salutationKey === 'm' ||
      this._salutationKey === 'f' ||
      this._salutationKey === null
    )
      return true
    throw new Error('Salutation not available')
  }

  getTitle() {
    return i18n.t('salutation.' + this.salutationKey)
  }

  get salutationKey() {
    this.checkSalutation()
    return this._salutationKey
  }

  set salutationKey(value) {
    this.checkSalutation()
    this._salutationKey = value
  }
}
