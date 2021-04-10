import store from '../../../../../src/store/store'

/**
 * handles the favorites/bookmarks fetching and storing persistently
 * on the api side
 */
export default class ProductDefinitionBookmarkService {
  /**
   * fetch the boookmark list from the api
   * @returns {Promise<[]>}
   */
  async fetch() {
    const baseUrl = store.getters
      .getCurrentDestinationInstance()
      .getShopApi(false)
    /* global EventBus axios */
    EventBus.$emit('spinnerShow')
    let bookmarks = []
    try {
      let response = await axios.get(baseUrl + 'user/profile/favorites')

      if (response.status === 200) {
        if (response.data) {
          bookmarks = response.data
        }
      } else {
        EventBus.$emit('notify')
      }
    } catch (e) {
      console.error('err', e)
      EventBus.$emit('notify', e.response)
    } finally {
      EventBus.$emit('spinnerHide')
    }

    return bookmarks
  }

  /**
   * update the bookmarks list
   * on the api
   * @param bookmarks
   * @returns {[]}
   */
  async update(bookmarks) {
    const baseUrl = store.getters
      .getCurrentDestinationInstance()
      .getShopApi(false)
    /* global EventBus axios */
    EventBus.$emit('spinnerShow')
    try {
      let response = await axios.patch(
        baseUrl + 'user/profile/favorites',
        bookmarks
      )

      if (response.status === 200) {
        bookmarks = response.data
      } else {
        EventBus.$emit('notify')
      }
    } catch (e) {
      console.error('err', e)
      EventBus.$emit('notify', e.response)
    } finally {
      EventBus.$emit('spinnerHide')
    }

    return bookmarks
  }
}
