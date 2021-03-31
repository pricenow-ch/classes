import User from '../user/User'

export default class Voucher {
  constructor(params) {
    this.code = params.hasOwnProperty('code') ? params.code : null
    this.value = params.hasOwnProperty('value') ? params.value : null
    this.type = params.hasOwnProperty('type') ? params.type : null
    this.valid = params.hasOwnProperty('valid') ? params.valid : null
    this.expireDate = params.hasOwnProperty('expireDate')
      ? new Date(params.expireDate)
      : null
    this.userInstance = params.user ? new User(params.user) : null
  }

  getCode() {
    return this.code
  }

  getValue() {
    return this.value
  }

  getType() {
    return this.type
  }

  getExpireDate() {
    return this.expireDate
  }

  isValid() {
    return this.valid
  }

  getUser() {
    return this.userInstance
  }
}
