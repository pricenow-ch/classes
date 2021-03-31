import ExternalTicketProviderState from '@/classes/bookings/ExternalTicketProviderState'

export default class Swisspass extends ExternalTicketProviderState {
  constructor(params) {
    super(params)
    this.type = 'swisspass'
  }
}
