export default class Role {
  constructor(params) {
    this._id = params.id || null
    this._name = params.name || null
    this._description = params.description || null
  }

  get id() {
    return this._id
  }

  set id(value) {
    this._id = value
  }

  get name() {
    return this._name
  }

  set name(value) {
    this._name = value
  }

  get description() {
    return this._description
  }

  set description(value) {
    this._description = value
  }
}
