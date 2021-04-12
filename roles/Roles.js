import { shopInstance } from '../utils/axiosInstance'
import Role from './Role'

export default class Roles {
  constructor(params = []) {
    // Type: Role[] (Array with Role)
    this._roles = []
    if (params.length) this.parseApiData(params)
  }

  parseApiData(roles) {
    this.roles = []
    for (let i = 0; i < roles.length; i++) {
      let role = roles[i].role || roles[i]
      this._roles.push(new Role(role))
    }
    return true
  }

  /**
   * Fetch all roles which are available for a region.
   * @returns {Promise<boolean>}
   */
  async loadAvailableRolesForRegion(destination = null) {
    EventBus.$emit('spinnerShow')
    try {
      const response = await shopInstance().get('/admin/role')
      await this.parseApiData(response.data)
      return Promise.resolve(true)
    } catch (e) {
      EventBus.$emit('notify', i18n.t('roles.couldNotBeLoaded'))
      return Promise.resolve(false)
    } finally {
      EventBus.$emit('spinnerHide')
    }
  }

  get roles() {
    return this._roles
  }

  set roles(value) {
    this._roles = value
  }
}
