/**
 * Represents all seasons a destination can have. => At the moment only used in the abo module. To be refactored. See init() function!
 */
import AppSeason from './AppSeason'

export default class AppSeasons {
  constructor() {
    // Type: Array<AppSeason>
    this.appSeasons = []
    // Type: AppSeason
    this.currentAppSeason = null
  }

  /**
   * for the moment the implementation is hard coded.
   */
  init() {
    let currentDestination = store.getters.getAppDestinationInstance().getSlug()
    // init Bellwald
    if (currentDestination === 'bellwald') {
      this.appSeasons.push(new AppSeason('summer', 'shortCutSeasonAbos.summer'))
      this.appSeasons.push(new AppSeason('winter', 'shortCutSeasonAbos.winter'))
    } else if (currentDestination === 'chaeserrugg') {
      // really bad workaround, as these are not seasons!
      this.appSeasons.push(new AppSeason('winter', 'shortCutSeasonAbos.winter'))
      // this.appSeasons.push(new AppSeason('family', 'shortCutSeasonAbos.family'))
    } else if (currentDestination === 'moosalpregion') {
      this.appSeasons.push(new AppSeason('winter', 'shortCutSeasonAbos.winter'))
      this.appSeasons.push(
        new AppSeason('pointCards', 'shortCutSeasonAbos.pointCards')
      )
    }
  }

  setCurrentAppSeason(appSeason) {
    this.currentAppSeason = appSeason
  }

  getAppSeasons() {
    return this.appSeasons
  }

  getCurrentAppSeason() {
    return this.currentAppSeason
  }
}
