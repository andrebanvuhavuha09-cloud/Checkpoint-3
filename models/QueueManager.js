/**
 * QueueManager.js - Singleton Design Pattern
 * Guarantees only one shared queue instance for the entire application.
 */
export class QueueManager {
  static #instance = null;

  #queueList;          // array of Appointment objects currently waiting / being served
  #currentQueueNumber; // sequential counter
  #nowServing;         // the Appointment currently being served (or null)

  constructor() {
    if (QueueManager.#instance) {
      throw new Error('QueueManager is a Singleton. Use QueueManager.getInstance() instead of new.');
    }
    this.#queueList = [];
    this.#currentQueueNumber = 0;
    this.#nowServing = null;
    QueueManager.#instance = this;
  }

  /**
   * Returns the single shared instance
   */
  static getInstance() {
    if (!QueueManager.#instance) {
      QueueManager.#instance = new QueueManager();
    }
    return QueueManager.#instance;
  }

  /**
   * Generate the next sequential queue number
   */
  generateQueueNumber() {
    this.#currentQueueNumber += 1;
    return this.#currentQueueNumber;
  }

  /**
   * Add a newly booked appointment to the live queue
   */
  addToQueue(appointment) {
    this.#queueList.push(appointment);
    return appointment;
  }

  /**
   * Call the next waiting customer.
   * Moves them to "Now Serving" and removes them from the waiting list.
   * @returns {Appointment|null}
   */
  callNext() {
    // First mark previous "Now Serving" as Completed if any
    if (this.#nowServing && this.#nowServing.getStatus() === 'Now Serving') {
      this.#nowServing.setStatus('Completed');
    }

    // Find the next Pending / Confirmed appointment
    const nextIndex = this.#queueList.findIndex(a => 
      a.getStatus() === 'Pending' || a.getStatus() === 'Confirmed'
    );

    if (nextIndex === -1) {
      this.#nowServing = null;
      return null;
    }

    const nextAppt = this.#queueList[nextIndex];
    nextAppt.setStatus('Now Serving');
    this.#nowServing = nextAppt;

    // Keep it in the list for display, or remove if preferred
    // We keep it so the live queue can still show "Now Serving"
    return nextAppt;
  }

  getQueueList() {
    // Return a shallow copy so external code cannot mutate the internal array
    return [...this.#queueList];
  }

  getNowServing() {
    return this.#nowServing;
  }

  getWaitingCount() {
    return this.#queueList.filter(a => 
      a.getStatus() === 'Pending' || a.getStatus() === 'Confirmed'
    ).length;
  }

  // Useful for testing / resetting
  static resetInstance() {
    QueueManager.#instance = null;
  }
}
