import moment from 'moment'

export default class DateRange {
  constructor(startDate = new Date(), endDate = new Date()) {
    // Type: JS Date
    this._startDate = startDate
    // Type: JS Date
    this._endDate = endDate
  }

  update(startDate, endDate) {
    if (!startDate || !endDate) throw new Error('No start or end date provided')
    this.startDate = startDate
    this.endDate = endDate
  }

  getStartDateMoment() {
    return moment(this.startDate)
  }
  getEndDateMoment() {
    return moment(this.endDate)
  }

  getStartDateApiFormat() {
    return this.getStartDateMoment().format('YYYY-MM-DD')
  }

  getEndDateApiFormat() {
    return this.getEndDateMoment().format('YYYY-MM-DD')
  }

  // input format 'YYYY-MM-DD'
  setApiFormatStartDate(date) {
    let newDate = new Date(date)
    newDate.setHours(0, 0, 0, 0)
    this.startDate = newDate
  }

  // input format 'YYYY-MM-DD'
  setApiFormatEndDate(date) {
    let newDate = new Date(date)
    newDate.setHours(0, 0, 0, 0)
    this.endDate = newDate
  }

  get startDate() {
    return this._startDate
  }

  set startDate(value) {
    this._startDate = value
  }

  get endDate() {
    return this._endDate
  }

  set endDate(value) {
    this._endDate = value
  }
}
