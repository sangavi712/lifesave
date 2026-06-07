import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import API from '../services/api';
import { Warehouse, Plus, AlertCircle, CheckCircle2, BarChart2, ShieldAlert, Clock } from 'lucide-react';

export const Inventory = () => {
  const { isAdmin } = useContext(AuthContext);
  const location = useLocation();
  const [inventory, setInventory] = useState([]);
  const searchParams = new URLSearchParams(location.search);
  const querySearch = searchParams.get('search') || '';

  const filteredInventory = inventory.filter(item => {
    if (!querySearch) return true;
    return item.blood_group.toLowerCase().includes(querySearch.toLowerCase());
  });
  
  // Admin form state
  const [bloodGroup, setBloodGroup] = useState('');
  const [units, setUnits] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await API.get('/inventory');
      setInventory(res.data);
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setErrorMsg('Failed to fetch blood bank stock levels. Please verify connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleUpdateInventory = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!bloodGroup || units === '') {
      setErrorMsg('Please select a blood group and enter units count.');
      return;
    }

    const unitsNum = parseInt(units, 10);
    if (isNaN(unitsNum) || unitsNum < 0) {
      setErrorMsg('Units must be a non-negative number.');
      return;
    }

    setFormLoading(true);
    try {
      const res = await API.put('/inventory', {
        blood_group: bloodGroup,
        units: unitsNum,
      });

      setSuccessMsg(`Audited stock updated: Blood Group ${bloodGroup} set to ${unitsNum} units.`);
      setBloodGroup('');
      setUnits('');
      
      // Update local state directly
      setInventory(prev =>
        prev.map(item => (item.blood_group === bloodGroup ? res.data : item))
      );
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update blood inventory levels.');
    } finally {
      setFormLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 pb-10"
    >
      
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 font-sans">
          Blood Bank <span className="text-primary-600">Inventory</span>
        </h1>
        <p className="text-slate-550 text-sm mt-0.5 font-medium">
          Check live stock levels in regional cooling vaults. Station administrators can adjust values manually during donations or audits.
        </p>
      </motion.div>

      {/* Action Banners */}
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

      {errorMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 rounded-2xl bg-red-50 border border-red-100 p-4 text-xs text-red-805"
        >
          <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={18} />
          <div>
            <p className="font-bold">Inventory Sync Refused</p>
            <p className="text-red-600 font-medium mt-0.5">{errorMsg}</p>
          </div>
        </motion.div>
      )}

      {/* Grid Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* Left Column: Admin Adjuster / Warning Panel */}
        <div className="lg:col-span-1">
          {isAdmin ? (
            <motion.div variants={itemVariants} className="glass-card rounded-2xl p-5 border border-slate-150 h-fit space-y-4">
              <h2 className="text-sm font-black text-slate-500 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
                <Warehouse size={18} className="text-primary-600" />
                Adjust Stock Quantity
              </h2>
              <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                Manually calibrate stock counts following audits, blood drives, or direct redemptions. Values will overwrite previous database levels.
              </p>

              <form onSubmit={handleUpdateInventory} className="space-y-4 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-550 uppercase mb-2">Target Blood Group</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="form-input text-xs font-semibold"
                    required
                  >
                    <option value="">Select blood type...</option>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-550 uppercase mb-2">New Units count (Bags)</label>
                  <input
                    type="number"
                    placeholder="e.g. 25"
                    value={units}
                    onChange={(e) => setUnits(e.target.value)}
                    className="form-input"
                    min="0"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full btn-primary text-xs font-bold uppercase tracking-wider py-3 mt-2 shadow-md"
                >
                  {formLoading ? (
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  ) : (
                    <>
                      <Plus size={14} /> Update Inventory
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div variants={itemVariants} className="glass-card rounded-2xl p-5 border border-slate-150 h-fit space-y-3">
              <ShieldAlert size={26} className="text-slate-400" />
              <h3 className="font-extrabold text-slate-800 text-sm">Write Access Restricted</h3>
              <p className="text-[10px] text-slate-450 font-semibold leading-relaxed">
                Standard user logins are restricted to read-only views for clinical integrity. Please consult shift supervisors to audit stock changes.
              </p>
            </motion.div>
          )}
        </div>

        {/* Right Columns: Inventory Visualizer Grid (Span 2) */}
        <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6 border border-slate-150 lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart2 size={18} className="text-slate-400" />
              Vault Room Stocks distribution
            </h2>
            <span className="text-[10px] font-bold text-slate-400">Total Capacity Scale: 40 Bags</span>
          </div>

          {loading ? (
            <div className="flex min-h-[200px] items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-primary-600"></div>
            </div>
          ) : filteredInventory.length === 0 ? (
            <p className="text-xs text-slate-550 py-8 text-center bg-slate-50/50 rounded-xl">
              {querySearch ? `No inventory matching "${querySearch}"` : 'Inventory empty.'}
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {filteredInventory.map((item) => {
                const maxCap = 40;
                const percentage = Math.min((item.units / maxCap) * 100, 100);
                
                let stockStatus = 'Stable';
                let statusColor = 'text-emerald-700 bg-emerald-50 border-emerald-100/40';
                
                if (item.units === 0) {
                  stockStatus = 'Depleted';
                  statusColor = 'text-rose-700 bg-rose-100 border-rose-200/40 animate-pulse';
                } else if (item.units <= 5) {
                  stockStatus = 'Critical Low';
                  statusColor = 'text-red-700 bg-red-50 border-red-100/40';
                } else if (item.units <= 12) {
                  stockStatus = 'Moderate';
                  statusColor = 'text-amber-700 bg-amber-50 border-amber-100/40';
                }

                return (
                  <div key={item.id} className="p-4 rounded-2xl border border-slate-150/60 bg-slate-50/10 hover:shadow-2xs transition-all relative overflow-hidden flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600 font-black text-xs border border-red-100/30">
                          {item.blood_group}
                        </span>
                        <div>
                          <p className="text-xs font-bold text-slate-805">Type {item.blood_group}</p>
                          <p className="text-[8px] text-slate-400 font-semibold flex items-center gap-0.5">
                            <Clock size={8} /> {new Date(item.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase border ${statusColor}`}>
                        {stockStatus}
                      </span>
                    </div>

                    <div className="mt-2.5">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="text-xl font-black text-slate-900 tracking-tight">{item.units} <span className="text-[10px] font-semibold text-slate-400">Bags</span></span>
                        <span className="text-[9px] font-bold text-slate-400">{Math.round(percentage)}%</span>
                      </div>
                      
                      {/* Gauge bar */}
                      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden mt-1.5">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            item.units === 0
                              ? 'bg-slate-200'
                              : item.units <= 5
                              ? 'bg-red-550'
                              : item.units <= 12
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

      </div>

    </motion.div>
  );
};
