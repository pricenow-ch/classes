import { shopInstance } from '../utils/axiosInstance'
import Booking from './Booking'

export default class Bookings {
  constructor(bookings) {
    this.upcomingBookings = []
    this.pastBookings = []

    // all bookings of an user (called in UserBookings.js)
    this._userBookings = []
    if (bookings) {
      this._userBookings = this.parseApiData(bookings)
    }
  }

  /**
   * loading upcoming bookings from api
   * @returns {Promise<PromiseConstructor>}
   */
  async loadUpcomingBookings() {
    /* global EventBus axios store */
    EventBus.$emit('spinnerShow')

    try {
      const { data } = await shopInstance().get('/bookings/upcoming')

      this.upcomingBookings = await this.parseApiData(data)
    } catch (e) {
      EventBus.$emit('notify', e.response)
    } finally {
      EventBus.$emit('spinnerHide')
      return Promise
    }
  }

  /**
   * loading bookings in past from api900
   * @returns {Promise<PromiseConstructor>}
   */
  async loadPastBookings() {
    /* global EventBus axios store */
    EventBus.$emit('spinnerShow')

    try {
      const PAGE = 1
      const LIMIT = 300
      const { data } = await shopInstance().get(
        `/bookings/elapsed/${PAGE}/${LIMIT}`
      )

      this.pastBookings = await this.parseApiData(data)
    } catch (e) {
      EventBus.$emit('notify', e.response)
    } finally {
      EventBus.$emit('spinnerHide')
      return Promise
    }
  }

  /**
   * load all bookings
   * @returns {Promise<*[]Booking>}
   */
  async loadAllBookings() {
    await Promise.all([this.loadUpcomingBookings(), this.loadPastBookings()])

    return Promise.resolve(this.pastBookings.concat(this.upcomingBookings))
  }

  /**
   * create Booking instances out of raw api data
   * @param apiBookings
   * @returns {[]}
   */
  parseApiData(apiBookings) {
    let bookings = []

    // iterate bookings from api
    for (let i = 0; i < apiBookings.length; i++) {
      let apiBooking = apiBookings[i]

      bookings.push(new Booking(apiBooking))
    }

    return bookings
  }

  /**
   * search for a certain booking id and replace it with a new booking instance
   * @param bookingIdToBeReplaced
   * @param newBookingInstance
   */
  replaceUserBooking(bookingIdToBeReplaced, newBookingInstance) {
    for (let i = 0; i < this.userBookings.length; i++) {
      let tmpBooking = this.userBookings[i]
      if (tmpBooking.getId() === bookingIdToBeReplaced) {
        this.userBookings[i] = newBookingInstance
        return
      }
    }
  }

  /**
   * GETTERS AND SETTERS
   */
  getUpcomingBookings() {
    return this.upcomingBookings
  }

  getPastBookings() {
    return this.pastBookings
  }

  get userBookings() {
    return this._userBookings
  }

  set userBookings(value) {
    this._userBookings = value
  }
}
