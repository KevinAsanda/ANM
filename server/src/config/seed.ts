import { supabase } from './supabase.js';
import crypto from 'crypto';

// Service type interface
interface ServiceType {
  name: string;
  description: string;
  notes: string;
  labour_cost: number;
  parts: { part_number: string; qty: number }[];
}

// Service types with parts used
const serviceTypes: ServiceType[] = [
  {
    name: 'Minor Service',
    description: 'Perform standard minor service. Replace engine oil and oil filter. Top up all fluids and check brakes.',
    notes: 'Engine oil and filter replaced. Fluids checked and topped up. Tyre pressures adjusted.',
    labour_cost: 450.00,
    parts: [
      { part_number: 'EO-006', qty: 1 }, // 5L Engine Oil
      { part_number: 'OF-001', qty: 1 }  // Oil Filter
    ]
  },
  {
    name: 'Major Service',
    description: 'Perform major service. Replace engine oil, oil filter, air filter, spark plugs, and cabin filter. Conduct full safety inspection.',
    notes: 'Major service complete. All filters and spark plugs replaced. Safety inspection passed.',
    labour_cost: 950.00,
    parts: [
      { part_number: 'EO-006', qty: 1 },
      { part_number: 'OF-001', qty: 1 },
      { part_number: 'AF-002', qty: 1 },
      { part_number: 'SP-005', qty: 1 },
      { part_number: 'CF-016', qty: 1 }
    ]
  },
  {
    name: 'Front Brakes Replacement',
    description: 'Customer reported squealing noise when braking. Inspect and replace worn front brake pads.',
    notes: 'Front brake pads were down to 15%. Replaced with new pads. Road test completed.',
    labour_cost: 350.00,
    parts: [
      { part_number: 'BP-F-003', qty: 1 }
    ]
  },
  {
    name: 'Rear Brakes Replacement',
    description: 'Inspect rear braking system. Replace worn rear brake pads and adjust handbrake.',
    notes: 'Rear brake pads replaced. Handbrake cable adjusted and tightened.',
    labour_cost: 350.00,
    parts: [
      { part_number: 'BP-R-004', qty: 1 }
    ]
  },
  {
    name: 'Battery Replacement',
    description: 'Vehicle failed to start. Perform battery health test and replace faulty battery.',
    notes: 'Battery health test showed bad cell. Replaced with new 650CCA battery. Alternator charging correctly.',
    labour_cost: 150.00,
    parts: [
      { part_number: 'BAT-008', qty: 1 }
    ]
  },
  {
    name: 'Cooling System Overhaul',
    description: 'Engine running slightly hot. Flush cooling system, replace coolant, and inspect hoses for leaks.',
    notes: 'Cooling system flushed. Coolant replaced. Pressure test done, no leaks found.',
    labour_cost: 400.00,
    parts: [
      { part_number: 'CL-010', qty: 2 } // 2x Coolant
    ]
  },
  {
    name: 'Wiper Blades Replacement',
    description: 'Replace worn windscreen wiper blades front and rear.',
    notes: 'Fitted new wiper blades. Tested washer jets and adjusted nozzle alignment.',
    labour_cost: 100.00,
    parts: [
      { part_number: 'WB-007', qty: 2 }
    ]
  },
  {
    name: 'Clutch Kit Replacement',
    description: 'Slipping clutch reported by customer. Remove gearbox, replace complete clutch kit, and bleed system.',
    notes: 'Clutch disc was worn down to rivets. Installed new clutch kit, pressure plate, and release bearing.',
    labour_cost: 1800.00,
    parts: [
      { part_number: 'CK-012', qty: 1 }
    ]
  },
  {
    name: 'Drive Belt Replacement',
    description: 'Inspect engine accessory drive belts. Replace cracked fan belt.',
    notes: 'Old fan belt was showing severe cracking. Replaced with new fan belt and adjusted tensioner.',
    labour_cost: 300.00,
    parts: [
      { part_number: 'FB-014', qty: 1 }
    ]
  },
  {
    name: 'Fuel Filter Service',
    description: 'Engine hesitation under acceleration. Replace fuel filter and check fuel pressure.',
    notes: 'Fuel filter replaced. Fuel pressure is within manufacturer specs. Hesitation resolved.',
    labour_cost: 350.00,
    parts: [
      { part_number: 'FF-015', qty: 1 }
    ]
  }
];

// Service types with no parts used
const serviceTypesNoParts: ServiceType[] = [
  {
    name: 'Diagnostic Check',
    description: 'Check engine warning light illuminated on dashboard. Run diagnostic scan and report codes.',
    notes: 'Scanned codes. Found temporary oxygen sensor code. Cleared code, test drove, light remained off.',
    labour_cost: 350.00,
    parts: []
  },
  {
    name: 'Wheel Alignment & Balancing',
    description: 'Vehicle pulling slightly to the left. Perform four-wheel alignment and wheel balancing.',
    notes: 'Aligned front and rear suspension to factory specifications. Balanced all four wheels.',
    labour_cost: 450.00,
    parts: []
  },
  {
    name: 'Suspension Inspection',
    description: 'Knocking noise from front suspension over bumps. Inspect shocks, ball joints, and control arm bushes.',
    notes: 'Inspected suspension. Advised customer that front stabilizer links are starting to play, but safe for now.',
    labour_cost: 250.00,
    parts: []
  }
];

// Helper to get a random weekday (excluding Sunday, keep Saturday morning open) in business hours
function getRandomWeekday(year: number, month: number, maxDay?: number): Date {
  const lastDay = maxDay || new Date(year, month + 1, 0).getDate();
  while (true) {
    const day = Math.floor(Math.random() * lastDay) + 1;
    const date = new Date(Date.UTC(year, month, day));
    const dayOfWeek = date.getUTCDay(); // 0 = Sunday, 6 = Saturday
    if (dayOfWeek !== 0) { // No Sundays
      const hour = Math.floor(Math.random() * 8) + 8; // 8:00 to 15:00
      const minute = Math.floor(Math.random() * 60);
      date.setUTCHours(hour, minute, 0, 0);
      return date;
    }
  }
}

// Helper to get all Mondays in a month for timesheets
function getMondaysInMonth(year: number, month: number): Date[] {
  const mondays: Date[] = [];
  const date = new Date(Date.UTC(year, month, 1));
  // Find first Monday
  while (date.getUTCDay() !== 1) {
    date.setUTCDate(date.getUTCDate() + 1);
  }
  // Get all Mondays in this month
  while (date.getUTCMonth() === month) {
    mondays.push(new Date(date));
    date.setUTCDate(date.getUTCDate() + 7);
  }
  return mondays;
}

// Helper to get service type with seasonality
function getServiceTypeForMonth(month: number): ServiceType {
  // month is 0-indexed: 5 = June, 6 = July (winter in South Africa)
  // 10 = Nov, 11 = Dec (holiday prep)
  // 1 = Feb, 2 = Mar (financial crunch)
  const rand = Math.random();
  if (month === 5 || month === 6) { // Winter: battery failures & cooling system flushes
    if (rand < 0.35) {
      return serviceTypes.find(s => s.name === 'Battery Replacement')!;
    }
    if (rand < 0.55) {
      return serviceTypes.find(s => s.name === 'Cooling System Overhaul')!;
    }
  } else if (month === 10 || month === 11) { // Pre-holiday: long trips, checks
    if (rand < 0.25) {
      return serviceTypes.find(s => s.name === 'Major Service')!;
    }
    if (rand < 0.45) {
      return rand < 0.35 ? serviceTypes.find(s => s.name === 'Front Brakes Replacement')! : serviceTypes.find(s => s.name === 'Rear Brakes Replacement')!;
    }
    if (rand < 0.60) {
      return serviceTypes.find(s => s.name === 'Wiper Blades Replacement')!;
    }
  } else if (month === 1 || month === 2) { // Post-holiday budget crunch
    if (rand < 0.25) {
      return serviceTypes.find(s => s.name === 'Clutch Kit Replacement')!; // Emergency repair
    }
    if (rand < 0.60) {
      const emergency = [...serviceTypesNoParts, serviceTypes.find(s => s.name === 'Front Brakes Replacement')!];
      return emergency[Math.floor(Math.random() * emergency.length)] as ServiceType;
    }
  }

  // General/Uniform fallback
  const allServices = [...serviceTypes, ...serviceTypesNoParts];
  return allServices[Math.floor(Math.random() * allServices.length)] as ServiceType;
}

async function seed() {
  console.log('Starting live database seeding (12 Months Historical Data)...');

  try {
    // 1. Delete all transactional tables in correct reverse FK order
    console.log('Cleaning up existing database records...');
    await supabase.from('timesheets').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('ticket_parts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('invoices').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('service_tickets').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('vehicles').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('customers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('inventory').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('staff').delete().neq('email', 'admin@anm.co.za');

    // 2. Fetch auth users list, delete all non-admin users, and ensure admin exists
    console.log('Cleaning up auth users (except admin@anm.co.za)...');
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      throw new Error(`Failed to list auth users: ${listError.message}`);
    }

    let adminUser = users.find(u => u.email?.toLowerCase() === 'admin@anm.co.za');
    let adminId: string;

    if (!adminUser) {
      console.log('Admin user admin@anm.co.za not found, creating in Auth...');
      const { data: createData, error: createError } = await supabase.auth.admin.createUser({
        email: 'admin@anm.co.za',
        password: 'adminPassword123',
        email_confirm: true
      });
      if (createError) {
        throw new Error(`Failed to create admin user: ${createError.message}`);
      }
      adminId = createData.user.id;
    } else {
      adminId = adminUser.id;
    }

    // Delete all other users in Supabase Auth
    for (const u of users) {
      if (u.email && u.email.toLowerCase() !== 'admin@anm.co.za') {
        console.log(`Deleting auth user: ${u.email}...`);
        await supabase.auth.admin.deleteUser(u.id);
      }
    }

    // Insert admin staff profile
    console.log('Ensuring Mpume Zulu (admin) staff profile...');
    await supabase.from('staff').upsert({
      id: adminId,
      name: 'Mpume Zulu',
      email: 'admin@anm.co.za',
      role: 'admin',
      hourly_rate: 120.00
    });

    // 3. Create 4 mechanics (3-5 required) in Auth and Staff
    const mechanicTemplates = [
      { email: 'mechanic@anm.co.za', name: 'Asanda Cele', hourly_rate: 85.00 },
      { email: 'sanele@anm.co.za', name: 'Sanele Dlamini', hourly_rate: 85.00 },
      { email: 'thabo@anm.co.za', name: 'Thabo Mokoena', hourly_rate: 90.00 },
      { email: 'lwazi@anm.co.za', name: 'Lwazi Ndlovu', hourly_rate: 80.00 }
    ];

    const mechanics: { id: string; email: string; name: string; hourly_rate: number }[] = [];

    for (const mech of mechanicTemplates) {
      console.log(`Creating mechanic user: ${mech.email} in Auth...`);
      const { data: createData, error: createError } = await supabase.auth.admin.createUser({
        email: mech.email,
        password: 'mechPassword123',
        email_confirm: true
      });

      if (createError) {
        throw new Error(`Failed to create mechanic ${mech.email}: ${createError.message}`);
      }

      const id = createData.user.id;
      
      console.log(`Creating staff profile for ${mech.name}...`);
      const { error: staffError } = await supabase.from('staff').insert({
        id,
        name: mech.name,
        email: mech.email,
        role: 'mechanic',
        hourly_rate: mech.hourly_rate
      });

      if (staffError) throw staffError;

      mechanics.push({
        id,
        email: mech.email,
        name: mech.name,
        hourly_rate: mech.hourly_rate
      });
    }

    // 4. Seed Customers (South African context)
    console.log('Inserting customers...');
    const customerData = [
      { name: 'Sipho Khumalo', phone: '0821234567', email: 'sipho@gmail.com' },
      { name: 'Zama Mkhize', phone: '0839876543', email: 'zama@gmail.com' },
      { name: 'Kevin Naidoo', phone: '0845551234', email: 'kevin@yahoo.com' },
      { name: 'Priya Govender', phone: '0823334444', email: 'priya.g@mweb.co.za' },
      { name: 'David Smith', phone: '0719998888', email: 'dsmith@telkomsa.net' },
      { name: 'Sarah Botha', phone: '0837776666', email: 'sarah.botha@gmail.com' },
      { name: 'Lerato Molefe', phone: '0612223333', email: 'lerato.m@gmail.com' },
      { name: 'Bongani Ndlovu', phone: '0824445555', email: 'bongani.n@gmail.com' },
      { name: 'Thabo Ndlovu', phone: '0846667777', email: 'tndlovu@gmail.com' },
      { name: 'Mbali Cele', phone: '0828889999', email: 'mbali.cele@outlook.com' },
      { name: 'Farai Moyo', phone: '0731112222', email: 'farai.moyo@gmail.com' },
      { name: 'Devan Pillay', phone: '0834441111', email: 'devan.pillay@gmail.com' },
      { name: 'Lindiwe Buthelezi', phone: '0729995555', email: 'lindi.b@gmail.com' },
      { name: 'Johan Nel', phone: '0827771111', email: 'jnel@vodamail.co.za' },
      { name: 'Amina Patel', phone: '0848882222', email: 'amina.patel@gmail.com' }
    ];

    const customers = customerData.map(c => ({
      id: crypto.randomUUID(),
      name: c.name,
      phone: c.phone,
      email: c.email,
      created_at: new Date('2025-05-15T08:00:00Z').toISOString()
    }));

    const { error: custError } = await supabase.from('customers').insert(customers);
    if (custError) throw custError;

    // 5. Seed Vehicles (Zulu Natal plates common in Pinetown)
    console.log('Inserting vehicles...');
    const vehicleTemplates = [
      { make: 'Toyota', model: 'Hilux', year: 2018 },
      { make: 'Volkswagen', model: 'Polo', year: 2017 },
      { make: 'Ford', model: 'Ranger', year: 2019 },
      { make: 'Hyundai', model: 'i20', year: 2015 },
      { make: 'Toyota', model: 'Corolla', year: 2016 },
      { make: 'BMW', model: '320i', year: 2014 },
      { make: 'Nissan', model: 'NP200', year: 2018 },
      { make: 'Isuzu', model: 'D-Max', year: 2020 },
      { make: 'Kia', model: 'Picanto', year: 2019 },
      { make: 'Chevrolet', model: 'Spark', year: 2013 },
      { make: 'Mazda', model: 'CX-5', year: 2017 },
      { make: 'Toyota', model: 'Fortuner', year: 2015 },
      { make: 'Volkswagen', model: 'Golf', year: 2016 },
      { make: 'Ford', model: 'Fiesta', year: 2014 },
      { make: 'Honda', model: 'Civic', year: 2015 },
      { make: 'Audi', model: 'A4', year: 2013 },
      { make: 'Nissan', model: 'Qashqai', year: 2017 },
      { make: 'Renault', model: 'Clio', year: 2018 },
      { make: 'Hyundai', model: 'Tucson', year: 2016 },
      { make: 'Mercedes-Benz', model: 'C200', year: 2015 }
    ];

    const vehicles: any[] = [];
    for (let i = 0; i < vehicleTemplates.length; i++) {
      const temp = vehicleTemplates[i];
      const customer = customers[i % customers.length];
      
      const suffix = String(100 + i).padStart(3, '0') + '-' + String(200 + i).padStart(3, '0');
      const regPrefix = i % 3 === 0 ? 'ND' : (i % 3 === 1 ? 'NU' : 'NP'); // ND = Durban, NU = Pinetown/Highway, NP = Pietermaritzburg
      const reg = `${regPrefix} ${suffix}`;
      
      const vin = `1A8HG5432EF${String(100000 + i)}`;

      vehicles.push({
        id: crypto.randomUUID(),
        customer_id: customer.id,
        registration_number: reg,
        vin,
        make: temp.make,
        model: temp.model,
        year: temp.year,
        created_at: new Date('2025-05-20T08:00:00Z').toISOString()
      });
    }

    const { error: vehError } = await supabase.from('vehicles').insert(vehicles);
    if (vehError) throw vehError;

    // 6. Set up in-memory Inventory items with initial stock levels
    console.log('Configuring inventory starting stock levels...');
    const inventoryTemplates = [
      { part_name: 'Oil Filter', part_number: 'OF-001', qty_in_stock: 120, reorder_level: 10, unit_cost: 45.00 },
      { part_name: 'Air Filter', part_number: 'AF-002', qty_in_stock: 80, reorder_level: 8, unit_cost: 120.00 },
      { part_name: 'Brake Pads (Front)', part_number: 'BP-F-003', qty_in_stock: 60, reorder_level: 5, unit_cost: 350.00 },
      { part_name: 'Brake Pads (Rear)', part_number: 'BP-R-004', qty_in_stock: 50, reorder_level: 5, unit_cost: 280.00 },
      { part_name: 'Spark Plugs (set of 4)', part_number: 'SP-005', qty_in_stock: 100, reorder_level: 8, unit_cost: 180.00 },
      { part_name: 'Engine Oil 5W-30 (5L)', part_number: 'EO-006', qty_in_stock: 90, reorder_level: 5, unit_cost: 210.00 },
      { part_name: 'Wiper Blades', part_number: 'WB-007', qty_in_stock: 110, reorder_level: 10, unit_cost: 95.00 },
      { part_name: 'Battery (650CCA)', part_number: 'BAT-008', qty_in_stock: 45, reorder_level: 4, unit_cost: 1200.00 },
      { part_name: 'Timing Belt', part_number: 'TB-009', qty_in_stock: 35, reorder_level: 3, unit_cost: 450.00 },
      { part_name: 'Coolant (1L)', part_number: 'CL-010', qty_in_stock: 150, reorder_level: 10, unit_cost: 55.00 },
      { part_name: 'Brake Fluid (500ml)', part_number: 'BF-011', qty_in_stock: 70, reorder_level: 8, unit_cost: 75.00 },
      { part_name: 'Clutch Kit', part_number: 'CK-012', qty_in_stock: 20, reorder_level: 2, unit_cost: 1800.00 },
      { part_name: 'Power Steering Fluid', part_number: 'PS-013', qty_in_stock: 60, reorder_level: 5, unit_cost: 65.00 },
      { part_name: 'Fan Belt', part_number: 'FB-014', qty_in_stock: 50, reorder_level: 5, unit_cost: 150.00 },
      { part_name: 'Fuel Filter', part_number: 'FF-015', qty_in_stock: 65, reorder_level: 5, unit_cost: 110.00 },
      { part_name: 'Cabin Filter', part_number: 'CF-016', qty_in_stock: 75, reorder_level: 5, unit_cost: 130.00 }
    ];

    const inventoryItems = inventoryTemplates.map(item => ({
      id: crypto.randomUUID(),
      part_name: item.part_name,
      part_number: item.part_number,
      qty_in_stock: item.qty_in_stock,
      reorder_level: item.reorder_level,
      unit_cost: item.unit_cost,
      created_at: new Date('2025-05-01T08:00:00Z').toISOString(),
      updated_at: new Date('2025-05-01T08:00:00Z').toISOString()
    }));

    const inventoryMap = new Map<string, typeof inventoryItems[0]>();
    for (const item of inventoryItems) {
      inventoryMap.set(item.part_number, item);
    }

    // 7. Define Monthly Service targets simulating customer drops and peaks
    const monthsList = [
      { year: 2025, month: 5, target: 18 }, // June 2025 (Winter: Average-high)
      { year: 2025, month: 6, target: 20 }, // July 2025 (Winter: Peak)
      { year: 2025, month: 7, target: 15 }, // August 2025 (Spring: Normal)
      { year: 2025, month: 8, target: 14 }, // September 2025 (Normal)
      { year: 2025, month: 9, target: 22 }, // October 2025 (Pre-holiday start)
      { year: 2025, month: 10, target: 25 }, // November 2025 (Pre-holiday: High)
      { year: 2025, month: 11, target: 28 }, // December 2025 (Holiday Peak)
      { year: 2026, month: 0, target: 12 }, // January 2026 (Back to School: Low)
      { year: 2026, month: 1, target: 8 },  // February 2026 (Janu-worry Crunch: Very Low)
      { year: 2026, month: 2, target: 9 },  // March 2026 (Crunch continuation: Very Low)
      { year: 2026, month: 3, target: 18 }, // April 2026 (Easter Holiday Prep: High)
      { year: 2026, month: 4, target: 20 }, // May 2026 (Normal)
      { year: 2026, month: 5, target: 8 }   // June 2026 (Current Month up to June 13)
    ];

    const currentLocalTime = new Date('2026-06-13T23:29:48+02:00');

    const serviceTickets: any[] = [];
    const ticketParts: any[] = [];
    const invoices: any[] = [];
    const invoiceIndexMap = new Map<string, number>();

    console.log('Generating 12-month calendar of service tickets, parts logs, and invoices...');

    for (const m of monthsList) {
      const isCurrentMonth = (m.year === 2026 && m.month === 5);
      const limitDay = isCurrentMonth ? 13 : undefined;

      for (let t = 0; t < m.target; t++) {
        const ticketDate = getRandomWeekday(m.year, m.month, limitDay);
        
        // Choose a vehicle and mechanic
        const vehicle = vehicles[Math.floor(Math.random() * vehicles.length)];
        const mechanic = mechanics[Math.floor(Math.random() * mechanics.length)];
        
        // Choose service type based on month seasonality
        const serviceType = getServiceTypeForMonth(m.month);
        
        // Distribute statuses realistically
        let status: 'draft' | 'pending' | 'in_progress' | 'completed' | 'cancelled' = 'completed';
        if (isCurrentMonth) {
          // Let's spread statuses for June 2026
          if (t === 0) status = 'draft';
          else if (t === 1) status = 'pending';
          else if (t === 2 || t === 3) status = 'in_progress';
          else if (t === 4) status = 'cancelled';
          else status = 'completed';
        } else {
          // 95% completed, 5% cancelled historically
          status = Math.random() < 0.05 ? 'cancelled' : 'completed';
        }

        const ticketId = crypto.randomUUID();
        const trackingToken = crypto.randomUUID();
        const description = serviceType.description;
        const notes = status === 'completed' ? serviceType.notes : (status === 'cancelled' ? 'Booking cancelled by customer request.' : null);

        const createdAtStr = ticketDate.toISOString();
        // Updated_at is ticket completion time (approx 4 hours later)
        const updatedAtStr = new Date(ticketDate.getTime() + 4 * 60 * 60 * 1000).toISOString();

        let staffId: string | null = mechanic.id;
        let createdBy: string | null = adminId;
        
        // Draft bookings from booking portal don't have mechanic or creator yet
        if (status === 'draft' && Math.random() < 0.5) {
          staffId = null;
          createdBy = null;
        }

        serviceTickets.push({
          id: ticketId,
          vehicle_id: vehicle.id,
          staff_id: staffId,
          created_by: createdBy,
          status,
          description,
          notes,
          labour_cost: serviceType.labour_cost,
          created_at: createdAtStr,
          updated_at: updatedAtStr,
          tracking_token: trackingToken,
          preferred_date: (status === 'pending' || status === 'draft') ? ticketDate.toISOString().split('T')[0] : null,
          preferred_time: (status === 'pending' || status === 'draft') ? (Math.random() < 0.5 ? 'morning' : 'afternoon') : null
        });

        // Log parts if completed or in_progress
        let partsCost = 0;
        if ((status === 'completed' || status === 'in_progress') && staffId) {
          for (const p of serviceType.parts) {
            const invItem = inventoryMap.get(p.part_number);
            if (invItem) {
              ticketParts.push({
                id: crypto.randomUUID(),
                ticket_id: ticketId,
                inventory_id: invItem.id,
                qty_used: p.qty,
                unit_cost_at_time: invItem.unit_cost,
                logged_by: staffId,
                created_at: new Date(ticketDate.getTime() + 2 * 60 * 60 * 1000).toISOString() // logged 2 hrs after clock-in
              });

              // Decrement stock in-memory for our final inventory counts
              if (invItem.qty_in_stock > p.qty) {
                invItem.qty_in_stock -= p.qty;
              } else {
                invItem.qty_in_stock = 0;
              }

              partsCost += invItem.unit_cost * p.qty;
            }
          }
        }

        // Generate invoice if completed
        if (status === 'completed') {
          const monthKey = `${ticketDate.getFullYear()}${String(ticketDate.getMonth() + 1).padStart(2, '0')}`;
          const index = (invoiceIndexMap.get(monthKey) || 0) + 1;
          invoiceIndexMap.set(monthKey, index);
          const invoiceNo = `INV-${monthKey}-${String(index).padStart(4, '0')}`;

          const labourCost = serviceType.labour_cost;
          const subtotal = labourCost + partsCost;
          const taxAmount = subtotal * 0.15; // 15% VAT (South Africa)
          const totalAmount = subtotal + taxAmount;

          // Unpaid invoice distribution: 10% in past months, 50% in current month
          let invStatus: 'paid' | 'unpaid' = 'paid';
          if (isCurrentMonth) {
            invStatus = Math.random() < 0.5 ? 'paid' : 'unpaid';
          } else {
            invStatus = Math.random() < 0.10 ? 'unpaid' : 'paid';
          }

          const paymentMethod = invStatus === 'paid' ? (Math.random() < 0.5 ? 'card' : (Math.random() < 0.85 ? 'eft' : 'cash')) : null;

          invoices.push({
            id: crypto.randomUUID(),
            ticket_id: ticketId,
            invoice_no: invoiceNo,
            labour_cost: labourCost,
            parts_cost: partsCost,
            tax_amount: taxAmount,
            total_amount: totalAmount,
            status: invStatus,
            payment_method: paymentMethod,
            secure_token: crypto.randomUUID(),
            created_at: new Date(ticketDate.getTime() + 3 * 60 * 60 * 1000).toISOString(), // invoice created 3 hrs after ticket
            updated_at: new Date(ticketDate.getTime() + (invStatus === 'paid' ? 4 : 3) * 60 * 60 * 1000).toISOString()
          });
        }
      }
    }

    // Ensure these specific parts are low stock at the end to demonstrate low-stock warning thresholds
    console.log('Enforcing low stock alerts for front brakes, battery, and clutch kits...');
    const frontBrakes = inventoryMap.get('BP-F-003');
    if (frontBrakes) frontBrakes.qty_in_stock = 4; // reorder_level 5
    const battery = inventoryMap.get('BAT-008');
    if (battery) battery.qty_in_stock = 3;       // reorder_level 4
    const clutch = inventoryMap.get('CK-012');
    if (clutch) clutch.qty_in_stock = 1;         // reorder_level 2

    // 8. Generate Timesheets for the 4 mechanics
    console.log('Generating weekly timesheets for payroll tracking...');
    const timesheets: any[] = [];
    const limitFriday = new Date('2026-06-12T17:00:00Z'); // Last Friday before June 13

    for (const mech of mechanics) {
      for (const m of monthsList) {
        const mondays = getMondaysInMonth(m.year, m.month);

        for (const monday of mondays) {
          const friday = new Date(monday);
          friday.setDate(monday.getDate() + 4);
          friday.setHours(17, 0, 0, 0);
          
          // Do not generate future timesheets
          if (friday > limitFriday) {
            continue;
          }

          // Hours worked: 40 hours standard + some random variance (38 to 44)
          const hoursWorked = Number((38 + Math.random() * 6).toFixed(2));
          const totalPay = Number((hoursWorked * mech.hourly_rate).toFixed(2));

          // Set status:
          // Past months = paid
          // Week ending June 5, 2026 = approved
          // Week ending June 12, 2026 = submitted
          let tsStatus: 'submitted' | 'approved' | 'paid' = 'paid';
          const isJune2026 = (m.year === 2026 && m.month === 5);
          if (isJune2026) {
            const dayOfMonth = friday.getDate();
            if (dayOfMonth === 5) {
              tsStatus = 'approved';
            } else if (dayOfMonth === 12) {
              tsStatus = 'submitted';
            }
          }

          const clockIn = new Date(monday);
          clockIn.setHours(8, Math.floor(Math.random() * 15) - 5, 0, 0); // e.g. 7:55 AM to 8:10 AM

          const clockOut = new Date(friday);
          clockOut.setMinutes(Math.floor(Math.random() * 20) - 10); // e.g. 4:50 PM to 5:10 PM

          const approvedBy = (tsStatus === 'approved' || tsStatus === 'paid') ? adminId : null;
          const approvedAt = (tsStatus === 'approved' || tsStatus === 'paid') ? new Date(clockOut.getTime() + 30 * 60 * 1000).toISOString() : null;

          timesheets.push({
            id: crypto.randomUUID(),
            staff_id: mech.id,
            clock_in: clockIn.toISOString(),
            clock_out: clockOut.toISOString(),
            hours_worked: hoursWorked,
            hourly_rate: mech.hourly_rate,
            total_pay: totalPay,
            status: tsStatus,
            approved_by: approvedBy,
            approved_at: approvedAt
          });
        }
      }
    }

    // 9. Bulk insert all data into Supabase
    console.log('Writing records to Supabase database...');
    
    console.log('Inserting inventory items...');
    const { error: invErr } = await supabase.from('inventory').insert(inventoryItems);
    if (invErr) throw invErr;

    console.log(`Inserting ${serviceTickets.length} service tickets...`);
    const { error: ticketErr } = await supabase.from('service_tickets').insert(serviceTickets);
    if (ticketErr) throw ticketErr;

    console.log(`Inserting ${ticketParts.length} logged parts...`);
    const { error: tpErr } = await supabase.from('ticket_parts').insert(ticketParts);
    if (tpErr) throw tpErr;

    console.log(`Inserting ${invoices.length} invoices...`);
    const { error: invsErr } = await supabase.from('invoices').insert(invoices);
    if (invsErr) throw invsErr;

    console.log(`Inserting ${timesheets.length} timesheets...`);
    const { error: tsErr } = await supabase.from('timesheets').insert(timesheets);
    if (tsErr) throw tsErr;

    console.log('Database seeding completed successfully! All 12 months generated.');
  } catch (err: any) {
    console.error('Seeding failed:', err.message || err);
    process.exit(1);
  }
}

seed();
