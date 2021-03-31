import User from '../user/User'
import Bookings from './Bookings'

export default class UserBookings extends User {
  constructor(UserBookingRaw) {
    super(UserBookingRaw)
    this._bookings = new Bookings(UserBookingRaw.bookings)
    this._shadowUsers = []
    this.parseShadowUsers(UserBookingRaw.sourceUser)
  }

  parseShadowUsers(rawUserData) {
    if (rawUserData) {
      for (let i = 0; i < rawUserData.length; i++) {
        this.shadowUsers.push(new User(rawUserData[i].user))
      }
    }
  }

  addShadowUser(user) {
    if (!(user instanceof User)) user = new User(user)
    this.shadowUsers.push(user)
  }

  setShadowUsers(shadowUsers) {
    this.shadowUsers = shadowUsers
  }

  /**
   * GETTERS and SETTERS
   */
  getShadowUsersIncludingMe() {
    return [this, ...this.shadowUsers]
  }

  get bookings() {
    return this._bookings
  }

  set bookings(value) {
    this._bookings = value
  }

  get userBookings() {
    return this._bookings.userBookings
  }

  get shadowUsers() {
    return this._shadowUsers
  }

  set shadowUsers(value) {
    this._shadowUsers = value
  }
}
