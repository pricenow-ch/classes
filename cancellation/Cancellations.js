import Cancellation from './Cancellation'
import DataTable from '../VuetifyHelper/DataTable'

export default class Cancellations extends DataTable {
  constructor(store) {
    super()
    this.store = store
    this.cancellations = []
  }

  // load more cancellations from api
  changePage(cancellationTypeId) {
    if (this.pagination.page >= this.highestPage) {
      super.changePage()

      // load cancellations
      this.loadCancellations(
        cancellationTypeId,
        this.getHighestPage(),
        this.getLimit(),
        false
      )
    }
  }

  // load cancellations from api
  async loadCancellations(
    cancellationTypeId,
    page = 1,
    limit = this.getLimit() * 2,
    reset = true
  ) {
    /* global EventBus axios */
    EventBus.$emit('spinnerShow')

    if (reset) {
      this.cancellations = []
      this.reset()
    }

    try {
      const dest = this.store.getters.getCurrentDestinationInstance()
      this.loading = true
      let response = await axios.get(
        dest.getShopApi() +
          'cancellations/' +
          cancellationTypeId +
          '/' +
          page +
          '/' +
          limit
      )

      // iterate data
      response.data.forEach((cancellation) => {
        this.cancellations.push(new Cancellation(cancellation))
      })
    } catch (e) {
      EventBus.$emit('notify', e.response)
    } finally {
      this.loading = false
      EventBus.$emit('spinnerHide')
    }
    return Promise
  }

  // load cancellations from api for export
  async loadCancellationsForExport(from, to, reset = true) {
    /* global EventBus axios */
    EventBus.$emit('spinnerShow')

    if (reset) {
      this.cancellations = []
      this.reset()
    }

    try {
      const dest = this.store.getters.getCurrentDestinationInstance()
      this.loading = true
      let response = await axios.get(
        dest.getShopApi() +
          'cancellations/filter?' +
          'from=' +
          from +
          '&to=' +
          to
      )

      // iterate data
      response.data.forEach((cancellation) => {
        this.cancellations.push(new Cancellation(cancellation))
      })
    } catch (e) {
      EventBus.$emit('notify', e.response)
    } finally {
      this.loading = false
      EventBus.$emit('spinnerHide')
    }
    return Promise
  }

  /**
   * return array with elements of Type: Cancellation
   * @returns {Array}
   */
  getCancellations() {
    return this.cancellations
  }
}
