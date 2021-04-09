const analytics = require('./analytics')
const authentication = require('./authentication')
const axess = require('./axess')
const basket = require('./basket')
const bookings = require('./bookings')
const cancellations = require('./cancellation')
const card = require('./card')
const checkout = require('./checkout')
const dates = require('./dates')
const destinations = require('./destinations')
const entityTranslations = require('./entityTranslations')
const events = require('./events')
const externalUrl = require('./externalUrl')
const files = require('./files')
const formRequest = require('./formRequest')
const navigationStores = require('./navigationStores')
const pages = require('./pages')
const products = require('./products')
const reports = require('./reports')
const roles = require('./roles')
const routerHelper = require('./routerHelper')
const salutations = require('./salutations')
const season = require('./season')
const shop = require('./shop')
const user = require('./user')
const vats = require('./vats')
const vouchers = require('./vouchers')
const vuetify = require('./VuetifyHelper')
const xlsx = require('./XLSX')
const Card = require('./Card')
const DateHelper = require('./DateHelper')
const ExtraRide = require('./ExtraRide')
const ExtraRides = require('./ExtraRides')
const NumberHelper = require('./NumberHelper')

module.exports = {
  Card,
  DateHelper,
  ExtraRide,
  ExtraRides,
  NumberHelper,
  ...analytics,
  ...authentication,
  ...axess,
  ...basket,
  ...bookings,
  ...cancellations,
  ...card,
  ...checkout,
  ...dates,
  ...destinations,
  ...entityTranslations,
  ...events,
  ...externalUrl,
  ...files,
  ...formRequest,
  ...navigationStores,
  ...pages,
  ...products,
  ...reports,
  ...roles,
  ...routerHelper,
  ...salutations,
  ...season,
  ...shop,
  ...user,
  ...vats,
  ...vouchers,
  ...vats,
  ...vuetify,
  ...xlsx,
}
