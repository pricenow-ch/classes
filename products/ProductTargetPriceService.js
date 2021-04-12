import moment from 'moment'
import store from '@/store/store'
import TargetPrice from '@/classes/products/ProductTargetPrice'
import { peInstance } from '../utils/axiosInstance'

export default class ProductTargetPriceService {
  /**
   * load target prices
   * @param from
   * @param to
   * @param prodDefIds
   * @param destinationInstance
   * @returns {Promise<[]>}
   */
  async fetchBetween(from = new Date(), to = new Date(), prodDefIds = []) {
    /* global EventBus axios */
    EventBus.$emit('spinnerShow')
    let targetPrices = []
    try {
      const { data, status } = await peInstance.get('/admin/target_prices', {
        params: {
          from: moment(from).format('YYYY-MM-DD'),
          to: moment(to).format('YYYY-MM-DD'),
          prodDefIds: prodDefIds.join(','),
        },
      })

      if (status === 200) {
        targetPrices = data.map((baseRate) => new TargetPrice(baseRate))
      } else {
        EventBus.$emit('notify')
      }
    } catch (e) {
      console.error('err', e)
      EventBus.$emit('notify', e.response)
    } finally {
      EventBus.$emit('spinnerHide')
    }

    return targetPrices
  }
}
