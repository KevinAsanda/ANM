import { supabase } from '../config/supabase.js';
import { mockCustomers } from './customer.service.js';
import { mockVehicles } from './vehicle.service.js';
import { mockStaff } from './staff.service.js';
import { mockInventory } from './inventory.service.js';

export interface Ticket {
  id: string;
  vehicle_id: string;
  staff_id: string;
  created_by: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  description: string;
  notes: string | null;
  labour_cost: number;
  created_at: string;
  updated_at: string;
  vehicle?: {
    id: string;
    registration_number: string;
    make: string;
    model: string;
    year: number | null;
  };
  customer?: {
    id: string;
    name: string;
    phone: string;
    email: string | null;
  };
  mechanic?: {
    id: string;
    name: string;
    email: string;
  };
  parts_used?: any[];
}

const isMockMode = process.env.SUPABASE_URL?.includes('mockproject.supabase.co');

// In-memory mock database for local development
export let mockTicketParts: any[] = [];

export let mockTickets: Ticket[] = [
  {
    id: 't1b07384-d113-49c3-a558-8b9a103c8099',
    vehicle_id: 'v7b91d90-b183-4903-8888-0f19c9d09a80',
    staff_id: 'f5f7b03b-1798-444a-a435-08103cd58522', // Asanda Cele
    created_by: 'd3b07384-d113-49c3-a558-8b9a103c801e', // Mpume Zulu
    status: 'pending',
    description: 'Front brake pads worn out and squealing. Replace pads.',
    notes: 'Customer reports squealing noise when braking.',
    labour_cost: 350.00,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hrs ago
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    vehicle: {
      id: 'v7b91d90-b183-4903-8888-0f19c9d09a80',
      registration_number: 'ND123456',
      make: 'Toyota',
      model: 'Hilux',
      year: 2018
    },
    customer: {
      id: 'c1f7b03b-1798-444a-a435-08103cd585e5',
      name: 'Sipho Khumalo',
      phone: '0821234567',
      email: 'sipho@gmail.com'
    },
    mechanic: {
      id: 'f5f7b03b-1798-444a-a435-08103cd58522',
      name: 'Asanda Cele',
      email: 'mechanic@anm.co.za'
    },
    parts_used: []
  }
];

export async function listTickets(status?: string): Promise<Ticket[]> {
  if (isMockMode) {
    if (status) {
      return mockTickets.filter(t => t.status === status);
    }
    return mockTickets;
  }

  let query = supabase
    .from('service_tickets')
    .select(`
      *,
      vehicle:vehicles(id, registration_number, make, model, year, customer:customers(id, name, phone, email)),
      mechanic:staff!service_tickets_staff_id_fkey(id, name, email)
    `)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) throw error;

  // Format response to match spec
  return data.map((t: any) => ({
    id: t.id,
    vehicle_id: t.vehicle_id,
    staff_id: t.staff_id,
    created_by: t.created_by,
    status: t.status,
    description: t.description,
    notes: t.notes,
    labour_cost: Number(t.labour_cost),
    created_at: t.created_at,
    updated_at: t.updated_at,
    vehicle: t.vehicle ? {
      id: t.vehicle.id,
      registration_number: t.vehicle.registration_number,
      make: t.vehicle.make,
      model: t.vehicle.model,
      year: t.vehicle.year
    } : undefined,
    customer: t.vehicle?.customer ? {
      id: t.vehicle.customer.id,
      name: t.vehicle.customer.name,
      phone: t.vehicle.customer.phone,
      email: t.vehicle.customer.email
    } : undefined,
    mechanic: t.mechanic ? {
      id: t.mechanic.id,
      name: t.mechanic.name,
      email: t.mechanic.email
    } : undefined
  }));
}

export async function listMechanicTickets(mechanicId: string): Promise<Ticket[]> {
  console.log('=== listMechanicTickets CALLED FOR MECHANIC ===', mechanicId);
  if (isMockMode) {
    return mockTickets.filter(t => t.staff_id === mechanicId);
  }

  const { data, error } = await supabase
    .from('service_tickets')
    .select(`
      *,
      vehicle:vehicles(id, registration_number, make, model, year, customer:customers(id, name, phone, email)),
      mechanic:staff!service_tickets_staff_id_fkey(id, name, email)
    `)
    .eq('staff_id', mechanicId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Format response to match spec
  return data.map((t: any) => ({
    id: t.id,
    vehicle_id: t.vehicle_id,
    staff_id: t.staff_id,
    created_by: t.created_by,
    status: t.status,
    description: t.description,
    notes: t.notes,
    labour_cost: Number(t.labour_cost),
    created_at: t.created_at,
    updated_at: t.updated_at,
    vehicle: t.vehicle ? {
      id: t.vehicle.id,
      registration_number: t.vehicle.registration_number,
      make: t.vehicle.make,
      model: t.vehicle.model,
      year: t.vehicle.year
    } : undefined,
    customer: t.vehicle?.customer ? {
      id: t.vehicle.customer.id,
      name: t.vehicle.customer.name,
      phone: t.vehicle.customer.phone,
      email: t.vehicle.customer.email
    } : undefined,
    mechanic: t.mechanic ? {
      id: t.mechanic.id,
      name: t.mechanic.name,
      email: t.mechanic.email
    } : undefined
  }));
}

export async function createTicket(
  vehicleId: string,
  staffId: string,
  createdBy: string,
  description: string,
  labourCost: number = 0.00
): Promise<Ticket> {
  if (isMockMode) {
    // Attempt to load associated vehicle/customer/mechanic from other mocks if available
    const newTicket: Ticket = {
      id: crypto.randomUUID(),
      vehicle_id: vehicleId,
      staff_id: staffId,
      created_by: createdBy,
      status: 'pending',
      description,
      notes: null,
      labour_cost: labourCost,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Populate relations for mock response
    const vehicle = mockVehicles.find(v => v.id === vehicleId);
    if (vehicle) {
      newTicket.vehicle = {
        id: vehicle.id,
        registration_number: vehicle.registration_number,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year
      };

      const customer = mockCustomers.find(c => c.id === vehicle.customer_id);
      if (customer) {
        newTicket.customer = {
          id: customer.id,
          name: customer.name,
          phone: customer.phone,
          email: customer.email
        };
      }
    }

    const mechanic = mockStaff.find(s => s.id === staffId);
    if (mechanic) {
      newTicket.mechanic = {
        id: mechanic.id,
        name: mechanic.name,
        email: mechanic.email
      };
    } else {
      newTicket.mechanic = {
        id: staffId,
        name: 'Unknown Mechanic',
        email: 'mechanic@anm.co.za'
      };
    }
    newTicket.parts_used = [];

    mockTickets.push(newTicket);
    return newTicket;
  }

  const { data, error } = await supabase
    .from('service_tickets')
    .insert({
      vehicle_id: vehicleId,
      staff_id: staffId,
      created_by: createdBy,
      description,
      labour_cost: labourCost
    })
    .select()
    .single();

  if (error) throw error;
  return data as Ticket;
}

export async function getTicketDetails(id: string): Promise<Ticket> {
  if (isMockMode) {
    const ticket = mockTickets.find(t => t.id === id);
    if (!ticket) {
      const error = new Error('Ticket not found') as any;
      error.status = 404;
      error.code = 'TICKET_NOT_FOUND';
      throw error;
    }
    
    // Fetch associated mock parts
    const ticketParts = mockTicketParts.filter(p => p.ticket_id === id);
    ticket.parts_used = ticketParts.map(p => {
      const part = mockInventory.find(i => i.id === p.inventory_id);
      const staff = mockStaff.find(s => s.id === p.logged_by);
      return {
        id: p.id,
        part_name: part?.part_name || 'Unknown Part',
        qty_used: p.qty_used,
        unit_cost_at_time: p.unit_cost_at_time,
        logged_by_name: staff?.name || 'Unknown',
        created_at: p.created_at
      };
    });
    return ticket;
  }

  // Fetch ticket details with joins
  const { data: t, error } = await supabase
    .from('service_tickets')
    .select(`
      *,
      vehicle:vehicles(
        id, registration_number, make, model, year, 
        customer:customers(id, name, phone, email)
      ),
      mechanic:staff!service_tickets_staff_id_fkey(id, name, email),
      parts:ticket_parts(
        id, qty_used, unit_cost_at_time, created_at,
        inventory(part_name),
        logged_by_staff:staff!ticket_parts_logged_by_fkey(name)
      )
    `)
    .eq('id', id)
    .maybeSingle();

  if (error || !t) {
    const customError = new Error('Ticket not found') as any;
    customError.status = 404;
    customError.code = 'TICKET_NOT_FOUND';
    throw customError;
  }

  // Map parts relationship
  const parts_used = (t.parts || []).map((p: any) => ({
    id: p.id,
    part_name: p.inventory?.part_name || 'Unknown Part',
    qty_used: p.qty_used,
    unit_cost_at_time: Number(p.unit_cost_at_time),
    logged_by_name: p.logged_by_staff?.name || 'Unknown',
    created_at: p.created_at
  }));

  return {
    id: t.id,
    vehicle_id: t.vehicle_id,
    staff_id: t.staff_id,
    created_by: t.created_by,
    status: t.status,
    description: t.description,
    notes: t.notes,
    labour_cost: Number(t.labour_cost),
    created_at: t.created_at,
    updated_at: t.updated_at,
    vehicle: t.vehicle ? {
      id: t.vehicle.id,
      registration_number: t.vehicle.registration_number,
      make: t.vehicle.make,
      model: t.vehicle.model,
      year: t.vehicle.year
    } : undefined,
    customer: t.vehicle?.customer ? {
      id: t.vehicle.customer.id,
      name: t.vehicle.customer.name,
      phone: t.vehicle.customer.phone,
      email: t.vehicle.customer.email
    } : undefined,
    mechanic: t.mechanic ? {
      id: t.mechanic.id,
      name: t.mechanic.name,
      email: t.mechanic.email
    } : undefined,
    parts_used
  };
}

export async function updateTicketStatus(
  id: string,
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled',
  role: 'admin' | 'mechanic',
  mechanicId?: string
): Promise<Ticket> {
  // Enforce role rule: mechanic cannot cancel
  if (role === 'mechanic' && status === 'cancelled') {
    const error = new Error('Mechanics are not allowed to cancel tickets.') as any;
    error.status = 403;
    error.code = 'FORBIDDEN';
    throw error;
  }

  if (isMockMode) {
    const ticket = mockTickets.find(t => t.id === id);
    if (!ticket) {
      const error = new Error('Ticket not found') as any;
      error.status = 404;
      error.code = 'TICKET_NOT_FOUND';
      throw error;
    }

    // Enforce mechanic can only update their own ticket
    if (role === 'mechanic' && ticket.staff_id !== mechanicId) {
      const error = new Error('You can only update status on your assigned tickets.') as any;
      error.status = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    ticket.status = status;
    ticket.updated_at = new Date().toISOString();
    return ticket;
  }

  // If mechanic, verify they are assigned to this ticket before updating
  if (role === 'mechanic') {
    const { data: checkTicket } = await supabase
      .from('service_tickets')
      .select('staff_id')
      .eq('id', id)
      .single();

    if (checkTicket && checkTicket.staff_id !== mechanicId) {
      const error = new Error('You can only update status on your assigned tickets.') as any;
      error.status = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }
  }

  const { data, error } = await supabase
    .from('service_tickets')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Ticket;
}

export async function updateTicketNotes(id: string, notes: string): Promise<Ticket> {
  if (isMockMode) {
    const ticket = mockTickets.find(t => t.id === id);
    if (!ticket) {
      const error = new Error('Ticket not found') as any;
      error.status = 404;
      error.code = 'TICKET_NOT_FOUND';
      throw error;
    }
    ticket.notes = notes;
    ticket.updated_at = new Date().toISOString();
    return ticket;
  }

  const { data, error } = await supabase
    .from('service_tickets')
    .update({ notes })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Ticket;
}

export async function logPartOnTicket(
  ticketId: string,
  inventoryId: string,
  qtyUsed: number,
  loggedByStaffId: string,
  userRole: 'admin' | 'mechanic'
): Promise<any> {
  if (isMockMode) {
    const ticket = mockTickets.find(t => t.id === ticketId);
    if (!ticket) {
      const error = new Error('Ticket not found') as any;
      error.status = 404;
      error.code = 'TICKET_NOT_FOUND';
      throw error;
    }

    // Authorization check: mechanic can only log parts on assigned tickets
    if (userRole === 'mechanic' && ticket.staff_id !== loggedByStaffId) {
      const error = new Error('You do not have permission to log parts on this ticket.') as any;
      error.status = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    const part = mockInventory.find(i => i.id === inventoryId);
    if (!part) {
      const error = new Error('Part not found') as any;
      error.status = 404;
      error.code = 'PART_NOT_FOUND';
      throw error;
    }

    if (part.qty_in_stock < qtyUsed) {
      const error = new Error(`Insufficient stock. Only ${part.qty_in_stock} units available.`) as any;
      error.status = 400;
      error.code = 'INSUFFICIENT_STOCK';
      throw error;
    }

    // Auto-decrement inventory
    part.qty_in_stock -= qtyUsed;
    part.updated_at = new Date().toISOString();

    const newLog = {
      id: `tp-${crypto.randomUUID()}`,
      ticket_id: ticketId,
      inventory_id: inventoryId,
      qty_used: qtyUsed,
      unit_cost_at_time: part.unit_cost ? Number(part.unit_cost) : 0.00,
      logged_by: loggedByStaffId,
      created_at: new Date().toISOString()
    };

    mockTicketParts.push(newLog);
    return newLog;
  }

  // Real Supabase mode
  // Verify ticket and authorization
  const { data: ticket, error: ticketError } = await supabase
    .from('service_tickets')
    .select('staff_id')
    .eq('id', ticketId)
    .maybeSingle();

  if (ticketError || !ticket) {
    const error = new Error('Ticket not found') as any;
    error.status = 404;
    error.code = 'TICKET_NOT_FOUND';
    throw error;
  }

  if (userRole === 'mechanic' && ticket.staff_id !== loggedByStaffId) {
    const error = new Error('You do not have permission to log parts on this ticket.') as any;
    error.status = 403;
    error.code = 'FORBIDDEN';
    throw error;
  }

  // Call PostgreSQL RPC function to do it atomically in a database transaction
  const { data, error } = await supabase
    .rpc('log_ticket_part', {
      p_ticket_id: ticketId,
      p_inventory_id: inventoryId,
      p_qty_used: qtyUsed,
      p_logged_by: loggedByStaffId
    });

  if (error) {
    if (error.message.includes('Insufficient stock')) {
      const customError = new Error(error.message) as any;
      customError.status = 400;
      customError.code = 'INSUFFICIENT_STOCK';
      throw customError;
    }
    if (error.message.includes('PART_NOT_FOUND')) {
      const customError = new Error('Part not found') as any;
      customError.status = 404;
      customError.code = 'PART_NOT_FOUND';
      throw customError;
    }
    throw error;
  }

  const record = data[0];
  if (!record) {
    throw new Error('Failed to log part');
  }

  return {
    id: record.id,
    ticket_id: record.ticket_id,
    inventory_id: record.inventory_id,
    qty_used: Number(record.qty_used),
    unit_cost_at_time: Number(record.unit_cost_at_time),
    logged_by: record.logged_by,
    created_at: record.created_at
  };
}

export async function getTicketParts(
  ticketId: string,
  loggedByStaffId: string,
  userRole: 'admin' | 'mechanic'
): Promise<any[]> {
  if (isMockMode) {
    const ticket = mockTickets.find(t => t.id === ticketId);
    if (!ticket) {
      const error = new Error('Ticket not found') as any;
      error.status = 404;
      error.code = 'TICKET_NOT_FOUND';
      throw error;
    }

    // Authorization check
    if (userRole === 'mechanic' && ticket.staff_id !== loggedByStaffId) {
      const error = new Error('You do not have permission to view parts on this ticket.') as any;
      error.status = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    const ticketParts = mockTicketParts.filter(p => p.ticket_id === ticketId);
    return ticketParts.map(p => {
      const part = mockInventory.find(i => i.id === p.inventory_id);
      const staff = mockStaff.find(s => s.id === p.logged_by);
      return {
        id: p.id,
        part_name: part?.part_name || 'Unknown Part',
        qty_used: p.qty_used,
        unit_cost_at_time: p.unit_cost_at_time,
        logged_by_name: staff?.name || 'Unknown',
        created_at: p.created_at
      };
    });
  }

  // Real Supabase mode
  // Verify ticket exists and is authorized
  const { data: ticket, error: ticketError } = await supabase
    .from('service_tickets')
    .select('staff_id')
    .eq('id', ticketId)
    .maybeSingle();

  if (ticketError || !ticket) {
    const error = new Error('Ticket not found') as any;
    error.status = 404;
    error.code = 'TICKET_NOT_FOUND';
    throw error;
  }

  if (userRole === 'mechanic' && ticket.staff_id !== loggedByStaffId) {
    const error = new Error('You do not have permission to view parts on this ticket.') as any;
    error.status = 403;
    error.code = 'FORBIDDEN';
    throw error;
  }

  const { data, error } = await supabase
    .from('ticket_parts')
    .select(`
      id, qty_used, unit_cost_at_time, created_at,
      inventory(part_name),
      logged_by_staff:staff!ticket_parts_logged_by_fkey(name)
    `)
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((p: any) => ({
    id: p.id,
    part_name: p.inventory?.part_name || 'Unknown Part',
    qty_used: Number(p.qty_used),
    unit_cost_at_time: Number(p.unit_cost_at_time),
    logged_by_name: p.logged_by_staff?.name || 'Unknown',
    created_at: p.created_at
  }));
}
