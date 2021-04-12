import { shopInstance } from '../utils/axiosInstance'

/**
 * class with login services.
 * To be continued.
 */
export default class Authentication {
  /**
   * Transfer user data to new region
   * @param region
   * @returns {Promise<boolean>}
   */
  static async tranferData(
    region = store.getters.getCurrentDestinationInstance().getSlug()
  ) {
    /* global EventBus axios store */
    EventBus.$emit('spinnerShow')
    try {
      await shopInstance().post('/user/agreeDataTransfer')
      return Promise.resolve(true)
    } catch (e) {
      EventBus.$emit('notify', i18n.t('login.errorWhileDataTransfer'))
      return Promise.resolve(false)
    } finally {
      EventBus.$emit('spinnerHide')
    }
  }

  /**
   * just call all regions
   * @returns {Promise<boolean>}
   */
  static async loadRegions() {
    /* global EventBus axios store */
    EventBus.$emit('spinnerShow')
    try {
      const response = await shopInstance(false).get('/regions')
      return Promise.resolve(response.data)
    } catch (e) {
      EventBus.$emit('notify', i18n.t('login.errorWhileDataTransfer'))
      return Promise.resolve(false)
    } finally {
      EventBus.$emit('spinnerHide')
    }
  }
}
