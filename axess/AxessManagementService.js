/** api interface class to talk with the api **/
import Season from '@/classes/season/Season'
import { peInstance } from '../utils/axiosInstance'

export default class AxessManagementService {
  /**
   * Load all seasons (and products) which are not yet initailized in the external Axess system
   * @param destinationSlug
   * @returns {Promise<boolean|[]>}
   */
  static async getProductSeasonsNotCreatedInAxess(destinationSlug) {
    if (!destinationSlug) {
      EventBus.$emit(
        'notify',
        i18n.t('axessManagementService.noDestinationProvided')
      )
      return false
    }
    try {
      const { data } = await peInstance(false).get(
        '/admin/imports/axess/newSeasons',
        {
          params: {
            destinationNames: destinationSlug,
          },
        }
      )
      // create model instances
      // iterate seasons
      let peSeasons = []
      const rawSeasons = data
      for (const rawSeason of rawSeasons) {
        peSeasons.push(new Season(rawSeason))
      }
      return peSeasons
    } catch (e) {
      EventBus.$emit('notify', e.response)
      return false
    }
  }

  /**
   * Initialize the creation of new Seasons in the external Axess system. => Do not await the response. It will timeout!
   * @param destinationSlug
   * @returns {boolean}
   */
  static async initNewAxessSeason(destinationSlug) {
    if (!destinationSlug) {
      return i18n.t('axessManagementService.noDestinationProvided')
    }
    try {
      await peInstance(false).patch(
        `/admin/imports/axess/newSeasons`,
        undefined,
        {
          params: {
            destinationNames: destinationSlug,
          },
        }
      )
      return true
    } catch (error) {
      return error.response.data.error
    }
  }
}
