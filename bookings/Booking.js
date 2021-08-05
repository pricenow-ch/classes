import BookingEntry from './BookingEntry'
import moment from 'moment'
import User from '../user/User'
import BookingStates from './BookingStates'
import GroupDiscounts from '../basket/GroupDiscounts'
import Vats from '../vats/Vats'
import Destination from '../destinations/Destination'
import Payment from '@/classes-shared/bookings/Payment'
import { shopInstance } from '../utils/axiosInstance'

export default class Booking {
  constructor(params) {
    this.id = null
    this.bookingId = null
    this.subTotal = null
    this.total = null
    this.hasPdf = null
    this.paid = null
    this.basketUuid = null

    // Type: User
    // buyer and owner of the booking
    this.buyer = params.hasOwnProperty('user') ? new User(params.user) : null

    // Type: Payment
    // Payment information
    this.payment = params.hasOwnProperty('payment')
      ? new Payment(params.payment)
      : null

    // booking state
    // Type: BookingState
    this.bookingStates = new BookingStates()

    // internal or external note
    this.note = null
    this.bookingEntries = []
    this.groupDiscounts = new GroupDiscounts()
    // vats
    this.vats = new Vats([])
    // amount of payed cause we care
    this.cwc = null
    // Type: Destination
    this.destination = new Destination({})
    this.parseApiBooking(params)
  }

  // self cancel endpoint
  async cancelBookingEntries(bookingEntryIds) {
    /* global EventBus axios store */
    EventBus.$emit('spinnerShow')

    try {
      const response = await shopInstance().delete('/cancel/entries', {
        data: {
          entries: bookingEntryIds,
        },
      })

      if (response.status === 200) return true
      else return false
    } catch (e) {
      EventBus.$emit('notify', e.response)
      return false
    } finally {
      EventBus.$emit('spinnerHide')
    }
  }

  /**
   * admin cancel endpoint
   * @param voucherValue => to be passed in swiss francs NOT cents!!!
   * @param cancelReason
   * @returns {Promise<boolean|any>}
   */
  async cancelSelectedBookingEntries(voucherValue, cancelReason) {
    /* global EventBus axios store */
    EventBus.$emit('spinnerShow')

    // prepare booking entry ids
    let bookingEntries = []
    let selectedBookingEntries = await this.getSelectedBookingEntries()
    for (let i = 0; i < selectedBookingEntries.length; i++) {
      bookingEntries.push(selectedBookingEntries[i].getId())
    }

    try {
      const response = await shopInstance().delete('/admin/cancel/entries', {
        data: {
          entries: bookingEntries,
          voucherValue: voucherValue * 100,
          cancelReason: cancelReason,
        },
      })

      if (response.status === 200) return true
      else if (response.status === 201) return response.data
      else return false
    } catch (e) {
      console.log(e)
      return false
    } finally {
      EventBus.$emit('spinnerHide')
    }
  }

  /**
   * Get the first and last date in the booking entries
   */
  getBookingBoundaryDates() {
    if (this.bookingEntries.length) {
      // get min start date
      let minStartDate = this.bookingEntries[0].getStartDate()
      for (let i = 0; i < this.bookingEntries.length; i++) {
        let bookingEntry = this.bookingEntries[i]

        if (minStartDate.getTime() > bookingEntry.getStartDate().getTime())
          minStartDate = bookingEntry.getStartDate()
      }

      // get max end data
      let maxEndDate = this.bookingEntries[
        this.bookingEntries.length - 1
      ].getEndDate()
      for (let b = 0; b < this.bookingEntries.length; b++) {
        let bookingEntry = this.bookingEntries[b]

        if (maxEndDate.getTime() > bookingEntry.getEndDate().getTime())
          maxEndDate = bookingEntry.getEndDate()
      }

      /* global i18n */
      if (minStartDate.getTime() === maxEndDate.getTime())
        return moment(minStartDate).format('DD.MM.YYYY')
      else
        return (
          moment(minStartDate).format('DD.MM.YYYY') +
          ' ' +
          i18n.t('general.to') +
          ' ' +
          moment(maxEndDate).format('DD.MM.YYYY')
        )
    } else return null
  }

  /**
   * download the pdf of this booking if available
   * @returns {Promise<PromiseConstructor>}
   */
  async downloadPdf() {
    if (this.getHasPdf()) {
      /* global EventBus axios store */
      EventBus.$emit('spinnerShow')

      try {
        const { data } = await shopInstance(false).get(`/pdf/${this.getId()}`, {
          responseType: 'blob',
        })

        // https://thewebtier.com/snippets/download-files-with-axios/
        // download pdf
        const url = window.URL.createObjectURL(new Blob([data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', 'printATHome.pdf') //or any other extension
        document.body.appendChild(link)
        link.click()
      } catch (e) {
        EventBus.$emit('notify', e.response)
      } finally {
        EventBus.$emit('spinnerHide')
        return Promise
      }
    } else {
      EventBus.$emit('notify', i18n.t('v5.noPdfAvailable'))
    }
  }

  /**
   * pay the booking cash via admin UI
   */
  async payCash(expectedAmount) {
    EventBus.$emit('spinnerShow')

    try {
      const { data } = await shopInstance().post(
        `/admin/booking/${this.id}/payWithCash`
      )
      const encashedAmount = data.cash
      if (encashedAmount === expectedAmount)
        EventBus.$emit(
          'notify',
          i18n.t('booking.cashPaymentSuccessful'),
          'success'
        )
      else {
        EventBus.$emit(
          'notify',
          i18n.t('booking.unexpectedAmount', {
            bookingId: this.id,
            expectedAmount: expectedAmount,
          })
        )
      }
      return true
    } catch (e) {
      EventBus.$emit('notify', i18n.t('booking.cashPaymentFailed'))
      return false
    } finally {
      EventBus.$emit('spinnerHide')
    }
  }

  // are all booking entries cancelled?
  allBookingEntriesCancelled() {
    // iterate booking entries
    for (let i = 0; i < this.bookingEntries.length; i++) {
      let bookingEntry = this.bookingEntries[i]

      if (!bookingEntry.hasBeenCancelled()) return false
    }

    return true
  }

  /**
   * load the the booking from the api using its id. Returns false if the id is not set
   * @returns {Promise<boolean|Booking>}
   */
  async fetchBooking() {
    if (this.id) {
      /* global EventBus axios*/
      EventBus.$emit('spinnerShow')

      try {
        const { data } = await shopInstance().get(
          `/admin/booking/${this.getId()}`
        )

        await this.parseSingleBooking(data)
      } catch (e) {
        /* global EventBus */
        EventBus.$emit('notify', e.response)
      } finally {
        EventBus.$emit('spinnerHide')
      }
      return Promise.resolve(this)
    }
    return Promise.resolve(false)
  }

  /**
   * If the original basket of this booking was changed, it will be saved by this endpoint
   * @returns {Promise<boolean>}
   */
  async saveNewBasket() {
    EventBus.$emit('spinnerShow')
    try {
      const { data } = await shopInstance().patch(
        `/admin/booking/basket/${this.id}`
      )
      EventBus.$emit('notify', i18n.t('booking.bookingChanged'), 'success')
      return data.bookingId
    } catch (e) {
      // set back to old state
      EventBus.$emit('notify', i18n.t('booking.bookingNotChanged'))
      return false
    } finally {
      EventBus.$emit('spinnerHide')
    }
  }

  /**
   * init object with booking information from api
   * @param booking
   */
  parseApiBooking(booking) {
    this.id = booking.hasOwnProperty('id') ? booking.id : null
    this.bookingId = booking.hasOwnProperty('bookingId')
      ? booking.bookingId
      : null
    this.subTotal = booking.hasOwnProperty('subTotal') ? booking.subTotal : null
    this.total = booking.hasOwnProperty('total') ? booking.total : null
    this.hasPdf = booking.hasOwnProperty('hasPdf') ? booking.hasPdf : null
    this.paid = booking.paid
    //this.paidAt = booking.
    this.bookingStates.setBookingState(booking.state)
    this.note = booking.note
    this.destination = booking.hasOwnProperty('region')
      ? new Destination(booking.region)
      : new Destination({})
    this.basketUuid = booking.pe_basketId || null

    this.bookingEntries = []
    this.user = booking.user ? new User(booking.user) : null
    // parse api data
    if (booking.hasOwnProperty('booking_entries'))
      this.parseBookingEntriesFromApi(booking.booking_entries)
    // parse group discounts
    if (booking.groupDiscounts && booking.groupDiscounts.length)
      this.groupDiscounts.parseApiData(booking.groupDiscounts)
    // vats
    if (booking.vats && booking.vats.length) this.vats = new Vats(booking.vats)
    // cwc
    this.cwc = booking.climateCharge || null
    return this
  }

  // this method is used to parse a single booking fetched from the api because the api data comes in another structure
  async parseSingleBooking(data) {
    this.buyer = new User(data)

    if (data.bookings && data.bookings.length) {
      await this.parseApiBooking(data.bookings[0])
    }

    return Promise.resolve(this)
  }

  /**
   * create BookingEntry instances out of raw api data
   * @param bookingEntriesFromApi
   */
  parseBookingEntriesFromApi(bookingEntriesFromApi) {
    // iterate booking entries
    for (let i = 0; i < bookingEntriesFromApi.length; i++) {
      let bookingEntryFromApi = bookingEntriesFromApi[i]
      this.bookingEntries.push(new BookingEntry(bookingEntryFromApi))
    }

    return this
  }

  /**
   * Save the booking's note to the api
   */
  async saveNote() {
    EventBus.$emit('spinnerShow')

    try {
      await shopInstance().patch(`/admin/booking/${this.id}`, {
        note: this.getNote(),
      })

      EventBus.$emit('notify', i18n.t('booking.noteSaved'), 'success')
      return Promise.resolve(true)
    } catch (e) {
      // set back to old state
      EventBus.$emit('notify', i18n.t('booking.noteCouldNotBeSaved'))
      return Promise.resolve(false)
    } finally {
      EventBus.$emit('spinnerHide')
    }
  }

  /**
   * GETTERS
   */

  // returns the filtered array of booking entries, which are selected
  getSelectedBookingEntries() {
    return this.bookingEntries.filter((entry) => entry.isSelected)
  }

  // sum of all selected booking entries
  getTotalPriceOfSelectedBookingEntries() {
    let selectedEntries = this.getSelectedBookingEntries()

    let totalPrice = 0
    for (let i = 0; i < selectedEntries.length; i++) {
      totalPrice += selectedEntries[i].getPrice()
    }

    return totalPrice
  }

  getCancelledBookingEntries() {
    return this.bookingEntries.filter((entry) => entry.hasBeenCancelled())
  }

  getCancelledEntriesAmount() {
    let amountCancelledBookingEntries = 0
    let cancelledBookingEntries = this.getCancelledBookingEntries()
    for (let i = 0; i < cancelledBookingEntries.length; i++) {
      amountCancelledBookingEntries =
        amountCancelledBookingEntries +
        parseInt(cancelledBookingEntries[i].getPrice())
    }
    return amountCancelledBookingEntries
  }

  getTotalWithoutCancelledBookingEntries() {
    return this.getTotal() - this.getCancelledEntriesAmount()
  }

  getId() {
    return this.id
  }

  getBookingId() {
    return this.bookingId
  }

  getSubTotal() {
    return this.subTotal
  }

  getTotal() {
    return this.total
  }

  getHasPdf() {
    return this.hasPdf
  }

  getBookingEntries() {
    return this.bookingEntries
  }

  getBuyer() {
    return this.buyer
  }

  // has this booking been paid?
  isPaid() {
    return this.paid
  }

  getBookingEntryById(id) {
    for (let i = 0; i < this.bookingEntries.length; i++) {
      if (this.bookingEntries[i].getId() == id) return this.bookingEntries[i]
    }

    return null
  }

  getNote() {
    return this.note
  }

  // Type: BookingStates
  getBookingStates() {
    return this.bookingStates
  }

  getGroupDisounts() {
    return this.groupDiscounts
  }

  getGroupDiscountsArray() {
    return this.groupDiscounts.getGroupDiscounts()
  }

  getVats() {
    return this.vats
  }

  getVatsArray() {
    return this.vats.getVats()
  }

  getTotalWithoutVats() {
    return this.total - this.getVats().getTotalPrice()
  }

  getCwc() {
    return this.cwc
  }

  getDestination() {
    return this.destination
  }
  getBasketUuid() {
    return this.basketUuid
  }
  getPayment() {
    return this.payment
  }
}
