import React, { useState, useEffect } from 'react';
import { User, ServicePackage, ServiceType, AiPlanResponse } from './types';
import { api } from './services/api'; // SWITCHED TO REAL API
import { SERVICES } from './services/mockDatabase'; // Keeping static service data
import Navbar from './components/Navbar';
import AiPlanner from './components/AiPlanner';
import Dashboard from './components/Dashboard';
import emailjs from '@emailjs/browser';
import { 
  X, Mail, Lock, User as UserIcon, Check, Star, 
  MapPin, Phone, Instagram, Facebook, Calendar, IndianRupee, CreditCard, Loader2, AlertTriangle, Settings
} from 'lucide-react';

const EMAILJS_SERVICE_ID = "service_eventhub"; 
const EMAILJS_TEMPLATE_ID = "template_xtga95a"; 
const EMAILJS_PUBLIC_KEY = "_c2Uq-Lh-ttenyFGS"; 

// --- SUB-COMPONENTS DEFINED IN APP FOR SIMPLICITY ---

// 1. Auth Modal
interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
}
const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let user;
      if (isSignup) {
        user = await api.signup(name, email, password);
      } else {
        user = await api.login(email, password);
      }
      onLogin(user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="h-6 w-6" />
        </button>
        <h2 className="text-2xl font-bold text-slate-900 mb-6 font-playfair">
          {isSignup ? 'Join Tirupalappa Events' : 'Welcome Back'}
        </h2>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <div>
              <label className="block text-sm text-gray-700 mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input type="text" required className="pl-10 w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" value={name} onChange={e => setName(e.target.value)} />
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input type="email" required className="pl-10 w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input type="password" required className="pl-10 w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition">
            {loading ? 'Processing...' : (isSignup ? 'Sign Up' : 'Login')}
          </button>
        </form>
        <div className="mt-4 text-center text-sm text-gray-600">
          {isSignup ? 'Already have an account? ' : "Don't have an account? "}
          <button onClick={() => setIsSignup(!isSignup)} className="text-amber-600 font-bold hover:underline">
            {isSignup ? 'Login' : 'Sign Up'}
          </button>
        </div>
        <div className="mt-4 text-xs text-center text-gray-400 border-t pt-2">
          For Admin/Agency Demo: Login as <b>thirupalappaeventhub@gmail.com</b>
        </div>
      </div>
    </div>
  );
};

// 2. Booking Modal with Payment Simulation & Runtime Config
interface BookingModalProps {
  service: ServicePackage | null;
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth: () => void;
}
const BookingModal: React.FC<BookingModalProps> = ({ service, user, isOpen, onClose, onOpenAuth }) => {
  const [step, setStep] = useState(1); // 1: Details, 2: Payment, 3: Success
  const [date, setDate] = useState('');
  const [guests, setGuests] = useState(100);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string>('');
  const [isEmailSuccess, setIsEmailSuccess] = useState(true);

  // Payment State
  const [cardNum, setCardNum] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setStatusMsg('');
      setIsEmailSuccess(true);
      if (user) {
        setCardName(user.name);
        setCardNum('');
        setCardExp('');
        setCardCvv('');
      }
    }
  }, [isOpen, user]);

  if (!isOpen || !service) return null;

  const totalCost = service.type === 'Catering Service' ? guests * service.price : service.price;

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (cardNum.length < 13 || !cardExp || cardCvv.length < 3 || !cardName) {
      alert("Please enter valid card details.");
      return;
    }

    setLoading(true);
    setStatusMsg('Processing Payment...');

    try {
      // 1. Save to Real Backend via API
      await api.createBooking({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        serviceId: service.id,
        serviceTitle: service.title,
        date,
        guestCount: guests,
        totalAmount: totalCost
      });

      // 2. Send Real Email using EmailJS
      setStatusMsg('Sending Confirmation Email...');
      
      try {
        await emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          {
            to_name: user.name,
            email: user.email,
            event_name: service.title,
            date: new Date(date).toDateString(),
            amount: totalCost.toLocaleString(),
            reply_to: 'thirupalappaeventhub@gmail.com'
          },
          EMAILJS_PUBLIC_KEY
        );
        setStatusMsg(`Confirmation Email Sent to ${user.email}!`);
        setIsEmailSuccess(true);
      } catch (emailError: any) {
        console.error("EmailJS Error:", emailError);
        setIsEmailSuccess(false);
        setStatusMsg('Booking Saved. Email Failed (Network Issue).');
      }

      setStep(3);
    } catch (e: any) {
      alert("Payment processing failed: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl text-center max-w-sm w-full">
          <Lock className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Login Required</h3>
          <p className="text-gray-600 mb-6">You must be logged in to keep track of your event bookings.</p>
          <div className="flex gap-4 justify-center">
            <button onClick={onClose} className="px-4 py-2 text-gray-600 font-medium">Cancel</button>
            <button onClick={() => { onClose(); onOpenAuth(); }} className="px-4 py-2 bg-slate-900 text-white rounded-lg font-medium">Login Now</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="bg-slate-900 p-4 flex justify-between items-center text-white sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <h3 className="font-playfair text-lg font-bold">Book: {service.title}</h3>
          </div>
          <button onClick={onClose}><X className="h-5 w-5" /></button>
        </div>

        <div className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Event Date</label>
                <input type="date" required className="w-full mt-1 p-2 border rounded-lg" value={date} onChange={e => setDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Guest Count</label>
                <input type="number" min="10" className="w-full mt-1 p-2 border rounded-lg" value={guests} onChange={e => setGuests(parseInt(e.target.value))} />
              </div>
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                   <span>Base Price</span>
                   <span>₹{service.price.toLocaleString()} {service.type === 'Catering Service' ? '/ plate' : ''}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-slate-900 border-t border-amber-200 pt-2 mt-2">
                   <span>Total</span>
                   <span>₹{totalCost.toLocaleString()}</span>
                </div>
              </div>
              <button 
                onClick={() => date ? setStep(2) : alert("Please select a date")}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold mt-4 hover:bg-indigo-700"
              >
                Proceed to Pay
              </button>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handlePayment} className="space-y-5">
              <div className="text-center">
                <p className="text-gray-600 text-sm">Enter your card details to complete the booking.</p>
              </div>
              
              {/* Interactive Card Preview */}
              <div className="bg-gradient-to-r from-slate-700 to-slate-900 text-white p-5 rounded-xl shadow-lg text-left relative overflow-hidden transition-all duration-300">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
                <div className="flex justify-between items-start mb-6">
                   <CreditCard className="h-8 w-8" />
                   <span className="font-mono text-sm opacity-70">DEBIT</span>
                </div>
                <div className="font-mono text-xl tracking-widest mb-4 truncate">
                   {cardNum || '0000 0000 0000 0000'}
                </div>
                <div className="flex justify-between text-xs opacity-80 uppercase tracking-wider">
                   <span className="truncate max-w-[150px]">{cardName || 'YOUR NAME'}</span>
                   <span>{cardExp || 'MM/YY'}</span>
                </div>
              </div>

              {/* Payment Inputs */}
              <div className="space-y-3">
                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Card Number</label>
                   <div className="relative">
                     <CreditCard className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                     <input 
                       type="text" 
                       maxLength={19}
                       placeholder="0000 0000 0000 0000" 
                       className="w-full pl-9 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                       value={cardNum}
                       onChange={e => {
                         let v = e.target.value.replace(/\D/g, '');
                         v = v.replace(/(.{4})/g, '$1 ').trim();
                         setCardNum(v.substring(0, 19));
                       }}
                       required
                     />
                   </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Expiry</label>
                     <input 
                       type="text" 
                       placeholder="MM/YY" 
                       maxLength={5}
                       className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                       value={cardExp}
                       onChange={e => {
                            let v = e.target.value.replace(/[^\d\/]/g, '');
                            if (v.length === 2 && !v.includes('/')) v += '/';
                            setCardExp(v);
                       }}
                       required
                     />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase mb-1">CVV</label>
                     <input 
                       type="password" 
                       placeholder="123" 
                       maxLength={3}
                       className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                       value={cardCvv}
                       onChange={e => setCardCvv(e.target.value.replace(/\D/g, ''))}
                       required
                     />
                   </div>
                </div>

                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cardholder Name</label>
                   <input 
                     type="text" 
                     placeholder="Name on Card" 
                     className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                     value={cardName}
                     onChange={e => setCardName(e.target.value)}
                     required
                   />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setStep(1)} 
                  className="w-1/3 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-bold hover:bg-gray-50 transition"
                >
                  Back
                </button>
                <button 
                    type="submit"
                    disabled={loading}
                    className="w-2/3 bg-green-600 text-white py-3 rounded-lg font-bold shadow-lg hover:bg-green-700 flex justify-center items-center transition"
                >
                    {loading ? (
                      <><Loader2 className="animate-spin h-5 w-5 mr-2" /> {statusMsg || 'Processing...'}</>
                    ) : (
                      `Pay ₹${totalCost.toLocaleString()}`
                    )}
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="text-center animate-fade-in">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isEmailSuccess ? 'bg-green-100' : 'bg-amber-100'}`}>
                {isEmailSuccess ? (
                  <Check className="h-10 w-10 text-green-600" />
                ) : (
                  <AlertTriangle className="h-8 w-8 text-amber-600" />
                )}
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                {isEmailSuccess ? 'Booking Successful!' : 'Booking Saved'}
              </h3>
              
              <p className="text-gray-600 mb-6">
                Thank you for choosing Tirupalappa Events. <br/>
                <span className={`font-semibold ${isEmailSuccess ? 'text-indigo-600' : 'text-amber-600'}`}>{statusMsg}</span>
              </p>

              <button onClick={onClose} className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition">
                Return to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---

const App = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServicePackage | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  // Check for logged in user on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('tirupalappa_current_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('tirupalappa_current_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('tirupalappa_current_user');
    localStorage.removeItem('token'); // Clear JWT
    setActiveTab('home');
  };

  const openBooking = (service: ServicePackage) => {
    setSelectedService(service);
    setIsBookingOpen(true);
  };

  const handleAiBooking = (plan: AiPlanResponse, eventType: string, budget: string) => {
    let estimatedPrice = 25000;
    if (budget === 'Low') estimatedPrice = 15000;
    if (budget === 'High') estimatedPrice = 80000;
  
    const customService: ServicePackage = {
      id: `ai-${Date.now()}`,
      type: ServiceType.CUSTOM,
      title: plan.theme,
      description: `Custom ${eventType} based on AI recommendations.`,
      price: estimatedPrice,
      image: 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      features: plan.suggestions
    };
    
    setSelectedService(customService);
    setIsBookingOpen(true);
  };

  // --- Render Functions for Tabs ---

  const renderHome = () => (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <div className="relative bg-slate-900 text-white py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
          alt="Event Background" 
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="relative max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold font-playfair tracking-tight mb-6">
            Turning Moments into <span className="text-amber-400">Memories</span>
          </h1>
          <p className="mt-4 text-xl text-gray-300 max-w-3xl mx-auto mb-10">
            Tirupalappa Events and Decorations brings your dream celebration to life. 
            From birthdays to weddings, we handle it all with premium packages and style.
          </p>
          <div className="flex justify-center gap-4">
            <button onClick={() => setActiveTab('services')} className="px-8 py-3 bg-amber-500 text-white font-bold rounded-full hover:bg-amber-600 transition shadow-lg">
              Explore Services
            </button>
            <button onClick={() => setActiveTab('ai-planner')} className="px-8 py-3 bg-white text-slate-900 font-bold rounded-full hover:bg-gray-100 transition shadow-lg flex items-center">
              <Star className="h-4 w-4 mr-2 text-indigo-600" /> AI Planner
            </button>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-16 max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
           <div className="p-6 bg-white rounded-xl shadow-sm border hover:shadow-md transition">
             <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
               <Star className="h-6 w-6" />
             </div>
             <h3 className="text-xl font-bold mb-2">All-in-One Packages</h3>
             <p className="text-gray-600">Decor, catering, and photography bundled together for the best prices.</p>
           </div>
           <div className="p-6 bg-white rounded-xl shadow-sm border hover:shadow-md transition">
             <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
               <UserIcon className="h-6 w-6" />
             </div>
             <h3 className="text-xl font-bold mb-2">Customer Records</h3>
             <p className="text-gray-600">Secure login system to manage your bookings and view history anytime.</p>
           </div>
           <div className="p-6 bg-white rounded-xl shadow-sm border hover:shadow-md transition">
             <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
               <Check className="h-6 w-6" />
             </div>
             <h3 className="text-xl font-bold mb-2">Instant Confirmation</h3>
             <p className="text-gray-600">Receive immediate email confirmations from our team upon booking.</p>
           </div>
        </div>
      </div>
    </div>
  );

  const renderServices = () => (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold font-playfair text-slate-900">Our Premium Services</h2>
        <p className="text-gray-600 mt-2">Select a package to customize your event.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {SERVICES.map(service => (
          <div key={service.id} className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300">
            <div className="relative h-48 overflow-hidden bg-gray-200">
              <img 
                src={service.image} 
                alt={service.title} 
                className="w-full h-full object-cover transform group-hover:scale-110 transition duration-500"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (service.fallbackImage && target.src !== service.fallbackImage) {
                    target.src = service.fallbackImage;
                  } else {
                    target.style.display = 'none';
                  }
                }}
              />
              <div className="absolute top-0 right-0 bg-amber-500 text-white px-3 py-1 text-sm font-bold rounded-bl-lg">
                Offer
              </div>
            </div>
            <div className="p-6">
              <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">{service.type}</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{service.title}</h3>
              <p className="text-gray-600 text-sm mb-4 h-10 line-clamp-2">{service.description}</p>
              
              <ul className="text-sm text-gray-500 mb-6 space-y-1">
                {service.features.slice(0,3).map((f, i) => (
                  <li key={i} className="flex items-center"><Check className="h-3 w-3 text-green-500 mr-2"/> {f}</li>
                ))}
              </ul>

              <div className="flex items-center justify-between mt-auto">
                <span className="text-xl font-bold text-slate-900">₹{service.price.toLocaleString()}</span>
                <button 
                  onClick={() => openBooking(service)}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition"
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar 
        user={user} 
        onLogout={handleLogout} 
        onOpenAuth={() => setIsAuthOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className="flex-grow">
        {activeTab === 'home' && renderHome()}
        {activeTab === 'services' && renderServices()}
        {activeTab === 'ai-planner' && <AiPlanner onBookPlan={handleAiBooking} />}
        {activeTab === 'dashboard' && user && <Dashboard user={user} />}
      </main>

      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-white text-lg font-bold font-playfair mb-4">Tirupalappa Events</h4>
            <p className="text-sm text-gray-400">Making every occasion grand and memorable with our professional decoration and management services.</p>
          </div>
          <div>
            <h4 className="text-white text-lg font-bold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center"><Mail className="h-4 w-4 mr-2"/> thirupalappaeventhub@gmail.com</li>
              <li className="flex items-center"><Phone className="h-4 w-4 mr-2"/> +91 98765 43210</li>
            </ul>
          </div>
        </div>
      </footer>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onLogin={handleLogin} />
      <BookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} service={selectedService} user={user} onOpenAuth={() => { setIsBookingOpen(false); setIsAuthOpen(true); }} />
    </div>
  );
};

export default App;
