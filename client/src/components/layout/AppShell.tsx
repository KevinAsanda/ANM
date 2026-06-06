import React, { useState } from 'react';
import { Sidebar } from './Sidebar.js';
import { Menu, X } from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row relative">
      {/* Mobile Top Navbar */}
      <header className="md:hidden flex items-center justify-between px-4 h-16 bg-surface/90 backdrop-blur-md border-b border-border/60 fixed top-0 left-0 right-0 z-30">
        <div className="flex flex-col">
          <span className="font-display font-medium text-text text-md tracking-tight">ANM Workshop</span>
          <span className="text-[9px] uppercase font-semibold text-text-muted tracking-widest">Portal</span>
        </div>
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-2 border border-border rounded-xl text-text-muted hover:bg-background transition-colors"
          aria-label="Open menu navigation"
        >
          <Menu size={18} />
        </button>
      </header>

      {/* Sidebar - Desktop Layout */}
      <div className="hidden md:block w-[240px] shrink-0">
        <Sidebar />
      </div>

      {/* Sidebar - Mobile Slide-over Drawer */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          {/* Overlay mask */}
          <div 
            className="fixed inset-0 bg-text/40 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={() => setIsMobileOpen(false)}
          />
          
          {/* Drawer body container */}
          <div className="relative flex flex-col w-[260px] max-w-xs h-full bg-primary text-white z-50 animate-slide-in shadow-2xl">
            {/* Close Toggle */}
            <button
              onClick={() => setIsMobileOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-white/70 hover:text-white rounded-xl hover:bg-white/10 transition-colors z-50"
              aria-label="Close menu navigation"
            >
              <X size={18} />
            </button>
            
            <Sidebar onClose={() => setIsMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 min-h-screen pt-20 md:pt-8 p-4 md:p-8 max-w-[1280px] mx-auto w-full transition-all duration-300">
        <div className="animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
};
