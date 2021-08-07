import moment from 'moment-timezone'

export default class DateHelper {
  /**
   * to communicate with the pe engine. transforms a local date instance to the apis expected format.
   * a local time is transformed to the utc time. e.g. 2019-09-08T00:00:00.000+02:00 => 2019-09-08T00:00:00.000Z
   * @param dateInstance
   * @returns {*}
   */
  static shiftLocalToUtcIsoString(dateInstance) {
    return moment(dateInstance.getTime()).toISOString(true).slice(0, 23) + 'Z'
  }

  static shiftLocalToSimpleDateString(dateInstance) {
    return moment(dateInstance.getTime()).format('YYYY-MM-DD')
  }

  /**
   * shift utc time (from api) to local time => used in calendar
   * @param dateInstance
   * @returns {*}
   */
  static shiftUtcToLocal(dateInstance) {
    dateInstance.setMinutes(
      dateInstance.getMinutes() + dateInstance.getTimezoneOffset()
    )
    return dateInstance
  }

  static getDateList(fromDate, toDate) {
    let dateList = []
    for (
      let currentDate = new Date(fromDate);
      currentDate <= toDate;
      currentDate.setDate(currentDate.getDate() + 1)
    ) {
      dateList.push(new Date(currentDate))
    }
    return dateList
  }
}
