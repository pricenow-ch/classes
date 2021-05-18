import ExternalTicketProviderState from '@/classes-shared/bookings/ExternalTicketProviderState'

export default class Axess extends ExternalTicketProviderState {
  constructor(params) {
    super(params)
    this.type = 'axess'
    this.axess_journal_number = params.axess_journal_number || null
    this.axess_ticket_POS_number = params.axess_ticket_POS_number || null
    this.axess_ticket_serial_number = params.axess_ticket_serial_number || null
  }
}
