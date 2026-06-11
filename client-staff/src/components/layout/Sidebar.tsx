import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { Button } from '../ui/Button.js';
import { LayoutDashboard, FileText, ClipboardList, Users, LogOut, Receipt, BarChart2, Clock } from 'lucide-react';

interface SidebarProps {
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const { user, logout } = useAuth();

  const adminLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { to: '/tickets', label: 'Service Tickets', icon: <FileText size={18} /> },
    { to: '/inventory', label: 'Inventory Info', icon: <ClipboardList size={18} /> },
    { to: '/staff', label: 'Staff Directory', icon: <Users size={18} /> },
    { to: '/invoices', label: 'Invoices Billing', icon: <Receipt size={18} /> },
    { to: '/analytics', label: 'Financial Reports', icon: <BarChart2 size={18} /> },
    { to: '/payroll', label: 'Payroll & Shifts', icon: <Clock size={18} /> },
  ];

  const mechanicLinks = [
    { to: '/my-jobs', label: 'My Jobs Queue', icon: <FileText size={18} /> },
    { to: '/payroll', label: 'My Timesheets', icon: <Clock size={18} /> },
  ];

  const links = user?.role === 'admin' ? adminLinks : mechanicLinks;

  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <aside className="w-full h-full md:w-[240px] bg-primary text-white flex flex-col md:h-screen md:fixed md:top-0 md:left-0 border-r border-white/10 select-none">
      {/* Brand Logo & Header */}
      <div className="p-5 bg-primary-hover border-b border-white/10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full border border-white/40 flex items-center justify-center font-display text-lg text-white font-semibold flex-shrink-0">
          A
        </div>
        <div className="min-w-0">
          <h1 className="font-display font-medium text-lg text-white leading-none tracking-wide">
            ANM Workshop
          </h1>
          <span className="text-[9px] font-semibold text-white/60 uppercase tracking-widest block mt-1.5">
            {user?.role} Portal
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-6 flex flex-col gap-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={handleLinkClick}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 border-l-4 ${
                isActive
                  ? 'bg-white/15 text-white border-white font-semibold'
                  : 'text-white/70 hover:text-white hover:bg-white/5 border-transparent'
              }`
            }
          >
            {link.icon}
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* User Session Information Footer */}
      <div className="p-4 border-t border-white/10 bg-primary-hover/30 flex flex-col gap-3">
        <div className="flex flex-col px-2">
          <span className="text-[10px] uppercase font-semibold text-white/50 tracking-wider">User Account</span>
          <span className="text-sm font-medium text-white truncate mt-1">{user?.name}</span>
          <span className="text-xs text-white/70 truncate mt-0.5">{user?.email}</span>
        </div>
        <button
          onClick={logout}
          className="w-full text-white/80 hover:text-white hover:bg-white/10 flex items-center justify-start px-3 py-2 text-xs border border-white/20 hover:border-white/40 rounded-lg transition-colors font-medium tracking-wide uppercase text-[10px]"
        >
          <LogOut size={14} className="mr-2 text-white/95" />
          Log Out Session
        </button>
      </div>
    </aside>
  );
};
