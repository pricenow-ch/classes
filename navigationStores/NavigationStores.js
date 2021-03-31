import NavigationStore from './NavigationStore'

export default class NavigationStores {
  constructor() {
    this._navigationStores = []
  }

  // just call this method on onMounted() hook, to create a new store depending on the route or overtake the existing
  initNavigationStore(routeObject) {
    if (!this.getNavigationStoreByRouteObject(routeObject)) {
      this.navigationStores.push(new NavigationStore(routeObject.name))
    }
  }

  getNavigationStoreByRouteObject(routeObject) {
    return this.navigationStores.find(
      (navigationStore) => navigationStore.routeName === routeObject.name
    )
  }

  getNavigationStoreByRouteName(routeName) {
    return this.navigationStores.find(
      (navigationStore) => navigationStore.routeName === routeName
    )
  }

  get navigationStores() {
    return this._navigationStores
  }

  set navigationStores(value) {
    this._navigationStores = value
  }
}
