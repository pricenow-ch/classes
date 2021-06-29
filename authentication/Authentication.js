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

  /**
   * Returns the domain the application is running on.
   * @returns {string|*}
   */
  static getDomain() {
    let domain = window.location.host
    // in case it's localhost, return it
    if (domain.startsWith('localhost')) {
      // remove localhost's port
      domain = domain.split(':')[0]
      return domain
    }
    return domain
  }
}
