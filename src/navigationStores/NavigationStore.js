export default class NavigationStore {
  constructor(routeName) {
    this._routeName = routeName
    this._storeObject = {}
  }

  get routeName() {
    return this._routeName
  }

  set routeName(value) {
    this._routeName = value
  }

  get storeObject() {
    return this._storeObject
  }

  set storeObject(value) {
    this._storeObject = value
  }
}
