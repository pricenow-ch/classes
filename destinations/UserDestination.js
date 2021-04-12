import Destination from './Destination'
import DateHelper from '../DateHelper'
import { peInstance } from '../utils/axiosInstance'
/**
 * Child class of destination used mostly in AppUserInstance. Maybe also in the filter of the pricing engine.
 */

export default class UserDestination extends Destination {
  constructor(params) {
    super(params)

    this.permissions =
      params.hasOwnProperty('acl') && params.acl.hasOwnProperty('permissions')
        ? params.acl.permissions
        : null
    this.capacities = []
  }

  /**
   * does the user have any backend permission in this destination
   * @returns {boolean}
   */
  hasAnyPermission() {
    return this.permissions !== null
  }

  /**
   * Does the user have a certain permission (e.g. BACKEND)
   * @param key
   * @returns {Boolean}
   */
  hasUserPermissionInThisDestination(key) {
    if (this.permissions) return this.permissions.includes(key)
    else return false
  }

  /**
   * load capacities of all productDefinitions from api
   */
  async loadCapacities(from = new Date(), to) {
    // set class variables
    this.fromDateInstance = from
    this.toDateInstance = to

    EventBus.$emit('spinnerShow')

    try {
      const response = await peInstance(false).get('/admin/expected_demands', {
        params: {
          from: DateHelper.shiftLocalToUtcIsoString(this.fromDateInstance),
          to: DateHelper.shiftLocalToUtcIsoString(this.toDateInstance),
        },
      })

      if (response.status === 200) {
        this.capacities = response.data.capacities
      } else {
        EventBus.$emit('notify')
      }
    } catch (e) {
      EventBus.$emit('notify', e.response)
    } finally {
      EventBus.$emit('spinnerHide')
      // eslint-disable-next-line no-unsafe-finally
      //return Promise
    }
  }
}
