/* Provides state information for skidata and axess */
import Card from '../card/Card'

export default class ExternalTicketProviderState {
  constructor(params, type) {
    /**
     * 0: Booked saved and in external system OK
     * 1: Successfully canceled but not in external system
     * 2: Unpaid, not in external system
     * 3: Failed to cancel entry in external system
     * 4: Failed to write entry to external system
     */
    this.state = params.hasOwnProperty('state') ? params.state : null
    // to print the pickup barcode
    this.barcode =
      params.skidata_permissionBarcode ||
      params.axess_barcode ||
      params.barcode ||
      null
    this.type = type
    this.card = params.skiCard ? new Card(params.skiCard) : null
  }

  getState() {
    return this.state
  }

  getStateDescription() {
    /* global i18n */
    switch (this.state) {
      case null:
        return i18n.t('skidata.unknownState')
      case 0:
        return i18n.t('skidata.ok')
      case 1:
        return i18n.t('skidata.cancellationSuccessfull')
      case 2:
        return i18n.t('skidata.unpaidNotInSkidata')
      case 3:
        return i18n.t('skidata.failedToCancelButInSkidata')
      case 4:
        return i18n.t('skidata.failedToWriteToSkidata')
      default:
        return i18n.t('skidata.unknownState')
    }
  }

  getType() {
    return this.type
  }

  getTypeDescription() {
    switch (this.getType()) {
      case 'swisspass':
        return i18n.t('ticketProvider.swisspass')
      case 'novatouch':
        return i18n.t('ticketProvider.novatouch')
      case 'axess':
        return i18n.t('ticketProvider.axess')
      case 'skidata':
        return i18n.t('ticketProvider.skidata')
      default:
        return i18n.t('ticketProvider.unknown')
    }
  }

  isGreenState() {
    return this.state === 0 || this.state === 1
  }

  getBarcode() {
    return this.barcode
  }

  getCard() {
    return this.card
  }
}
