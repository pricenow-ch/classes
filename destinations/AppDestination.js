import Destination from './Destination'
import AppSeasons from './AppSeasons'
import { shopInstance } from '../utils/axiosInstance'
import definitions from '../../../definitions'

/**
 * Defines the current destination params for the shop. Like colors or logos, icons etc. depending on the destination.
 * Responsible to get the right api urls
 */

export default class AppDestination extends Destination {
  constructor(params) {
    super(params)

    // vuetify instance
    this.$vuetify = params.$vuetify

    // image which is shown in the header of the application
    this.headerImage = null

    // the background image for the last booking step
    this.backgroundImage = null

    // name of the destination (like Bellwald Sportbahnen AG)
    this.name = null
    this.address = null
    this.zip = null
    this.city = null
    this.mail = null
    this.website = null
    this.tel = null
    this.currency = null
    // available seasons of this destination
    // handling the seasons. also the current season
    this.appSeasons = null
    this.init()
  }

  async init() {
    // load the slug
    this.loadSlug()
    // set logo after slug was loaded
    this.setLogo()
    // loading header image
    this.loadingDesign()
    // init seasons only if not backend
    if (this.slug !== definitions.destinations.default) {
      this.appSeasons = new AppSeasons()
      this.appSeasons.init()
    }
  }

  /**
   * parsing the subdomain
   */
  loadSlug() {
    // iterate destinations
    this.slug = process.env.VUE_APP_DESTINATION
  }

  /**
   * set all destination's design elements
   */
  async loadingDesign() {
    // set primary color
    switch (this.slug) {
      // BELLWALD
      case definitions.destinations.bellwald:
        try {
          this.setCustomDesign(
            require('@/assets/destinations/headerImage/bellwald.jpg'),
            require('@/assets/destinations/backgroundImage/bellwald.jpg'),
            '#d50612',
            '#f7cdd0'
          )
        } catch (e) {
          console.log(e)
        }
        break
      // VALS
      case definitions.destinations.vals:
        try {
          this.setCustomDesign(
            require('@/assets/destinations/headerImage/vals.jpg'),
            require('@/assets/destinations/backgroundImage/vals.jpg'),
            '#40605a',
            '#40605a'
          )
        } catch (e) {
          console.log(e)
        }
        break
      // NIESEN
      case definitions.destinations.niesen:
        try {
          this.setCustomDesign(
            require('@/assets/destinations/headerImage/niesen.jpg'),
            require('@/assets/destinations/backgroundImage/niesen.jpg'),
            '#004183',
            '#004183'
          )
        } catch (e) {
          console.log(e)
        }
        break
      // CHAESERRUGG
      case definitions.destinations.chaeserrugg:
        try {
          this.setCustomDesign(
            require('@/assets/destinations/headerImage/chaeserrugg.jpg'),
            require('@/assets/destinations/backgroundImage/chaeserrugg.jpg'),
            '#909090',
            '#909090'
          )
        } catch (e) {
          console.log(e)
        }
        break
      // MOOSALPREGION
      case definitions.destinations.moosalpregion:
        try {
          this.setCustomDesign(
            require('@/assets/destinations/headerImage/moosalpregion.jpg'),
            require('@/assets/destinations/backgroundImage/moosalpregion.jpg'),
            '#78B6E2',
            '#78B6E2'
          )
        } catch (e) {
          console.log(e)
        }
        break
    }

    /* global EventBus axios store */
    try {
      const { data } = await shopInstance().get('/region')

      // parse api data
      if (data.hasOwnProperty('name')) this.name = data.name
      if (data.hasOwnProperty('street')) this.address = data.street
      if (data.hasOwnProperty('zip')) this.zip = data.zip
      if (data.hasOwnProperty('city')) this.city = data.city
      if (data.hasOwnProperty('mail')) this.mail = data.mail
      if (data.hasOwnProperty('website')) this.website = data.website
      if (data.hasOwnProperty('tel')) this.tel = data.tel
      if (data.hasOwnProperty('currency')) this.currency = data.currency
    } catch (e) {
      EventBus.$emit('notify', e.response)
    }

    return Promise.resolve(this)
  }

  /**
   * interface to set all required destinations variables
   * @param headerImage
   * @param logo
   * @param primaryColor
   */
  setCustomDesign(headerImage, backgroundImage, primary, primary20) {
    // set header image in shop
    this.headerImage = headerImage
    this.backgroundImage = backgroundImage

    // set theme colors
    this.$vuetify.theme.themes.light.primary = primary
    this.$vuetify.theme.themes.light.primary20 = primary20
  }

  /**
   * GETTERS
   */
  getHeaderImage() {
    return this.headerImage
  }

  getBackgroundImage() {
    return this.backgroundImage
  }

  getName() {
    return this.name
  }

  getAddress() {
    return this.address
  }

  getZip() {
    return this.zip
  }

  getCity() {
    return this.city
  }

  getMail() {
    return this.mail
  }

  getWebsite() {
    return this.website
  }

  getTel() {
    return this.tel
  }

  getCurrency() {
    return this.currency
  }

  hasContact() {
    return this.getName() || this.getMail() || this.getTel()
  }
  getAppSeasons() {
    return this.appSeasons
  }
}
