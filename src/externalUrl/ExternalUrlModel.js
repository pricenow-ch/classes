export default class ExternalUrlModel {
  constructor(data) {
    if (data) {
      this.id = data.id ? data.id : null
      this.regionId = data.regionId ? data.regionId : null
      this.name = data.name ? data.name : null
      this.type = data.type ? data.type : null
      this.url = data.url ? data.url : null
      this.externalUrlRoles = data.externalUrlRoles
        ? data.externalUrlRoles
        : null
    }
  }

  hasRole(roleId) {
    if (this.externalUrlRoles.length < 1) return false

    let result = false

    this.externalUrlRoles.forEach((eUrlRole) => {
      if (eUrlRole.active && eUrlRole.roleId === roleId) {
        result = true
      }
    })

    return result
  }
}
