/**
 * app.js - Controller (MVC)
 * Wires the View (DOM) to the Model (classes)
 */
import { Person } from '../models/Person.js';
import { Customer } from '../models/Customer.js';
import { Staff } from '../models/Staff.js';
import { ServiceType } from '../models/ServiceType.js';
import { Appointment } from '../models/Appointment.js';
import { QueueManager } from '../models/QueueManager.js';

// -------------------- Model layer (in-memory store) --------------------
const customers = new Map(); // email -> Customer
let nextCustomerId = 1;
let nextAppointmentId = 1;

// Pre-defined service types
const serviceTypes = [
  new ServiceType(1, 'General Consultation', 15),
  new ServiceType(2, 'Specialist Appointment', 30),
  new ServiceType(3, 'Document Collection', 10),
  new ServiceType(4, 'Account Inquiry', 20)
];

// Default staff member
const defaultStaff = new Staff(100, 'Alex Rivera', 'alex@appointease.com', '0400000000', 'Front Desk');

// -------------------- Validation helpers (R8) --------------------
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^(\+?\d{1,3}[- ]?)?\d{8,12}$/;

function validateEmail(email) {
  return emailRegex.test(email);
}

function validatePhone(phone) {
  return phoneRegex.test(phone.replace(/\s+/g, ''));
}

// -------------------- View helpers --------------------
function showMessage(elementId, message, type = 'info') {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = message;
  el.className = `message ${type}`;
  el.style.display = 'block';
  setTimeout(() => {
    el.style.display = 'none';
  }, 4000);
}

function clearForm(formId) {
  document.getElementById(formId).reset();
}

// -------------------- Controller actions --------------------

// R1 – Register new customer
function handleRegister(event) {
  event.preventDefault();

  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim().toLowerCase();
  const phone = document.getElementById('reg-phone').value.trim();

  if (!name || !email || !phone) {
    showMessage('reg-message', 'All fields are required.', 'error');
    return;
  }
  if (!validateEmail(email)) {
    showMessage('reg-message', 'Please enter a valid email address.', 'error');
    return;
  }
  if (!validatePhone(phone)) {
    showMessage('reg-message', 'Please enter a valid phone number (8–12 digits).', 'error');
    return;
  }
  if (customers.has(email)) {
    showMessage('reg-message', 'An account with this email already exists.', 'error');
    return;
  }

  const customer = new Customer(nextCustomerId++, name, email, phone);
  customers.set(email, customer);

  showMessage('reg-message', `Welcome ${name}! Registration successful.`, 'success');
  clearForm('register-form');

  // Auto-fill booking form email
  document.getElementById('book-email').value = email;
  updateCustomerSelect();
}

// R2 + R3 – Book appointment (generates queue number)
function handleBook(event) {
  event.preventDefault();

  const email = document.getElementById('book-email').value.trim().toLowerCase();
  const serviceId = parseInt(document.getElementById('book-service').value, 10);
  const dateTime = document.getElementById('book-datetime').value;

  if (!email || !serviceId || !dateTime) {
    showMessage('book-message', 'All fields are required.', 'error');
    return;
  }

  const customer = customers.get(email);
  if (!customer) {
    showMessage('book-message', 'Customer not found. Please register first.', 'error');
    return;
  }

  const service = serviceTypes.find(s => s.serviceId === serviceId);
  if (!service) {
    showMessage('book-message', 'Invalid service selected.', 'error');
    return;
  }

  const qm = QueueManager.getInstance();
  const queueNumber = qm.generateQueueNumber();

  const appointment = new Appointment(
    nextAppointmentId++,
    customer,
    service,
    dateTime,
    queueNumber
  );

  // Confirm automatically for demo simplicity
  appointment.setStatus('Confirmed');

  customer.bookAppointment(appointment);
  qm.addToQueue(appointment);

  showMessage(
    'book-message',
    `Appointment booked! Your queue number is #${queueNumber}.`,
    'success'
  );
  clearForm('book-form');
  document.getElementById('book-email').value = email; // keep email

  refreshQueueDisplay();
  refreshMyAppointments(email);
}

// R5 – Cancel appointment
function handleCancel(appointmentId, email) {
  const customer = customers.get(email);
  if (!customer) return;

  const success = customer.cancelAppointment(appointmentId);
  if (success) {
    showMessage('my-appts-message', 'Appointment cancelled successfully.', 'success');
    refreshQueueDisplay();
    refreshMyAppointments(email);
  } else {
    showMessage('my-appts-message', 'Could not cancel appointment.', 'error');
  }
}

// R6 – Staff: Call next customer
function handleCallNext() {
  const staff = defaultStaff;
  const next = staff.callNextCustomer();

  if (next) {
    showMessage(
      'staff-message',
      `Now serving: Queue #${next.queueNumber} – ${next.customer.getName()}`,
      'success'
    );
  } else {
    showMessage('staff-message', 'No more customers waiting in the queue.', 'info');
  }
  refreshQueueDisplay();
}

// R6 – Staff: Mark as Completed / No-show
function handleUpdateStatus(appointmentId, newStatus) {
  const qm = QueueManager.getInstance();
  const appt = qm.getQueueList().find(a => a.appointmentId === appointmentId);
  if (appt) {
    defaultStaff.updateAppointmentStatus(appt, newStatus);
    showMessage('staff-message', `Appointment #${appt.queueNumber} marked as ${newStatus}.`, 'success');
    refreshQueueDisplay();
  }
}

// -------------------- View update functions --------------------

function populateServiceSelect() {
  const select = document.getElementById('book-service');
  select.innerHTML = '<option value="">-- Select a service --</option>';
  serviceTypes.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.serviceId;
    opt.textContent = s.toString();
    select.appendChild(opt);
  });
}

function updateCustomerSelect() {
  // Optional helper – not strictly needed
}

function refreshQueueDisplay() {
  const qm = QueueManager.getInstance();
  const list = qm.getQueueList();
  const nowServing = qm.getNowServing();

  // Now Serving banner
  const nowEl = document.getElementById('now-serving');
  if (nowServing && nowServing.getStatus() === 'Now Serving') {
    nowEl.innerHTML = `
      <strong>NOW SERVING</strong><br>
      Queue #${nowServing.queueNumber} – ${nowServing.customer.getName()}<br>
      <small>${nowServing.serviceType.serviceName}</small>
    `;
    nowEl.className = 'now-serving active';
  } else {
    nowEl.innerHTML = '<strong>NOW SERVING</strong><br><em>None</em>';
    nowEl.className = 'now-serving';
  }

  // Waiting list
  const waitingEl = document.getElementById('queue-list');
  const waiting = list.filter(a => 
    a.getStatus() === 'Pending' || a.getStatus() === 'Confirmed'
  );

  if (waiting.length === 0) {
    waitingEl.innerHTML = '<li class="empty">No customers currently waiting.</li>';
  } else {
    waitingEl.innerHTML = waiting
      .map(a => `
        <li>
          <span class="qnum">#${a.queueNumber}</span>
          <span class="name">${a.customer.getName()}</span>
          <span class="service">${a.serviceType.serviceName}</span>
          <span class="status badge">${a.getStatus()}</span>
        </li>
      `)
      .join('');
  }

  // Full queue for staff panel (including Now Serving / Completed recently)
  const staffListEl = document.getElementById('staff-queue-list');
  if (list.length === 0) {
    staffListEl.innerHTML = '<li class="empty">Queue is empty.</li>';
  } else {
    staffListEl.innerHTML = list
      .map(a => {
        const canComplete = a.getStatus() === 'Now Serving';
        return `
          <li class="staff-item status-${a.getStatus().toLowerCase().replace(' ', '-')}">
            <div>
              <strong>#${a.queueNumber}</strong> – ${a.customer.getName()}
              <br><small>${a.serviceType.serviceName} · ${a.getStatus()}</small>
            </div>
            <div class="actions">
              ${canComplete ? `
                <button class="btn-sm success" data-id="${a.appointmentId}" data-status="Completed">Complete</button>
                <button class="btn-sm danger" data-id="${a.appointmentId}" data-status="No-show">No-show</button>
              ` : ''}
            </div>
          </li>
        `;
      })
      .join('');

    // Attach event listeners for status buttons
    staffListEl.querySelectorAll('button[data-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        handleUpdateStatus(parseInt(btn.dataset.id, 10), btn.dataset.status);
      });
    });
  }

  // Stats
  document.getElementById('waiting-count').textContent = qm.getWaitingCount();
  document.getElementById('total-served').textContent = 
    list.filter(a => a.getStatus() === 'Completed').length;
}

function refreshMyAppointments(email) {
  const container = document.getElementById('my-appointments');
  const customer = customers.get(email);
  if (!customer) {
    container.innerHTML = '<p class="empty">Register or enter your email above to see appointments.</p>';
    return;
  }

  const appts = customer.getAppointments();
  if (appts.length === 0) {
    container.innerHTML = '<p class="empty">You have no appointments yet.</p>';
    return;
  }

  container.innerHTML = appts
    .map(a => {
      const canCancel = a.getStatus() === 'Pending' || a.getStatus() === 'Confirmed';
      return `
        <div class="appt-card">
          <div class="appt-header">
            <span class="qnum">Queue #${a.queueNumber}</span>
            <span class="badge status-${a.getStatus().toLowerCase().replace(' ', '-')}">${a.getStatus()}</span>
          </div>
          <p><strong>Service:</strong> ${a.serviceType.serviceName}</p>
          <p><strong>When:</strong> ${new Date(a.dateTime).toLocaleString()}</p>
          ${canCancel ? `
            <button class="btn-sm danger cancel-btn" data-id="${a.appointmentId}" data-email="${email}">
              Cancel Appointment
            </button>
          ` : ''}
        </div>
      `;
    })
    .join('');

  container.querySelectorAll('.cancel-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      handleCancel(parseInt(btn.dataset.id, 10), btn.dataset.email);
    });
  });
}

// Lookup my appointments by email
function handleLookup() {
  const email = document.getElementById('lookup-email').value.trim().toLowerCase();
  if (!email) {
    showMessage('my-appts-message', 'Please enter your email.', 'error');
    return;
  }
  if (!customers.has(email)) {
    showMessage('my-appts-message', 'No customer found with that email.', 'error');
    return;
  }
  refreshMyAppointments(email);
}

// -------------------- Initialise --------------------
document.addEventListener('DOMContentLoaded', () => {
  // Forms
  document.getElementById('register-form').addEventListener('submit', handleRegister);
  document.getElementById('book-form').addEventListener('submit', handleBook);
  document.getElementById('call-next-btn').addEventListener('click', handleCallNext);
  document.getElementById('lookup-btn').addEventListener('click', handleLookup);

  populateServiceSelect();
  refreshQueueDisplay();

  // Set min datetime to now
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  document.getElementById('book-datetime').min = now.toISOString().slice(0, 16);

  console.log('AppointEase MVC prototype loaded.');
  console.log('QueueManager singleton check:', QueueManager.getInstance() === QueueManager.getInstance());
});
