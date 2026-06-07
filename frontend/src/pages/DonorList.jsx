import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../services/api';
import { Search, MapPin, Phone, Calendar, EyeOff, Filter, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';

export const DonorList = () => {
  const location = useLocation();
  const [donors, setDonors] = useState([]);
  const [bloodGroup, setBloodGroup] = useState('');
  const [city, setCity] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDonors = async (currentSearch = searchTerm) => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await API.get('/donors', {
        params: {
          blood_group: bloodGroup || undefined,
          city: city || undefined,
          search: currentSearch || undefined,
          page,
          limit: 8,
        },
      });

      setDonors(res.data.donors);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('Error fetching donors:', err);
      setError('Unable to fetch voluntary donor registries. Please check your system connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const querySearch = searchParams.get('search') || '';
    setSearchTerm(querySearch);
    fetchDonors(querySearch);
  }, [location.search, bloodGroup, city, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchDonors(searchTerm);
  };

  const clearFilters = () => {
    setBloodGroup('');
    setCity('');
    setSearchTerm('');
    setPage(1);
  };

  // Helper function to check if donor is eligible (e.g. 90 days / 3 months rule)
  const getDonorEligibility = (lastDonationDate) => {
    if (!lastDonationDate) return { eligible: true, text: 'Eligible', color: 'bg-emerald-50 text-emerald-700 border-emerald-100/50' };
    
    const donationDate = new Date(lastDonationDate);
    const today = new Date();
    const diffTime = Math.abs(today - donationDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 90) {
      const remaining = 90 - diffDays;
      return { eligible: false, text: `Resting (${remaining}d left)`, color: 'bg-amber-50 text-amber-700 border-amber-100/50' };
    }
    
    return { eligible: true, text: 'Eligible', color: 'bg-emerald-50 text-emerald-700 border-emerald-100/50' };
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.04 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
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
          Voluntary Donors <span className="text-primary-600">Registry</span>
        </h1>
        <p className="text-slate-550 text-sm mt-0.5 font-medium">
          Query compatible life-savers across cities, verify clinical eligibility status, and coordinate donations.
        </p>
      </motion.div>

      {/* Filter and Search Ribbon */}
      <motion.div variants={itemVariants} className="glass-card rounded-2xl p-5 border border-slate-150">
        <form onSubmit={handleSearchSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search by full name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-10"
            />
          </div>

          <div>
            <select
              value={bloodGroup}
              onChange={(e) => {
                setBloodGroup(e.target.value);
                setPage(1);
              }}
              className="form-input"
            >
              <option value="">All Blood Groups</option>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                <option key={bg} value={bg}>Blood Group {bg}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <MapPin size={16} />
            </span>
            <input
              type="text"
              placeholder="Filter by city (e.g. Metro City)"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="form-input pl-10"
            />
          </div>

          <div className="flex gap-2">
            <button type="submit" className="btn-primary flex-1 text-xs font-bold uppercase tracking-wider">
              <Filter size={14} /> Search
            </button>
            <button
              type="button"
              onClick={clearFilters}
              className="btn-secondary text-xs font-bold uppercase tracking-wider"
              title="Reset search variables"
            >
              Reset
            </button>
          </div>

        </form>
      </motion.div>

      {/* Donors Grid */}
      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-primary-600"></div>
        </div>
      ) : error ? (
        <div className="rounded-2xl bg-red-50 border border-red-100 p-5 text-center text-red-800 text-xs font-semibold">
          <AlertCircle size={20} className="mx-auto mb-2 text-red-600" />
          <span>{error}</span>
        </div>
      ) : donors.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">
          <EyeOff className="mx-auto mb-3 text-slate-350" size={36} />
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">No Registry Matches Found</h3>
          <p className="mt-1 text-xs text-slate-400">Try loosening your search filters or querying another regional node.</p>
        </div>
      ) : (
        <>
          <motion.div 
            variants={containerVariants}
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
          >
            {donors.map((donor) => {
              const status = getDonorEligibility(donor.last_donation);
              return (
                <motion.div
                  key={donor.id}
                  variants={itemVariants}
                  whileHover={{ y: -2 }}
                  className="glass-card rounded-2xl p-5 border border-slate-150 relative overflow-hidden flex flex-col justify-between"
                >
                  {/* Rose colored accent border */}
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-400 to-rose-600 opacity-90"></div>

                  <div>
                    {/* Header: Name and Blood Group */}
                    <div className="flex items-start justify-between">
                      <div className="max-w-[130px]">
                        <h3 className="font-extrabold text-slate-800 text-base truncate pr-1 leading-snug">
                          {donor.name}
                        </h3>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Age: {donor.age} • Registered</p>
                      </div>
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 font-black text-sm border border-red-100/50 shadow-xs">
                        {donor.blood_group}
                      </span>
                    </div>

                    {/* Eligibility Badge */}
                    <div className="mt-2.5">
                      <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[9px] font-bold uppercase border ${status.color}`}>
                        {status.eligible ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
                        {status.text}
                      </span>
                    </div>

                    {/* Details section */}
                    <div className="mt-4 space-y-2 border-t border-slate-50 pt-3.5 text-xs text-slate-600">
                      <p className="flex items-center gap-2 text-slate-500">
                        <MapPin size={13} className="text-slate-400 shrink-0" />
                        <span className="truncate font-semibold text-slate-600">{donor.city}</span>
                      </p>
                      <p className="flex items-center gap-2 text-slate-500">
                        <Phone size={13} className="text-slate-400 shrink-0" />
                        <span className="font-bold text-slate-700">{donor.phone}</span>
                      </p>
                      <p className="flex items-center gap-2 text-slate-500">
                        <Calendar size={13} className="text-slate-400 shrink-0" />
                        <span className="truncate font-medium text-slate-600">
                          Intake:{' '}
                          <strong className="text-slate-700 font-semibold">
                            {donor.last_donation
                              ? donor.last_donation.split('T')[0]
                              : 'First time'}
                          </strong>
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Actions button */}
                  <div className="mt-5">
                    <a
                      href={`tel:${donor.phone}`}
                      className="w-full btn-secondary text-xs py-2 bg-slate-50 border-0 hover:bg-primary-50/50 hover:text-primary-700 font-bold uppercase tracking-wider flex items-center justify-center gap-1"
                    >
                      <Phone size={12} /> Contact Lifesaver
                    </a>
                  </div>

                </motion.div>
              );
            })}
          </motion.div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <motion.div variants={itemVariants} className="flex items-center justify-between border-t border-slate-200/60 pt-5">
              <span className="text-xs text-slate-550 font-semibold">
                Displaying registry page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalItems} total lifesavers)
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="rounded-xl border border-slate-200 bg-white p-2.5 hover:bg-slate-50 disabled:opacity-50 transition-colors shadow-2xs"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage(page + 1)}
                  className="rounded-xl border border-slate-200 bg-white p-2.5 hover:bg-slate-50 disabled:opacity-50 transition-colors shadow-2xs"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          )}
        </>
      )}

    </motion.div>
  );
};
