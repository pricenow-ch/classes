import store from '../../store/store'
import Product from './Product'
import _ from 'lodash'
import DateHelper from '../utils/DateHelper'
import Price from './Price'
import EventHelper from '../events/EventHelper'
import { peInstance, shopInstance } from '../utils/axiosInstance'

export default class Products extends EventHelper {
  constructor(param = {}) {
    super()
    this._products = param.products ? param.products : []
  }

  async loadProducts(
    destinationInstance = null,
    showSpinner = true,
    fetchInactive = false
  ) {
    /* global EventBus axios */
    if (showSpinner) EventBus.$emit('spinnerShow')
    try {
      const response = await peInstance().get(`/products`, {
        params: {
          inactive: fetchInactive && '1',
        },
      })

      if (response.status === 200) {
        await this.parseApiData(response.data, false, destinationInstance)
      } else {
        EventBus.$emit('notify')
      }
    } catch (e) {
      EventBus.$emit('notify', e.response)
    } finally {
      if (showSpinner) EventBus.$emit('spinnerHide')
    }
    return Promise.resolve(this)
  }

  /**
   * load all products in one request to prevent
   * blocking the concurrent request limit in the browser
   * @param fetchInactive
   * @param destinations
   * @returns {Promise<Products>}
   */
  async loadProductsForAllDestinations(destinations, fetchInactive = false) {
    /* global EventBus axios */
    EventBus.$emit('spinnerShow')
    try {
      // IMPORT: Map destinations over slug and not id => shop-api and pe-api don't have the same ids!
      const destinationSlugs = destinations.map((destination) => {
        return destination.slug
      })
      if (destinationSlugs.length > 0) {
        const response = await peInstance().get(`/products/pools`, {
          params: {
            poolIdentifier: destinationSlugs.join(','),
            inactive: fetchInactive && '1',
          },
        })
        if (response.status === 200) {
          response.data.products.forEach((apiProduct) => {
            // instantiate product class
            let productInstance = new Product(apiProduct)
            // create product definitions and set the links
            productInstance.addProductDefinitions(
              apiProduct.productDefinitions,
              productInstance
            )
            // if this product is already defined simply push the destination
            const index = _.findIndex(this.products, (prod) => {
              return prod.id == apiProduct.id
            })
            const destinationInstance = destinations.find(
              (destination) => destination.slug === apiProduct.pool.identifier
            )
            // set different pe id
            destinationInstance.setPeId(apiProduct.pool.id)
            if (index > -1) {
              this.products[index].destinations.push(destinationInstance)
            } else {
              productInstance.destinations.push(destinationInstance)
              this.products.push(productInstance)
            }
          })
        } else {
          EventBus.$emit('notify')
        }
      }
    } catch (e) {
      EventBus.$emit('notify', e.response)
    } finally {
      EventBus.$emit('spinnerHide')
    }
    return Promise.resolve(this)
  }

  /**
   * load the data of all products we have
   * @returns {Promise<void>}
   */
  async loadProductsByIds() {
    EventBus.$emit('spinnerShow')
    const productIds = this.products.map((product) => product.getId())

    try {
      const response = await peInstance().get('/products', {
        params: {
          ids: productIds + '',
        },
      })

      // parse response
      await this.parseApiData(response.data, true)
      return Promise.resolve(response)
    } catch (e) {
      EventBus.$emit('notify', e.response)
      return Promise.resolve(false)
    } finally {
      EventBus.$emit('spinnerHide')
    }
  }

  /**
   * Creates product instances out of a set of api data
   * @param apiProducts
   * @returns {Promise<void>}
   */
  async parseApiData(
    apiProducts,
    reset = false,
    destinationInstance = store.getters.getCurrentDestinationInstance()
  ) {
    if (reset) this.products = []
    // iterate all products
    apiProducts.forEach((apiProduct) => {
      // instantiate product class
      let productInstance = new Product(apiProduct)
      // create product definitions and set the links
      productInstance.addProductDefinitions(
        apiProduct.productDefinitions,
        productInstance
      )
      // if this product is already defined simply push the destination
      const index = _.findIndex(this.products, (prod) => {
        return prod.id == apiProduct.id
      })

      if (index > -1) {
        this.products[index].destinations.push(destinationInstance)
      } else {
        productInstance.destinations.push(destinationInstance)
        this.products.push(productInstance)
      }
    })
  }

  /**
   * ADMIN FUNCTION
   * loads all prices of the current destination and assigns them to the corresponding product definitions
   * @return {Promise<Products>}
   */
  async loadPrices() {
    /* global EventBus axios */
    // get first season start of all products (or today, if season started yet)
    const from = await this.getFirstSeasonStart()

    try {
      const { data } = await peInstance(false).get('/admin/prices', {
        params: {
          from: DateHelper.shiftLocalToSimpleDateString(from),
          to: DateHelper.shiftLocalToSimpleDateString(from),
          poolNames: store.getters.getCurrentDestinationInstance().getSlug(),
        },
      })

      if (data) {
        // assign prices from pe to each product definition
        await this.parsePrices(data)
      }
    } catch (e) {
      // retry to fetch prices
      setTimeout(() => {
        this.loadPrices()
      }, 10000)
    }
    return Promise.resolve(this)
  }

  // assign prices from pe to each product definition
  parsePrices(prices) {
    prices = prices.productDefinitions
    if (this.products.length) {
      // iterate products
      for (let i = 0; i < this.products.length; i++) {
        let productDefinitions = this.products[i].getProductDefinitions()

        // iterate product definitions
        for (let b = 0; b < productDefinitions.length; b++) {
          let productDefinition = productDefinitions[b]

          // reset prices array of the product definition
          productDefinition.prices = []

          // does a product definition id of a price match with the current product definition?
          // iterate prices
          for (let c = 0; c < prices.length; c++) {
            let currentPrice = prices[c]
            if (currentPrice.id === productDefinition.getId()) {
              // iterate prices of the price array inside the prices
              for (let d = 0; d < currentPrice.prices.length; d++) {
                productDefinition.prices.push(new Price(currentPrice.prices[d]))
              }

              break // performance
            }
          }
        }
      }
    }
  }

  /**
   * Override capacities rule based. The method considers the capacityPreview values which live in the ValueCapacity class.
   * dates: Array<String<YYYY-MM-DD>>
   */
  async overrideCapacitiesRulebased(dates, dateToLookAt) {
    if (!dates.length) throw new Error('No dates provided!')
    EventBus.$emit(
      'spinnerShow',
      i18n.t('products.capacityOverrideTakesAWhile')
    )
    // prepare the api object
    let apiObject = {
      products: [],
      dates,
    }
    // prepare date to look at
    let dateForCapacities = new Date(
      new Date(dateToLookAt).setHours(0, 0, 0, 0)
    )
    // iterate products
    for (let i = 0; i < this.products.length; i++) {
      let product = this.products[i]
      // get all capacities of the current product on the first date, as only there are previewCapacity
      let capacities = product
        .getProductCapacity()
        .getCapacitiesbyDate(dateForCapacities)

      apiObject.products.push({
        pe_productId: product.getId(),
        key: product.getProductCapacity().getKey(),
        values: [],
        capacity: null,
      })
      // iterate capacities
      for (let b = 0; b < capacities.length; b++) {
        let capacity = capacities[b]
        if (capacity.getCapacityPreview() !== null) {
          let apiProduct = apiObject.products.find(
            (tmpProduct) => tmpProduct.pe_productId === product.getId()
          )
          if (!apiProduct) throw new Error('Product in array not found!')
          apiProduct.values.push(capacity.getValue())
          apiProduct.capacity = capacity.getCapacityPreview()
        }
      }
    }
    try {
      await shopInstance().put(
        '/admin/capacity/products/override/rulebased',
        apiObject
      )
      EventBus.$emit(
        'notify',
        i18n.t('products.capacitiesOverriden'),
        'success'
      )
      return Promise.resolve(true)
    } catch (e) {
      EventBus.$emit('notify', i18n.t('products.overrideFailed'))
      return Promise.resolve(false)
    } finally {
      EventBus.$emit('spinnerHide')
    }
  }

  resetCapacityPreviews() {
    // iterate products
    for (let i = 0; i < this.products.length; i++) {
      let productCapacity = this.products[i].getProductCapacity()
      if (productCapacity) productCapacity.resetCapacityPreviews()
    }
  }

  /**
   * FILTER
   */
  /**
   * returning product definitions
   * @param attributes
   * @param regions
   * @returns {Promise<void>}
   */
  async filterProductsByAttributesAndDestinations(attributes) {
    let filtered = []
    for (let i = 0; i < this.products.length; i++) {
      filtered = filtered.concat(
        this.products[i].filterProductByAttributesAndDestinations(attributes)
      )
    }

    return filtered
  }

  /**
   * filter prod defs bei their ids
   * @param prodDefIds
   * @returns {Promise<*[]>}
   */
  async filterByProductDefIds(prodDefIds) {
    if (prodDefIds) {
      let filtered = []
      for (let i = 0; i < this.products.length; i++) {
        filtered = filtered.concat(
          this.products[i].filterByProdDefIds(prodDefIds)
        )
      }

      return filtered
    }

    return this.getAllProductDefinitions()
  }

  /**
   * GETTERS
   */
  get products() {
    return this._products
  }

  set products(products) {
    this._products = products
  }

  /**
   *
   * @param excludeEvents: only get products without products which are event templates
   * @returns {[]|*[]}
   */
  getProducts(
    excludeEventTemplates = false,
    excludeRequests = true,
    excludeRequired = true
  ) {
    let productsToReturn = []
    // filter products
    if (excludeEventTemplates || excludeRequests || excludeRequired) {
      for (let i = 0; i < this.products.length; i++) {
        let product = this.products[i]
        if (
          (excludeEventTemplates && product.isEventTemplate()) ||
          (excludeRequests && product.isRequest()) ||
          (excludeRequired && product.isRequired())
        )
          continue
        else productsToReturn.push(product)
      }
    } else {
      // no filter required (performance)
      productsToReturn = this.products
    }
    return productsToReturn.sort((a, b) => a.getSortOrder() - b.getSortOrder())
  }

  getActiveProducts() {
    return this.products.filter((product) => product.isActive())
  }

  allProductsAreInactive() {
    return !this.products.find((product) => product.isActive())
  }

  // return only product event templates
  getEventProducts() {
    return this.products.filter((product) => product.isEventTemplate())
  }

  /**
   * get all product definitions from n products and filter them by attribute key
   * @param key
   * @param productIds
   * @returns {Array}
   */
  async getProductDefinitionsByAttributeKeyAndProducts(key, productIds) {
    let productDefinitions = []

    // iterate products
    for (let i = 0; i < this.products.length; i++) {
      let product = this.products[i]

      // only get products, if in pids array from function argument
      if (productIds.includes(product.getId())) {
        let filteredProductDefinitions = await product.getProductDefinitionsContainingAttributeKey(
          key
        )

        // merge filtered product definitions
        productDefinitions = [
          ...productDefinitions,
          ...filteredProductDefinitions,
        ]
      }
    }

    return productDefinitions
  }

  /**
   * get product instance
   * @param productId
   * @returns {Promise<null|*>}
   */
  getProductInstanceByProductId(productId) {
    // iterate products
    for (let i = 0; i < this.products.length; i++) {
      let product = this.products[i]

      if (product.getId() === productId) return product
    }
    return null
  }

  /**
   * Alias for getProductInstanceByProductId
   * @param productId
   * @returns {Promise<null|*>}
   */
  getProductById(productId) {
    return this.getProductInstanceByProductId(productId)
  }

  /**
   * get first product containing a particular event id
   * @param eventId
   * @returns {*}
   */
  getProductInstanceByEventId(eventId) {
    for (let i = 0; i < this.products.length; i++) {
      let product = this.products[i]
      if (product.events.findEventId(eventId)) return product
    }

    // no product found
    return null
  }

  /**
   * Get an array of products filtered by the product category and sorted by the product's sort order.
   * @param productType: String
   * @returns {*[]}
   */
  getProductsByProductCategory(productCategory) {
    let productsByCategory = this.products.filter(
      (product) => product.productCategory === productCategory
    )
    // sort by sort order
    return productsByCategory.sort((a, b) => a.sortOrder - b.sortOrder)
  }

  /**
   * get event instance by event id
   * @param eventId
   * @returns {null|*}
   */
  getEventInstanceByEventId(eventId) {
    for (let i = 0; i < this.products.length; i++) {
      let event = this.products[i].events.findEventId(eventId)
      if (event) return event
    }

    // no product found
    return null
  }

  /**
   * search for the first product including the passed product definition id
   * @param productDefinitionId
   * @returns {Promise<null|*>}
   */
  getProductInstanceByProductDefinitionId(productDefinitionId) {
    // iterate products
    for (let i = 0; i < this.products.length; i++) {
      let product = this.products[i]
      if (product.includeProductDefinitionId(productDefinitionId))
        return product
    }
    return null
  }

  getProductDefinitionByProductDefinitionId(productDefinitionId) {
    for (let i = 0; i < this.products.length; i++) {
      const product = this.products[i]
      const productDefinition = product.getProductDefinitionInstance(
        productDefinitionId
      )
      if (productDefinition) return productDefinition
    }
    return null
  }

  getProductByName(name) {
    return this.products.find((product) => product.getName() === name)
  }

  /**
   * simply return first product in the array
   * @returns {null|*}
   */
  getFirstProduct() {
    if (this.products.length) return this.products[0]
    else return null
  }

  /**
   * Gets the first season start of all products (or the today)
   * @returns {null | Date}
   */
  getFirstSeasonStart() {
    const dates = this.products.map((product) =>
      product.getCurrentSeasonStart().getTime()
    )
    return new Date(Math.min(...dates))
  }

  /**
   * Get latest season end date over all products
   * @return {Date}
   */
  getMaxSeasonEnd() {
    let dates = this.products.map((product) =>
      product.getCurrentSeasonEnd().getTime()
    )
    return new Date(Math.max(...dates))
  }

  /**
   * checks all products if a particular product definition is present
   * @param productDefinitionId
   * @returns {Promise<boolean>}
   */
  includeProductDefinitionId(productDefinitionId) {
    // iterate products
    for (let i = 0; i < this.products.length; i++) {
      if (this.products[i].includeProductDefinitionId(productDefinitionId))
        return true
    }

    return false
  }

  getAllProductCategories(
    excludeEventTemplates = false,
    excludeRequests = true,
    excludeRequired = true
  ) {
    let filteredProducts = this.getProducts(
      excludeEventTemplates,
      excludeRequests,
      excludeRequired
    )
    return _.uniqBy(filteredProducts, (product) => product.productCategory)
  }

  /**
   * // todo: optimize performance with lodash
   * todo: use getPossibleAttributeValuesByKey() in the Product.js class
   * Get all attribute keys and all values from all products from their product definition
   * used for the filter
   * @returns {[]}
   */
  async getAllAttributeNames() {
    let attributesToReturn = []
    let excludes = []

    // iterate products
    for (let i = 0; i < this.products.length; i++) {
      const attributesToAdd = this.products[i].getAllAttributeNames(false)
      attributesToReturn = attributesToReturn.concat(attributesToAdd)

      const excludesToAdd = this.products[i].getExcludesFromUiFilters()
      excludes = excludes.concat(excludesToAdd)
    }

    // exclude excludeFromUiFilter
    attributesToReturn = this.getAllUniqueAttributesWithUniqueValues(
      attributesToReturn
    )
    excludes = _.uniq(excludes)
    for (let e = 0; e < excludes.length; e++) {
      for (let a = 0; a < attributesToReturn.length; a++) {
        if (attributesToReturn[a].key === excludes[e])
          attributesToReturn.splice(a, 1)
      }
    }

    // unique attribute values
    for (let u = 0; u < attributesToReturn.length; u++) {
      attributesToReturn[u].values = _.uniqBy(
        attributesToReturn[u].values,
        'value'
      )
    }

    // sort by sort order
    // iterate attributes
    for (let k = 0; k < attributesToReturn.length; k++) {
      attributesToReturn[k].values.sort((a, b) => a.sortOrder - b.sortOrder)
    }

    return attributesToReturn
  }

  getAllUniqueAttributesWithUniqueValues(attributes) {
    const grouped = _.groupBy(attributes, (a) => a.key)
    const unique = Object.keys(grouped).map((key) => {
      const values = _.uniqBy(
        grouped[key].flatMap((val) => val.values),
        (o) => o.value
      )
      return {
        key,
        values,
      }
    })
    return unique
  }

  // merge available dates of all products
  getAvailableDates(type = 'date') {
    let allAvailableDates = []
    for (let i = 0; i < this.products.length; i++) {
      allAvailableDates = [
        ...allAvailableDates,
        ...this.products[i].getAvailableDates(type),
      ]
    }
    return _.uniq(allAvailableDates)
  }

  /**
   * get all product definitions from all products
   */
  getAllProductDefinitions() {
    let availableDefinitions = []
    const products = this.getProducts()
    for (let i = 0; i < products.length; i++) {
      availableDefinitions = availableDefinitions.concat(
        products[i].productDefinitions
      )
    }

    return availableDefinitions
  }

  /**
   * get all unique destinations from the products
   * @returns {Array}
   */
  getDestinations() {
    let destinations = []

    for (let i = 0; i < this.getProducts().length; i++) {
      destinations = destinations.concat(this.getProducts()[i].destinations)
    }
    return _.uniqBy(destinations, 'id')
  }

  /**
   * return all product Ids
   * @returns {int[]}
   */
  getProductIds() {
    return this._products.map((product) => product.id)
  }

  /**
   * SETTERS
   */

  /**
   * push a new product instance to the products array
   * @param productInstance
   */
  addProduct(productInstance) {
    this.products.push(productInstance)
  }

  getProductsIds() {
    return this.products.map((product) => product.getId())
  }

  /**
   * Get unique product types out of the products array
   * @returns {*[]}
   */
  getUniqueProductTypes(onlyActive) {
    const products = this.products.filter(
      (product) => onlyActive || product.isActive()
    )
    const uniqueProducts = _.uniqBy(products, (product) => {
      return product.productCategory
    })

    return uniqueProducts.map((product) => product.productCategory)
  }

  /**
   * Note that all products must have the same pricing model
   * https://pricenow.atlassian.net/jira/software/projects/T1/boards/4/backlog?selectedIssue=T1-1052
   * @returns {string}
   */
  isActivePricingModel(pricingModel) {
    return this._products.find((product) => product.priceModel === pricingModel)
  }

  /**
   * ensure that only static pricing and static pricing model
   * are used: in the isActivePricingModel you could have a mix
   */
  isOnlyStaticallyPriced() {
    return !this._products.find((product) => {
      const firstProdDef = product.getProductDefinitions()[0]
      return (
        product.priceModel !== 'static' &&
        (firstProdDef?.minPrice !== firstProdDef?.maxPrice ||
          (!firstProdDef?.minPrice && !firstProdDef?.maxPrice))
      )
    })
  }
}
