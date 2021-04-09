import moment from 'moment'
import { CapacityCalendarEntry } from './CapacityCalendarEntry'

/**
 * Helper Class for the CapacityCalendar to simplify the logic in the UI
 */
export class CapacityCalendarEntries {
  /**
   *
   * @param Product[]
   */
  constructor() {
    this.calendarEntries = []
  }

  // builds the data structure
  init(products) {
    // reset
    this.calendarEntries = []
    // iterate products
    for (let i = 0; i < products.length; i++) {
      let product = products[i]

      // only add events of this product
      if (product && product.isEventTemplate()) {
        // iterate all events
        let events = product.events.events
        events.forEach((tmpEvent) => {
          let productCapacity = product.getProductCapacity()
          let eventCapacities = productCapacity
            ? productCapacity.getCapacitiesbyDate(tmpEvent.getDateInstance())
            : []

          // an event can have multiple capacities (on attribute level): iterate them
          if (eventCapacities.length) {
            eventCapacities.forEach((eventCapacity) => {
              this.calendarEntries.push(
                new CapacityCalendarEntry(
                  product,
                  eventCapacity,
                  tmpEvent,
                  tmpEvent.date
                )
              )
            })
          } else {
            // no capacity for this event. Just add the event and set capacity to null
            this.calendarEntries.push(
              new CapacityCalendarEntry(product, null, tmpEvent, tmpEvent.date)
            )
          }
        })
      } else if (product && product.getProductCapacity()) {
        // add capacities, if product has no event
        let dailyCapacities = product.getProductCapacity().getDailyCapacities()
        dailyCapacities.forEach((CalendarEntryInstance) => {
          CalendarEntryInstance.getValueCapacities().forEach(
            (ProductCapacity) => {
              // do not show hidden capacities
              if (ProductCapacity && !ProductCapacity.isHidden()) {
                this.calendarEntries.push(
                  new CapacityCalendarEntry(
                    product,
                    ProductCapacity,
                    null,
                    moment(CalendarEntryInstance.date).format('YYYY-MM-DD')
                  )
                )
              }
            }
          )
        })
      }
    }
  }

  getCalendarEntryByDate(date, maxEntries = 0) {
    let filteredEntries = this.calendarEntries.filter(
      (entry) => entry.date === date
    )
    return maxEntries ? filteredEntries.slice(0, maxEntries) : filteredEntries
  }

  getCalendarEntries() {
    return this.calendarEntries
  }
}
