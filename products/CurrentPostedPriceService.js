import moment from 'moment'
import CurrentPostedPrice from './CurrentPostedPrice'
import { peInstance } from '../utils/axiosInstance'

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
    /* global EventBus axios */
    EventBus.$emit('spinnerShow')
    let prices = []
    try {
      const { data, status } = await peInstance(false).get(
        '/admin/prices/current',
        {
          params: {
            from: moment(from).format('YYYY-MM-DD'),
            to: moment(to).format('YYYY-MM-DD'),
            prodDefIds: productDefinitionIds.join(','),
          },
        }
      )

      if (status === 200) {
        prices = data.prices.map(
          (price) => new CurrentPostedPrice(price, data.lastCalculationDate)
        )
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
