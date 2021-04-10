import definitions from '../../../../src/definitions'

export default class Card {
  /**
   * IMPORTANT: Using old card type style (0 = swisspass, 1 = skidata)
   * @param card: DB Object (direct from api)
   * @param type: String (because of vuetify radio-select)
   * @param cardDescription
   */
  constructor(card = null, type = 0) {
    /* global i18n */
    this.card = {}
    if (card) {
      // if card object from api
      this.card.id = card.id ? card.id : null
      // toString because of vuetify radio-group
      this.card.type = card.type ? card.type.toString() : 0
      this.card.cardNumber = card.cardNumber ? card.cardNumber : null
      this.card.zip = card.zip ? card.zip : null
      this.card.cardDescription = card.users2skiCard
        ? card.users2skiCard.cardDescription
        : null
      this.card.firstName = card.firstname ? card.firstname : null
      this.card.lastName = card.surname ? card.surname : null
      this.card.validGA = card.validGA ? card.validGA : null
      this.card.validHTA = card.validHTA ? card.validHTA : null
      this.card.birthdate = card.birthdate ? new Date(card.birthdate) : null
    } else {
      // standard card (swisspass)
      this.card.id = null
      this.card.type = type
      this.card.cardNumber = null
      this.card.zip = null
      this.card.cardDescription =
        type === -1 ? i18n.t('personalData.addNewCard') : null
      this.card.firstName = null
      this.card.lastName = null
      this.card.validGA = null
      this.card.validHTA = null
      this.card.birthdate = null
    }

    // last time, the method updateSwisspass was called
    this.lastSwisspassUpdate = null
  }

  /**
   * update a particular card instance with newest swisspass data (only ga and hta so far => can be extended)
   * @param cardInstance
   * @returns {Promise<PromiseConstructor>}
   */
  async updateSwisspass() {
    /* global EventBus axios store */
    EventBus.$emit('spinnerShow')

    // check if card instance is a Swisspass
    if (this.getTypeAsIdentifier() === definitions.ticketMedia.swisspass) {
      // only call api if last update is older than 1 hour
      if (
        !this.lastSwisspassUpdate ||
        new Date().getTime() - this.lastSwisspassUpdate.getTime() >
          60 * 60 * 1000
      ) {
        this.lastSwisspassUpdate = new Date()

        try {
          let response = await axios.get(
            store.getters.getCurrentDestinationInstance().getShopApi() +
              'swisspass/data/' +
              this.getCardNumber() +
              '/' +
              this.getZip()
          )

          // update card
          this.setValidGA(response.data.validGA)
          this.setValidHTA(response.data.validHTA)
          this.birthdate = response.data.birthdate
        } catch (e) {
          this.lastSwisspassUpdate = null
          EventBus.$emit(
            'notify',
            i18n.t('selectMedium.swisspassDataNotUpdated')
          )
        }
      }
    } else {
      this.lastSwisspassUpdate = null
      EventBus.$emit('notify', i18n.t('selectMedium.isNotASwisspass'))
    }

    EventBus.$emit('spinnerHide')
    return Promise.resolve(this)
  }

  /* GETTERS */

  /**
   * return card in json format
   * @returns {{}|*}
   */
  getCard() {
    return this.card
  }

  getId() {
    return this.card.id
  }

  /**
   *
   * @returns card type as {number}
   */
  getType() {
    return this.card.type
  }

  /**
   * @returns card type as identifier
   */
  getTypeAsIdentifier() {
    return definitions.oldMediaType[this.card.type]
  }

  getCardNumber() {
    return this.card.cardNumber
  }

  getZip() {
    return parseInt(this.card.zip)
  }

  hasValidGA() {
    return this.card.validGA
  }

  hasValidHTA() {
    return this.card.validHTA
  }

  /**
   * check if this card has a required abo
   * @param requiredAbo
   * @returns {boolean|*}
   */
  async hasValidAboOnSwisspass(requiredAbo) {
    // first update Swisspass (api only called if not updated just before)
    await this.updateSwisspass()

    switch (requiredAbo) {
      case definitions.attributeValueContent.withGA:
        if (this.hasValidGA()) return true
        else {
          EventBus.$emit('notify', i18n.t('selectMedium.swisspassHasNoGA'))
          return false
        }
      case definitions.attributeValueContent.withHalfFare:
        if (this.hasValidHTA()) return true
        else {
          EventBus.$emit(
            'notify',
            i18n.t('selectMedium.swisspassHasNoHalfFare')
          )
          return false
        }
      case definitions.attributeValueContent.withHalfFareOrGA:
        if (this.hasValidGA() || this.hasValidHTA()) return true
        else {
          EventBus.$emit(
            'notify',
            i18n.t('selectMedium.swisspassHasNoGaOrHalfFare')
          )
          return false
        }
      default:
        return false
    }
  }

  // returns card type in string format
  getCardTypeDescription() {
    if (this.getType() === 0) {
      return i18n.t('general.swisspass')
    } else if (this.getType() == 1) {
      return i18n.t('general.skicard')
    } else if (this.getType() == 2) {
      return i18n.t('cardAdder.smartCard')
    } else {
      return i18n.t('cardsList.unknownCardType')
    }
  }

  getCardDescription() {
    if (this.getType() === 0) {
      // swisspass
      return (
        (this.card.firstName ? this.card.firstName + ' ' : '') +
        (this.card.lastName ? this.card.lastName : '') +
        ' ' +
        this.card.cardNumber
      )
    } else if (this.getType() == 1 || this.getType() == 2) {
      // keycard (axess || skidata)
      return (
        (this.card.cardDescription ? this.card.cardDescription + ' ' : '') +
        this.card.cardNumber
      )
    } else if (this.getType() === -1) {
      return this.card.cardDescription
    } else {
      return i18n.t('cardList.unknownCardType')
    }
  }

  /* SETTERS */
  /**
   *
   * @param type: STRING
   */
  setCardType(type = 0) {
    this.card.type = type.toString()
  }

  setCardNumber(cardNumber) {
    this.card.cardNumber = cardNumber
  }

  setValidGA(valid) {
    this.card.validGA = valid === 'true'
  }

  setValidHTA(valid) {
    this.card.validHTA = valid === 'true'
  }

  // is keycard and starts with 01
  isValidKeyCardOrSwisspass() {
    return (
      (this.getType() == 1 && this.getCardNumber().substring(0, 2) === '01') ||
      this.getType() == 0 ||
      this.getType() == 2
    )
  }

  getBirthdate() {
    return this.card.birthdate
  }

  getFullName() {
    return this.getFirstName() + ' ' + this.getLastName()
  }

  getFirstName() {
    return this.card.firstName
  }

  getLastName() {
    return this.card.lastName
  }
}
