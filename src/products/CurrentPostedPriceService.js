import store from '@/store/store'
import moment from 'moment'
import CurrentPostedPrice from './CurrentPostedPrice'

export default class CurrentPostedPriceService {
  /**
   * load current posted prices
   * @param from
   * @param to
   * @param productDefinitionIds
   * @param destinationInstance
   * @returns {Promise<CurrentPostedPrice[]>}
   */
  async fetchBetween(
    from = new Date(),
    to = new Date(),
    productDefinitionIds = []
  ) {
    let baseUrl = store.getters.getCurrentDestinationInstance().getBasePeApi()

    /* global EventBus axios */
    EventBus.$emit('spinnerShow')
    let prices = []
    try {
      let response = await axios.get(baseUrl + 'admin/prices/current', {
        params: {
          from: moment(from).format('YYYY-MM-DD'),
          to: moment(to).format('YYYY-MM-DD'),
          prodDefIds: productDefinitionIds.join(','),
        },
      })

      if (response.status === 200) {
        response.data.prices.forEach((price) => {
          prices.push(
            new CurrentPostedPrice(price, response.data.lastCalculationDate)
          )
        })
      } else {
        EventBus.$emit('notify')
      }
    } catch (e) {
      console.error('err', e)
      EventBus.$emit('notify', e.response)
    } finally {
      EventBus.$emit('spinnerHide')
    }
    return prices
  }
}
