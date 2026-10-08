/**
 * Appointment.js
 * Demonstrates: Encapsulation (private fields + controlled setStatus)
 */
export class Appointment {
  #appointmentId;
  #customer;
  #serviceType;
  #dateTime;
  #status;
  #queueNumber;

  static ALLOWED_STATUSES = [
    'Pending',
    'Confirmed',
    'Now Serving',
    'Completed',
    'Cancelled',
    'No-show'
  ];

  constructor(appointmentId, customer, serviceType, dateTime, queueNumber) {
    this.#appointmentId = appointmentId;
    this.#customer = customer;
    this.#serviceType = serviceType;
    this.#dateTime = dateTime;
    this.#status = 'Pending';
    this.#queueNumber = queueNumber;
  }

  get appointmentId() {
    return this.#appointmentId;
  }

  get customer() {
    return this.#customer;
  }

  get serviceType() {
    return this.#serviceType;
  }

  get dateTime() {
    return this.#dateTime;
  }

  get queueNumber() {
    return this.#queueNumber;
  }

  getStatus() {
    return this.#status;
  }

  /**
   * Controlled setter – only allows valid statuses
   */
  setStatus(newStatus) {
    if (!Appointment.ALLOWED_STATUSES.includes(newStatus)) {
      throw new Error(`Invalid status: ${newStatus}. Allowed: ${Appointment.ALLOWED_STATUSES.join(', ')}`);
    }
    this.#status = newStatus;
  }

  cancel() {
    this.setStatus('Cancelled');
  }

  toSummary() {
    return {
      id: this.#appointmentId,
      queueNumber: this.#queueNumber,
      customerName: this.#customer.getName(),
      service: this.#serviceType.serviceName,
      dateTime: this.#dateTime,
      status: this.#status
    };
  }

  toString() {
    return `Q#${this.#queueNumber} – ${this.#customer.getName()} – ${this.#serviceType.serviceName} [${this.#status}]`;
  }
}
