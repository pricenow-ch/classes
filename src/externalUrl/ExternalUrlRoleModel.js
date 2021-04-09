export default class ExternalUrlRoleModel {
  constructor(data) {
    if (data) {
      this.id = data.id ? data.id : null
      this.externalUrlId = data.externalUrlId ? data.externalUrlId : null
      this.roleId = data.roleId ? data.roleId : null
      this.active = data.active ? data.active : null
    }
  }
}
