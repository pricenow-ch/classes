import Season from '@/classes-shared/season/Season'
import { peInstance } from '../utils/axiosInstance'

export default class Seasons {
  constructor(param = {}) {
    this.seasons = param.seasons || []
  }

  /**
   * load all seasons for given destinations
   * @param destinations
   * @returns {Promise<Products>}
   */
  async loadSeasonsForAllDestinations(destinations) {
    /* global EventBus axios */
    EventBus.$emit('spinnerShow')
    try {
      // IMPORT: Map destinations over slug and not id => shop-api and pe-api don't have the same ids!
      const destinationSlugs = destinations.map((destination) => {
        return destination.slug
      })
      if (destinationSlugs.length > 0) {
        const response = await peInstance().get(`/seasons/pools`, {
          params: {
            poolIdentifier: destinationSlugs.join(','),
          },
        })

        if (response.status === 200) {
          response.data.seasons.forEach((apiSeason) => {
            const seasonInstance = new Season(apiSeason)
            this.seasons.push(seasonInstance)
          })
        } else {
          EventBus.$emit('notify')
        }
      }
    } catch (e) {
      EventBus.$emit('notify', e.response)
    } finally {
      EventBus.$emit('spinnerHide')
    }
    return Promise.resolve(this)
  }

  getAllSeasons() {
    return this.seasons
  }

  getFirstSeason() {
    return this.seasons.length > 0 ? this.seasons[0] : null
  }

  getSeasonById(seasonId) {
    return this.seasons.find((season) => season.id === seasonId)
  }
}
