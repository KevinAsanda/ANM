import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { Button } from '../ui/Button.js';
import { LayoutDashboard, FileText, ClipboardList, Users, LogOut } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();

  const adminLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { to: '/tickets', label: 'Service Tickets', icon: <FileText size={20} /> },
    { to: '/inventory', label: 'Inventory', icon: <ClipboardList size={20} /> },
    { to: '/staff', label: 'Staff Directory', icon: <Users size={20} /> },
  ];

  const mechanicLinks = [
    { to: '/my-jobs', label: 'My Jobs', icon: <FileText size={20} /> },
  ];

  const links = user?.role === 'admin' ? adminLinks : mechanicLinks;

  return (
    <aside className="w-[240px] bg-slate-900 text-slate-100 flex flex-col h-screen fixed top-0 left-0 border-r border-slate-800">
      {/* Brand */}
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold tracking-tight text-white">ANM Workshop</h1>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {user?.role} Portal
        </span>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-4 py-6 flex flex-col gap-1.5">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md font-medium text-sm transition-colors ${
                isActive
                  ? 'bg-primary text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`
            }
          >
            {link.icon}
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* User Session Footer */}
      <div className="p-4 border-t border-slate-800 flex flex-col gap-3">
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-white truncate">{user?.name}</span>
          <span className="text-xs text-slate-400 truncate">{user?.email}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="w-full text-slate-400 hover:text-white hover:bg-slate-800 justify-start px-2 py-2 text-xs"
        >
          <LogOut size={16} className="mr-2" />
          Log Out
        </Button>
      </div>
    </aside>
  );
};
