import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Logo } from './Logo';
import {
  LayoutDashboard,
  HeartHandshake,
  Search,
  FileText,
  Warehouse,
  Mail,
  X,
  Settings,
  FileSpreadsheet
} from 'lucide-react';

export const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user } = useContext(AuthContext);

  const links = [
    {
      to: '/',
      label: 'Dashboard',
      icon: <LayoutDashboard size={18} />,
      roles: ['user', 'admin'],
    },
    {
      to: '/register-donor',
      label: 'Become Donor',
      icon: <HeartHandshake size={18} />,
      roles: ['user', 'admin'],
    },
    {
      to: '/donors',
      label: 'Search Donors',
      icon: <Search size={18} />,
      roles: ['user', 'admin'],
    },
    {
      to: '/requests',
      label: 'Blood Requests',
      icon: <FileText size={18} />,
      roles: ['user', 'admin'],
    },
    {
      to: '/inventory',
      label: 'Blood Inventory',
      icon: <Warehouse size={18} />,
      roles: ['user', 'admin'],
    },
    {
      to: '/reports',
      label: 'Audit Reports',
      icon: <FileSpreadsheet size={18} />,
      roles: ['user', 'admin'],
    },
    {
      to: '/settings',
      label: 'SaaS Settings',
      icon: <Settings size={18} />,
      roles: ['user', 'admin'],
    },
    {
      to: '/contact',
      label: 'Contact Us',
      icon: <Mail size={18} />,
      roles: ['user', 'admin'],
    },
  ];

  if (!user) return null;

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/30 backdrop-blur-xs md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 transform border-r border-slate-200/60 bg-white p-4 transition-transform duration-300 ease-in-out md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 md:hidden">
          <span className="font-bold text-slate-800 flex items-center gap-1.5 text-sm uppercase tracking-wider">
            <Logo mode="icon" className="w-5 h-5" />
            Navigation Menu
          </span>
          <button
            onClick={toggleSidebar}
            className="rounded-xl p-1.5 text-slate-500 hover:bg-slate-50 border border-transparent hover:border-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Link List */}
        <nav className="mt-4 flex flex-col gap-1">
          {links
            .filter((link) => link.roles.includes(user.role))
            .map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => {
                  if (window.innerWidth < 768) {
                    toggleSidebar();
                  }
                }}
                className={({ isActive }) =>
                  `relative flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 group ${
                    isActive
                      ? 'bg-gradient-to-r from-[#C1121F]/20 to-transparent text-[#FF2E63] font-bold border-l-4 border-[#FF2E63] pl-3 shadow-[inset_0_1px_1px_rgba(255,46,99,0.1)]'
                      : 'text-slate-500 hover:bg-[#FF2E63]/5 hover:text-[#C1121F] dark:text-slate-400 dark:hover:bg-[#FF2E63]/10 dark:hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={`transition-colors duration-300 ${
                      isActive ? 'text-[#FF2E63]' : 'text-slate-500 group-hover:text-[#C1121F] dark:group-hover:text-white'
                    }`}>
                      {link.icon}
                    </span>
                    <span>{link.label}</span>
                  </>
                )}
              </NavLink>
            ))}
        </nav>
      </aside>
    </>
  );
};
