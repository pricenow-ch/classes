import CancellationType from './CancellationType'

export default class CancellationTypes {
  constructor() {
    // Type: CancellationType
    this.cancellationTypes = []

    // init cancellation types
    /* global i18n */
    this.addCancellationType(0, i18n.t('v4.selfStorno'))
    this.addCancellationType(1, i18n.t('v4.cashDeskStorno'))
  }

  // add new cancellation type object to class array
  addCancellationType(id, description) {
    this.cancellationTypes.push(new CancellationType(id, description))
  }

  // get all cancellationTypes
  getCancellationTypes() {
    return this.cancellationTypes
  }

  // return type: cancellation
  getStandardCancellationType() {
    return this.cancellationTypes[1]
  }
}
