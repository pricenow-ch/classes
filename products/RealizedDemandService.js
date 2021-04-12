import store from '../../store/store'
import moment from 'moment'
import RealizedDemand from '@/classes/products/RealizedDemand'
import { peInstance } from '../utils/axiosInstance'

export default class RealizedDemandService {
  /**
   * load realized demand
   * @param from
   * @param to
   * @param productDefinitionIds
   * @param destinationInstance
   * @returns {Promise<[]>}
   */
  async fetchBetween(
    from = new Date(),
    to = new Date(),
    productDefinitionIds = []
  ) {
    /* global axios */
    let realizedDemand = {}
    try {
      const { status, data } = await peInstance(false).get(
        '/admin/realized_demand',
        {
          params: {
            from: moment(from).format('YYYY-MM-DD'),
            to: moment(to).format('YYYY-MM-DD'),
            prodDefIds: productDefinitionIds.join(','),
            destinationNames: store.getters
              .getCurrentDestinationInstance()
              .getSlug(),
          },
        }
      )

      if (status === 200) {
        realizedDemand = new RealizedDemand(data)
      } else {
        EventBus.$emit('notify')
      }
    } catch (e) {
      console.error('err', e)
      EventBus.$emit('notify', e.response)
    }

    return realizedDemand
  }
}
