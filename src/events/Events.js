import Event from './Event'

/**
 * holds an array of Event.js instances
 */

export default class events {
  constructor(events = []) {
    this._events = []

    if (events.length) this.parseEvents(events)
  }

  parseEvents(events) {
    for (let i = 0; i < events.length; i++) {
      let event = events[i]
      this.events.push(new Event(event))
    }
  }

  sortEvents() {
    this.events.sort((a, b) => {
      return a.getDateInstance().getTime() - b.getDateInstance().getTime()
    })
  }

  findEventId(eventId) {
    return this.events.find((event) => event.id === eventId)
  }

  addEvent(event) {
    this.events.push(event)
  }

  get events() {
    return this._events
  }

  set events(events) {
    this._events = events
  }
}
