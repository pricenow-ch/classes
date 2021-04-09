import BookingEntry from './BookingEntry'
import Booking from './Booking'
import moment from 'moment'
import _ from 'lodash'

export default class BookingEntryFilterable extends BookingEntry {
  constructor(params) {
    super(params)
    this.filteredResults = []
    this.booking = params.booking ? new Booking(params.booking) : null
  }

  /**
   * loads booking entries by filters
   * @param from
   * @param to
   * @param productId
   * @param productDefinitionId
   * @param timePeriod
   * @param state
   * @returns {Promise<[]|*[]>}
   */
  async loadFilteredBookingEntries(
    from,
    to,
    productId,
    productDefinitionId,
    timePeriod,
    state
  ) {
    if (!from || !to) {
      throw new Error('from or to parameter not set!')
    }

    try {
      let url =
        store.getters.getCurrentDestinationInstance().getShopApi() +
        'admin/bookingEntry/filter?' +
        'from=' +
        from +
        '&to=' +
        to

      if (productId) {
        url += '&productId=' + productId
      }
      if (timePeriod) {
        url += '&timePeriod=' + timePeriod
      }
      if (productDefinitionId) {
        url += '&productDefinitionId=' + productDefinitionId
      }
      if (state) {
        url += '&state=' + state
      }

      let response = await axios.get(url)
      this.filteredResults = []
      response.data.forEach((rawSearchResult) => {
        this.filteredResults.push(new BookingEntryFilterable(rawSearchResult))
      })
    } catch (e) {
      /* global EventBus */
      EventBus.$emit('notify', e.response)
    }

    return Promise.resolve(this.filteredResults)
  }

  /**
   * get boundary dates
   * @returns {string}
   */
  getBoundaryDate() {
    if (this.startDate.getTime() === this.endDate.getTime()) {
      return moment(this.startDate).format('DD.MM.YYYY')
    }
    return (
      moment(this.startDate).format('DD.MM.YYYY') +
      ' ' +
      i18n.t('general.to') +
      ' ' +
      moment(this.endDate).format('DD.MM.YYYY')
    )
  }

  getBooking() {
    return this.booking
  }

  /**
   *
   * @param onlyPersonsComing: A person which has paid in the online shop or was manually confirmed by cash desk user
   * @returns {[]|*[]}
   */
  getBookingEntries(onlyPersonsComing = false) {
    if (onlyPersonsComing) {
      return this.filteredResults.filter((result) => {
        return (
          (result.booking.getBookingStates().isAutoConfirmed() &&
            result.booking.paid) ||
          result.booking.getBookingStates().isManualConfirmed()
        )
      })
    }
    return this.filteredResults
  }

  getTotalPeopleCount() {
    return _.sumBy(
      this.filteredResults,
      (bookingEntry) => bookingEntry.peopleCount
    )
  }
}
