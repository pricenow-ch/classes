import User from '../user/User'
import DateHelper from '../utils/DateHelper'
import Cancellation from '../cancellation/Cancellation'
import Skidata from './Skidata'
import Event from '../events/Event.js'
import Vats from '../vats/Vats'
import Novatouch from './Novatouch'
import Axess from '@/classes-shared/bookings/Axess'
import Swisspass from '@/classes-shared/bookings/Swisspass'
import { shopInstance } from '../utils/axiosInstance'
import definitions from '../../../definitions'

export default class BookingEntry {
  constructor(params) {
    this.id = params.hasOwnProperty('id') ? params.id : null
    this.identifier = params.hasOwnProperty('identifier')
      ? params.identifier
      : null
    // like the "requirerBasketEntryId"
    this.requiredEntry = params.requiredEntry || null

    // translation keys
    this.productTranslation = params.hasOwnProperty('translation_product')
      ? params.translation_product
      : null
    this.productDefinitionTranslation = params.hasOwnProperty(
      'translation_productDefinition'
    )
      ? params.translation_productDefinition
      : null

    // pe ids
    this.productId = params.hasOwnProperty('pe_productId')
      ? params.pe_productId
      : null
    this.productDefinitionId = params.hasOwnProperty('pe_productDefinitionId')
      ? params.pe_productDefinitionId
      : null
    this.sortOrder = params.sortOrder || null

    this.startDate = params.hasOwnProperty('start_date')
      ? DateHelper.shiftUtcToLocal(new Date(params.start_date))
      : null
    this.endDate = params.hasOwnProperty('end_date')
      ? DateHelper.shiftUtcToLocal(new Date(params.end_date))
      : null
    this.media = params.hasOwnProperty('media') ? params.media : null

    // net price (=> minus group discounts)
    this.price = params.hasOwnProperty('priceNet') ? params.priceNet : null
    this.priceGross = params.priceGross || null

    // is this booking entry cancellable by the user itself
    this.selfCancelable = params.hasOwnProperty('selfCancelable')
      ? params.selfCancelable
      : null
    // if booking entry was cancelled: We expect an integer. If not cancelled: We expect null
    this.cancellationId = params.hasOwnProperty('cancellationId')
      ? params.cancellationId
      : null

    // Type: Cancellation
    this.cancellation = params.cancellation
      ? new Cancellation(params.cancellation)
      : null
    // Type: Skidata
    this.skidata = params.Skidata ? new Skidata(params.Skidata) : null
    // Type: Axess
    this.axess = params.Axess ? new Axess(params.Axess) : null
    // Type: Novatouch
    this.novatouch = params.Novatouch ? new Novatouch(params.Novatouch) : null
    // Type: Swisspass | null
    this.swisspass = params.Swisspass ? new Swisspass(params.Swisspass) : null
    // helper to select multiple booking entries
    this.isSelected = false

    // User instance || null
    this.user = params.hasOwnProperty('user') ? new User(params.user) : null

    // peopleCount
    this.peopleCount = params.peopleCount || 1

    // Type: Event
    this.event = params.event ? new Event(params.event) : null

    // Type: Integer
    // eg. room number
    this.allocationNumber = params.allocationNumber || null

    // Type: Vats
    this.vats = params.vats ? new Vats(params.vats) : new Vats([])
    // transferable
    this.transferableTicket = params.transferableTicket || null
    // promocodes
    this.promoCode = params.promoCode || null
    this.promoReduction = params.promoReduction || null

    this.createdAt = params.createdAt || null
  }

  async saveAllocationNumber() {
    /* global EventBus axios store */
    EventBus.$emit('spinnerShow')

    try {
      await shopInstance().put(
        `admin/bookingEntry/updateCustomFields/${this.id}`,
        {
          allocationNumber:
            this.allocationNumber === '' ? null : this.allocationNumber,
        }
      )

      EventBus.$emit(
        'notify',
        i18n.t('productCapacity.capacityUpdatedSuccessfully'),
        'success'
      )
      return Promise.resolve(true)
    } catch (e) {
      EventBus.$emit(
        'notify',
        i18n.t('bookingEntry.saveAllocationNumberFailed')
      )
      return Promise.reject(e)
    } finally {
      EventBus.$emit('spinnerHide')
    }
  }

  /**
   * GETTERS
   */
  getId() {
    return this.id
  }

  getStartDate() {
    return this.startDate
  }

  getEndDate() {
    return this.endDate
  }

  getTranslation() {
    return this.getProductTranslation()
      ? this.getProductTranslation() +
          ', ' +
          this.getProductDefinitionTranslation()
      : this.getProductDefinitionTranslation
  }

  // also considers events
  getProductTranslation() {
    if (this.event) return this.event.title

    /* global i18n */
    return i18n.t(this.productTranslation)
  }

  getProductDefinitionTranslation() {
    /* global i18n */
    return i18n.t(this.productDefinitionTranslation)
  }

  getPrice() {
    return this.price
  }

  getOriginalPrice() {
    return this.getPrice() + this.getPromoReduction()
  }

  getOriginalPriceGross() {
    return this.getPriceGross() + this.getPromoReduction()
  }

  getPriceGross() {
    return this.priceGross
  }

  getUser() {
    return this.user
  }

  isSelfCancelable() {
    return this.selfCancelable
  }

  hasBeenCancelled() {
    return this.cancellationId !== null
  }

  getCancellation() {
    return this.cancellation
  }

  getSkidata() {
    return this.skidata
  }

  getAxess() {
    return this.axess
  }

  getNovatouch() {
    return this.novatouch
  }

  getSwisspass() {
    return this.swisspass
  }

  // returns external ticket provider independently from it's type
  getExternalTicketProvider() {
    return this.getSkidata() || this.getAxess() || this.getNovatouch()
  }

  // the media provider can be Swisspass even though Axess or Skidata is the ticket provider
  getMediaProvider() {
    return this.getMedia() === 'swisspass'
      ? this.getSwisspass()
      : this.getExternalTicketProvider()
  }

  isPaperMedia() {
    return (
      this.media === definitions.ticketMedia.paper ||
      this.media === definitions.ticketMedia.pickUp ||
      this.media === definitions.ticketMedia.printAtHome
    )
  }

  getMedia() {
    return this.media
  }

  getProductId() {
    return this.productId
  }

  getProductDefinitionId() {
    return this.productDefinitionId
  }

  getPeopleCount() {
    return this.peopleCount
  }

  getEvent() {
    return this.event
  }

  getAllocationNumber() {
    return this.allocationNumber
  }

  getVatsArray() {
    return this.vats.getVats()
  }

  // does this booking entry has any barcode to show
  hasAnyBarcode() {
    return this.getNovatouch() || this.getSkidata()
  }

  isTransferableTicket() {
    return this.transferableTicket
  }
  isReservation() {
    let regex = new RegExp(/.*(-products-reservation).*/, 'g')
    return regex.test(this.productTranslation)
  }
  getRequiredEntry() {
    return this.requiredEntry
  }
  getSortOrder() {
    return this.sortOrder
  }
  getCreationDate() {
    return this.createdAt
  }
  getPromoCode() {
    return this.promoCode
  }
  getPromoReduction() {
    return this.promoReduction ? parseInt(this.promoReduction, 10) : 0
  }
}
