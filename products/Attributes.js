import definitions from '../../../definitions'

export default class Attributes {
  constructor(params) {
    this.age = params.age || null
    this.duration = params.duration || null
    this.flex = params.flex || null
    this.performanceDiff = params.performanceDiff
      ? params.performanceDiff
      : null
    this.route = params.route || null
    this.from = params.from || null
    this.to = params.to || null
    this.swisspass = params.swisspass || null
    this.swisspassDescription = params.swisspassDescription || null
    this.time = params.time || null
    this.breakfastTime = params.breakfastTime || null
    this.room = params.room || null
    this.train = params.train || null
    this.adults = params.adults || null
    this.children = params.children || null
    this.trainAdults = params.trainAdults || null
    this.trainChildren = params.trainChildren || null
    this.train = params.train || null
    this.shuttleBus = params.shuttleBus || null
    this.meal = params.meal || null
    // to map the amount of people (eg. person1, person2 on table reservation) => not the same as peopleCount, the later is a number only
    this.personAmount = params.hasOwnProperty('personAmount')
      ? params.personAmount
      : null

    // needed for example in the hotel at Niesen => HotelRoomSelector.vue => changePersonCount()
    this.peopleCount = params.peopleCount || null
    this.tarif = params.tarif || null
    this.voucherType = params.voucherType || null
    this.sledge = params.sledge || null
    this.basketCondition = params.basketCondition || null
    this.menuChoice = params.menuChoice || null
    this.sector = params.sector || null
    this.restaurant = params.restaurant || null
    this.breakfastChoice = params.breakfastChoice || null
    this.yoga = params.yoga || null
    this.annualPass = params.annualPass || null
    this.pickupLocation = params.pickupLocation || null
  }

  getAge() {
    return this.age
  }

  getDuration() {
    return this.duration
  }

  getFlex() {
    return this.flex
  }

  getPerformanceDiff() {
    return this.performanceDiff
  }

  getRoute() {
    return this.route
  }

  getFrom() {
    return this.from
  }

  getTo() {
    return this.to
  }

  getSwisspass() {
    return this.swisspass
  }

  getPickupLocation() {
    return this.pickupLocation
  }

  getTime() {
    return this.time
  }

  getSledge() {
    return this.sledge
  }

  getBasketCondition() {
    return this.basketCondition
  }

  getTitle(key) {
    if (this[key]) {
      return i18n.t(this[key].translation)
    }
    return ''
  }

  static getTitleByValue(attributeValue) {
    const destinationSlug = store.getters
      .getCurrentDestinationInstance()
      .getSlug()
    return i18n.t(destinationSlug + '-attributes-' + attributeValue)
  }

  /**
   * static helper method to parse attribute objects or the attributes of a product definitions to key/value pairs
   * @param attributeObject
   * @returns {[]}
   */
  static parseAttributeObjectToAttributePairs(attributeObject) {
    let attributePairs = []
    for (let attribute in attributeObject) {
      let attributeValue = attributeObject[attribute]

      if (attributeValue) {
        attributePairs.push({
          key: attribute,
          value:
            attributeValue[definitions.attributeValues.value] || attributeValue,
        })
      }
    }

    return attributePairs
  }
}
