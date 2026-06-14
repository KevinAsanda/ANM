import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, Phone, Mail, Car, HelpCircle, Check, Copy, ArrowRight, ArrowLeft, Printer } from 'lucide-react';
import { Button } from '../components/ui/Button.js';
import { Input } from '../components/ui/Input.js';
import { Textarea } from '../components/ui/Textarea.js';
import { Select } from '../components/ui/Select.js';
import { Spinner } from '../components/ui/Spinner.js';
import { ticketsService } from '../services/ticketsService.js';
import anmLogo from '../assets/anm-logo.svg';

interface BookingFormState {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  registrationNumber: string;
  make: string;
  model: string;
  year: string;
  description: string;
  preferredDate: string;
  preferredTime: 'morning' | 'afternoon';
  serviceCategory: string;
  estimatedDuration: string;
}

const PublicBooking: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [form, setForm] = useState<BookingFormState>({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    registrationNumber: '',
    make: '',
    model: '',
    year: '',
    description: '',
    preferredDate: '',
    preferredTime: 'morning',
    serviceCategory: 'General Inspection & Repair',
    estimatedDuration: '1.0'
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isClassifying, setIsClassifying] = useState<boolean>(false);
  const [aiReasoning, setAiReasoning] = useState<string>('');
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [successData, setSuccessData] = useState<{
    ticketId: string;
    trackingToken: string;
    trackingUrl: string;
  } | null>(null);

  const [isCopied, setIsCopied] = useState<boolean>(false);

  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDescriptionBlur = async () => {
    const symptoms = form.description.trim();
    if (symptoms.length < 10) return;

    setIsClassifying(true);
    try {
      const result = await ticketsService.classifyBookingSymptoms(symptoms);
      if (result) {
        setForm((prev) => ({
          ...prev,
          serviceCategory: result.suggested_category,
          estimatedDuration: String(result.estimated_duration_hours)
        }));
        setAiReasoning(result.reasoning);
      }
    } catch (err) {
      console.error('Failed to auto-classify symptoms:', err);
    } finally {
      setIsClassifying(false);
    }
  };

  const validateStep = (currentStep: number): boolean => {
    const errors: { [key: string]: string } = {};

    if (currentStep === 1) {
      if (!form.customerName.trim()) errors.customerName = 'Customer name is required.';
      if (!form.customerPhone.trim()) {
        errors.customerPhone = 'Contact phone number is required.';
      } else if (form.customerPhone.trim().length < 9) {
        errors.customerPhone = 'Invalid phone number format.';
      }
      if (form.customerEmail.trim() && !/\S+@\S+\.\S+/.test(form.customerEmail)) {
        errors.customerEmail = 'Invalid email address format.';
      }
    } else if (currentStep === 2) {
      if (!form.registrationNumber.trim()) errors.registrationNumber = 'Registration plate number is required.';
      if (!form.make.trim()) errors.make = 'Vehicle manufacturer make is required.';
      if (!form.model.trim()) errors.model = 'Vehicle model description is required.';
      if (form.year.trim()) {
        const yearVal = parseInt(form.year);
        if (isNaN(yearVal) || yearVal < 1900 || yearVal > 2100) {
          errors.year = 'Please enter a valid year between 1900 and 2100.';
        }
      }
      if (!form.description.trim()) {
        errors.description = 'Please describe the mechanical issues/services required.';
      } else if (form.description.trim().length < 5) {
        errors.description = 'Issue description must be at least 5 characters.';
      }
    } else if (currentStep === 3) {
      if (!form.preferredDate) {
        errors.preferredDate = 'Please select your preferred date.';
      } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selDate = new Date(form.preferredDate);
        if (selDate < today) {
          errors.preferredDate = 'Preferred date must be today or in the future.';
        }
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    setIsLoading(true);
    try {
      const response = await ticketsService.createBookingRequest({
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        customerEmail: form.customerEmail || null,
        registrationNumber: form.registrationNumber,
        make: form.make,
        model: form.model,
        year: form.year ? parseInt(form.year) : null,
        description: form.description,
        preferredDate: form.preferredDate,
        preferredTime: form.preferredTime,
        aiDiagnostics: {
          suggested_category: form.serviceCategory,
          estimated_duration_hours: Number(form.estimatedDuration),
          reasoning: aiReasoning || 'Customer selection'
        }
      });

      // Construct full absolute tracking link using current origin
      const absoluteUrl = `${window.location.origin}/public/track/${response.trackingToken}`;
      setSuccessData({
        ticketId: response.ticketId,
        trackingToken: response.trackingToken,
        trackingUrl: absoluteUrl
      });
    } catch (err: any) {
      setFormErrors({ form: err.message || 'Failed to submit booking request. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (successData?.trackingUrl) {
      navigator.clipboard.writeText(successData.trackingUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    }
  };

  // Date restriction for date picker (today or future dates)
  const getMinDateStr = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Success view
  if (successData) {
    return (
      <div className="min-h-screen bg-background font-sans py-12 px-4 flex justify-center items-center">
        <div className="max-w-xl w-full bg-surface border border-border rounded-3xl p-8 shadow-sm flex flex-col items-center text-center animate-scale-in">
          <div className="w-16 h-16 bg-primary/10 border border-primary/30 rounded-full flex items-center justify-center text-primary mb-6 animate-pulse">
            <Check size={32} />
          </div>
          <h2 className="font-display text-3xl text-primary font-medium mb-3">
            Booking Request Received!
          </h2>
          <p className="text-xs text-text-muted mb-8 leading-relaxed max-w-sm">
            Thank you for choosing ANM Workshop. Your booking request has been registered as a **Draft** and is pending review by our administrator.
          </p>

          <div className="w-full bg-background border border-border rounded-2xl p-6 mb-8 text-left flex flex-col gap-4">
            <div>
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block">
                Booking Reference ID
              </span>
              <span className="text-sm font-mono font-semibold text-text mt-0.5 block select-all">
                {successData.ticketId}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block">
                Secure tracking token
              </span>
              <span className="text-xs font-mono text-primary font-medium mt-0.5 block select-all">
                {successData.trackingToken}
              </span>
            </div>
            <div className="border-t border-border pt-4">
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block">
                Real-Time Tracking URL
              </span>
              <div className="flex gap-2 items-center mt-1.5">
                <span className="text-xs text-text-muted font-mono truncate flex-1 bg-surface border border-border px-3 py-2 rounded-lg leading-none">
                  {successData.trackingUrl}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCopyLink}
                  className="px-3 py-2 h-auto text-xs shrink-0 flex items-center gap-1 font-semibold"
                >
                  {isCopied ? 'Copied' : 'Copy'}
                  <Copy size={13} />
                </Button>
              </div>
              <p className="text-[10px] text-text-muted/80 italic mt-2">
                * Bookmark this link to check progress, read notes, and view/print your invoice.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Button
              variant="primary"
              onClick={() => navigate(`/public/track/${successData.trackingToken}`)}
              className="flex-1 py-3.5 font-semibold"
            >
              Track Repair Progress
            </Button>
            <Button
              variant="secondary"
              onClick={() => window.print()}
              className="py-3.5 px-6 font-semibold flex items-center justify-center gap-2"
            >
              <Printer size={16} />
              Print Receipt
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-sans py-12 px-4 flex justify-center items-center">
      <div className="max-w-xl w-full bg-surface border border-border rounded-3xl shadow-sm overflow-hidden animate-slide-in">
        {/* Top Header Card */}
        <div className="p-6 bg-primary text-white flex justify-between items-center border-b border-white/10">
          <div className="flex items-center gap-3">
            <img src={anmLogo} alt="ANM Logo" className="w-9 h-9 object-contain rounded-lg bg-white p-0.5" />
            <div>
              <h1 className="font-display font-medium text-base leading-none tracking-wide">
                ANM Workshop
              </h1>
              <span className="text-[9px] text-white/60 uppercase tracking-widest block mt-1">
                Booking Portal
              </span>
            </div>
          </div>
          <span className="text-xs font-semibold text-white/80 bg-white/10 px-3 py-1 rounded-full">
            Step {step} of 3
          </span>
        </div>

        {/* Step Indicator Bar */}
        <div className="w-full bg-background h-1 flex">
          <div className={`h-full bg-primary transition-all duration-300 ${
            step === 1 ? 'w-1/3' : step === 2 ? 'w-2/3' : 'w-full'
          }`} />
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} className="p-8">
          {formErrors.form && (
            <div className="p-4 bg-error/10 border border-error/20 rounded-xl text-xs text-error font-medium flex gap-2 mb-6 animate-fade-in">
              <User size={16} className="shrink-0 mt-0.5" />
              <span>{formErrors.form}</span>
            </div>
          )}

          {/* STEP 1: Customer Info */}
          {step === 1 && (
            <div className="flex flex-col gap-5 animate-fade-in">
              <div className="border-b border-border pb-3 mb-2">
                <h3 className="font-display text-xl text-primary font-medium">Customer Information</h3>
                <p className="text-[10px] text-text-muted mt-1">Enter your contact details so we can update you on status.</p>
              </div>

              <Input
                label="Full Name"
                name="customerName"
                placeholder="e.g. Sipho Khumalo"
                value={form.customerName}
                onChange={handleInputChange}
                error={formErrors.customerName}
                required
              />

              <Input
                label="Phone Number"
                name="customerPhone"
                placeholder="e.g. 082 123 4567"
                value={form.customerPhone}
                onChange={handleInputChange}
                error={formErrors.customerPhone}
                required
              />

              <Input
                label="Email Address (Optional)"
                name="customerEmail"
                placeholder="e.g. customer@gmail.com"
                value={form.customerEmail}
                onChange={handleInputChange}
                error={formErrors.customerEmail}
              />
            </div>
          )}

          {/* STEP 2: Vehicle Specs */}
          {step === 2 && (
            <div className="flex flex-col gap-5 animate-fade-in">
              <div className="border-b border-border pb-3 mb-2">
                <h3 className="font-display text-xl text-primary font-medium">Vehicle Specs & Description</h3>
                <p className="text-[10px] text-text-muted mt-1">Details of the vehicle to be serviced.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Registration Number"
                  name="registrationNumber"
                  placeholder="e.g. ND 123456"
                  value={form.registrationNumber}
                  onChange={handleInputChange}
                  error={formErrors.registrationNumber}
                  required
                />

                <Input
                  label="Year (Optional)"
                  name="year"
                  placeholder="e.g. 2018"
                  value={form.year}
                  onChange={handleInputChange}
                  error={formErrors.year}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Make / Manufacturer"
                  name="make"
                  placeholder="e.g. Toyota"
                  value={form.make}
                  onChange={handleInputChange}
                  error={formErrors.make}
                  required
                />

                <Input
                  label="Model / Variant"
                  name="model"
                  placeholder="e.g. Hilux"
                  value={form.model}
                  onChange={handleInputChange}
                  error={formErrors.model}
                  required
                />
              </div>

              <Textarea
                label="Service Details / Repair Request"
                name="description"
                placeholder="e.g. Major service requested. Squealing noise from front wheels when braking. Engine runs hot."
                value={form.description}
                onChange={handleInputChange}
                onBlur={handleDescriptionBlur}
                error={formErrors.description}
                rows={4}
                required
              />

              {/* AI Categorizer Feedback Panel */}
              <div className="mt-4 p-4 rounded-2xl border transition-all duration-300 bg-gradient-to-r from-surface to-primary-light/40 border-primary/30 shadow-sm flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs font-semibold text-text uppercase tracking-wider">
                    AI Service Booking Assistant
                  </span>
                  {isClassifying && <span className="text-[10px] text-text-muted animate-pulse font-medium">(Analyzing symptoms...)</span>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Service Category"
                    name="serviceCategory"
                    value={form.serviceCategory}
                    onChange={handleSelectChange}
                    options={[
                      { value: 'Oil & Filter Service', label: 'Oil & Filter Service' },
                      { value: 'Brakes & Braking System', label: 'Brakes & Braking System' },
                      { value: 'Suspension & Steering', label: 'Suspension & Steering' },
                      { value: 'Engine & Transmission Diagnostic', label: 'Engine & Transmission Diagnostic' },
                      { value: 'Electrical & Battery Diagnostic', label: 'Electrical & Battery Diagnostic' },
                      { value: 'General Inspection & Repair', label: 'General Inspection & Repair' }
                    ]}
                    required
                  />

                  <div className="flex flex-col gap-1.5">
                    <label className="block text-[0.72rem] font-semibold text-text-muted uppercase tracking-wider">
                      Estimated Duration (Hours)
                    </label>
                    <input
                      type="number"
                      name="estimatedDuration"
                      min="0.5"
                      max="24"
                      step="0.5"
                      value={form.estimatedDuration}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-surface transition-all"
                      required
                    />
                  </div>
                </div>

                {aiReasoning && (
                  <div className="p-3 bg-background border border-border rounded-xl text-[10px] text-text-muted leading-relaxed">
                    <span className="font-semibold text-text block mb-1">AI Recommendation Reasoning:</span>
                    {aiReasoning}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Scheduling */}
          {step === 3 && (
            <div className="flex flex-col gap-5 animate-fade-in">
              <div className="border-b border-border pb-3 mb-2">
                <h3 className="font-display text-xl text-primary font-medium">Scheduling Preferences</h3>
                <p className="text-[10px] text-text-muted mt-1">Select your preferred date and time slot.</p>
              </div>

              <Input
                label="Preferred Date"
                name="preferredDate"
                type="date"
                value={form.preferredDate}
                onChange={handleInputChange}
                error={formErrors.preferredDate}
                min={getMinDateStr()}
                required
              />

              <Select
                label="Preferred Time Slot"
                name="preferredTime"
                value={form.preferredTime}
                onChange={handleSelectChange}
                options={[
                  { value: 'morning', label: 'Morning (08:00 AM - 12:00 PM)' },
                  { value: 'afternoon', label: 'Afternoon (12:00 PM - 05:00 PM)' }
                ]}
                required
              />

              <div className="p-4 bg-background border border-border rounded-xl flex items-start gap-3 mt-2">
                <HelpCircle className="text-primary mt-0.5 shrink-0" size={16} />
                <div>
                  <p className="text-xs font-semibold text-text">Review Process</p>
                  <p className="text-[10px] text-text-muted mt-0.5 leading-relaxed">
                    Once submitted, our team will review the slot and details. We will confirm the appointment via a WhatsApp message or telephone call.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Controls Footer */}
          <div className="flex items-center justify-between border-t border-border mt-8 pt-6">
            {step > 1 ? (
              <Button
                type="button"
                variant="secondary"
                onClick={handlePrev}
                disabled={isLoading}
                className="py-3 px-6 font-semibold flex items-center gap-1.5"
              >
                <ArrowLeft size={16} />
                Previous
              </Button>
            ) : (
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/')}
                disabled={isLoading}
                className="py-3 px-6 font-semibold"
              >
                Cancel
              </Button>
            )}

            {step < 3 ? (
              <Button
                type="button"
                variant="primary"
                onClick={handleNext}
                className="py-3 px-6 font-semibold flex items-center gap-1.5 ml-auto"
              >
                Next Step
                <ArrowRight size={16} />
              </Button>
            ) : (
              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
                className="py-3 px-6 font-semibold flex items-center justify-center gap-2 ml-auto"
              >
                {isLoading ? (
                  <>
                    <Spinner size="sm" />
                    Submitting...
                  </>
                ) : (
                  'Submit Booking Request'
                )}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default PublicBooking;
