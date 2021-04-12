import { peInstance } from '../utils/axiosInstance'
import Basket from './Basket'
import GroupDiscounts from './GroupDiscounts'

export default class AdminBasket extends Basket {
  constructor() {
    super()
    this.groupDiscounts = new GroupDiscounts()
  }

  /**
   * load basket from api by an uuid
   * @returns {Promise<boolean>}
   */
  async getBasketByUuid(uuid = this.uuid) {
    if (!uuid) {
      throw new Error('No basket uuid is given!')
    }
    EventBus.$emit('spinnerShow')
    try {
      const response = await peInstance().get(`/baskets/${uuid}`)
      await this.parseApiData(response.data)
      return true
    } catch (e) {
      EventBus.$emit('notify', i18n.t('adminBasket.fetchingBasketFailed'))
      return false
    } finally {
      EventBus.$emit('spinnerHide')
    }
  }

  // create new group discount
  async addGroupDiscount(discountType, discountAmount, discountDescription) {
    EventBus.$emit('spinnerShow')

    let amount =
      discountType.toLowerCase() === 'relative'
        ? discountAmount
        : discountAmount * 100

    try {
      let response = await peInstance(false).post(
        `/admin/${this.getUuid()}/group_discounts`,
        {
          kind: discountType,
          amount: amount,
          description: discountDescription,
          destinationName: store.getters
            .getCurrentDestinationInstance()
            .getSlug(),
        }
      )

      await this.parseApiData(response.data)
    } catch (e) {
      EventBus.$emit('notify', i18n.t('adminBasket.createGroupDiscountFailed'))
    } finally {
      EventBus.$emit('spinnerHide')
      return Promise.resolve(true)
    }
  }

  async deleteGroupDiscount(groupDiscountId) {
    EventBus.$emit('spinnerShow')

    try {
      let response = await peInstance(false).delete(
        `/admin/${this.getUuid()}/${
          process.env.VUE_APP_DESITNATION
        }/group_discounts/${store.getters
          .getCurrentDestinationInstance()
          .getSlug()}`
      )

      await this.parseApiData(response.data)
    } catch (e) {
      EventBus.$emit(
        'notify',
        i18n.t('adminBasket.couldNotDeleteGroupDiscount')
      )
    } finally {
      EventBus.$emit('spinnerHide')
      return Promise.resolve(true)
    }
  }

  /**
   * @param basket
   * @returns {Promise<boolean>}
   */
  async parseApiData(basket) {
    await super.parseApiData(basket, false)
    // parse group discount
    if (basket.groupDiscounts)
      await this.groupDiscounts.parseApiData(basket.groupDiscounts)
    return true
  }

  /**
   * remove all basket entries which are occurring in booking entries (used for accurate capacity management in CreateBooking.vue)
   * @param clonedBookingInstance
   */
  removeBasketEntriesContainedInBooking(clonedBookingInstance) {
    if (!clonedBookingInstance) return
    let bookingEntries = clonedBookingInstance.getBookingEntries()
    for (let i = this.basketEntries.length; i > 0; i--) {
      const basketEntry = this.basketEntries[i - 1]
      const bookingEntryIndex = bookingEntries.findIndex((bookingEntry) => {
        return (
          bookingEntry.getProductDefinitionId() ===
            basketEntry.getProductDefinitionId() &&
          basketEntry.getValidFrom().getTime() ===
            bookingEntry.getStartDate().getTime()
        )
      })
      if (bookingEntryIndex !== -1) {
        // remove booking entry and basket entry
        bookingEntries.splice(bookingEntryIndex, 1)
        this.basketEntries.splice(i - 1, 1)
      }
    }
  }

  getGroupDiscountsArray() {
    return this.groupDiscounts.getGroupDiscounts()
  }
}
