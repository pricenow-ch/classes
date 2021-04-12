import { shopInstance } from './utils/axiosInstance'
import DateHelper from './DateHelper'
import ExtraRide from './ExtraRide'

export default class ExtraRides {
  constructor() {
    this.rides = []
    this.today = new Date()
    this.startDate = null
    this.endDate = null
  }

  /**
   * Parse dates params, call to API and load all extra rides on selected date / within date range
   * @param dates
   * @returns [{}]
   */
  loadExtraRides(dates) {
    let datesArray = this.parseSelectedDates(dates)
    this.startDate = DateHelper.shiftLocalToUtcIsoString(
      new Date(datesArray[0].setHours(0, 0, 0, 0))
    )
    this.endDate = DateHelper.shiftLocalToUtcIsoString(
      new Date(datesArray[1].setHours(23, 59, 59, 999))
    )
    // Reset current rides array
    this.rides = []
    this.getExtraRideByDate(this.startDate, this.endDate)
  }

  /**
   * Returns selected date(s) for extra rides as date instances that can later be passed to api as strings
   * @requires Array
   * @type Array
   * @returns [dateInstance, dateInstance]
   */
  parseSelectedDates(dates) {
    // If no date was selected, return extra rides of today by default => TODO: set different start/end times of day
    if (!dates.length) return [this.today, this.today]
    // If date range was selected and dates are in opposite order, switch them
    else if (dates.length == 2 && dates[1] < dates[0])
      return [new Date(dates[1]), new Date(dates[0])]
    // Single date selected
    else if (dates.length == 1) return [new Date(dates[0]), new Date(dates[0])]
    else return [new Date(dates[0]), new Date(dates[1])]
  }

  async getExtraRideByDate(startDate, endDate) {
    // expects array as params
    try {
      const { data } = await shopInstance().get(
        `/admin/extraRide/${startDate}/${endDate}`
      )

      data.forEach((params) => {
        this.rides.push(new ExtraRide(params))
      })
    } catch (e) {
      EventBus.$emit('notify', i18n.t('extraRides.updateNotSuccessfull'))
    } finally {
      return Promise
    }
  }

  async getExtraRideById(id) {
    try {
      let response = await shopInstance().get(`/admin/extraRide/${id}`)
      if (response.status === 200) {
        return new ExtraRide(response.data)
      }
    } catch (e) {
      EventBus.$emit('notify', i18n.t('extraRides.editNotSuccessfull'))
      return new ExtraRide({})
    }
  }

  /**
   * Pass extra ride data to api
   */

  async addExtraRide(ascentDate, descentDate, comment) {
    // Api doesn't accept parameters with null values, therefore params object only contains keys that have values (ascent / descent date possibly isn't defined)
    function returnParamsObject() {
      let params = {}
      ascentDate ? (params.ascentDate = ascentDate) : null
      descentDate ? (params.descentDate = descentDate) : null
      comment ? (params.comment = comment) : null
      return params
    }

    try {
      const response = await shopInstance().post(
        '/admin/extraRide',
        returnParamsObject(ascentDate, descentDate, comment)
      )

      if (response.status === 200) {
        EventBus.$emit(
          'notify',
          i18n.t('extraRides.newExtraRideSuccessfull'),
          'success'
        )
      }
    } catch (e) {
      EventBus.$emit('notify', e.response)
    } finally {
      return Promise
    }
  }

  async updateExtraRide(id, ascentDate, descentDate, comment) {
    // In contrast to the params function in addExtraRide, all params get passed because the patch request has to overwrite all values (e.g. empty values)
    function returnParamsObject() {
      let params = {}
      params.ascentDate = ascentDate
      params.descentDate = descentDate
      params.comment = comment
      return params
    }

    try {
      let response = await shopInstance().patch(
        `/admin/extraRide/${id}`,
        returnParamsObject(ascentDate, descentDate, comment)
      )

      if (response.status === 200) {
        EventBus.$emit(
          'notify',
          i18n.t('extraRides.editSuccessfull'),
          'success'
        )
      }
    } catch (e) {
      EventBus.$emit('notify', e.response)
    } finally {
      return Promise
    }
  }

  async deleteExtraRide(id) {
    try {
      const response = await shopInstance().delete(`/admin/extraRide/${id}`)

      if (response.status === 200) {
        EventBus.$emit(
          'notify',
          i18n.t('extraRides.deletionSuccessfull'),
          'success'
        )
      }
    } catch (e) {
      EventBus.$emit('notify', i18n.t('extraRides.deletionNotSuccessfull'))
    } finally {
      return Promise
    }
  }

  getRides() {
    return this.rides
  }
}
