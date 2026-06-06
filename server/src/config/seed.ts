import { supabase } from './supabase.js';

async function seed() {
  console.log('Starting Supabase live database seeding...');

  try {
    // 1. Ensure Auth Users exist in Supabase Auth and get their IDs
    const emails = [
      { email: 'admin@anm.co.za', name: 'Mpume Zulu', role: 'admin', password: 'adminPassword123' },
      { email: 'mechanic@anm.co.za', name: 'Asanda Cele', role: 'mechanic', password: 'mechPassword123' },
      { email: 'sanele@anm.co.za', name: 'Sanele Dlamini', role: 'mechanic', password: 'mechPassword123' }
    ];

    const staffIds: Record<string, string> = {};

    // List existing users to find if they are already created
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      throw new Error(`Failed to list auth users: ${listError.message}`);
    }

    for (const item of emails) {
      const existingUser = users.find(u => u.email?.toLowerCase() === item.email.toLowerCase());
      if (existingUser) {
        console.log(`User already exists in Auth: ${item.email} (ID: ${existingUser.id})`);
        staffIds[item.email] = existingUser.id;
      } else {
        console.log(`Creating user in Auth: ${item.email}...`);
        const { data: createData, error: createError } = await supabase.auth.admin.createUser({
          email: item.email,
          password: item.password,
          email_confirm: true
        });

        if (createError) {
          throw new Error(`Failed to create auth user ${item.email}: ${createError.message}`);
        }

        console.log(`Created user: ${item.email} (ID: ${createData.user.id})`);
        staffIds[item.email] = createData.user.id;
      }
    }

    // 2. Insert/Ensure Staff Profiles
    console.log('Seeding staff profiles...');
    for (const item of emails) {
      const id = staffIds[item.email];
      const { error: staffError } = await supabase
        .from('staff')
        .upsert({
          id,
          name: item.name,
          email: item.email,
          role: item.role
        }, { onConflict: 'id' });

      if (staffError) {
        throw new Error(`Failed to upsert staff profile ${item.email}: ${staffError.message}`);
      }
    }
    console.log('Staff profiles seeded.');

    // 3. Seed Customers
    console.log('Seeding customers...');
    const customers = [
      { id: 'c1f7b03b-1798-444a-a435-08103cd585e5', name: 'Sipho Khumalo', phone: '0821234567', email: 'sipho@gmail.com' },
      { id: 'c2f7b03b-1798-444a-a435-08103cd585e6', name: 'Zama Mkhize', phone: '0839876543', email: 'zama@gmail.com' },
      { id: 'c3f7b03b-1798-444a-a435-08103cd585e7', name: 'Kevin Naidoo', phone: '0845551234', email: 'kevin@yahoo.com' }
    ];

    for (const customer of customers) {
      const { error } = await supabase
        .from('customers')
        .upsert(customer, { onConflict: 'phone' });

      if (error) {
        throw new Error(`Failed to seed customer ${customer.name}: ${error.message}`);
      }
    }

    // 4. Seed Vehicles
    console.log('Seeding vehicles...');
    const vehicles = [
      { id: 'f7b91d90-b183-4903-8888-0f19c9d09a80', customer_id: 'c1f7b03b-1798-444a-a435-08103cd585e5', registration_number: 'ND123456', vin: 'VIN12345678901234', make: 'Toyota', model: 'Hilux', year: 2018 },
      { id: 'f7b91d90-b183-4903-8888-0f19c9d09a81', customer_id: 'c1f7b03b-1798-444a-a435-08103cd585e5', registration_number: 'ND654321', vin: 'VIN12345678901235', make: 'Volkswagen', model: 'Polo', year: 2017 },
      { id: 'f7b91d90-b183-4903-8888-0f19c9d09a82', customer_id: 'c2f7b03b-1798-444a-a435-08103cd585e6', registration_number: 'NP987654', vin: 'VIN12345678901236', make: 'Ford', model: 'Ranger', year: 2019 },
      { id: 'f7b91d90-b183-4903-8888-0f19c9d09a83', customer_id: 'c2f7b03b-1798-444a-a435-08103cd585e6', registration_number: 'NU456123', vin: 'VIN12345678901237', make: 'Hyundai', model: 'i20', year: 2015 },
      { id: 'f7b91d90-b183-4903-8888-0f19c9d09a84', customer_id: 'c3f7b03b-1798-444a-a435-08103cd585e7', registration_number: 'NUR789012', vin: 'VIN12345678901238', make: 'Toyota', model: 'Corolla', year: 2016 }
    ];

    for (const vehicle of vehicles) {
      const { error } = await supabase
        .from('vehicles')
        .upsert(vehicle, { onConflict: 'registration_number' });

      if (error) {
        throw new Error(`Failed to seed vehicle ${vehicle.registration_number}: ${error.message}`);
      }
    }

    // 5. Seed Inventory
    console.log('Seeding inventory...');
    const inventory = [
      { id: 'e9b91d90-b183-4903-8888-0f19c9d09a01', part_name: 'Oil Filter', part_number: 'OF-001', qty_in_stock: 15, reorder_level: 5, unit_cost: 45.00 },
      { id: 'e9b91d90-b183-4903-8888-0f19c9d09a02', part_name: 'Air Filter', part_number: 'AF-002', qty_in_stock: 8, reorder_level: 5, unit_cost: 120.00 },
      { id: 'e9b91d90-b183-4903-8888-0f19c9d09a03', part_name: 'Brake Pads (Front)', part_number: 'BP-F-003', qty_in_stock: 4, reorder_level: 5, unit_cost: 350.00 },
      { id: 'e9b91d90-b183-4903-8888-0f19c9d09a04', part_name: 'Spark Plugs (set of 4)', part_number: 'SP-004', qty_in_stock: 12, reorder_level: 5, unit_cost: 180.00 },
      { id: 'e9b91d90-b183-4903-8888-0f19c9d09a05', part_name: 'Engine Oil 5W-30 (5L)', part_number: 'EO-005', qty_in_stock: 3, reorder_level: 5, unit_cost: 210.00 },
      { id: 'e9b91d90-b183-4903-8888-0f19c9d09a06', part_name: 'Wiper Blades', part_number: 'WB-006', qty_in_stock: 20, reorder_level: 5, unit_cost: 95.00 },
      { id: 'e9b91d90-b183-4903-8888-0f19c9d09a07', part_name: 'Battery (650CCA)', part_number: 'BAT-007', qty_in_stock: 2, reorder_level: 3, unit_cost: 1200.00 },
      { id: 'e9b91d90-b183-4903-8888-0f19c9d09a08', part_name: 'Timing Belt', part_number: 'TB-008', qty_in_stock: 6, reorder_level: 3, unit_cost: 45.00 },
      { id: 'e9b91d90-b183-4903-8888-0f19c9d09a09', part_name: 'Coolant (1L)', part_number: 'CL-009', qty_in_stock: 18, reorder_level: 5, unit_cost: 55.00 },
      { id: 'e9b91d90-b183-4903-8888-0f19c9d09a10', part_name: 'Brake Fluid (500ml)', part_number: 'BF-010', qty_in_stock: 9, reorder_level: 5, unit_cost: 75.00 },
      { id: 'e9b91d90-b183-4903-8888-0f19c9d09a11', part_name: 'Clutch Kit', part_number: 'CK-011', qty_in_stock: 1, reorder_level: 2, unit_cost: 1800.00 },
      { id: 'e9b91d90-b183-4903-8888-0f19c9d09a12', part_name: 'Power Steering Fluid', part_number: 'PS-012', qty_in_stock: 7, reorder_level: 5, unit_cost: 65.00 }
    ];

    for (const item of inventory) {
      const { error } = await supabase
        .from('inventory')
        .upsert(item, { onConflict: 'part_number' });

      if (error) {
        throw new Error(`Failed to seed inventory item ${item.part_name}: ${error.message}`);
      }
    }

    // 6. Seed Service Tickets
    console.log('Seeding service tickets...');
    const adminId = staffIds['admin@anm.co.za'];
    const mech1Id = staffIds['mechanic@anm.co.za'];
    const mech2Id = staffIds['sanele@anm.co.za'];

    const tickets = [
      {
        id: 'ab07384d-1134-9c3a-5588-b9a103c80900',
        vehicle_id: 'f7b91d90-b183-4903-8888-0f19c9d09a80',
        staff_id: mech1Id,
        created_by: adminId,
        status: 'pending',
        description: 'Front brake pads worn out and squealing. Replace pads.',
        notes: 'Customer reports squealing noise when braking.',
        labour_cost: 350.00
      },
      {
        id: 'ab07384d-1134-9c3a-5588-b9a103c80910',
        vehicle_id: 'f7b91d90-b183-4903-8888-0f19c9d09a81',
        staff_id: mech2Id,
        created_by: adminId,
        status: 'in_progress',
        description: 'Polo oil service. Replace engine oil, oil filter, and spark plugs.',
        notes: 'Check for minor engine oil leak reported by owner.',
        labour_cost: 450.00
      },
      {
        id: 'ab07384d-1134-9c3a-5588-b9a103c80920',
        vehicle_id: 'f7b91d90-b183-4903-8888-0f19c9d09a82',
        staff_id: mech1Id,
        created_by: adminId,
        status: 'completed',
        description: 'Timing belt replacement on Ranger. Perform critical checks.',
        notes: 'Engine belt replaced, checked tensions.',
        labour_cost: 950.00
      },
      {
        id: 'ab07384d-1134-9c3a-5588-b9a103c80930',
        vehicle_id: 'f7b91d90-b183-4903-8888-0f19c9d09a83',
        staff_id: mech2Id,
        created_by: adminId,
        status: 'completed',
        description: 'Wiper blades replacement and general windscreen wash.',
        notes: 'Cleaned windscreen, fitted new blades.',
        labour_cost: 100.00
      },
      {
        id: 'ab07384d-1134-9c3a-5588-b9a103c80940',
        vehicle_id: 'f7b91d90-b183-4903-8888-0f19c9d09a84',
        staff_id: mech1Id,
        created_by: adminId,
        status: 'cancelled',
        description: 'Clutch replacement request. Owner changed mind.',
        notes: 'Ticket cancelled by admin as client requested quotes only.',
        labour_cost: 0.00
      },
      {
        id: 'ab07384d-1134-9c3a-5588-b9a103c80950',
        vehicle_id: 'f7b91d90-b183-4903-8888-0f19c9d09a80',
        staff_id: mech2Id,
        created_by: adminId,
        status: 'pending',
        description: 'Wheel alignment check and minor steering adjustment.',
        notes: 'Owner complains of slight left-side drift on highway.',
        labour_cost: 250.00
      },
      {
        id: 'ab07384d-1134-9c3a-5588-b9a103c80960',
        vehicle_id: 'f7b91d90-b183-4903-8888-0f19c9d09a82',
        staff_id: mech1Id,
        created_by: adminId,
        status: 'in_progress',
        description: 'Minor service on Ford Ranger. Oil change and fluid topups.',
        notes: 'Top up coolant, washer fluids.',
        labour_cost: 300.00
      },
      {
        id: 'ab07384d-1134-9c3a-5588-b9a103c80970',
        vehicle_id: 'f7b91d90-b183-4903-8888-0f19c9d09a81',
        staff_id: mech2Id,
        created_by: adminId,
        status: 'completed',
        description: 'Engine diagnostics for check-engine light. Diagnose spark plug fault.',
        notes: 'Scanned codes, found cylinder 3 misfire. Replaced spark plugs.',
        labour_cost: 400.00
      }
    ];

    for (const ticket of tickets) {
      const { error } = await supabase
        .from('service_tickets')
        .upsert(ticket, { onConflict: 'id' });

      if (error) {
        throw new Error(`Failed to seed service ticket ${ticket.id}: ${error.message}`);
      }
    }

    // 7. Seed Logged Parts
    console.log('Seeding logged parts on tickets...');
    const ticketParts = [
      {
        id: 'b07384d1-1349-c3a5-588b-9a103c800100',
        ticket_id: 'ab07384d-1134-9c3a-5588-b9a103c80920',
        inventory_id: 'e9b91d90-b183-4903-8888-0f19c9d09a08', // Timing Belt
        qty_used: 1,
        unit_cost_at_time: 450.00,
        logged_by: mech1Id
      },
      {
        id: 'b07384d1-1349-c3a5-588b-9a103c800200',
        ticket_id: 'ab07384d-1134-9c3a-5588-b9a103c80930',
        inventory_id: 'e9b91d90-b183-4903-8888-0f19c9d09a06', // Wiper Blades
        qty_used: 2,
        unit_cost_at_time: 95.00,
        logged_by: mech2Id
      },
      {
        id: 'b07384d1-1349-c3a5-588b-9a103c800300',
        ticket_id: 'ab07384d-1134-9c3a-5588-b9a103c80970',
        inventory_id: 'e9b91d90-b183-4903-8888-0f19c9d09a04', // Spark Plugs
        qty_used: 1,
        unit_cost_at_time: 180.00,
        logged_by: mech2Id
      }
    ];

    for (const tp of ticketParts) {
      const { error } = await supabase
        .from('ticket_parts')
        .upsert(tp, { onConflict: 'id' });

      if (error) {
        throw new Error(`Failed to seed ticket part ${tp.id}: ${error.message}`);
      }
    }

    console.log('Seeding completed successfully!');
  } catch (err: any) {
    console.error('Seeding failed:', err.message || err);
    process.exit(1);
  }
}

seed();
