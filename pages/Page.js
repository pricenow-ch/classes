import { shopInstance } from '../utils/axiosInstance'

export default class Page {
  constructor(params) {
    this.id = params.id ? params.id : null
    this.language = params.language ? params.language : null
    this.isTermsAndConditions = params.hasOwnProperty('terms_conditions')
      ? params.terms_conditions
      : null
    this.isPrivacyPolicy = params.hasOwnProperty('privacy_policy')
      ? params.privacy_policy
      : null
    this.title = params.title ? params.title : null
    this.body = params.hasOwnProperty('page_revision.body')
      ? params['page_revision.body']
      : null
    this.weblink = params.weblink ? params.weblink : null

    // has the page content already be loaded. By default, only title is loaded via api endpoint
    this.contentLoaded = false
  }

  // loading page revisions from api
  async loadPageContent() {
    // lazy loading
    if (!this.contentLoaded) {
      /* global EventBus axios store */
      EventBus.$emit('spinnerShow')

      try {
        const { data } = await shopInstance().get(`/page/${this.id}`)

        this.body = data['page_revision.body']

        this.contentLoaded = true
      } catch (e) {
        EventBus.$emit('notify', e.response)
      } finally {
        EventBus.$emit('spinnerHide')
      }
    }

    return Promise
  }

  /**
   * GETTERS
   */
  getId() {
    return this.id
  }

  getTitle() {
    return this.title
  }

  getBody() {
    return this.body
  }

  getLanguage() {
    return this.language
  }

  getWeblink() {
    return this.weblink
  }
}
