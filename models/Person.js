/**
 * Person.js - Base class for all people in the system (Customer, Staff)
 * Demonstrates: Encapsulation (private fields), Constructor, Getters/Setters
 */
export class Person {
  #id;
  #name;
  #email;
  #phone;

  constructor(id, name, email, phone) {
    this.#id = id;
    this.#name = name;
    this.#email = email;
    this.#phone = phone;
  }

  get id() {
    return this.#id;
  }

  getName() {
    return this.#name;
  }

  getContact() {
    return {
      email: this.#email,
      phone: this.#phone
    };
  }

  setContact(email, phone) {
    if (email) this.#email = email;
    if (phone) this.#phone = phone;
  }

  // For display purposes
  toString() {
    return `${this.#name} (${this.#email})`;
  }
}
