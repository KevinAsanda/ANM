import { supabase } from '../config/supabase.js';
import { Ticket, mockTickets, mockTicketParts } from './ticket.service.js';
import { WhatsAppService } from './whatsapp.service.js';

export interface Invoice {
  id: string;
  ticket_id: string;
  invoice_no: string;
  labour_cost: number;
  parts_cost: number;
  tax_amount: number;
  total_amount: number;
  status: 'unpaid' | 'paid' | 'void';
  payment_method: 'cash' | 'card' | 'eft' | null;
  secure_token: string;
  created_at: string;
  updated_at: string;
  ticket?: any;
}

const isMockMode = process.env.SUPABASE_URL?.includes('mockproject.supabase.co');

export let mockInvoices: Invoice[] = [];

// Helper to reset mocks in tests
export function resetMockInvoices() {
  mockInvoices = [];
}

export async function createInvoice(
  ticketId: string,
  customLabour?: number
): Promise<Invoice> {
  const taxRate = 0.15; // 15% VAT in South Africa

  // 1. Fetch ticket and parts details
  let ticket: any;
  let partsUsed: any[] = [];
  let labourCost = 0;

  if (isMockMode) {
    ticket = mockTickets.find(t => t.id === ticketId);
    if (!ticket) {
      const error = new Error('Ticket not found') as any;
      error.status = 404;
      error.code = 'TICKET_NOT_FOUND';
      throw error;
    }

    // Resolve vehicle & customer mock relations
    const { mockCustomers } = await import('./customer.service.js');
    const { mockVehicles } = await import('./vehicle.service.js');
    const { mockStaff } = await import('./staff.service.js');

    const vehicle = mockVehicles.find(v => v.id === ticket.vehicle_id);
    const customer = vehicle ? mockCustomers.find(c => c.id === vehicle.customer_id) : undefined;
    const mechanic = mockStaff.find(s => s.id === ticket.staff_id);

    ticket.vehicle = vehicle;
    ticket.customer = customer;
    ticket.mechanic = mechanic;

    // Filter parts
    partsUsed = mockTicketParts.filter(tp => tp.ticket_id === ticketId);
    labourCost = customLabour !== undefined ? customLabour : ticket.labour_cost;
  } else {
    // Live Supabase Mode
    const { data: ticketData, error: ticketError } = await supabase
      .from('service_tickets')
      .select(`
        id,
        labour_cost,
        description,
        status,
        staff_id,
        vehicle:vehicle_id (
          id,
          registration_number,
          make,
          model,
          year,
          customer:customer_id (
            id,
            name,
            phone,
            email
          )
        )
      `)
      .eq('id', ticketId)
      .single();

    if (ticketError || !ticketData) {
      const error = new Error('Ticket not found') as any;
      error.status = 404;
      error.code = 'TICKET_NOT_FOUND';
      throw error;
    }

    ticket = ticketData;
    labourCost = customLabour !== undefined ? customLabour : Number(ticket.labour_cost);

    // Fetch parts logged
    const { data: partsData, error: partsError } = await supabase
      .from('ticket_parts')
      .select(`
        id,
        qty_used,
        unit_cost_at_time,
        inventory:inventory_id (
          part_name,
          part_number
        )
      `)
      .eq('ticket_id', ticketId);

    if (partsError) throw partsError;
    partsUsed = partsData || [];
  }

  // Check if invoice already exists for this ticket
  if (isMockMode) {
    const existing = mockInvoices.find(inv => inv.ticket_id === ticketId);
    if (existing) return existing;
  } else {
    const { data: existing } = await supabase
      .from('invoices')
      .select('*')
      .eq('ticket_id', ticketId)
      .maybeSingle();

    if (existing) {
      return existing as Invoice;
    }
  }

  // 2. Perform Calculations
  let partsCost = 0;
  for (const part of partsUsed) {
    const cost = Number(part.unit_cost_at_time || 0);
    const qty = Number(part.qty_used || 0);
    partsCost += cost * qty;
  }

  const subtotal = labourCost + partsCost;
  const taxAmount = subtotal * taxRate;
  const totalAmount = subtotal + taxAmount;

  // 3. Generate sequential invoice number: INV-YYYYMM-XXXX
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  let invoiceNo = '';

  if (isMockMode) {
    const index = mockInvoices.length + 1;
    invoiceNo = `INV-${year}${month}-${String(index).padStart(4, '0')}`;
  } else {
    const startOfMonth = new Date(year, now.getMonth(), 1).toISOString();
    const { count } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth);

    const index = (count || 0) + 1;
    invoiceNo = `INV-${year}${month}-${String(index).padStart(4, '0')}`;
  }

  // 4. Create Invoice Record
  const secureToken = isMockMode 
    ? 'mock-token-' + Math.random().toString(36).substring(2, 11)
    : undefined; // Supabase defaults to gen_random_uuid()

  const invoiceData: Partial<Invoice> = {
    ticket_id: ticketId,
    invoice_no: invoiceNo,
    labour_cost: labourCost,
    parts_cost: partsCost,
    tax_amount: taxAmount,
    total_amount: totalAmount,
    status: 'unpaid',
    payment_method: null
  };

  if (secureToken) {
    invoiceData.secure_token = secureToken;
  }

  let savedInvoice: Invoice;

  if (isMockMode) {
    savedInvoice = {
      id: 'mock-inv-' + Math.random().toString(36).substring(2, 11),
      secure_token: secureToken!,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...invoiceData
    } as Invoice;
    mockInvoices.push(savedInvoice);
  } else {
    // If labour_cost was custom modified, update the service ticket as well
    if (customLabour !== undefined) {
      await supabase
        .from('service_tickets')
        .update({ labour_cost: customLabour })
        .eq('id', ticketId);
    }

    const { data, error } = await supabase
      .from('invoices')
      .insert(invoiceData)
      .select()
      .single();

    if (error) throw error;
    savedInvoice = data as Invoice;
  }

  // 5. Trigger WhatsApp Notification
  const customer = ticket.vehicle?.customer || ticket.customer;
  const vehicle = ticket.vehicle;
  const makeModel = vehicle ? `${vehicle.make} ${vehicle.model}` : 'Vehicle';
  const regNumber = vehicle ? vehicle.registration_number : 'Unknown';

  if (customer) {
    try {
      await WhatsAppService.sendInvoiceNotification(
        customer.name,
        customer.phone,
        regNumber,
        makeModel,
        savedInvoice.invoice_no,
        savedInvoice.total_amount,
        savedInvoice.secure_token
      );
    } catch (waError) {
      console.error('Failed to dispatch WhatsApp notification:', waError);
    }
  }

  return savedInvoice;
}

export async function listInvoices(status?: string): Promise<Invoice[]> {
  if (isMockMode) {
    let list = [...mockInvoices];
    if (status) {
      list = list.filter(inv => inv.status === status);
    }
    return list;
  }

  let query = supabase
    .from('invoices')
    .select(`
      *,
      ticket:ticket_id (
        id,
        description,
        vehicle:vehicle_id (
          registration_number,
          make,
          model,
          customer:customer_id (
            name,
            phone
          )
        )
      )
    `)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as any[];
}

export async function getInvoiceDetails(id: string): Promise<Invoice> {
  if (isMockMode) {
    const invoice = mockInvoices.find(inv => inv.id === id);
    if (!invoice) {
      const error = new Error('Invoice not found') as any;
      error.status = 404;
      error.code = 'INVOICE_NOT_FOUND';
      throw error;
    }

    const ticket = mockTickets.find(t => t.id === invoice.ticket_id);
    invoice.ticket = ticket;
    return invoice;
  }

  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      ticket:ticket_id (
        id,
        description,
        labour_cost,
        created_at,
        notes,
        vehicle:vehicle_id (
          registration_number,
          make,
          model,
          year,
          customer:customer_id (
            name,
            phone,
            email
          )
        ),
        ticket_parts (
          id,
          qty_used,
          unit_cost_at_time,
          inventory:inventory_id (
            part_name,
            part_number
          )
        )
      )
    `)
    .eq('id', id)
    .single();

  if (error || !data) {
    const err = new Error('Invoice not found') as any;
    err.status = 404;
    err.code = 'INVOICE_NOT_FOUND';
    throw err;
  }

  return data as any;
}

export async function getInvoiceByToken(secureToken: string): Promise<Invoice> {
  if (isMockMode) {
    const invoice = mockInvoices.find(inv => inv.secure_token === secureToken);
    if (!invoice) {
      const error = new Error('Invoice not found') as any;
      error.status = 404;
      error.code = 'INVOICE_NOT_FOUND';
      throw error;
    }

    const ticket = mockTickets.find(t => t.id === invoice.ticket_id);
    invoice.ticket = ticket;
    return invoice;
  }

  // Query using service role to bypass RLS, ensuring public token reads are allowed
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      ticket:ticket_id (
        id,
        description,
        labour_cost,
        created_at,
        notes,
        vehicle:vehicle_id (
          registration_number,
          make,
          model,
          year,
          customer:customer_id (
            name,
            phone,
            email
          )
        ),
        ticket_parts (
          id,
          qty_used,
          unit_cost_at_time,
          inventory:inventory_id (
            part_name,
            part_number
          )
        )
      )
    `)
    .eq('secure_token', secureToken)
    .single();

  if (error || !data) {
    const err = new Error('Invoice not found') as any;
    err.status = 404;
    err.code = 'INVOICE_NOT_FOUND';
    throw err;
  }

  return data as any;
}

export async function updateInvoiceStatus(
  id: string,
  status: 'unpaid' | 'paid' | 'void',
  paymentMethod?: 'cash' | 'card' | 'eft' | null
): Promise<Invoice> {
  if (isMockMode) {
    const invoice = mockInvoices.find(inv => inv.id === id);
    if (!invoice) {
      const error = new Error('Invoice not found') as any;
      error.status = 404;
      error.code = 'INVOICE_NOT_FOUND';
      throw error;
    }
    invoice.status = status;
    invoice.payment_method = paymentMethod || null;
    invoice.updated_at = new Date().toISOString();
    return invoice;
  }

  const { data, error } = await supabase
    .from('invoices')
    .update({ 
      status, 
      payment_method: paymentMethod || null 
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Invoice;
}
