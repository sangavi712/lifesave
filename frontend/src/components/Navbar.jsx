import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { Logo } from './Logo';
import API from '../services/api';
import { 
  Droplet, 
  LogOut, 
  Menu, 
  User, 
  Shield, 
  Compass, 
  Search, 
  Bell, 
  AlertCircle, 
  Info, 
  CheckCircle2,
  Settings
} from 'lucide-react';

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0][0].toUpperCase();
};

const UserAvatar = ({ user, className = "" }) => {
  const borderClasses = "border border-[#FF2E63]/30 dark:border-[#FF2E63]/50";
  if (user?.profilePhoto) {
    return (
      <img
        src={user.profilePhoto}
        alt={user.name}
        className={`rounded-full object-cover shrink-0 ${borderClasses} ${className}`}
      />
    );
  }
  return (
    <div className={`rounded-full bg-gradient-to-br from-[#8B0000]/15 to-[#FF2E63]/25 dark:from-[#8B0000]/30 dark:to-[#FF2E63]/40 text-[#FF2E63] font-bold flex items-center justify-center select-none shrink-0 ${borderClasses} ${className}`}>
      {getInitials(user?.name)}
    </div>
  );
};

export const Navbar = ({ toggleSidebar }) => {
  const { user, logout, isAdmin } = useContext(AuthContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isSearchingFocused, setIsSearchingFocused] = useState(false);
  const navigate = useNavigate();

  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim().length < 2) {
      setSearchResults(null);
      return;
    }

    setSearchLoading(true);
    try {
      const donorsRes = await API.get('/donors', { params: { search: query, limit: 5 } });
      const donors = donorsRes.data.donors || [];

      const inventoryRes = await API.get('/inventory');
      const inventory = (inventoryRes.data || []).filter(item => 
        item.blood_group.toLowerCase().includes(query.toLowerCase())
      );

      const requestsRes = await API.get('/requests');
      const requests = (requestsRes.data.requests || []).filter(item => 
        item.hospital.toLowerCase().includes(query.toLowerCase()) ||
        item.blood_group.toLowerCase().includes(query.toLowerCase())
      );

      setSearchResults({ donors, inventory, requests });
    } catch (err) {
      console.error('Error in navbar search:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleResultClick = (path, searchVal) => {
    setIsSearchingFocused(false);
    setSearchQuery('');
    setSearchResults(null);
    if (searchVal) {
      if (window.location.pathname === path) {
        window.location.href = `${path}?search=${encodeURIComponent(searchVal)}`;
      } else {
        navigate(`${path}?search=${encodeURIComponent(searchVal)}`);
      }
    } else {
      if (window.location.pathname === path) {
        window.location.reload();
      } else {
        navigate(path);
      }
    }
  };

  // Mock Notifications for the hospital-grade dashboard feel
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'CRITICAL: O- Blood shortage at Valley Health Clinic', type: 'critical', time: '5m ago' },
    { id: 2, text: 'New donor registered: Sarah Davis (AB-)', type: 'info', time: '42m ago' },
    { id: 3, text: 'URGENT: AB+ request approved for City Hospital', type: 'success', time: '2h ago' }
  ]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'critical':
        return <AlertCircle size={16} className="text-red-500 flex-shrink-0 animate-pulse" />;
      case 'success':
        return <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />;
      default:
        return <Info size={16} className="text-blue-500 flex-shrink-0" />;
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/50 bg-white/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left Side: Brand and Sidebar Toggle */}
        <div className="flex items-center gap-4">
          {user && (
            <button
              onClick={toggleSidebar}
              className="rounded-xl p-2 text-slate-500 hover:bg-slate-50 border border-transparent hover:border-slate-100 md:hidden transition-colors"
            >
              <Menu size={20} />
            </button>
          )}
          <Link to="/" className="flex items-center gap-2 group hover:scale-[1.02] active:scale-[0.98] transition-all duration-300">
            <Logo mode="navbar" />
          </Link>
        </div>

        {/* Center: Search Bar */}
        {user && (
          <div className="hidden md:flex flex-1 max-w-sm lg:max-w-md mx-6 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search donor base, stock, hospitals..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => setIsSearchingFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchingFocused(false), 200)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10 transition-all text-slate-800 dark:text-white dark:bg-zinc-900/60 dark:border-zinc-800 dark:focus:bg-zinc-900 placeholder:text-slate-400"
            />
            {isSearchingFocused && searchQuery.trim().length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl border border-slate-150 bg-white p-2.5 shadow-xl glass-card max-h-80 overflow-y-auto animate-fade-in text-slate-800">
                {searchLoading ? (
                  <div className="flex py-6 items-center justify-center">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-primary-600"></div>
                  </div>
                ) : !searchResults || (searchResults.donors.length === 0 && searchResults.inventory.length === 0 && searchResults.requests.length === 0) ? (
                  <div className="py-6 text-center text-xs text-slate-400 dark:text-slate-300 font-semibold">
                    No matches found for "{searchQuery}"
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Donors section */}
                    {searchResults.donors.length > 0 && (
                      <div>
                        <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-zinc-800">
                          Voluntary Donors
                        </div>
                        <div className="mt-1 space-y-0.5">
                          {searchResults.donors.map(donor => (
                            <button
                              key={donor.id}
                              onMouseDown={() => handleResultClick('/donors', donor.name)}
                              className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 dark:hover:bg-white/[0.05] rounded-lg transition-colors flex items-center justify-between group"
                            >
                              <span className="text-xs text-slate-700 dark:text-slate-200 font-semibold group-hover:text-primary-600 dark:group-hover:text-[#FF2E63]">{donor.name}</span>
                              <span className="text-[10px] font-black text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-100/50 dark:border-red-900/30 px-1.5 py-0.5 rounded">
                                {donor.blood_group}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Inventory section */}
                    {searchResults.inventory.length > 0 && (
                      <div>
                        <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-zinc-800">
                          Blood Inventory
                        </div>
                        <div className="mt-1 space-y-0.5">
                          {searchResults.inventory.map(item => (
                            <button
                              key={item.id}
                              onMouseDown={() => handleResultClick('/inventory', item.blood_group)}
                              className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 dark:hover:bg-white/[0.05] rounded-lg transition-colors flex items-center justify-between group"
                            >
                              <span className="text-xs text-slate-700 dark:text-slate-200 font-semibold group-hover:text-primary-600 dark:group-hover:text-[#FF2E63]">Blood Group {item.blood_group}</span>
                              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                                {item.units} Bags Available
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Requests section */}
                    {searchResults.requests.length > 0 && (
                      <div>
                        <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-zinc-800">
                          Hospital Requests
                        </div>
                        <div className="mt-1 space-y-0.5">
                          {searchResults.requests.map(req => (
                            <button
                              key={req.id}
                              onMouseDown={() => handleResultClick('/requests', req.hospital)}
                              className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 dark:hover:bg-white/[0.05] rounded-lg transition-colors flex items-center justify-between group"
                            >
                              <div className="min-w-0 flex-1">
                                <p className="text-xs text-slate-700 dark:text-slate-200 font-semibold truncate group-hover:text-primary-600 dark:group-hover:text-[#FF2E63]">{req.hospital}</p>
                                <p className="text-[9px] text-slate-450 dark:text-slate-400 font-medium mt-0.5 capitalize">{req.status} status</p>
                              </div>
                              <span className="text-[10px] font-black text-rose-650 bg-rose-50 border border-rose-100/50 px-1.5 py-0.5 rounded shrink-0">
                                {req.blood_group} ({req.units} bags)
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Right Side: Navigation & Profile Dropdown */}
        <div className="flex items-center gap-3">
          {!user ? (
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link
                to="/login"
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-primary-600 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="rounded-xl bg-primary-600 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-primary-700 shadow-md shadow-primary-600/10 hover:shadow-primary-600/20 transition-all"
              >
                Register
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <ThemeToggle />
              
              {/* Notification Icon & Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setNotificationsOpen(!notificationsOpen);
                    setDropdownOpen(false);
                  }}
                  className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 border border-slate-100 transition-all"
                >
                  <Bell size={18} />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary-600 text-[9px] font-bold text-white ring-2 ring-white animate-pulse">
                      {notifications.length}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setNotificationsOpen(false)}
                    ></div>
                    
                    <div className="absolute right-0 mt-2.5 z-50 w-80 rounded-2xl border border-slate-150 bg-white p-2.5 shadow-xl glass-card animate-fade-in">
                      <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-slate-100">
                        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Alert Center</span>
                        <span className="text-[10px] font-semibold text-primary-600 cursor-pointer hover:underline" onClick={() => setNotifications([])}>Clear all</span>
                      </div>
                      
                      <div className="mt-1 divide-y divide-slate-50 max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="py-6 text-center text-xs text-slate-400">No new alerts</div>
                        ) : (
                          notifications.map((notif) => (
                            <div key={notif.id} className="flex gap-2.5 p-2.5 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
                              {getNotificationIcon(notif.type)}
                              <div className="flex-1">
                                <p className="text-[11px] text-slate-700 font-medium leading-normal">{notif.text}</p>
                                <span className="text-[9px] text-slate-400 font-medium mt-0.5 block">{notif.time}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setDropdownOpen(!dropdownOpen);
                    setNotificationsOpen(false);
                  }}
                  className="flex items-center gap-2 rounded-xl p-1 hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all"
                type="button"
              >
                <UserAvatar user={user} className="h-8 w-8 text-xs" />
                <div className="hidden text-left sm:block pr-1">
                  <p className="text-xs font-bold text-slate-800 leading-none">
                    {user.name}
                  </p>
                  <p className="text-[9px] text-slate-450 font-semibold mt-0.5 flex items-center gap-0.5 capitalize">
                    {isAdmin && <Shield size={9} className="text-primary-650" />}
                    {user.role}
                  </p>
                </div>
              </button>

                {dropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setDropdownOpen(false)}
                    ></div>
                    
                    <div className="absolute right-0 mt-2.5 z-50 w-52 rounded-2xl border border-slate-150 bg-white p-1.5 shadow-xl glass-card animate-fade-in">
                      <div className="px-3 py-2 border-b border-slate-100 flex items-center gap-2.5">
                        <UserAvatar user={user} className="h-9 w-9 text-xs" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-800 truncate">{user.name}</p>
                          <p className="text-[10px] text-slate-450 truncate mt-0.5">{user.email}</p>
                        </div>
                      </div>
                      <Link
                        to="/settings"
                        onClick={() => setDropdownOpen(false)}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-slate-600 hover:bg-slate-50 transition-colors font-medium"
                      >
                        <Settings size={14} className="text-slate-400" />
                        SaaS Settings
                      </Link>
                      <Link
                        to="/contact"
                        onClick={() => setDropdownOpen(false)}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-slate-600 hover:bg-slate-50 transition-colors font-medium"
                      >
                        <Compass size={14} className="text-slate-400" />
                        Support Help
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50 transition-colors font-semibold border-t border-slate-50 mt-1"
                      >
                        <LogOut size={14} className="text-red-500" />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>

            </div>
          )}
        </div>

      </div>
    </header>
  );
};
