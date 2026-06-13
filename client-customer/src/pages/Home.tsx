import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wrench, 
  Shield, 
  Search, 
  ArrowRight, 
  MapPin, 
  Clock, 
  Phone, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Star, 
  UserCheck, 
  CreditCard, 
  Smartphone,
  Gauge,
  Sparkles
} from 'lucide-react';
import { Button } from '../components/ui/Button.js';
import { Input } from '../components/ui/Input.js';
import anmLogo from '../assets/anm-logo.svg';

const Home: React.FC = () => {
  const [tokenInput, setTokenInput] = useState<string>('');
  const [searchError, setSearchError] = useState<string | null>(null);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const navigate = useNavigate();

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);

    const token = tokenInput.trim();
    if (!token) {
      setSearchError('Please enter a tracking token.');
      return;
    }

    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    
    if (uuidRegex.test(token) || token.startsWith('mock-') || token.length > 5) {
      navigate(`/public/track/${token}`);
    } else {
      setSearchError('Invalid tracking token format. Please check your token.');
    }
  };

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const services = [
    {
      title: 'Scheduled Maintenance',
      description: 'Major and minor services, filters, spark plugs, fluid top-ups, and multi-point vehicle safety diagnostics.',
      icon: <Wrench className="text-primary" size={24} />,
      price: 'From R 850'
    },
    {
      title: 'Brake System Repairs',
      description: 'Disc pad replacement, brake fluid flushing, rotor skimming, and caliper servicing for reliable stopping power.',
      icon: <Shield className="text-primary" size={24} />,
      price: 'From R 450'
    },
    {
      title: 'Engine Diagnostics',
      description: 'OBD-II computer fault scans, sensor calibration, emissions checks, and troubleshooting check-engine lights.',
      icon: <Search className="text-primary" size={24} />,
      price: 'From R 350'
    },
    {
      title: 'Steering & Suspension',
      description: 'Shock absorber replacement, ball joints, control arms, steering rack repairs, and complete wheel alignment.',
      icon: <Gauge className="text-primary" size={24} />,
      price: 'From R 550'
    },
    {
      title: 'Clutch & Gearbox Repairs',
      description: 'Clutch kit replacements, master cylinders, manual gearbox diagnostics, and driveshaft repairs.',
      icon: <Sparkles className="text-primary" size={24} />,
      price: 'Quote required'
    },
    {
      title: 'Auto Electrical & Alternators',
      description: 'Starter motors, alternators, battery testing, wiring diagnostics, and electrical accessory installations.',
      icon: <Smartphone className="text-primary" size={24} />,
      price: 'From R 400'
    }
  ];

  const testimonials = [
    {
      name: 'Sipho Mthembu',
      role: 'Toyota Hilux Owner (Pinetown)',
      quote: 'The live tracking feature changed everything. I could see exactly when they logged the brake pads on my Hilux and what it cost before I even arrived at the shop. Outstanding transparency!',
      rating: 5
    },
    {
      name: 'Sarah Naidoo',
      role: 'VW Polo Owner (Kloof)',
      quote: 'No more surprise phone calls with extra costs. I got my quote on WhatsApp, authorized the spark plugs change online, and paid via EFT. Highly recommend ANM for modern, honest service.',
      rating: 5
    },
    {
      name: 'Bruce Anderson',
      role: 'Ford Ranger Owner (New Germany)',
      quote: 'ANM is the only workshop in Durban that actually shows you live status progress. The mechanics are highly skilled and the owner, Mpume, keeps a tight, honest ship.',
      rating: 5
    }
  ];

  const faqs = [
    {
      q: 'How does the live repair progress tracking work?',
      a: 'Once you book an appointment and check in your vehicle, you receive a unique tracking token via WhatsApp or email. Clicking the link lets you see a real-time progress bar (Pending → In Progress → Completed), diagnostic notes from your mechanic, and a list of parts logged to your job card.'
    },
    {
      q: 'Will I be charged for extra parts without my consent?',
      a: 'Absolutely not. We list all parts needed on your digital ticket. If our mechanics discover additional issues, we update the ticket draft and seek your authorization via WhatsApp before any parts are logged or fitted.'
    },
    {
      q: 'Do I need to pay online to collect my vehicle?',
      a: 'We accept EFT and secure digital payments. When the vehicle status reaches "Completed", the digital invoice is finalized and displayed on your tracker, complete with bank details. You can pay online and upload the POP for a seamless pick-up.'
    },
    {
      q: 'Are you open on Saturdays?',
      a: 'Yes, our workshop is open on Saturdays from 08:00 AM to 01:00 PM for scheduled minor services, battery swaps, and light diagnostics. We are closed on Sundays.'
    },
    {
      q: 'Where is ANM Workshop located?',
      a: 'We are situated at 14 Marianheights Road in Pinetown (South Africa). You can find us easily just off the main arterial routes connecting Pinetown, Kloof, and New Germany.'
    }
  ];

  return (
    <div className="min-h-screen bg-background text-text font-sans flex flex-col selection:bg-primary/20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={anmLogo} alt="ANM Logo" className="w-10 h-10 object-contain rounded-lg" />
            <div>
              <h1 className="font-display font-medium text-xl leading-none tracking-wide text-primary">
                ANM Workshop
              </h1>
              <span className="text-[10px] text-text-muted uppercase tracking-wider block mt-1">
                Automotive Service Excellence
              </span>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-text/80">
            <a href="#services" className="hover:text-primary transition-colors">Services</a>
            <a href="#how-it-works" className="hover:text-primary transition-colors">Our Process</a>
            <a href="#tracking" className="hover:text-primary transition-colors">Track Repair</a>
            <a href="#faqs" className="hover:text-primary transition-colors">FAQs</a>
            <a href="#contact" className="hover:text-primary transition-colors">Contact</a>
          </nav>
          <div className="md:hidden flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/public/booking')}
              className="text-xs font-semibold"
            >
              Book Now
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-16 md:py-24">
          <div className="max-w-6xl mx-auto px-4 grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Hero Left */}
            <div className="lg:col-span-7 flex flex-col gap-6 animate-slide-in">
              <span className="text-[10px] uppercase font-bold text-primary tracking-widest bg-primary/10 px-3.5 py-1.5 rounded-full w-fit">
                Marianheights, Pinetown
              </span>
              <h2 className="font-display text-4xl md:text-6xl text-primary font-medium leading-[1.1] tracking-tight">
                Modern Car Repairs.<br />
                Total Transparency.
              </h2>
              <p className="text-text-muted text-base md:text-lg leading-relaxed max-w-xl">
                ANM Workshop is Pinetown’s leading paperless garage. We eliminate the guesswork of car repairs with real-time status updates, live parts logging, and digital invoices sent directly to your phone.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mt-2">
                <Button
                  variant="primary"
                  onClick={() => navigate('/public/booking')}
                  className="group flex items-center justify-center gap-2 py-4 px-8 font-semibold text-sm tracking-wider"
                >
                  Book Appointment
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Button>
                <a href="#tracking">
                  <Button
                    variant="secondary"
                    className="w-full sm:w-auto py-4 px-8 font-semibold text-sm tracking-wider"
                  >
                    Track Your Vehicle
                  </Button>
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-4 border-t border-border/80 pt-8 mt-4 text-center sm:text-left">
                <div>
                  <p className="font-display text-2xl md:text-3xl font-bold text-primary">15+</p>
                  <p className="text-xs text-text-muted mt-0.5">Years Serving KZN</p>
                </div>
                <div>
                  <p className="font-display text-2xl md:text-3xl font-bold text-primary">100%</p>
                  <p className="text-xs text-text-muted mt-0.5">Digital & Paperless</p>
                </div>
                <div>
                  <p className="font-display text-2xl md:text-3xl font-bold text-primary">RMI</p>
                  <p className="text-xs text-text-muted mt-0.5">Standard Mechanics</p>
                </div>
              </div>
            </div>

            {/* Hero Right: Tracking Widget */}
            <div className="lg:col-span-5 w-full">
              <div id="tracking" className="bg-surface border border-border rounded-3xl p-8 relative overflow-hidden shadow-md flex flex-col gap-6 animate-fade-in">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-12 -mt-12"></div>
                <div className="relative z-10">
                  <h3 className="font-display text-2xl md:text-3xl text-primary font-medium mb-2">
                    Live Progress Tracker
                  </h3>
                  <p className="text-xs text-text-muted mb-6 leading-relaxed">
                    Enter your booking token below to see diagnostics notes, mechanic assignments, logged parts, and final billing.
                  </p>
                  <form onSubmit={handleTrackSubmit} className="flex flex-col gap-4">
                    <div>
                      <Input
                        label="Tracking Token"
                        placeholder="e.g. b62rdieof-e82b-4720-a61f-..."
                        value={tokenInput}
                        onChange={(e) => setTokenInput(e.target.value)}
                        required
                      />
                    </div>
                    {searchError && (
                      <div className="flex items-center gap-2 text-xs text-error mt-0.5 animate-fade-in">
                        <AlertCircle size={14} />
                        <span>{searchError}</span>
                      </div>
                    )}
                    <Button
                      type="submit"
                      variant="primary"
                      className="w-full py-3.5 font-semibold text-xs tracking-widest uppercase"
                    >
                      Lookup Repair Status
                    </Button>
                  </form>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Digital Journey / How It Works */}
        <section id="how-it-works" className="py-20 bg-surface border-y border-border">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center max-w-xl mx-auto mb-16 flex flex-col gap-3">
              <h3 className="font-display text-3xl md:text-4xl text-primary font-medium">
                The Paperless Client Experience
              </h3>
              <p className="text-text-muted text-sm leading-relaxed">
                From scheduling to pickup, we’ve rebuilt the workshop experience from the ground up to be digital, clear, and convenient.
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8 relative">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center gap-4 bg-background p-6 rounded-2xl border border-border relative hover:border-primary/30 transition-all">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                  1
                </div>
                <h4 className="font-display text-xl text-primary font-medium">Online Booking</h4>
                <p className="text-xs text-text-muted leading-relaxed">
                  Submit vehicle details and select your preferred service slot in under two minutes on our web portal.
                </p>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center gap-4 bg-background p-6 rounded-2xl border border-border relative hover:border-primary/30 transition-all">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                  2
                </div>
                <h4 className="font-display text-xl text-primary font-medium">WhatsApp Quote</h4>
                <p className="text-xs text-text-muted leading-relaxed">
                  Our admin reviews your request, assigns a mechanic, and sends you a quote directly on WhatsApp.
                </p>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center gap-4 bg-background p-6 rounded-2xl border border-border relative hover:border-primary/30 transition-all">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                  3
                </div>
                <h4 className="font-display text-xl text-primary font-medium">Track Progress</h4>
                <p className="text-xs text-text-muted leading-relaxed">
                  Watch the live stepper. See diagnostic notes and exact parts logged by the mechanic in real time.
                </p>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col items-center text-center gap-4 bg-background p-6 rounded-2xl border border-border relative hover:border-primary/30 transition-all">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                  4
                </div>
                <h4 className="font-display text-xl text-primary font-medium">Digital Checkout</h4>
                <p className="text-xs text-text-muted leading-relaxed">
                  Review the finalized invoice on your tracker, pay via EFT, and drop in for a quick key pickup.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-20 bg-background">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center max-w-xl mx-auto mb-16 flex flex-col gap-3">
              <h3 className="font-display text-3xl md:text-4xl text-primary font-medium">
                Professional Workshop Services
              </h3>
              <p className="text-text-muted text-sm leading-relaxed">
                ANM Workshop is fully equipped to handle minor, major, and advanced diagnostics on passenger and light commercial vehicles.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((svc, i) => (
                <div
                  key={i}
                  className="p-8 bg-surface border border-border rounded-2xl flex flex-col justify-between gap-6 hover:border-primary/40 hover:-translate-y-1 hover:shadow-md transition-all duration-300 group"
                >
                  <div className="flex flex-col gap-4">
                    <div className="p-3.5 bg-primary/10 rounded-xl w-fit group-hover:bg-primary group-hover:text-white transition-all text-primary">
                      {svc.icon}
                    </div>
                    <h4 className="font-display text-2xl text-primary font-medium">
                      {svc.title}
                    </h4>
                    <p className="text-xs text-text-muted leading-relaxed">
                      {svc.description}
                    </p>
                  </div>
                  <div className="flex justify-between items-center border-t border-border pt-4 text-xs font-semibold">
                    <span className="text-text-muted uppercase tracking-wider text-[10px]">Pricing Guide</span>
                    <span className="text-primary font-bold text-sm bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
                      {svc.price}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Button
                variant="primary"
                onClick={() => navigate('/public/booking')}
                className="py-3.5 px-8 font-semibold tracking-wider text-xs"
              >
                Book Your Service Slot
              </Button>
            </div>
          </div>
        </section>

        {/* Why ANM - Comparison Grid */}
        <section className="py-20 bg-surface border-y border-border">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              
              <div className="lg:col-span-5 flex flex-col gap-6">
                <h3 className="font-display text-3xl md:text-4xl text-primary font-medium leading-[1.1]">
                  A Different Kind of Repair Workshop
                </h3>
                <p className="text-text-muted text-sm leading-relaxed">
                  Traditional workshops keep you in the dark. Surprises on your bill, hours on the phone chasing updates, and messy paper receipts. We built ANM around absolute transparency.
                </p>
                <div className="flex flex-col gap-3 mt-2 text-xs">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={16} className="text-success" />
                    <span className="font-semibold">No surprise labor charges</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={16} className="text-success" />
                    <span className="font-semibold">Real-time inventory decrement audit</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={16} className="text-success" />
                    <span className="font-semibold">WhatsApp notifications when stage shifts</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7">
                <div className="overflow-hidden rounded-2xl border border-border shadow-sm">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-primary/5 text-primary border-b border-border">
                        <th className="px-5 py-4 font-bold uppercase tracking-wider">Features</th>
                        <th className="px-5 py-4 font-bold uppercase tracking-wider bg-primary/10">ANM Workshop</th>
                        <th className="px-5 py-4 font-bold uppercase tracking-wider text-text-muted/70">Standard Garages</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-surface">
                      <tr className="hover:bg-primary/5 transition-all">
                        <td className="px-5 py-4 font-semibold text-text">Quote Authorization</td>
                        <td className="px-5 py-4 bg-primary/5 font-semibold text-success flex items-center gap-1.5">
                          <CheckCircle2 size={14} /> WhatsApp Approval
                        </td>
                        <td className="px-5 py-4 text-text-muted">Verbal over phone</td>
                      </tr>
                      <tr className="hover:bg-primary/5 transition-all">
                        <td className="px-5 py-4 font-semibold text-text">Repair Progress</td>
                        <td className="px-5 py-4 bg-primary/5 font-semibold text-success flex items-center gap-1.5">
                          <CheckCircle2 size={14} /> Live Status Stepper
                        </td>
                        <td className="px-5 py-4 text-text-muted">Call to check</td>
                      </tr>
                      <tr className="hover:bg-primary/5 transition-all">
                        <td className="px-5 py-4 font-semibold text-text">Parts Logged Audit</td>
                        <td className="px-5 py-4 bg-primary/5 font-semibold text-success flex items-center gap-1.5">
                          <CheckCircle2 size={14} /> Live Itemized View
                        </td>
                        <td className="px-5 py-4 text-text-muted">Listed at pickup</td>
                      </tr>
                      <tr className="hover:bg-primary/5 transition-all">
                        <td className="px-5 py-4 font-semibold text-text">Inventory Match</td>
                        <td className="px-5 py-4 bg-primary/5 font-semibold text-success flex items-center gap-1.5">
                          <CheckCircle2 size={14} /> Auto-deduct Transaction
                        </td>
                        <td className="px-5 py-4 text-text-muted">Manual stock check</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-background">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center max-w-xl mx-auto mb-16 flex flex-col gap-3">
              <h3 className="font-display text-3xl md:text-4xl text-primary font-medium">
                Trusted by Pinetown Drivers
              </h3>
              <p className="text-text-muted text-sm leading-relaxed">
                Read how local KwaZulu-Natal car owners rate our digital booking and mechanical services.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((t, i) => (
                <div
                  key={i}
                  className="p-8 bg-surface border border-border rounded-2xl flex flex-col justify-between gap-6 shadow-sm hover:border-primary/20 transition-all duration-300"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex gap-1">
                      {[...Array(t.rating)].map((_, idx) => (
                        <Star key={idx} size={14} className="fill-warning text-warning" />
                      ))}
                    </div>
                    <p className="text-xs text-text italic leading-relaxed">
                      "{t.quote}"
                    </p>
                  </div>
                  <div className="border-t border-border pt-4 flex flex-col gap-1">
                    <p className="font-display text-lg text-primary font-semibold leading-tight">{t.name}</p>
                    <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">{t.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQs Section */}
        <section id="faqs" className="py-20 bg-surface border-y border-border">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center max-w-xl mx-auto mb-16 flex flex-col gap-3">
              <h3 className="font-display text-3xl md:text-4xl text-primary font-medium">
                Frequently Asked Questions
              </h3>
              <p className="text-text-muted text-sm leading-relaxed">
                Find answers to common questions about our workshop repairs, diagnostics, and digital tracker.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="border border-border rounded-xl bg-background overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex justify-between items-center px-6 py-4.5 text-left font-display text-lg text-primary font-semibold hover:bg-primary/5 transition-all focus:outline-none"
                  >
                    <span>{faq.q}</span>
                    {activeFaq === idx ? (
                      <ChevronUp size={18} className="text-primary flex-shrink-0" />
                    ) : (
                      <ChevronDown size={18} className="text-primary flex-shrink-0" />
                    )}
                  </button>
                  {activeFaq === idx && (
                    <div className="px-6 pb-5 pt-1 text-xs text-text-muted border-t border-border/45 bg-surface/50 leading-relaxed animate-fade-in">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact & Map Section */}
        <section id="contact" className="max-w-6xl mx-auto px-4 py-20 grid lg:grid-cols-2 gap-12">
          
          {/* Contact Details */}
          <div className="flex flex-col gap-6 justify-center">
            <span className="text-[10px] uppercase font-bold text-primary tracking-widest bg-primary/10 px-3 py-1 rounded-full w-fit">
              Get in Touch
            </span>
            <h3 className="font-display text-3xl md:text-4xl text-primary font-medium leading-none">
              Visit Our Workshop
            </h3>
            <p className="text-text-muted text-sm leading-relaxed max-w-lg">
              We are situated conveniently in Marianheights, Pinetown. Drop by, book your appointment online, or query repair statuses on WhatsApp.
            </p>

            <div className="grid sm:grid-cols-2 gap-6 mt-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-xl text-primary mt-1">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-text uppercase tracking-wider">Workshop Address</p>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed">
                    14 Marianheights Road,<br />
                    Pinetown, South Africa, 3610
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-xl text-primary mt-1">
                  <Clock size={18} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-text uppercase tracking-wider">Working Hours</p>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed">
                    Mon - Fri: 08:00 AM - 05:00 PM<br />
                    Saturday: 08:00 AM - 01:00 PM
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-xl text-primary mt-1">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-text uppercase tracking-wider">Contact Channels</p>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed">
                    Call: +27 31 701 1234<br />
                    WhatsApp: +27 82 123 4567
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-xl text-primary mt-1">
                  <UserCheck size={18} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-text uppercase tracking-wider">Authorized Repair</p>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed">
                    Compliant with major insurance policies & parts warranties.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Real Google Map Embed with Directions */}
          <div className="bg-surface border border-border rounded-3xl p-4 shadow-sm flex flex-col gap-4 relative overflow-hidden h-[400px] md:h-[450px]">
            <div className="relative z-10 w-full h-full rounded-2xl overflow-hidden border border-border bg-slate-100">
              <iframe
                title="ANM Workshop Location"
                src="https://maps.google.com/maps?q=14%20Marianheights%20Road,%20Pinetown,%20South%20Africa&t=&z=15&ie=UTF8&iwloc=&output=embed"
                className="w-full h-full border-0"
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              
              {/* Floating Action Button for Directions */}
              <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-center">
                <a
                  href="https://www.google.com/maps/dir/?api=1&destination=14+Marianheights+Road,+Pinetown,+South+Africa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-medium text-xs py-2.5 px-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 tracking-wider uppercase"
                >
                  <MapPin size={14} />
                  Get Directions on Google Maps
                </a>
              </div>
            </div>
          </div>

        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-surface py-12">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:row justify-between items-center gap-8 text-xs text-text-muted">
          <div className="flex flex-col items-center md:items-start gap-2">
            <h5 className="font-display text-lg text-primary font-medium">ANM Automotive</h5>
            <p className="text-text-muted mt-0.5 text-center md:text-left">
              Serving Pinetown & Durban drivers with professional mechanical integrity.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 font-semibold">
            <a href="#services" className="hover:text-primary transition-colors">Services</a>
            <a href="#how-it-works" className="hover:text-primary transition-colors">Our Process</a>
            <a href="#tracking" className="hover:text-primary transition-colors">Track Status</a>
            <a href="#faqs" className="hover:text-primary transition-colors">FAQs</a>
            <a href="#contact" className="hover:text-primary transition-colors">Contact Us</a>
            <span className="text-border">|</span>
            <span
              onClick={() => navigate('/login')}
              className="hover:text-primary transition-colors cursor-pointer text-primary"
            >
              Staff Portal Login
            </span>
          </div>

          <div className="text-center md:text-right border-t border-border/50 w-full pt-6 flex flex-col sm:row justify-between gap-4 items-center">
            <p>© 2026 ANM Workshop. All rights reserved. Registered RMI Member.</p>
            <p className="text-[10px] text-text-muted/60">Built for Mangosuthu University of Technology Portfolio.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
