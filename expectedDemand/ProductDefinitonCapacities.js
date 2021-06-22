import store from '../../store/store'
import moment from 'moment'
import ExpectedDemand from '@/classes-shared/expectedDemand/ExpectedDemand'
import { peInstance } from '../utils/axiosInstance'

// loads realized demand => old pattern => to be refactored
export default class ProductDefinitionCapacities {
  constructor() {
    this.capacities = {}
    this.loading = false
  }

  /**
   * Get all capacities in a time range for all product definitions
   * @param from
   * @param to
   * @param destinationInstance
   * @returns {Promise<PromiseConstructor>}
   */
  async getAllProductDefinitionCapacities(
    from = new Date(),
    to,
    destinationInstance = null
  ) {
    const destSlug = store.getters.getDestinationInstanceSlug(
      destinationInstance
    )
    /* global EventBus axios */
    EventBus.$emit('spinnerShow')

    try {
      this.capacities = {}
      const { status, data } = await peInstance(false).get(
        '/admin/expected_demands/',
        {
          params: {
            from: moment(from).format('YYYY-MM-DD'),
            to: moment(to).format('YYYY-MM-DD'),
          },
        }
      )

      if (status === 200) {
        this.capacities[destSlug] = {}
        data.productDefinitions.forEach((prodDef) => {
          const demand = prodDef?.expectedDemands[0]
          this.capacities[destSlug][prodDef.id] = {}
          this.capacities[destSlug][prodDef.id][
            demand.date
          ] = new ExpectedDemand(demand)
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

    return Promise
  }

  /**
   * fetch single capacity
   * efficiently
   * @param destSlug
   * @param prodDefId
   * @param date
   * @returns ExpectedDemand | null
   */
  getRealizedDemandByPath(prodDefId, date) {
    return this?.capacities?.[prodDefId]?.[date]
  }

  /**
   * Get all capacities in a time range for all product definitions
   * @param from
   * @param to
   * @param destinations
   * @returns {Promise<PromiseConstructor>}
   */
  async getAllRealizedDemandForMultipleDestinations(
    from = new Date(),
    to,
    destinations = []
  ) {
    try {
      this.capacities = {}
      this.loading = true
      const { data, status } = await peInstance(false).get(
        '/admin/realized_demand/batch',
        {
          params: {
            from: moment(from).format('YYYY-MM-DD'),
            to: moment(to).format('YYYY-MM-DD'),
            destinationNames: destinations
              .map((dest) => dest.getSlug())
              .join(','),
          },
        }
      )

      destinations.forEach((dest) => {
        this.capacities[dest.slug] = {}
      })
      if (status === 200) {
        const realizedDemand = data
        for (let prodDefId in realizedDemand) {
          this.capacities[prodDefId] = {}
          realizedDemand[prodDefId].forEach((demandOnDate) => {
            this.capacities[prodDefId][
              demandOnDate.validity_start_date
            ] = new ExpectedDemand(demandOnDate)
          })
        }
      } else {
        EventBus.$emit('notify')
      }
    } catch (e) {
      console.error('err', e)
      EventBus.$emit('notify', e.response)
    } finally {
      EventBus.$emit('spinnerHide')
      this.loading = false
    }

    return Promise
  }

  isLoading() {
    return this.loading
  }
}
