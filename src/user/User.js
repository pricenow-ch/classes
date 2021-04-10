import Card from '../card/Card'
import Salutations from '../salutations/Salutations'
import Salutation from '../salutations/Salutation'

export default class User {
  constructor(params) {
    // setting uid
    if (params.hasOwnProperty('uid')) this.uid = params.uid
    else if (params.hasOwnProperty('id')) this.uid = params.id
    else this.uid = null

    this.firstName = params.firstname
      ? params.firstname
      : params.firstName
      ? params.firstName
      : null
    this.lastName = params.surname
      ? params.surname
      : params.lastName
      ? params.lastName
      : null
    this.company = params.company || null
    this.address = params.street ? params.street : null
    this.zip = params.zip ? params.zip : null
    this.city = params.city ? params.city : null
    this.country = params.country ? params.country : null
    this.phone = params.phone ? params.phone : null
    this.skiDay = params.skiDay ? params.skiDay : null
    this.skiDestination = params.skiDestination ? params.skiDestination : null
    this.skiMask = params.skiMask ? params.skiMask : null
    this.education = params.education ? params.education : null
    this.profession = params.profession ? params.profession : null
    this.mail = params.mail ? params.mail : null
    this.birthdate = params.birthdate ? params.birthdate : null
    this.language = params.language ? params.language : null

    // ski cards
    this.cards = []
    // load cards (for shadow users)
    if (params.hasOwnProperty('users2skiCards'))
      this.parseApiCardData(params.users2skiCards)

    this.salutations = new Salutations()
    if (params.title) this.salutations.salutation = new Salutation(params.title)
    else this.salutations.salutation = new Salutation(null)
  }

  /**
   * helper method to parse shadow users cards
   * @param apiCards
   */
  parseApiCardData(apiCards) {
    // iterate all cards
    for (let i = 0; i < apiCards.length; i++) {
      let card = apiCards[i]
      this.cards.push(new Card(card.skiCard))
    }
  }

  /**
   * SETTERS
   */
  setLanguage(languageKey) {
    this.language = languageKey
  }

  /**
   * GETTERS
   */
  getId() {
    return this.uid
  }

  getUid() {
    return this.uid
  }

  getFirstName() {
    return this.firstName
  }

  getLastName() {
    return this.lastName
  }

  // get full user name
  getFullName() {
    return this.firstName + ' ' + this.lastName
  }

  getMail() {
    return this.mail
  }

  getAddress() {
    return this.address
  }

  getZip() {
    return this.zip
  }

  getCity() {
    return this.city
  }

  getCountry() {
    return this.country
  }

  getBirthdate() {
    return this.birthdate
  }

  getPhone() {
    return this.phone
  }

  getSkiDay() {
    return this.skiDay
  }

  getSkiDestination() {
    return this.skiDestination
  }

  getSkiMask() {
    return this.skiMask
  }

  getEducation() {
    return this.education
  }

  getProfession() {
    return this.profession
  }

  getCards() {
    return this.cards
  }

  getCardById(id) {
    for (let i = 0; i < this.cards.length; i++) {
      if (this.cards[i].getId === id) return this.cards[i]
    }

    return null
  }

  getCardsByType(type) {
    let foundCards = []

    // iterate all cards
    for (let i = 0; i < this.cards.length; i++) {
      let card = this.cards[i]

      if (card.getTypeAsIdentifier() === type) foundCards.push(card)
    }

    return foundCards
  }

  getLanguage() {
    return this.language
  }

  getCompany() {
    return this.company
  }

  // Type: String
  getSalutation() {
    return this.salutations.salutation.getTitle()
  }

  // Type: Salutations
  getSalutations() {
    return this.salutations
  }
}
