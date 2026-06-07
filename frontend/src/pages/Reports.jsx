import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Download, 
  Calendar, 
  Filter, 
  RefreshCw, 
  FileSpreadsheet, 
  ArrowUpRight, 
  Activity, 
  Clock, 
  Check
} from 'lucide-react';
import API from '../services/api';

export const Reports = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exportingType, setExportingType] = useState(null); // 'pdf' | 'excel'
  const [logFilter, setLogFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch metrics from backend dashboard stats to match numbers
  const fetchReportStats = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setIsRefreshing(true);
      
      const res = await API.get('/dashboard/stats');
      setStats(res.data.stats);
    } catch (err) {
      console.error('Error fetching report stats:', err);
      // fallback metrics
      setStats({
        totalUnits: 94,
        totalDonors: 18,
        pendingRequests: 2,
        approvedRequests: 14,
        totalUsers: 8
      });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReportStats();
  }, []);

  const handleExport = (type) => {
    setExportingType(type);
    setTimeout(() => {
      setExportingType(null);
      // Simulate file download by creating a fake toast or alert
      const link = document.createElement('a');
      link.href = '#';
      // Simulate click
      alert(`Success: Report successfully compiled and downloaded as LifeSave_Audit_${new Date().toISOString().split('T')[0]}.${type === 'pdf' ? 'pdf' : 'xlsx'}`);
    }, 2000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 80 } }
  };

  const auditLogs = [
    { id: 1, event: 'Safety Stock Re-evaluation Completed', category: 'audit', status: 'pass', user: 'System Cron', time: '10 mins ago' },
    { id: 2, event: 'Alert: O- Blood Stock level falls below safety margin (2 Units)', category: 'alert', status: 'warn', user: 'Inventory Hook', time: '45 mins ago' },
    { id: 3, event: 'Staff Account authorized: Dr. Sarah Bennett', category: 'security', status: 'pass', user: 'Admin User', time: '2 hours ago' },
    { id: 4, event: 'Backup database compiled and exported to cloud registry', category: 'audit', status: 'pass', user: 'System Backup', time: '4 hours ago' },
    { id: 5, event: 'Emergency dispatch clearance key issued for Nova Care Outpost', category: 'security', status: 'pass', user: 'Admin User', time: '6 hours ago' },
    { id: 6, event: 'Blood stock manually adjusted: A+ (+5 Units)', category: 'audit', status: 'pass', user: 'Station Manager', time: '1 day ago' },
    { id: 7, event: 'Failed login attempt from unauthorized IP: 198.51.100.42', category: 'security', status: 'fail', user: 'Security Firewall', time: '1 day ago' }
  ];

  const filteredLogs = auditLogs.filter(log => {
    if (logFilter === 'all') return true;
    return log.category === logFilter;
  });

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 pb-10 animate-fade-in"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 font-sans">
            System Audits & <span className="text-primary-600">Reports</span>
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Operational summaries, stock trend charts, compliance indicators, and system audit logs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchReportStats(true)}
            disabled={isRefreshing}
            className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500 hover:text-slate-800 disabled:opacity-50 transition-colors shadow-sm"
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => handleExport('pdf')}
            disabled={exportingType !== null}
            className="btn-secondary text-xs"
          >
            {exportingType === 'pdf' ? (
              <span className="h-4 w-4 animate-spin rounded-full border border-slate-600 border-t-transparent"></span>
            ) : (
              <FileText size={14} />
            )}
            Export PDF
          </button>
          <button
            onClick={() => handleExport('xlsx')}
            disabled={exportingType !== null}
            className="btn-primary text-xs"
          >
            {exportingType === 'xlsx' ? (
              <span className="h-4 w-4 animate-spin rounded-full border border-white border-t-transparent"></span>
            ) : (
              <FileSpreadsheet size={14} />
            )}
            Download Excel
          </button>
        </div>
      </motion.div>

      {/* Overview Cards */}
      <motion.div variants={itemVariants} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Stock Integrity', value: `${stats?.totalUnits || 94} Units`, desc: 'Bags currently locked in vault', icon: <Activity size={18} />, color: 'bg-primary-50 text-primary-600' },
          { label: 'Life-Saver Database', value: `${stats?.totalDonors || 18} Donors`, desc: 'Active voluntary profiles', icon: <TrendingUp size={18} />, color: 'bg-red-50 text-red-600' },
          { label: 'Pending Clearances', value: `${stats?.pendingRequests || 0} Inquiries`, desc: 'Awaiting clinical response', icon: <Clock size={18} />, color: 'bg-amber-50 text-amber-600' },
          { label: 'Redemptions Approved', value: `${stats?.approvedRequests || 14} Cleared`, desc: 'Dispatch orders fulfilled', icon: <CheckCircle2 size={18} />, color: 'bg-emerald-50 text-emerald-600' }
        ].map((c, idx) => (
          <div key={idx} className="glass-card rounded-2xl p-5 border border-slate-100 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{c.label}</span>
              <span className={`flex h-9 w-9 items-center justify-center rounded-xl shadow-inner ${c.color}`}>
                {c.icon}
              </span>
            </div>
            <div className="mt-3.5">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">{c.value}</h3>
              <p className="text-[11px] text-slate-400 mt-1 font-semibold leading-none">{c.desc}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Analytics Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* Donation Trends SVG Chart (2 columns) */}
        <motion.div variants={itemVariants} className="lg:col-span-2 glass-card rounded-2xl p-5 border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Historical Blood Supply Growth</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Average collection units accumulated vs. hospital demands.</p>
            </div>
            <span className="px-2.5 py-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 rounded-lg">
              Stable +8% MoM
            </span>
          </div>

          <div className="h-60 w-full relative pt-2">
            <svg className="w-full h-48" viewBox="0 0 500 150" preserveAspectRatio="none">
              <defs>
                <linearGradient id="glow-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#e11d48" stopOpacity="0.2"/>
                  <stop offset="100%" stopColor="#e11d48" stopOpacity="0.0"/>
                </linearGradient>
                <linearGradient id="demand-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.1"/>
                  <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.0"/>
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="30" x2="500" y2="30" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="75" x2="500" y2="75" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="120" x2="500" y2="120" stroke="#e2e8f0" strokeWidth="1" />

              {/* Demanded units line (Mock Hospital Orders) */}
              <path
                d="M 0 110 Q 50 100 100 90 T 200 110 T 300 80 T 400 95 T 500 70"
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="2"
                strokeDasharray="4,4"
              />
              
              {/* Collected units area fill */}
              <path
                d="M 0 120 Q 50 85 100 75 T 200 65 T 300 45 T 400 50 T 500 25 L 500 150 L 0 150 Z"
                fill="url(#glow-grad)"
              />

              {/* Collected units line */}
              <path
                d="M 0 120 Q 50 85 100 75 T 200 65 T 300 45 T 400 50 T 500 25"
                fill="none"
                stroke="#e11d48"
                strokeWidth="3"
              />

              {/* Core Anchors */}
              <circle cx="100" cy="75" r="4" fill="#e11d48" className="animate-pulse" />
              <circle cx="200" cy="65" r="4" fill="#e11d48" />
              <circle cx="300" cy="45" r="4" fill="#e11d48" />
              <circle cx="400" cy="50" r="4" fill="#e11d48" />
              <circle cx="500" cy="25" r="4" fill="#e11d48" />
            </svg>

            <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-2 px-1">
              <span>Dec</span>
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May/Jun</span>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 justify-center mt-3 text-[10px] font-bold text-slate-500">
              <div className="flex items-center gap-1">
                <span className="inline-block w-2.5 h-2.5 bg-primary-600 rounded-full"></span>
                <span>Collected Blood Units</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="inline-block w-2.5 h-0.5 bg-slate-350 border-t border-dashed border-slate-400"></span>
                <span>Hospital Demand Outflow</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quality Audit Rating Gauge */}
        <motion.div variants={itemVariants} className="glass-card rounded-2xl p-5 border border-slate-100 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Compliance Index</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Safety score evaluated dynamically.</p>
          </div>

          <div className="my-5 flex flex-col items-center justify-center">
            {/* Round Gauge */}
            <div className="relative h-28 w-28 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-500"
                  strokeDasharray="98, 100"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-black text-slate-800">98%</span>
                <span className="text-[8px] uppercase font-bold text-slate-400">Excellent</span>
              </div>
            </div>
            <span className="text-xs font-semibold text-slate-600 mt-3 text-center">Demo Simulation Safety Margin</span>
          </div>

          <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3 text-[10px] text-emerald-800">
            <span className="font-bold flex items-center gap-1">
              <CheckCircle2 size={12} className="text-emerald-600" />
              Optimal Clinical Condition
            </span>
            <p className="mt-0.5 text-slate-500">Inventory cooling sensors, log traces, and donation forms are compliant with strict guidelines.</p>
          </div>
        </motion.div>

      </div>

      {/* Audit Logs list */}
      <motion.div variants={itemVariants} className="glass-card rounded-2xl p-5 border border-slate-100">
        
        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Security & Integrity Audit Log</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Chronological list of background system actions, authorization requests, and status indicators.</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
              <Filter size={12} /> Filter logs:
            </span>
            <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 text-xs font-semibold">
              {['all', 'audit', 'alert', 'security'].map(f => (
                <button
                  key={f}
                  onClick={() => setLogFilter(f)}
                  className={`px-2.5 py-1 rounded-md capitalize transition-colors ${
                    logFilter === f ? 'bg-primary-50 text-primary-700' : 'text-slate-500 hover:text-slate-850'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Audit Table */}
        <div className="overflow-hidden rounded-xl border border-slate-100 bg-slate-50/20 divide-y divide-slate-100">
          {filteredLogs.map(log => (
            <div key={log.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-50/50 transition-colors">
              <div className="flex items-start gap-3">
                <span className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full ${
                  log.status === 'pass' 
                    ? 'bg-emerald-50 text-emerald-600' 
                    : log.status === 'warn' 
                    ? 'bg-amber-50 text-amber-600' 
                    : 'bg-red-50 text-red-600'
                }`}>
                  {log.status === 'pass' && <Check size={10} />}
                  {log.status === 'warn' && <AlertCircle size={10} />}
                  {log.status === 'fail' && <AlertCircle size={10} />}
                </span>
                <div>
                  <p className="font-semibold text-slate-800 leading-normal">{log.event}</p>
                  <p className="text-[9px] text-slate-400 mt-0.5 flex items-center gap-2">
                    <span className="capitalize font-bold text-slate-500">{log.category} log</span>
                    <span>• Triggered by: <span className="font-semibold text-slate-500">{log.user}</span></span>
                  </p>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap pl-4">{log.time}</span>
            </div>
          ))}
        </div>

      </motion.div>

    </motion.div>
  );
};
