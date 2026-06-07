import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { 
  Settings as SettingsIcon, 
  Shield, 
  Bell, 
  Building, 
  Users, 
  Save, 
  CheckCircle2, 
  Lock, 
  ShieldAlert,
  Sliders,
  Plus,
  User
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

export const Settings = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('profile');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Profile Customization state
  const [profileName, setProfileName] = useState('');
  const [profilePhoto, setProfilePhoto] = useState(null);

  useEffect(() => {
    if (user) {
      setProfileName(user.name || '');
      setProfilePhoto(user.profilePhoto || null);
    }
  }, [user]);

  // Clinic profile forms
  const [clinicName, setClinicName] = useState('Metro Biomedical Donor Center');
  const [facilityCode, setFacilityCode] = useState('BMS-MET-1002');
  const [leadPhysician, setLeadPhysician] = useState('Dr. Sarah Bennett');
  const [alertLevel, setAlertLevel] = useState('5'); // Units limit to trigger alerts

  // Toggle switch states
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [autoBackups, setAutoBackups] = useState(true);
  const [notifyLowStock, setNotifyLowStock] = useState(true);
  const [notifyEmergencies, setNotifyEmergencies] = useState(true);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (png, jpg, jpeg).');
      return;
    }

    // 200KB limits to prevent localStorage overflow
    if (file.size > 200 * 1024) {
      alert('Profile photo size exceeds 200KB. Please choose a smaller or compressed image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setProfilePhoto(uploadEvent.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setProfilePhoto(null);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');

    setTimeout(() => {
      setLoading(false);
      if (activeTab === 'profile') {
        updateProfile(profileName, profilePhoto);
        setSuccessMsg('Profile settings updated successfully.');
      } else {
        setSuccessMsg('Settings updated successfully. Facility configuration refreshed.');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      setTimeout(() => {
        setSuccessMsg('');
      }, 3000);
    }, 1000);
  };

  const tabs = [
    { id: 'profile', label: 'User Profile', icon: <User size={16} /> },
    { id: 'general', label: 'Facility General', icon: <Building size={16} /> },
    { id: 'alerts', label: 'Alert Profiles', icon: <Bell size={16} /> },
    { id: 'staff', label: 'Medical Staff', icon: <Users size={16} /> },
    { id: 'security', label: 'Security & Integrity', icon: <Shield size={16} /> }
  ];

  const staffList = [
    { id: 101, name: 'Dr. Sarah Bennett', email: 's.bennett@metrobiomed.local', role: 'Head Physician', status: 'Active' },
    { id: 102, name: 'David Henderson', email: 'd.henderson@metrobiomed.local', role: 'Station Manager', status: 'Active' },
    { id: 103, name: 'Jane Carter', email: 'j.carter@metrobiomed.local', role: 'Clinical Nurse', status: 'Active' },
    { id: 104, name: 'Alexander Vance', email: 'a.vance@metrobiomed.local', role: 'Lab Technologist', status: 'On Shift' }
  ];

  return (
    <div className="space-y-6 pb-10 animate-fade-in">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 font-sans">
          SaaS Portal <span className="text-primary-600">Settings</span>
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Configure clinic profiles, threshold notifications, user permissions, and compliance configurations.
        </p>
      </div>

      {/* Success Notification Banner */}
      {successMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-100 p-4 text-sm text-emerald-800"
        >
          <CheckCircle2 className="text-emerald-600 shrink-0" size={18} />
          <span className="font-semibold">{successMsg}</span>
        </motion.div>
      )}

      <div className="grid gap-6 md:grid-cols-4">
        
        {/* Left Side: Navigation Links (Vertical Tabs) */}
        <div className="space-y-2 md:col-span-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'bg-primary-50 text-primary-700 shadow-sm border-l-4 border-primary-600 pl-3'
                  : 'bg-white border border-slate-200/50 hover:bg-slate-50 text-slate-600 hover:text-slate-900 shadow-xs'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Right Side: Details Panels (Tab Contents) */}
        <div className="md:col-span-3">
          
          <form onSubmit={handleSave} className="space-y-6">
            
            {/* Panel 0: User Profile Settings */}
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl p-6 border border-slate-100 space-y-6"
              >
                <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
                  <User size={18} className="text-primary-600" />
                  User Profile Customization
                </h3>

                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Left: Avatar preview */}
                  <div className="relative flex flex-col items-center justify-center shrink-0">
                    <UserAvatar user={{ name: profileName, profilePhoto }} className="h-24 w-24 text-2xl" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Preview</span>
                  </div>

                  {/* Right: Upload controls */}
                  <div className="space-y-3 flex-1 w-full text-center sm:text-left">
                    <h4 className="text-xs font-bold text-slate-700 uppercase">Upload Profile Photo</h4>
                    <p className="text-[10px] text-slate-450 font-medium">
                      Accepts PNG, JPG, or GIF up to 5MB. Circular placeholder and theme border will apply automatically.
                    </p>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1">
                      <label className="btn-secondary text-xs px-4 py-2 cursor-pointer font-bold select-none border-dashed hover:border-[#FF2E63]/50">
                        <span>Choose Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                      {profilePhoto && (
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="btn-danger text-xs px-4 py-2 font-bold"
                        >
                          Remove Photo
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Display Name</label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="form-input"
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email Address (Read Only)</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      className="form-input opacity-70 bg-slate-50/50 cursor-not-allowed"
                      disabled
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Panel 1: General Facility Configuration */}
            {activeTab === 'general' && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl p-6 border border-slate-100 space-y-4"
              >
                <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
                  <Building size={18} className="text-primary-600" />
                  Facility Information Settings
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Clinic Center Name</label>
                    <input
                      type="text"
                      value={clinicName}
                      onChange={(e) => setClinicName(e.target.value)}
                      className="form-input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Clinical Code (Simulation Index)</label>
                    <input
                      type="text"
                      value={facilityCode}
                      onChange={(e) => setFacilityCode(e.target.value)}
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Lead Officer on Shift</label>
                    <input
                      type="text"
                      value={leadPhysician}
                      onChange={(e) => setLeadPhysician(e.target.value)}
                      className="form-input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Facility Country / Node</label>
                    <select className="form-input">
                      <option value="US-EAST">Metro City (MC Node)</option>
                      <option value="US-WEST">Hill Valley (HV Node)</option>
                      <option value="UK-LON">United Kingdom (London)</option>
                      <option value="EU-GER">Germany (Berlin)</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Panel 2: Safety & Alerts Settings */}
            {activeTab === 'alerts' && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl p-6 border border-slate-100 space-y-4"
              >
                <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
                  <Bell size={18} className="text-primary-600" />
                  Inventory Alert Settings & Safety Rules
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                      Low Stock Threshold Warning (Units)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={alertLevel}
                        onChange={(e) => setAlertLevel(e.target.value)}
                        className="form-input w-28"
                        required
                      />
                      <span className="text-xs text-slate-400 font-medium leading-normal">
                        Triggers automatic email alert warnings to shift supervisors when stock of any blood group falls below this line.
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-800">Email Alerts on Critical Scarcity</p>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Alert supervisor immediately when stock hits 0 units.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setNotifyLowStock(!notifyLowStock)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          notifyLowStock ? 'bg-primary-600' : 'bg-slate-200'
                        }`}
                      >
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          notifyLowStock ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-50 pt-3">
                      <div>
                        <p className="text-xs font-bold text-slate-800">Hospital Emergency Dispatch Clearances</p>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Require multi-step approval for outbound critical dispatches.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setNotifyEmergencies(!notifyEmergencies)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          notifyEmergencies ? 'bg-primary-600' : 'bg-slate-200'
                        }`}
                      >
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          notifyEmergencies ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Panel 3: Medical Staff Settings */}
            {activeTab === 'staff' && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl p-6 border border-slate-100 space-y-4"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Users size={18} className="text-primary-600" />
                    Shift Personnel & Authorized Medical Staff
                  </h3>
                  <button
                    type="button"
                    className="btn-primary text-[10px] px-2.5 py-1.5 flex items-center gap-1 font-extrabold"
                    onClick={() => alert('Add staff form')}
                  >
                    <Plus size={12} /> Add Member
                  </button>
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-100 bg-slate-50/20 divide-y divide-slate-100">
                  {staffList.map((st) => (
                    <div key={st.id} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50/30 transition-colors">
                      <div>
                        <p className="font-bold text-slate-800">{st.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{st.email} • <span className="font-semibold text-slate-500">{st.role}</span></p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {st.status}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Panel 4: Security & Integrity configurations */}
            {activeTab === 'security' && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl p-6 border border-slate-100 space-y-4"
              >
                <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
                  <Lock size={18} className="text-primary-600" />
                  Security Protocols & Audit Controls
                </h3>

                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800">Two-Factor Authentication (2FA)</p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Require 2FA authorization token codes for all admin operations.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMfaEnabled(!mfaEnabled)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        mfaEnabled ? 'bg-primary-600' : 'bg-slate-200'
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        mfaEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-50 pt-3">
                    <div>
                      <p className="font-bold text-slate-800">Database Auto-Backups</p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Encrypt and back up blood logs hourly to secured repository vault storage.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAutoBackups(!autoBackups)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        autoBackups ? 'bg-primary-600' : 'bg-slate-200'
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        autoBackups ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  <div className="border-t border-slate-100 pt-4">
                    <span className="flex items-start gap-2 text-[10px] text-amber-800 bg-amber-50/50 border border-amber-100 p-3.5 rounded-xl font-semibold">
                      <ShieldAlert size={16} className="text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p>SaaS Access Audit Integrity</p>
                        <p className="text-slate-500 font-normal mt-0.5">
                          Every configuration update logs your administrative signature and facility node ID under standard simulation audit profiles.
                        </p>
                      </div>
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Save Buttons Row */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary px-6 py-2.5 flex items-center gap-2"
              >
                {loading ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                ) : (
                  <>
                    <Save size={16} /> Save Configuration
                  </>
                )}
              </button>
            </div>

          </form>

        </div>

      </div>

    </div>
  );
};
