export default class BookingState {
  constructor(state, title) {
    this._state = state
    this._title = title
  }

  get state() {
    return this._state
  }

  set state(value) {
    this._state = value
  }

  get title() {
    return this._title
  }

  set title(value) {
    this._title = value
  }
}
