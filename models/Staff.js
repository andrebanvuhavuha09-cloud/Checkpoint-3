/**
 * Staff.js - Extends Person
 * Demonstrates: Inheritance (extends + super())
 */
import { Person } from './Person.js';
import { QueueManager } from './QueueManager.js';

export class Staff extends Person {
  #role;

  constructor(id, name, email, phone, role = 'Service Agent') {
    super(id, name, email, phone);
    this.#role = role;
  }

  getRole() {
    return this.#role;
  }

  /**
   * Call the next customer in the queue
   * @returns {Appointment|null} The appointment now being served
   */
  callNextCustomer() {
    const qm = QueueManager.getInstance();
    return qm.callNext();
  }

  /**
   * Update status of a specific appointment
   */
  updateAppointmentStatus(appointment, newStatus) {
    if (appointment && typeof appointment.setStatus === 'function') {
      appointment.setStatus(newStatus);
      return true;
    }
    return false;
  }

  /**
   * View the current live queue
   */
  viewQueue() {
    const qm = QueueManager.getInstance();
    return qm.getQueueList();
  }
}
