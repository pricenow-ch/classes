import moment from 'moment'
import CurrentPostedPrice from '@/classes-shared/products/CurrentPostedPrice'
import { peInstance } from '../utils/axiosInstance'

export default class PriceHistoryService {
  /**
   * load price history from api
   * @param date
   * @param productDefinitionIds
   * @param destinationInstance
   * @returns {Promise<[]>}
   */
  async fetchHistory(date = new Date(), productDefinitionIds = []) {
    /* global EventBus axios */
    EventBus.$emit('spinnerShow')
    let prices = []
    try {
      const dateStr = moment(date).format('YYYY-MM-DD')
      const { status, data } = await peInstance(false).get(
        `admin/prices/historical/${dateStr}`,
        {
          params: {
            prodDefIds: productDefinitionIds.join(','),
          },
        }
      )

      if (status === 200) {
        prices = data.prices.map((price) => new CurrentPostedPrice(price))
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
