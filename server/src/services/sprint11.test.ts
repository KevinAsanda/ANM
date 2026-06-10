import test from 'node:test';
import assert from 'node:assert';

// Set environment to mock mode
process.env.SUPABASE_URL = 'https://mockproject.supabase.co';

const { 
  createBookingRequest, 
  getTicketByTrackingToken, 
  approveBooking, 
  mockTickets 
} = await import('./ticket.service.js');
const { mockCustomers } = await import('./customer.service.js');
const { mockVehicles } = await import('./vehicle.service.js');
const { createInvoice, resetMockInvoices } = await import('./invoice.service.js');

test('Sprint 11 - Customer Booking & Tracking Portal Service Tests', async () => {
  // Clear mock lists to avoid leaks
  resetMockInvoices();
  mockTickets.splice(1); // keep the first mock ticket
  
  // 1. Test booking request creation
  const customerName = 'John Doe';
  const customerPhone = '0711234567';
  const customerEmail = 'john@anm.co.za';
  const registrationNumber = 'ND777888';
  const make = 'Ford';
  const model = 'Ranger';
  const year = 2020;
  const description = 'Gearbox noise';
  const preferredDate = '2026-06-20';
  const preferredTime = 'afternoon';

  const ticket = await createBookingRequest(
    customerName,
    customerPhone,
    customerEmail,
    registrationNumber,
    make,
    model,
    year,
    description,
    preferredDate,
    preferredTime
  );

  assert.ok(ticket);
  assert.strictEqual(ticket.status, 'draft');
  assert.strictEqual(ticket.staff_id, null);
  assert.strictEqual(ticket.created_by, null);
  assert.strictEqual(ticket.preferred_date, preferredDate);
  assert.strictEqual(ticket.preferred_time, preferredTime);
  assert.ok(ticket.tracking_token);

  // Check if customer and vehicle records were created/linked
  const customer = mockCustomers.find(c => c.phone === customerPhone);
  assert.ok(customer);
  assert.strictEqual(customer.name, customerName);

  const vehicle = mockVehicles.find(v => v.registration_number === registrationNumber);
  assert.ok(vehicle);
  assert.strictEqual(vehicle.make, make);
  assert.strictEqual(vehicle.customer_id, customer.id);

  // 2. Test tracking retrieval
  const trackingDetails = await getTicketByTrackingToken(ticket.tracking_token!);
  assert.ok(trackingDetails);
  assert.strictEqual(trackingDetails.ticket.id, ticket.id);
  assert.strictEqual(trackingDetails.ticket.status, 'draft');
  assert.strictEqual(trackingDetails.invoice, null); // draft has no invoice

  // 3. Test admin approval
  const mechId = 'f5f7b03b-1798-444a-a435-08103cd58522'; // Asanda Cele
  const labourCost = 750.00;

  const approvedTicket = await approveBooking(ticket.id, mechId, labourCost);
  assert.ok(approvedTicket);
  assert.strictEqual(approvedTicket.status, 'pending');
  assert.strictEqual(approvedTicket.staff_id, mechId);
  assert.strictEqual(approvedTicket.labour_cost, labourCost);

  // 4. Test tracking of completed status (invoice visibility)
  approvedTicket.status = 'completed';
  const invoice = await createInvoice(approvedTicket.id);
  invoice.status = 'unpaid';

  const trackingDetailsWithInvoice = await getTicketByTrackingToken(ticket.tracking_token!);
  assert.ok(trackingDetailsWithInvoice.invoice);
  assert.strictEqual(trackingDetailsWithInvoice.invoice.ticket_id, ticket.id);
  assert.strictEqual(trackingDetailsWithInvoice.invoice.total_amount, labourCost + invoice.tax_amount); // total cost is labor (parts is 0) + VAT
});
