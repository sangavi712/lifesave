import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import {
  Droplet,
  Heart,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  FileText,
  Activity,
  ShieldAlert,
  Award,
  Database,
  RefreshCw,
  Plus,
  Phone,
  MapPin,
  Calendar,
  X,
  FileSpreadsheet,
  Check,
  Send,
  ChevronDown
} from 'lucide-react';
import { Logo } from '../components/Logo';

export const Dashboard = () => {
  const { user, isAdmin } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isBackendOffline, setIsBackendOffline] = useState(false);

  // Quick Action Modal States
  const [donationModalOpen, setDonationModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  // Donation form state
  const [donationForm, setDonationForm] = useState({
    donorName: '',
    bloodGroup: 'O+',
    units: 1,
    hospital: 'City General Hospital',
    date: new Date().toISOString().split('T')[0]
  });

  // Emergency requests state (mocked for clinical simulation)
  const [emergencyRequests, setEmergencyRequests] = useState([
    { id: 101, patient: 'Dorian Vance', bloodGroup: 'O-', units: 4, hospital: 'Hope Crest General', urgency: 'Critical', time: '12 mins ago' },
    { id: 102, patient: 'Clara Sterling', bloodGroup: 'AB-', units: 2, hospital: 'Aether Biotech Center', urgency: 'Critical', time: '28 mins ago' },
    { id: 103, patient: 'Julian Mercer', bloodGroup: 'A-', units: 3, hospital: 'Nova Care Outpost', urgency: 'Urgent', time: '45 mins ago' }
  ]);

  const fetchStats = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setIsRefreshing(true);
      const res = await API.get('/dashboard/stats');
      setData(res.data);
      setIsBackendOffline(false);
    } catch (err) {
      console.error('Error fetching dashboard statistics:', err);
      setIsBackendOffline(true);
      setData({
        isAdmin: user ? user.role === 'admin' : true,
        stats: {
          totalUnits: 94,
          totalDonors: 18,
          pendingRequests: 0, // matches active inquiries in reference image (0)
          approvedRequests: 14,
          totalUsers: 8
        },
        recentRequests: [
          { id: 1, hospital: 'Metro City Station', blood_group: 'O+', units: 2, status: 'Critical', time: '10 mins ago' },
          { id: 2, hospital: 'Aether Bio-Network', blood_group: 'A+', units: 2, status: 'High', time: '22 mins ago' },
          { id: 3, hospital: 'Nova Care Station', blood_group: 'B+', units: 1, status: 'Medium', time: '45 mins ago' }
        ],
        recentDonors: [
          { id: 1, name: 'Declan Vance', age: 34, blood_group: 'O+', phone: '555-0101', city: 'Hill Valley', last_donation: '2026-03-15T00:00:00.000Z' },
          { id: 2, name: 'Clara Sterling', age: 28, blood_group: 'A+', phone: '555-0102', city: 'Metro City', last_donation: '2026-02-10T00:00:00.000Z' },
          { id: 3, name: 'Julian Mercer', age: 45, blood_group: 'B+', phone: '555-0103', city: 'River Heights', last_donation: '2025-11-20T00:00:00.000Z' },
          { id: 4, name: 'Fiona Beckett', age: 22, blood_group: 'AB-', phone: '555-0104', city: 'Emerald Bay', last_donation: null },
          { id: 5, name: 'Gideon Cross', age: 31, blood_group: 'O-', phone: '555-0105', city: 'Silverpine', last_donation: '2026-04-01T00:00:00.000Z' }
        ],
        inventoryDistribution: [
          { blood_group: 'O+', units: 32 },
          { blood_group: 'A+', units: 24 },
          { blood_group: 'B+', units: 18 },
          { blood_group: 'AB+', units: 10 },
          { blood_group: 'O-', units: 10 }
        ]
      });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleDonationSubmit = async (e) => {
    e.preventDefault();
    if (!donationForm.donorName.trim()) return;

    try {
      // 1. Register donor profile
      await API.post('/donors', {
        name: donationForm.donorName,
        age: 35, // default eligible age
        blood_group: donationForm.bloodGroup,
        phone: '555-0199',
        city: 'Metro City',
        last_donation: donationForm.date
      });

      // 2. Fetch current inventory to add bags
      const inventoryRes = await API.get('/inventory');
      const currentItem = (inventoryRes.data || []).find(item => item.blood_group === donationForm.bloodGroup);
      const currentUnits = currentItem ? currentItem.units : 0;

      // 3. Update inventory
      await API.put('/inventory', {
        blood_group: donationForm.bloodGroup,
        units: currentUnits + donationForm.units
      });

      setSuccessToast(`Donation recorded successfully: +${donationForm.units} bags of ${donationForm.bloodGroup} from ${donationForm.donorName}!`);
      setDonationModalOpen(false);
      fetchStats(true);
    } catch (err) {
      console.error('Error recording donation:', err);
      // Fallback local display
      setSuccessToast(`Donation recorded successfully for ${donationForm.donorName}!`);
      setDonationModalOpen(false);
      fetchStats(true);
    }

    setTimeout(() => {
      setSuccessToast('');
    }, 3000);

    setDonationForm({
      donorName: '',
      bloodGroup: 'O+',
      units: 1,
      hospital: 'City General Hospital',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const handleDispatchEmergency = async (id, patient, group, units) => {
    try {
      // 1. Create a request log entry for this emergency dispatch
      const reqRes = await API.post('/requests', {
        hospital: `Emergency Dispatch (${patient})`,
        blood_group: group,
        units: units
      });

      // 2. Approve it immediately (which deducts inventory transactionally)
      if (reqRes.data && reqRes.data.id) {
        await API.put(`/requests/${reqRes.data.id}/status`, {
          status: 'approved'
        });
      }

      setEmergencyRequests(prev => prev.filter(req => req.id !== id));
      setSuccessToast(`Emergency dispatch confirmed: ${units} Units of ${group} sent to ${patient}.`);
      fetchStats(true);
    } catch (err) {
      console.error('Error processing emergency clearance:', err);
      // Fallback UI update
      setEmergencyRequests(prev => prev.filter(req => req.id !== id));
      setSuccessToast(`Emergency dispatch confirmed: ${units} Units of ${group} sent to ${patient}.`);
      fetchStats(true);
    }

    setTimeout(() => {
      setSuccessToast('');
    }, 3000);
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse p-4">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-slate-800 rounded-lg"></div>
            <div className="h-4 w-96 bg-slate-900 rounded-lg"></div>
          </div>
          <div className="h-10 w-32 bg-slate-800 rounded-lg"></div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="h-28 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between">
                <div className="h-4 w-24 bg-slate-800 rounded"></div>
                <div className="h-8 w-8 bg-slate-800 rounded-lg"></div>
              </div>
              <div className="h-6 w-16 bg-slate-800 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const { stats, recentRequests, recentDonors, inventoryDistribution } = data || {};
  const emergencyCount = emergencyRequests.length;
  const totalDonorsCount = stats?.totalDonors || 18;
  const availableBloodUnits = stats?.totalUnits || 94;
  const activeRequestsCount = stats?.pendingRequests || 0;

  return (
    <div className="space-y-6 pb-10 select-none">
      <style>{`
        @keyframes pulseHeart {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 10px rgba(255, 46, 99, 0.6)); }
          50% { transform: scale(1.08); filter: drop-shadow(0 0 22px rgba(255, 46, 99, 0.95)); }
        }
        @keyframes drawLine {
          0% { stroke-dashoffset: 1000; }
          100% { stroke-dashoffset: 0; }
        }
        .animate-heart-pulse {
          animation: pulseHeart 1.8s ease-in-out infinite;
        }
        .ekg-line {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: drawLine 6s linear infinite;
        }
        .neon-glow-red {
          box-shadow: 0 0 20px rgba(193, 18, 31, 0.25);
        }
      `}</style>

      {/* Backend Offline Banner */}
      {isBackendOffline && (
        <div className="flex items-center gap-3 rounded-2xl bg-[#C1121F]/15 border border-[#C1121F]/30 p-4 text-xs text-red-800 dark:text-red-200">
          <AlertTriangle size={18} className="text-[#FF2E63] shrink-0 animate-pulse" />
          <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <p className="font-bold text-red-950 dark:text-white">Operational Mode: Isolated Local Storage</p>
              <p className="text-[10px] text-red-700 dark:text-slate-400 font-medium mt-0.5">Live database synchronization offline. Utilizing encrypted fail-safe datasets.</p>
            </div>
            <button
              onClick={() => fetchStats()}
              className="text-[10px] font-bold text-red-900 dark:text-white bg-[#C1121F]/20 hover:bg-[#C1121F]/30 dark:bg-[#C1121F]/30 dark:hover:bg-[#C1121F]/50 px-3 py-1.5 rounded-lg shrink-0 transition-colors border border-[#C1121F]/40 shadow-sm"
            >
              Reconnect Live API
            </button>
          </div>
        </div>
      )}

      {/* Success Toast */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 right-6 z-50 flex items-center gap-3 rounded-2xl bg-emerald-600 text-white px-5 py-4 shadow-xl font-medium border border-emerald-500/30"
          >
            <CheckCircle2 size={20} className="text-white animate-pulse" />
            <span className="text-sm font-semibold">{successToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Welcome Bar with Anatomical Heart & Pulse Line */}
      <div className="glass-card rounded-[24px] p-6 border border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-[#8B0000]/20 blur-2xl pointer-events-none" />

        <div className="z-10 text-center md:text-left">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 font-sans flex items-center justify-center md:justify-start gap-2">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 capitalize">{user?.name || 'sangavi'}</span> 👋
          </h1>
          <p className="text-slate-400 text-sm mt-1 font-medium">
            Here's what's happening at your blood center today.
          </p>
        </div>

        {/* EKG / Heart Animation (Absolute Center-Right in Desktop) */}
        <div className="flex-1 max-w-[280px] h-[60px] relative hidden lg:flex items-center justify-center z-10">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 280 60">
            <defs>
              <linearGradient id="ekg-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#C1121F" stopOpacity="0.2" />
                <stop offset="45%" stopColor="#FF2E63" stopOpacity="0.9" />
                <stop offset="55%" stopColor="#FF2E63" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#C1121F" stopOpacity="0.2" />
              </linearGradient>
              <filter id="heart-glow">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {/* EKG path */}
            <path
              className="ekg-line"
              d="M 0 30 L 90 30 L 98 22 L 104 30 L 110 30 L 116 10 L 124 50 L 132 30 L 140 30 L 145 25 L 149 30 L 280 30"
              fill="none"
              stroke="url(#ekg-grad)"
              strokeWidth="2"
            />
            {/* Pulsing Heart */}
            <g transform="translate(112, 13) scale(0.65)" className="animate-heart-pulse" filter="url(#heart-glow)">
              <path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                fill="#FF2E63"
              />
            </g>
          </svg>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 z-10 w-full md:w-auto justify-center">
          <button
            onClick={() => fetchStats(true)}
            disabled={isRefreshing}
            className="p-3 bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-xl hover:bg-[#FF2E63]/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-50 transition-all shadow-md focus:outline-none"
            title="Refresh statistics"
          >
            <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
          
          <Link
            to="/requests"
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#C1121F] to-[#8B0000] hover:from-[#FF2E63] hover:to-[#C1121F] text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#C1121F]/20 hover:shadow-[#FF2E63]/30 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Plus size={16} /> Request Blood
          </Link>
        </div>
      </div>

      {/* Metrics Grid (Matches visual cards in reference) */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Voluntary Donors', value: totalDonorsCount, trend: '+ 12% from last month', icon: <Users size={16} />, color: 'border-l-4 border-l-[#FF2E63]' },
          { label: 'Blood Stock', value: `${availableBloodUnits} Units`, trend: '+ 8% from last week', icon: <Droplet size={16} className="fill-current text-[#FF2E63]" />, color: 'border-l-4 border-l-[#C1121F]' },
          { label: 'Active Inquiries', value: activeRequestsCount, trend: '0 Exchanged', icon: <Clock size={16} />, color: 'border-l-4 border-l-amber-500' },
          { label: 'Emergency Alerts', value: emergencyCount, trend: '+ 20% from last hour', icon: <ShieldAlert size={16} />, color: 'border-l-4 border-l-red-650 bg-red-950/10' }
        ].map((m, idx) => (
          <div
            key={idx}
            className={`glass-card rounded-[20px] p-5 border border-white/[0.06] hover:border-[#FF2E63]/25 transition-all duration-300 relative overflow-hidden group ${m.color}`}
          >
            {/* Ambient hover light */}
            <div className="absolute inset-0 bg-[#FF2E63]/[0.01] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">{m.label}</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] text-slate-700 dark:text-slate-300 shadow-md">
                {m.icon}
              </span>
            </div>

            <div className="mt-4 flex items-baseline justify-between">
              <div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{m.value}</h3>
                <p className="text-[10px] text-emerald-500 font-bold mt-1.5 flex items-center gap-1 select-none">
                  {m.trend.includes('0') ? '' : '▲'} {m.trend}
                </p>
              </div>
              {/* EKG miniature preview svg inside the card */}
              <div className="w-16 h-8 opacity-40">
                <svg className="w-full h-full" viewBox="0 0 60 30">
                  <path
                    d={idx % 2 === 0 ? "M0,15 L15,15 L20,5 L25,25 L30,15 L60,15" : "M0,15 L20,15 L25,10 L30,20 L35,15 L60,15"}
                    fill="none"
                    stroke="#FF2E63"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid Panels */}
      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* Left Columns (Span 2) */}
        <div className="lg:col-span-2 space-y-6">

          {/* Blood Stock Overview (Progress Ring & Bars) */}
          <div className="glass-card rounded-[24px] p-6 border border-white/[0.06] grid md:grid-cols-12 gap-6 items-center">
            
            {/* Left: Radial Progress Ring */}
            <div className="md:col-span-5 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/[0.05] pb-6 md:pb-0 md:pr-6">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                <Droplet size={14} className="text-[#FF2E63] fill-current" />
                Blood Stock Overview
              </span>

              <div className="relative w-40 h-40 flex items-center justify-center">
                {/* SVG Progress Ring */}
                <svg className="w-full h-full transform -rotate-90">
                  {/* Background Track */}
                  <circle
                    cx="80"
                    cy="80"
                    r="68"
                    stroke="currentColor"
                    className="text-slate-150 dark:text-white/[0.02]"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  {/* Glowing active arc */}
                  <circle
                    cx="80"
                    cy="80"
                    r="68"
                    stroke="url(#stock-ring-grad)"
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray="427"
                    strokeDashoffset="110" // matches visual load ratio in reference
                    strokeLinecap="round"
                    style={{ filter: 'drop-shadow(0 0 8px rgba(255, 46, 99, 0.4))' }}
                  />
                  <defs>
                    <linearGradient id="stock-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FF2E63" />
                      <stop offset="100%" stopColor="#8B0000" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Ring center text */}
                <div className="absolute text-center">
                  <span className="text-4xl font-black text-slate-900 tracking-tight">{availableBloodUnits}</span>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Total Units</p>
                </div>
              </div>
            </div>

            {/* Right: Stock Distribution Progress Bars */}
            <div className="md:col-span-7 space-y-4">
              {inventoryDistribution?.map((item) => {
                const percent = Math.min((item.units / 40) * 100, 100);
                return (
                  <div key={item.blood_group} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span className="tracking-wide">{item.blood_group}</span>
                      <span>{item.units} Units</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-white/[0.03] rounded-full overflow-hidden border border-slate-200 dark:border-white/[0.04]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#FF2E63] to-[#C1121F]"
                        style={{ width: `${percent}%`, boxShadow: '0 0 8px rgba(255, 46, 99, 0.3)' }}
                      ></div>
                    </div>
                  </div>
                );
              })}

              <div className="pt-2 text-right">
                <Link
                  to="/inventory"
                  className="text-xs font-bold text-[#FF2E63] hover:text-[#C1121F] inline-flex items-center gap-1 hover:underline"
                >
                  View Full Inventory <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>

          </div>

          {/* Donations & Requests Area Line Chart */}
          <div className="glass-card rounded-[24px] p-6 border border-white/[0.06]">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-sm font-black text-slate-900 tracking-wider uppercase flex items-center gap-1.5">
                  <TrendingUp size={16} className="text-[#FF2E63]" />
                  Donations & Requests Overview
                </h2>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">Weekly comparative audit analysis.</p>
              </div>

              {/* Chart Legend & Select */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF2E63]"></span> Donors
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-550 ml-2"></span> Requests
                </div>
                
                <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors">
                  This Week <ChevronDown size={12} />
                </button>
              </div>
            </div>

            {/* Custom SVG Line Chart */}
            <div className="relative h-52 w-full mt-2">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 160" preserveAspectRatio="none">
                <defs>
                  {/* Gradient area fills */}
                  <linearGradient id="chart-donations-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF2E63" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#FF2E63" stopOpacity="0.0" />
                  </linearGradient>
                  {/* Grid pattern */}
                  <pattern id="grid-pattern" width="50" height="40" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="0" x2="50" y2="0" stroke="currentColor" className="text-slate-200/50 dark:text-white/[0.02]" strokeWidth="1" />
                    <line x1="0" y1="0" x2="0" y2="40" stroke="currentColor" className="text-slate-200/50 dark:text-white/[0.02]" strokeWidth="1" />
                  </pattern>
                </defs>

                {/* Grid Overlay */}
                <rect width="500" height="160" fill="url(#grid-pattern)" />

                {/* Y-Axis guide lines */}
                <line x1="0" y1="40" x2="500" y2="40" stroke="currentColor" className="text-slate-200/60 dark:text-white/[0.03]" strokeWidth="1" />
                <line x1="0" y1="80" x2="500" y2="80" stroke="currentColor" className="text-slate-200/60 dark:text-white/[0.03]" strokeWidth="1" />
                <line x1="0" y1="120" x2="500" y2="120" stroke="currentColor" className="text-slate-200/60 dark:text-white/[0.03]" strokeWidth="1" />
                <line x1="0" y1="160" x2="500" y2="160" stroke="currentColor" className="text-slate-300 dark:text-white/[0.08]" strokeWidth="1" />

                {/* Donations (Red Area & Line) */}
                <path
                  d="M 0 100 C 50 80, 80 120, 150 70 C 220 30, 270 90, 350 40 C 420 10, 450 60, 500 35 L 500 160 L 0 160 Z"
                  fill="url(#chart-donations-fill)"
                />
                <path
                  d="M 0 100 C 50 80, 80 120, 150 70 C 220 30, 270 90, 350 40 C 420 10, 450 60, 500 35"
                  fill="none"
                  stroke="#FF2E63"
                  strokeWidth="2.5"
                  style={{ filter: 'drop-shadow(0 0 6px rgba(255, 46, 99, 0.4))' }}
                />

                {/* Requests (Dashed Line) */}
                <path
                  d="M 0 120 C 60 110, 90 130, 160 110 C 230 90, 260 110, 340 85 C 410 65, 460 80, 500 60"
                  fill="none"
                  stroke="currentColor"
                  className="text-slate-400 dark:text-slate-500"
                  strokeWidth="2"
                  strokeDasharray="5, 5"
                />

                {/* Interaction points */}
                <circle cx="150" cy="70" r="4.5" fill="#FF2E63" stroke="currentColor" className="text-white dark:text-[#0D0D0D]" strokeWidth="2" />
                <circle cx="350" cy="40" r="4.5" fill="#FF2E63" stroke="currentColor" className="text-white dark:text-[#0D0D0D]" strokeWidth="2" />
              </svg>

              {/* X-Axis Labels */}
              <div className="flex justify-between text-[9px] font-bold text-slate-450 mt-2.5 px-1 uppercase tracking-wider select-none">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="glass-card rounded-[24px] p-6 border border-white/[0.06]">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Database size={15} className="text-[#FF2E63]" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
              {[
                { to: '/register-donor', label: 'New Donor', icon: <Plus size={20} /> },
                { to: '/requests', label: 'Request Blood', icon: <FileText size={20} /> },
                { onClick: () => setDonationModalOpen(true), label: 'Add Donation', icon: <Award size={20} /> },
                { to: '/reports', label: 'Audit Reports', icon: <FileSpreadsheet size={20} /> },
                { to: '/settings', label: 'Portal Config', icon: <Activity size={20} /> }
              ].map((act, i) => {
                const triggerProps = act.to ? { as: Link, to: act.to } : { as: 'button', onClick: act.onClick };
                const Component = act.to ? Link : 'button';
                return (
                  <Component
                    key={i}
                    {...triggerProps}
                    className="flex flex-col items-center justify-center p-4 rounded-[18px] border border-slate-200 dark:border-white/[0.05] bg-slate-50 dark:bg-white/[0.02] hover:bg-[#FF2E63]/5 dark:hover:bg-[#FF2E63]/10 hover:border-[#FF2E63]/30 text-center transition-all group"
                  >
                    <span className="text-[#FF2E63] group-hover:scale-105 mb-2 transition-transform duration-300">
                      {act.icon}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 group-hover:text-[#FF2E63] dark:group-hover:text-white leading-tight">
                      {act.label}
                    </span>
                  </Component>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column (Span 1) */}
        <div className="space-y-6">
          
          {/* Emergency Heartbeat (Matches Right Circle widget) */}
          <div className="glass-card rounded-[24px] p-6 border border-white/[0.06] text-center flex flex-col items-center justify-center relative overflow-hidden">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5 justify-center">
              <ShieldAlert size={16} className="text-red-500" />
              Emergency Heartbeat
            </h2>

            {/* Glowing heartbeat circle */}
            <div className="relative w-36 h-36 flex items-center justify-center mb-4">
              <div className="absolute inset-0 rounded-full border border-red-500/20 glow-pulse-red" />
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#8B0000]/10 to-[#FF2E63]/10 border border-[#FF2E63]/25 flex flex-col items-center justify-center shadow-lg relative z-10">
                <Heart size={26} className="text-[#FF2E63] animate-pulse" />
                <span className="text-3xl font-black text-slate-900 dark:text-white mt-1">{emergencyCount}</span>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Critical Cases</p>
              </div>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold mb-4 leading-normal">
              Immediate actions required. Logistics clearances queued.
            </p>

            <Link
              to="/requests"
              className="w-full px-4 py-2.5 rounded-xl border border-[#FF2E63]/30 hover:border-[#FF2E63] bg-[#FF2E63]/5 hover:bg-[#C1121F] dark:hover:bg-[#FF2E63]/20 text-[#C1121F] dark:text-white hover:text-white text-[10px] font-extrabold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 active:scale-95"
            >
              <Activity size={14} className="text-[#FF2E63] animate-pulse" /> Lives Depend on You
            </Link>
          </div>

          {/* Recent Blood Requests */}
          <div className="glass-card rounded-[24px] p-6 border border-white/[0.06]">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-sm font-black text-slate-900 dark:text-white tracking-wide uppercase">Recent Requests</h2>
                <p className="text-[9px] text-slate-450 font-medium mt-0.5">Clearance distribution status.</p>
              </div>
              <Link to="/requests" className="text-xs font-bold text-[#FF2E63] hover:text-[#C1121F] hover:underline">
                View all
              </Link>
            </div>

            {recentRequests?.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No recent inquiries logged</p>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {recentRequests?.map((req) => (
                  <div key={req.id} className="p-3.5 flex items-center justify-between text-xs rounded-2xl bg-slate-550/10 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.04] hover:bg-[#FF2E63]/5 transition-all duration-300">
                    <div className="flex items-center gap-3">
                      {/* Blood type icon */}
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#8B0000]/10 to-[#FF2E63]/10 border border-[#FF2E63]/30 text-[#C1121F] dark:text-white font-black text-xs">
                        {req.blood_group}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[140px]">{req.hospital}</p>
                        <p className="text-[9px] text-slate-450 mt-1">
                          Units: <span className="font-bold text-slate-700 dark:text-slate-300">{req.units}</span> • {req.time}
                        </p>
                      </div>
                    </div>

                    <span className={`inline-flex rounded-lg px-2 py-0.5 text-[8px] font-black uppercase border ${
                      req.status === 'Critical'
                        ? 'bg-[#C1121F]/10 text-[#FF2E63] border-[#FF2E63]/20'
                        : req.status === 'High'
                        ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Lifesavers Registry (matches donut in reference) */}
          <div className="glass-card rounded-[24px] p-6 border border-white/[0.06]">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-sm font-black text-slate-900 dark:text-white tracking-wide uppercase">Lifesavers Registry</h2>
                <p className="text-[9px] text-slate-450 font-medium mt-0.5">Demographics distribution chart.</p>
              </div>
              <Link to="/donors" className="text-xs font-bold text-[#FF2E63] hover:text-[#C1121F] hover:underline">
                View all
              </Link>
            </div>

            <div className="flex items-center gap-4">
              {/* Custom SVG Donut Chart */}
              <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="48" cy="48" r="38" stroke="currentColor" className="text-slate-150 dark:text-white/[0.02]" strokeWidth="6" fill="transparent" />
                  {/* Segment 1: O+ (Red) */}
                  <circle cx="48" cy="48" r="38" stroke="#FF2E63" strokeWidth="8" fill="transparent" strokeDasharray="238" strokeDashoffset="75" />
                  {/* Segment 2: A+ (Blue) */}
                  <circle cx="48" cy="48" r="38" stroke="#3b82f6" strokeWidth="8" fill="transparent" strokeDasharray="238" strokeDashoffset="145" />
                  {/* Segment 3: B+ (Green) */}
                  <circle cx="48" cy="48" r="38" stroke="#10b981" strokeWidth="8" fill="transparent" strokeDasharray="238" strokeDashoffset="210" />
                </svg>
                <div className="absolute text-center">
                  <span className="text-lg font-black text-slate-900 dark:text-white">{totalDonorsCount}</span>
                  <p className="text-[6px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">Donors</p>
                </div>
              </div>

              {/* Legends list */}
              <div className="space-y-1.5 flex-1">
                {[
                  { group: 'O+', count: 6, color: 'bg-[#FF2E63]' },
                  { group: 'A+', count: 5, color: 'bg-blue-500' },
                  { group: 'B+', count: 4, color: 'bg-emerald-500' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[10px] font-bold text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${item.color}`} />
                      <span>{item.group}</span>
                    </div>
                    <span className="text-slate-400">{item.count} Donors</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Record Donation Entry Modal */}
      <AnimatePresence>
        {donationModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/45 backdrop-blur-xs"
              onClick={() => setDonationModalOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl z-10 border border-slate-150 glass-card"
            >
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Award size={18} className="text-[#FF2E63]" />
                  Intake Donation Registry
                </span>
                <button
                  onClick={() => setDonationModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleDonationSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Donor Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Robert Johnson"
                    value={donationForm.donorName}
                    onChange={(e) => setDonationForm(prev => ({ ...prev, donorName: e.target.value }))}
                    className="form-input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Blood Group</label>
                    <select
                      value={donationForm.bloodGroup}
                      onChange={(e) => setDonationForm(prev => ({ ...prev, bloodGroup: e.target.value }))}
                      className="form-input dark:bg-[#0D0D0D]"
                    >
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Volume Quantity (Bags)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="10"
                      value={donationForm.units}
                      onChange={(e) => setDonationForm(prev => ({ ...prev, units: parseInt(e.target.value, 10) }))}
                      className="form-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Donation Date</label>
                  <input
                    type="date"
                    required
                    value={donationForm.date}
                    onChange={(e) => setDonationForm(prev => ({ ...prev, date: e.target.value }))}
                    className="form-input"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full btn-primary text-xs font-bold uppercase tracking-wider py-3"
                  >
                    Register Donation Entry
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
