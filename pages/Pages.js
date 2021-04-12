import { shopInstance } from '../utils/axiosInstance'
import Page from './Page'

export default class Pages {
  constructor() {
    this.pages = []
  }

  async loadPages() {
    /* global EventBus axios */
    EventBus.$emit('spinnerShow')

    try {
      /* global store */
      const { data } = await shopInstance().get('/pages')

      // iterate languages
      for (let language in data) {
        // iterate pages inside language
        for (let b = 0; b < data[language].length; b++) {
          // prepare params
          let params = data[language][b]
          params.language = language

          // create new page instance
          this.pages.push(new Page(params))
        }
      }
    } catch (e) {
      EventBus.$emit('notify', e.response)
    } finally {
      EventBus.$emit('spinnerHide')
    }
    return 'Promise'
  }

  /**
   * loading page content for all terms and conditions pages
   * type: termsAndConditions || privacyPolicy
   * @returns {Promise<void>}
   */
  async loadContent(type) {
    let pages =
      type === 'termsAndConditions'
        ? this.getTermsAndConditions()
        : this.getPrivacyPolicies()

    // loading page content for each terms and conditions page
    await Promise.all(
      pages.map(async (page) => {
        await page.loadPageContent()
      })
    )

    return Promise
  }

  /**
   * GETTERS
   */
  getPages() {
    return this.pages.filter((page) => {
      return page.getLanguage() === store.getters.getActualLanguage(false)
    })
  }

  getTermsAndConditions() {
    return this.getPages().filter((page) => {
      return page.isTermsAndConditions
    })
  }

  getPrivacyPolicies() {
    return this.getPages().filter((page) => {
      return page.isPrivacyPolicy
    })
  }

  getPageById(id) {
    return this.pages.find((page) => {
      // has to be ==
      return page.getId() == id
    })
  }
}
