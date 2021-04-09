export default class Gtag {
  constructor(vue, router, vueGtag, vueAnalytics) {
    this.vue = vue
    this.router = router
    this.vueGtag = vueGtag
    this.vueAnalytics = vueAnalytics
  }

  init() {
    const destination = store.getters.getCurrentDestinationInstance().slug
    let gtagId = null
    let gAnalytics = null

    // CHAESERRUGG
    if (destination === 'chaeserrugg') {
      gAnalytics = 'UA-62841235-1'
    }
    // BELLWALD
    if (destination === 'bellwald') {
      gAnalytics = 'UA-130995173-1'
    }

    // google tag manager
    if (gtagId) {
      this.vue.use(this.vueGtag, {
        config: { id: gtagId },
      })
    }

    // google analytics
    if (gAnalytics) {
      this.vue.use(this.vueAnalytics, {
        id: gAnalytics,
        router: this.router,
        /* debug: {
          sendHitTask: process.env.NODE_ENV === 'development'
        } */
      })
    }
  }
}
