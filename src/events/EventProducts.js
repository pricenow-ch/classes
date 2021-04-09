import Products from '../products/Products'
import _ from 'lodash'
/**
 * Only products holding an event in the future
 */

export default class EventProducts extends Products {
  constructor() {
    super()
  }

  async loadEvents(timePeriode = 'future', from = null, to = null) {
    // first load all products of the current destination
    await this.loadProducts()

    // fetch all events in the future
    this.products = await this.fetchEventsFromApi(
      this.products,
      true,
      true,
      timePeriode,
      from,
      to
    )

    return Promise.resolve(this)
  }

  /**
   * @override
   * @param destinationInstance
   * @param showSpinner
   * @returns {Promise<[]>}
   */
  async loadProducts(destinationInstance = null, showSpinner = true) {
    // load all products
    await super.loadProducts(destinationInstance, showSpinner)

    // only get products, which are of type event template
    // todo: new api endpoint which only returns event template products
    let products = []
    for (let i = 0; i < this.products.length; i++) {
      if (this.products[i].isEventTemplate()) products.push(this.products[i])
    }
    // override with new products
    this.products = products

    return this.products
  }

  // fetch capacities for all event products (minimalized products array)
  async loadCapacities(from, to, force = false) {
    await Promise.all(
      this.events.map(async (product) => {
        // todo: check, if await is needed (api calls should be serialized)
        await product.fetchCapacities(from, to, force, false)
      })
    )

    Promise.resolve(this)
  }

  findProductById(id) {
    return _.find(this.products, function (prod) {
      return prod.id === id
    })
  }

  get events() {
    return this.products
  }
}
