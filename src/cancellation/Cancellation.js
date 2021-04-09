import moment from 'moment-timezone'
import User from '../user/User'
import Voucher from '../vouchers/Voucher'
import BookingEntry from '../bookings/BookingEntry'

export default class Cancellation {
  constructor(params) {
    this.id = params.id ? params.id : null
    this.date = params.date ? params.date : null
    this.originalAmount = params.originalAmount ? params.originalAmount : null
    this.reason = params.reason ? params.reason : null

    this.bookingEntries = []
    if (params.hasOwnProperty('booking_entries'))
      this.parseBookingEntries(params.booking_entries)

    // Type: User
    this.userInstance = params.user ? new User(params.user) : null

    // Type: Voucher
    this.voucherInstance = params.voucher ? new Voucher(params.voucher) : null
  }

  parseBookingEntries(entries) {
    entries.forEach((entry) => {
      this.bookingEntries.push(new BookingEntry(entry))
    })
  }

  /**
   * GETTERS
   */

  getCancellationDate() {
    return moment(this.date).format('DD.MM.YYYY - HH:mm')
  }

  // get cancellation user
  getUser() {
    return this.userInstance
  }

  // return type: Voucher
  getVoucher() {
    return this.voucherInstance
  }

  getCancellationRatio(vueOptions = null) {
    if (this.getVoucher()) {
      return (
        vueOptions.filters.currency(this.getVoucher().getValue()) +
        ' / ' +
        vueOptions.filters.currency(this.getOriginalAmount())
      )
    } else {
      /* global i18n */
      return (
        i18n.t('v4.noVoucherHasBeenGenerated') +
        ' / ' +
        vueOptions.filters.currency(this.getOriginalAmount())
      )
    }
  }

  getOriginalAmount() {
    return this.originalAmount
  }

  getReason() {
    return this.reason
  }

  getBookingEntries() {
    return this.bookingEntries
  }
  getId() {
    return this.id
  }
}
