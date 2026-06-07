import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../services/api';
import { FileText, PlusCircle, AlertCircle, CheckCircle2, Trash2, Clock, Check, X, Building, BarChart2 } from 'lucide-react';

export const BloodRequests = () => {
  const { user, isAdmin } = useContext(AuthContext);
  const location = useLocation();
  const [requests, setRequests] = useState([]);
  const searchParams = new URLSearchParams(location.search);
  const querySearch = searchParams.get('search') || '';

  const filteredRequests = requests.filter(req => {
    if (!querySearch) return true;
    return req.hospital.toLowerCase().includes(querySearch.toLowerCase()) ||
           req.blood_group.toLowerCase().includes(querySearch.toLowerCase());
  });
  
  // Form state
  const [hospital, setHospital] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [units, setUnits] = useState('');
  
  // Statuses
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [formLoading, setFormLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await API.get('/requests', {
        params: {
          status: filterStatus || undefined,
          limit: 50
        }
      });
      setRequests(res.data.requests);
    } catch (err) {
      console.error('Error fetching blood requests:', err);
      setErrorMsg('Failed to fetch blood requests. Check your station configuration.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filterStatus]);

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!hospital || !bloodGroup || !units) {
      setErrorMsg('Please fill in all clinical request fields.');
      return;
    }

    const unitsCount = parseInt(units, 10);
    if (isNaN(unitsCount) || unitsCount <= 0) {
      setErrorMsg('Requested volume must be greater than 0.');
      return;
    }

    setFormLoading(true);
    try {
      await API.post('/requests', {
        hospital,
        blood_group: bloodGroup,
        units: unitsCount,
      });

      setSuccessMsg('Blood intake request registered successfully. Shift supervisors notified.');
      setHospital('');
      setBloodGroup('');
      setUnits('');
      fetchRequests();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit blood request.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setActionLoading(prev => ({ ...prev, [id]: true }));

    try {
      const res = await API.put(`/requests/${id}/status`, { status });
      setSuccessMsg(`Request successfully ${status}.`);
      
      // Update local state directly
      setRequests(prev => prev.map(req => req.id === id ? res.data : req));
    } catch (err) {
      setErrorMsg(err.response?.data?.message || `Failed to update request to ${status}.`);
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleDeleteRequest = async (id) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!window.confirm('Are you sure you want to delete this order?')) return;

    try {
      await API.delete(`/requests/${id}`);
      setSuccessMsg('Request successfully deleted from archive.');
      setRequests(prev => prev.filter(req => req.id !== id));
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to delete request.');
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
          {isAdmin ? 'Intake Clearances' : 'Blood Inquiries'}
        </h1>
        <p className="text-slate-550 text-sm mt-0.5 font-medium">
          {isAdmin 
            ? 'Review, approve, or reject blood requests submitted by hospitals and clinical networks.' 
            : 'Request urgent blood units or track compatibility logs of your existing requests.'}
        </p>
      </motion.div>

      {/* Notifications */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-100 p-4 text-sm text-emerald-800"
          >
            <CheckCircle2 className="text-emerald-600 shrink-0" size={18} />
            <span className="font-semibold">{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-3 rounded-2xl bg-red-50 border border-red-100 p-4 text-xs text-red-800"
          >
            <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={18} />
            <div>
              <p className="font-bold">Operations Refused</p>
              <p className="text-red-600 font-medium mt-0.5">{errorMsg}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* Left Column: Form to create request (only for non-admin/users) */}
        {!isAdmin && (
          <motion.div variants={itemVariants} className="glass-card rounded-2xl p-5 border border-slate-150 h-fit space-y-4">
            <h2 className="text-sm font-black text-slate-500 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
              <PlusCircle size={18} className="text-primary-600" /> New Blood Request
            </h2>

            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-550 uppercase mb-2">Hospital Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Building size={16} />
                  </span>
                  <input
                    type="text"
                    placeholder="e.g. City General Hospital"
                    value={hospital}
                    onChange={(e) => setHospital(e.target.value)}
                    className="form-input pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-550 uppercase mb-2">Required Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="form-input font-semibold"
                  required
                >
                  <option value="">Select compatible type...</option>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-550 uppercase mb-2">Volume Required (Bags)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <BarChart2 size={16} />
                  </span>
                  <input
                    type="number"
                    placeholder="e.g. 3"
                    value={units}
                    onChange={(e) => setUnits(e.target.value)}
                    className="form-input pl-10"
                    min="1"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={formLoading}
                className="w-full btn-primary text-xs font-bold uppercase tracking-wider py-3 mt-2 shadow-md"
              >
                {formLoading ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                ) : (
                  'Submit Order Request'
                )}
              </button>
            </form>
          </motion.div>
        )}

        {/* Right Columns: Requests Table List (colspan depends if form is shown) */}
        <motion.div 
          variants={itemVariants} 
          className={`glass-card rounded-2xl p-5 border border-slate-150 ${
            isAdmin ? 'lg:col-span-3' : 'lg:col-span-2'
          }`}
        >
          
          {/* Header and Filter */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5 pb-3 border-b border-slate-100">
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-wider">
              {isAdmin ? 'All Active Orders Queue' : 'Past Request History'}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-bold whitespace-nowrap">Filter:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="form-input py-1 px-3 text-xs w-36 bg-slate-50 font-semibold"
              >
                <option value="">All Clearances</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* List display */}
          {loading ? (
            <div className="flex min-h-[200px] items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-primary-600"></div>
            </div>
          ) : filteredRequests.length === 0 ? (
            <p className="text-xs text-slate-500 py-10 text-center bg-slate-50/20 rounded-2xl border border-dashed border-slate-150">
              {querySearch ? `No requests match "${querySearch}"` : 'No requests recorded.'}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead>
                  <tr className="border-b border-slate-100 pb-2 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 pl-2">Hospital Network</th>
                    <th className="py-3 text-center">Group</th>
                    <th className="py-3 text-center">Bags</th>
                    <th className="py-3">Status</th>
                    <th className="py-3">Audit Date</th>
                    <th className="py-3 text-right pr-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="py-4 pl-2 font-bold text-slate-805 max-w-[160px] truncate">{req.hospital}</td>
                      <td className="py-4 text-center">
                        <span className="inline-flex items-center justify-center rounded-lg bg-red-50 px-2 py-0.5 text-xs font-black text-red-600 border border-red-100/50">
                          {req.blood_group}
                        </span>
                      </td>
                      <td className="py-4 text-center font-bold text-slate-800">{req.units}</td>
                      <td className="py-4">
                        <span className={`inline-flex items-center gap-1 rounded px-2.5 py-0.5 text-[10px] font-bold uppercase border ${
                          req.status === 'approved'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100/50'
                            : req.status === 'rejected'
                            ? 'bg-red-50 text-red-700 border-red-100/50'
                            : 'bg-amber-50 text-amber-700 border-amber-100/50'
                        }`}>
                          {req.status === 'pending' && <Clock size={10} className="animate-pulse" />}
                          {req.status}
                        </span>
                      </td>
                      <td className="py-4 text-[10px] text-slate-400 font-semibold">
                        {new Date(req.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 text-right pr-2">
                        <div className="flex justify-end gap-1.5">
                          {isAdmin && req.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(req.id, 'approved')}
                                disabled={actionLoading[req.id]}
                                className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100/30 flex items-center justify-center transition-colors"
                                title="Approve Request"
                              >
                                {actionLoading[req.id] ? (
                                  <span className="h-3 w-3 animate-spin rounded-full border border-emerald-600 border-t-transparent"></span>
                                ) : (
                                  <Check size={12} />
                                )}
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(req.id, 'rejected')}
                                disabled={actionLoading[req.id]}
                                className="h-7 w-7 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-100/30 flex items-center justify-center transition-colors"
                                title="Reject Request"
                              >
                                {actionLoading[req.id] ? (
                                  <span className="h-3 w-3 animate-spin rounded-full border border-red-600 border-t-transparent"></span>
                                ) : (
                                  <X size={12} />
                                )}
                              </button>
                            </>
                          )}
                          
                          {(req.status === 'pending' || isAdmin) && (
                            <button
                              onClick={() => handleDeleteRequest(req.id)}
                              className="h-7 w-7 rounded-lg bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600 border border-slate-100/30 flex items-center justify-center transition-colors"
                              title="Delete Request"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </motion.div>

      </div>

    </motion.div>
  );
};
