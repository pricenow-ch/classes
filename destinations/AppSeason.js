/**
 * This class represents a season of the app, destination respectively
 */
export default class AppSeason {
  constructor(identifier, label) {
    // Type: String
    this.identifier = identifier
    // Type: String 'label.label'
    this.label = label
  }

  getIdentifier() {
    return this.identifier
  }
  getTitle() {
    return i18n.t(this.label)
  }
}
