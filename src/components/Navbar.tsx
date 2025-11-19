import React, { useState } from 'react';
import { LogOut, Menu, X } from 'lucide-react';

interface NavbarProps {
  user: { name: string } | null;
  onLogout: () => void;
  onOpenAuth: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout, onOpenAuth, activeTab, setActiveTab }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Use the direct external URL provided
  const logoUrl = 'https://i.pinimg.com/736x/73/d7/86/73d7867050bb5cab9b32cd37750f9ecb.jpg';

  const NavLink = ({ name, tab }: { name: string, tab: string }) => (
    <button
      onClick={() => { setActiveTab(tab); setIsMobileOpen(false); }}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        activeTab === tab 
          ? 'text-amber-600 bg-amber-50' 
          : 'text-gray-600 hover:text-amber-600'
      }`}
    >
      {name}
    </button>
  );

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-24">
          <div className="flex items-center cursor-pointer" onClick={() => setActiveTab('home')}>
            {/* Logo */}
            <img 
              src={logoUrl} 
              alt="Thirupalappa Events" 
              className="h-20 w-auto mr-3 object-contain py-1 mix-blend-multiply"
              onError={(e) => {
                // Fallback if image fails to load
                const target = e.target as HTMLImageElement;
                console.warn("Logo failed to load:", target.src);
              }}
            />
            
            <div className="flex flex-col justify-center">
              <span className="font-playfair font-bold text-2xl text-slate-800 leading-none tracking-wide uppercase">
                THIRUPALAPPA
              </span>
              <span className="text-[10px] text-amber-500 font-bold tracking-[0.2em] uppercase mt-1">
                Decorations & Events
              </span>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <NavLink name="Home" tab="home" />
            <NavLink name="Services" tab="services" />
            <NavLink name="AI Planner" tab="ai-planner" />
            {user && <NavLink name="Dashboard" tab="dashboard" />}
            
            {user ? (
              <div className="flex items-center ml-4 pl-4 border-l border-gray-200">
                <span className="text-sm text-gray-700 mr-3">Hi, {user.name}</span>
                <button 
                  onClick={onLogout}
                  className="flex items-center text-sm text-red-500 hover:text-red-700 font-medium"
                >
                  <LogOut className="h-4 w-4 mr-1" /> Logout
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="ml-4 px-6 py-2 rounded-full bg-amber-500 text-white hover:bg-amber-600 transition text-sm font-bold shadow-lg uppercase tracking-wide"
              >
                Login / Sign Up
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 pb-4">
          <div className="flex flex-col px-4 space-y-2 mt-2">
            <NavLink name="Home" tab="home" />
            <NavLink name="Services" tab="services" />
            <NavLink name="AI Planner" tab="ai-planner" />
            {user && <NavLink name="Dashboard" tab="dashboard" />}
            <div className="pt-2 border-t border-gray-100 mt-2">
              {user ? (
                <button onClick={onLogout} className="flex items-center w-full text-left text-red-500 py-2">
                  <LogOut className="h-4 w-4 mr-2" /> Logout ({user.name})
                </button>
              ) : (
                <button onClick={() => { onOpenAuth(); setIsMobileOpen(false); }} className="w-full text-left py-2 text-amber-600 font-bold">
                  Login / Sign Up
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;