import BookingAggregatedModel from './BookingAggregatedModel'

export default class BookingAggregatedService {
  constructor() {
    this.aggregatedBookings = []
  }

  /**
   * request the aggregated booking date from the api
   * @param from
   * @param to
   * @returns BookingAggregatedModel[]
   */
  async fetchAggregatedBookings(from, to) {
    if (!from || !to) {
      throw new Error('from or to parameter not set!')
    }
    this.aggregatedBookings = []
    try {
      let url =
        store.getters.getCurrentDestinationInstance().getShopApi() +
        'admin/bookingEntry/sum?' +
        'from=' +
        from +
        '&to=' +
        to

      let response = await axios.get(url)
      response.data.forEach((raw) => {
        this.aggregatedBookings.push(new BookingAggregatedModel(raw))
      })
    } catch (e) {
      /* global EventBus */
      EventBus.$emit('notify', e.response)
    }

    return Promise.resolve(this.aggregatedBookings)
  }

  getAggregatedBookings() {
    return this.aggregatedBookings
  }
}
