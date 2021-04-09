import definitions from '../../../definitions'
import BookingState from './BookingState'

/**
 * Where all possible booking states and a current selected booking state live
 */

export default class BookingStates {
  constructor() {
    this.bookingStates = [
      new BookingState(
        definitions.bookingState.waiting_list,
        i18n.t('shopBackendBookingDetail.bookingStateWaitingList')
      ),
      new BookingState(
        definitions.bookingState.reserved,
        i18n.t('shopBackendBookingDetail.bookingStateProvisionally')
      ),
      new BookingState(
        definitions.bookingState.manual_confirmed,
        i18n.t('shopBackendBookingDetail.bookingStateManualConfirmed')
      ),
      new BookingState(
        definitions.bookingState.auto_confirmed,
        i18n.t('shopBackendBookingDetail.bookingStateAutoConfirmed')
      ),
    ]

    // current selected booking state
    this.bookingState = null
  }

  /**
   * set a new current booking state
   * @param bookingState: String
   */
  setBookingState(bookingState) {
    this.bookingState = this.bookingStates.find(
      (tmpBookingState) => tmpBookingState.state === bookingState
    )
  }

  // save the current booking state to api
  async saveBookingState(bookingId) {
    EventBus.$emit('spinnerShow')

    try {
      await axios.patch(
        store.getters.getCurrentDestinationInstance().getShopApi() +
          'admin/booking/' +
          bookingId,
        {
          state: this.bookingState.state,
        }
      )

      return true
    } catch (e) {
      // set back to old state
      EventBus.$emit('notify', i18n.t('bookingStates.stateCouldNotBeChanged'))
      return false
    } finally {
      EventBus.$emit('spinnerHide')
    }
  }

  getStateText() {
    /* global i18n */
    if (this.isAutoConfirmed())
      return i18n.t('shopBackendBookingDetail.bookingStateAutoConfirmed')
    if (this.isManualConfirmed())
      return i18n.t('shopBackendBookingDetail.bookingStateManualConfirmed')
    if (this.isWaitingList())
      return i18n.t('shopBackendBookingDetail.bookingStateWaitingList')
    if (this.isReserved())
      return i18n.t('shopBackendBookingDetail.bookingStateProvisionally')
  }

  isConfirmed() {
    return this.isAutoConfirmed() || this.isManualConfirmed()
  }

  isAutoConfirmed() {
    if (!this.bookingState) return false
    return this.bookingState.state === definitions.bookingState.auto_confirmed
  }

  isManualConfirmed() {
    if (!this.bookingState) return false
    return this.bookingState.state === definitions.bookingState.manual_confirmed
  }

  isWaitingList() {
    if (!this.bookingState) return false
    return this.bookingState.state === definitions.bookingState.waiting_list
  }

  isReserved() {
    if (!this.bookingState) return false
    return this.bookingState.state === definitions.bookingState.reserved
  }

  // possible booking states as array
  getBookingStates(excludeState = null) {
    return this.bookingStates.filter(
      (bookingState) => bookingState.state !== excludeState
    )
  }

  // current booking state
  getBookingState() {
    return this.bookingState
  }

  getBookingStateByState(stateString) {
    return this.bookingStates.find(
      (bookingState) => bookingState.state === stateString
    )
  }
}
