import store from '../../store/store'
import { shopInstance } from '../utils/axiosInstance'

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
    /* global EventBus axios */
    EventBus.$emit('spinnerShow')
    let bookmarks = []
    try {
      const response = await shopInstance(false).get('/user/profile/favorites')

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
    /* global EventBus axios */
    EventBus.$emit('spinnerShow')
    try {
      const response = await shopInstance(false).patch(
        '/user/profile/favorites',
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
