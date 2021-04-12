import { shopInstance } from '../utils/axiosInstance'
import UserRoles from './UserRoles'

export default class UsersRoles {
  constructor() {
    // Type: UserRoles[] (an array with users containing their roles)
    this._usersRoles = []
  }

  async loadUsersRoles() {
    EventBus.$emit('spinnerShow')
    try {
      const { data } = await shopInstance().get('/admin/role/user')
      await this.parseApiData(data)
      return Promise.resolve(true)
    } catch (e) {
      EventBus.$emit('notify', i18n.t('UsersRoles.couldNotBeLoaded'))
      return Promise.resolve(false)
    } finally {
      EventBus.$emit('spinnerHide')
    }
  }

  parseApiData(roles) {
    this._usersRoles = []
    for (let i = 0; i < roles.length; i++) {
      this._usersRoles.push(new UserRoles(roles[i]))
    }
    return true
  }

  // is an user in the users list?
  hasUser(uid) {
    return this.usersRoles.find((userRole) => userRole.getId() === uid)
  }

  get usersRoles() {
    return this._usersRoles
  }

  set usersRoles(value) {
    this._usersRoles = value
  }
}
