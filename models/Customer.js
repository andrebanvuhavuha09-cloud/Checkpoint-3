/**
 * Customer.js - Extends Person
 * Demonstrates: Inheritance (extends + super()), Encapsulation
 */
import { Person } from './Person.js';

export class Customer extends Person {
  #appointments; // private array of Appointment objects

  constructor(id, name, email, phone) {
    super(id, name, email, phone); // call parent constructor
    this.#appointments = [];
  }

  bookAppointment(appointment) {
    this.#appointments.push(appointment);
    return appointment;
  }

  cancelAppointment(appointmentId) {
    const appt = this.#appointments.find(a => a.appointmentId === appointmentId);
    if (appt) {
      appt.cancel();
      return true;
    }
    return false;
  }

  viewStatus(appointmentId) {
    const appt = this.#appointments.find(a => a.appointmentId === appointmentId);
    return appt ? appt.getStatus() : null;
  }

  getAppointments() {
    return [...this.#appointments]; // return a copy to preserve encapsulation
  }

  getUpcomingAppointments() {
    return this.#appointments.filter(a => 
      a.getStatus() === 'Pending' || a.getStatus() === 'Confirmed'
    );
  }
}
