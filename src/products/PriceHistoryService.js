import store from '../../../../../src/store/store'
import moment from 'moment'
import CurrentPostedPrice from './CurrentPostedPrice'

export default class PriceHistoryService {
  /**
   * load price history from api
   * @param date
   * @param productDefinitionIds
   * @param destinationInstance
   * @returns {Promise<[]>}
   */
  async fetchHistory(date = new Date(), productDefinitionIds = []) {
    let baseUrl = store.getters.getCurrentDestinationInstance().getBasePeApi()

    /* global EventBus axios */
    EventBus.$emit('spinnerShow')
    let prices = []
    try {
      const dateStr = moment(date).format('YYYY-MM-DD')
      let response = await axios.get(
        baseUrl + `admin/prices/historical/${dateStr}`,
        {
          params: {
            prodDefIds: productDefinitionIds.join(','),
          },
        }
      )

      if (response.status === 200) {
        response.data.prices.forEach((price) => {
          prices.push(new CurrentPostedPrice(price))
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
