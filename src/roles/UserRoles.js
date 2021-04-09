import User from '../user/User'
import Roles from './Roles'

export default class UserRoles extends User {
  constructor(params) {
    super(params)
    // Type: Roles
    this._roles = new Roles(params.role2users)
  }

  /**
   * Add or delete role from user
   * @param role: Role
   * @param userId
   */
  async flipRole(role, userId) {
    if (this.hasRole(role)) await this.unlinkRole(role.id, userId)
    else await this.linkRole(role.id, userId)
  }

  async linkRole(roleId, userId) {
    EventBus.$emit('spinnerShow')
    try {
      await axios.post(
        store.getters.getCurrentDestinationInstance().getShopApi() +
          'admin/role/user',
        {
          userId: userId,
          roleId: roleId,
        }
      )
      return Promise.resolve(true)
    } catch (e) {
      EventBus.$emit('notify', i18n.t('roles.couldNotBeLinked'))
      return Promise.resolve(false)
    } finally {
      EventBus.$emit('spinnerHide')
    }
  }

  async unlinkRole(roleId, userId) {
    EventBus.$emit('spinnerShow')
    try {
      await axios.delete(
        store.getters.getCurrentDestinationInstance().getShopApi() +
          'admin/role/user',
        {
          data: {
            userId: userId,
            roleId: roleId,
          },
        }
      )
      return Promise.resolve(true)
    } catch (e) {
      EventBus.$emit('notify', i18n.t('roles.couldNotBeLinked'))
      return Promise.resolve(false)
    } finally {
      EventBus.$emit('spinnerHide')
    }
  }

  /**
   * Does this user have a specific role?
   * @param role: Role
   * @returns {*}
   */
  hasRole(role) {
    return this.roles.roles.find((tmpRole) => tmpRole.id === role.id)
  }

  get roles() {
    return this._roles
  }

  set roles(value) {
    this._roles = value
  }
}
