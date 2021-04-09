/** api interface class to talk with the api **/
import Season from '@/classes/season/Season'

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
      let response = await axios.get(
        store.getters.getCurrentDestinationInstance().getBasePeApi() +
          'admin/imports/axess/newSeasons',
        {
          params: {
            destinationNames: destinationSlug,
          },
        }
      )
      // create model instances
      // iterate seasons
      let peSeasons = []
      const rawSeasons = response.data
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
      await axios.patch(
        store.getters.getCurrentDestinationInstance().getBasePeApi() +
          'admin/imports/axess/newSeasons?destinationNames=' +
          destinationSlug
      )
      return true
    } catch (error) {
      return error.response.data.error
    }
  }
}
