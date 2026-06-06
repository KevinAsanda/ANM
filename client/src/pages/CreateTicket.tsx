import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { customerService } from '../services/customerService.js';
import type { Customer } from '../services/customerService.js';
import { vehicleService } from '../services/vehicleService.js';
import { ticketsService } from '../services/ticketsService.js';
import { staffService } from '../services/staffService.js';
import type { Staff } from '../services/staffService.js';
import { Input } from '../components/ui/Input.js';
import { Select } from '../components/ui/Select.js';
import { Textarea } from '../components/ui/Textarea.js';
import { Button } from '../components/ui/Button.js';
import { ArrowLeft, AlertCircle } from 'lucide-react';

const CreateTicket: React.FC = () => {
  // Lists
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [mechanics, setMechanics] = useState<Staff[]>([]);
  
  // Loading & Errors
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Form Fields - Customer
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [existingCustomer, setExistingCustomer] = useState<Customer | null>(null);

  // Form Fields - Vehicle
  const [vehicleReg, setVehicleReg] = useState('');
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleYear, setVehicleYear] = useState('');

  // Form Fields - Job Card
  const [description, setDescription] = useState('');
  const [labourCost, setLabourCost] = useState('0.00');
  const [assignedMechanicId, setAssignedMechanicId] = useState('');

  // Field Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const navigate = useNavigate();

  // Load staff and customers for lookups
  useEffect(() => {
    async function loadData() {
      try {
        const [staffData, customerData] = await Promise.all([
          staffService.getStaff(),
          customerService.getCustomers()
        ]);
        
        // Filter active mechanics
        setMechanics(staffData.filter(s => s.role === 'mechanic'));
        setCustomers(customerData);
      } catch (err: any) {
        console.error('Error loading ticket setup data:', err);
        setSubmitError('Failed to initialize ticket form. Please refresh.');
      } finally {
        setIsLoadingList(false);
      }
    }
    loadData();
  }, []);

  // Check phone number on blur for existing customer lookup
  const handlePhoneBlur = () => {
    if (!customerPhone.trim()) return;

    const matched = customers.find(
      c => c.phone.trim().replace(/\s/g, '') === customerPhone.trim().replace(/\s/g, '')
    );

    if (matched) {
      setExistingCustomer(matched);
      setCustomerName(matched.name);
      setCustomerEmail(matched.email || '');
      setErrors(prev => ({ ...prev, customerPhone: '', customerName: '' }));
    } else {
      setExistingCustomer(null);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!customerPhone.trim()) newErrors.customerPhone = 'Phone number is required';
    if (!customerName.trim()) newErrors.customerName = 'Customer name is required';
    
    if (!vehicleReg.trim()) newErrors.vehicleReg = 'Registration number is required';
    if (!vehicleMake.trim()) newErrors.vehicleMake = 'Make is required';
    if (!vehicleModel.trim()) newErrors.vehicleModel = 'Model is required';

    if (!description.trim()) newErrors.description = 'Job description is required';
    if (!assignedMechanicId) newErrors.assignedMechanicId = 'Must assign a mechanic';

    if (vehicleYear.trim() && (isNaN(Number(vehicleYear)) || Number(vehicleYear) < 1900 || Number(vehicleYear) > 2100)) {
      newErrors.vehicleYear = 'Year must be between 1900 and 2100';
    }

    if (isNaN(Number(labourCost)) || Number(labourCost) < 0) {
      newErrors.labourCost = 'Labour cost must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      let activeCustomer: Customer;

      // 1. Resolve Customer (Create if new, otherwise reuse)
      if (existingCustomer) {
        activeCustomer = existingCustomer;
      } else {
        const res = await customerService.createCustomer({
          name: customerName,
          phone: customerPhone,
          email: customerEmail || undefined
        });
        activeCustomer = res.customer;
      }

      // 2. Resolve Vehicle (Check if vehicle with this reg already exists or create new)
      let activeVehicleId = '';
      try {
        const vehicles = await vehicleService.getCustomerVehicles(activeCustomer.id);
        const matchedVehicle = vehicles.find(
          v => v.registration_number.toUpperCase().trim() === vehicleReg.toUpperCase().trim()
        );
        if (matchedVehicle) {
          activeVehicleId = matchedVehicle.id;
        }
      } catch (err) {
        // Safe to ignore, list could be empty
      }

      if (!activeVehicleId) {
        const vehicle = await vehicleService.createVehicle({
          customer_id: activeCustomer.id,
          registration_number: vehicleReg,
          make: vehicleMake,
          model: vehicleModel,
          vin: '',
          year: vehicleYear ? Number(vehicleYear) : null
        });
        activeVehicleId = vehicle.id;
      }

      // 3. Create Ticket
      await ticketsService.createTicket({
        vehicle_id: activeVehicleId,
        staff_id: assignedMechanicId,
        description,
        labour_cost: Number(labourCost)
      });

      // Navigate back to lists
      navigate('/tickets');
    } catch (err: any) {
      console.error('Error creating ticket:', err);
      setSubmitError(err.message || 'Failed to submit service ticket. Check inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const mechanicOptions = mechanics.map(m => ({
    value: m.id,
    label: m.name
  }));

  return (
    <div className="flex flex-col gap-6 max-w-[640px] mx-auto">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/tickets')}
          className="p-2 border border-border rounded-lg text-text-muted hover:bg-slate-100 transition-colors"
          aria-label="Back to tickets list"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-text">New Service Ticket</h1>
          <p className="text-text-muted text-sm mt-0.5">Create digital job card, register vehicle, and assign mechanic</p>
        </div>
      </div>

      {submitError && (
        <div className="p-4 bg-error-bg border border-error text-error rounded-lg flex items-center gap-3" role="alert">
          <AlertCircle size={20} />
          <p className="text-sm font-medium">{submitError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
        {/* Section: Customer */}
        <div className="bg-surface p-6 rounded-lg shadow-sm border border-border flex flex-col gap-4">
          <h2 className="text-lg font-bold text-text border-b border-border pb-2">Customer Details</h2>
          
          <Input
            label="Phone Number"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            onBlur={handlePhoneBlur}
            error={errors.customerPhone}
            placeholder="0821234567"
            helperText="Tab away or blur to check if customer already exists."
            disabled={isSubmitting}
            required
          />

          <Input
            label="Full Name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            error={errors.customerName}
            placeholder="Sipho Khumalo"
            disabled={isSubmitting || !!existingCustomer}
            required
          />

          <Input
            label="Email Address"
            type="email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            placeholder="sipho@example.com"
            disabled={isSubmitting || !!existingCustomer}
          />

          {existingCustomer && (
            <div className="p-3 bg-blue-50 border border-blue-200 text-primary rounded text-xs font-semibold">
              ✓ Customer found. Details locked.
            </div>
          )}
        </div>

        {/* Section: Vehicle */}
        <div className="bg-surface p-6 rounded-lg shadow-sm border border-border flex flex-col gap-4">
          <h2 className="text-lg font-bold text-text border-b border-border pb-2">Vehicle Details</h2>

          <Input
            label="Registration Number"
            value={vehicleReg}
            onChange={(e) => setVehicleReg(e.target.value)}
            error={errors.vehicleReg}
            placeholder="ND123456"
            disabled={isSubmitting}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Make"
              value={vehicleMake}
              onChange={(e) => setVehicleMake(e.target.value)}
              error={errors.vehicleMake}
              placeholder="Toyota"
              disabled={isSubmitting}
              required
            />
            <Input
              label="Model"
              value={vehicleModel}
              onChange={(e) => setVehicleModel(e.target.value)}
              error={errors.vehicleModel}
              placeholder="Hilux"
              disabled={isSubmitting}
              required
            />
          </div>

          <Input
            label="Year"
            value={vehicleYear}
            onChange={(e) => setVehicleYear(e.target.value)}
            error={errors.vehicleYear}
            placeholder="2018"
            disabled={isSubmitting}
          />
        </div>

        {/* Section: Job Details */}
        <div className="bg-surface p-6 rounded-lg shadow-sm border border-border flex flex-col gap-4">
          <h2 className="text-lg font-bold text-text border-b border-border pb-2">Job Specifications</h2>

          <Textarea
            label="Job Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            error={errors.description}
            placeholder="Specify work required (e.g. front brake pads replacement, oil service...)"
            disabled={isSubmitting}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Assign Mechanic"
              value={assignedMechanicId}
              onChange={(e) => setAssignedMechanicId(e.target.value)}
              options={mechanicOptions}
              error={errors.assignedMechanicId}
              disabled={isSubmitting || isLoadingList}
              required
            />
            <Input
              label="Labour Cost (ZAR)"
              type="number"
              step="0.01"
              value={labourCost}
              onChange={(e) => setLabourCost(e.target.value)}
              error={errors.labourCost}
              placeholder="450.00"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full py-3 text-lg font-bold"
          loading={isSubmitting}
        >
          Create Service Ticket
        </Button>
      </form>
    </div>
  );
};

export default CreateTicket;
