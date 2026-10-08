/**
 * ServiceType.js
 */
export class ServiceType {
  #serviceId;
  #serviceName;
  #estimatedDuration; // in minutes

  constructor(serviceId, serviceName, estimatedDuration) {
    this.#serviceId = serviceId;
    this.#serviceName = serviceName;
    this.#estimatedDuration = estimatedDuration;
  }

  get serviceId() {
    return this.#serviceId;
  }

  get serviceName() {
    return this.#serviceName;
  }

  get estimatedDuration() {
    return this.#estimatedDuration;
  }

  getDetails() {
    return {
      id: this.#serviceId,
      name: this.#serviceName,
      duration: this.#estimatedDuration
    };
  }

  toString() {
    return `${this.#serviceName} (~${this.#estimatedDuration} min)`;
  }
}
