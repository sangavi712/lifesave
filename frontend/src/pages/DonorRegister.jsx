import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { Heart, Calendar, Phone, MapPin, AlertCircle, CheckCircle2, User, Award, ShieldCheck } from 'lucide-react';

export const DonorRegister = () => {
  const { user } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [lastDonation, setLastDonation] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Populate name on mount if user is loaded
  useEffect(() => {
    if (user) {
      setName(user.name);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!name || !age || !bloodGroup || !phone || !city) {
      setError('Please fill in all required clinical fields.');
      return;
    }

    const parsedAge = parseInt(age, 10);
    if (isNaN(parsedAge) || parsedAge < 18 || parsedAge > 65) {
      setError('Regulatory compliance: Donors must be between 18 and 65 years old.');
      return;
    }

    if (phone.length < 10) {
      setError('Please enter a valid phone number (at least 10 digits).');
      return;
    }

    setLoading(true);
    try {
      await API.post('/donors', {
        name,
        age: parsedAge,
        blood_group: bloodGroup,
        phone,
        city,
        last_donation: lastDonation || null,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/donors');
      }, 2000);
    } catch (err) {
      console.error('Donor registration exception:', err);
      setError(err.response?.data?.message || 'Failed to register profile. You may already have a donor record in this center.');
    } finally {
      setLoading(false);
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
      className="mx-auto max-w-3xl space-y-6 pb-10"
    >
      
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 font-sans">
          Join Lifesaver <span className="text-primary-600">Registry</span>
        </h1>
        <p className="text-slate-550 text-sm mt-0.5 font-medium">
          A single donation can save up to three lives. Register your donor profile to coordinate regional collections.
        </p>
      </motion.div>

      {/* Success Banner */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-100 p-5 text-sm text-emerald-800"
        >
          <CheckCircle2 className="shrink-0 text-emerald-600" size={24} />
          <div>
            <p className="font-bold">Intake Registry Confirmed!</p>
            <p className="text-xs text-emerald-605 font-medium mt-0.5">Thank you for joining our lifesaving registry. Redirecting to donors search list...</p>
          </div>
        </motion.div>
      )}

      {/* Failure Banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 rounded-2xl bg-red-50 border border-red-100 p-5 text-xs text-red-800"
        >
          <AlertCircle className="shrink-0 text-red-600 mt-0.5" size={20} />
          <div>
            <p className="font-bold">Registration Refused</p>
            <p className="text-red-600 font-medium mt-0.5">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Grid: Registration Form (Col 3) + Sidebar Info (Col 1) */}
      <div className="grid gap-6 md:grid-cols-4">
        
        {/* Form Panel */}
        <motion.div variants={itemVariants} className="md:col-span-3 glass-card rounded-2xl p-6 border border-slate-150 relative overflow-hidden h-fit">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-500 to-rose-600 opacity-90"></div>

          {/* Steps Display */}
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100 mb-6 text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span className="text-primary-600 flex items-center gap-1"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-100 text-[10px] text-primary-700">1</span> Bio Profiles</span>
            <span>&gt;</span>
            <span className="text-slate-500 flex items-center gap-1"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[10px] text-slate-600">2</span> Medical Intake</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Donor Full Name *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <User size={16} />
                  </span>
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="form-input pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Age (Compliance: 18 - 65) *</label>
                <input
                  type="number"
                  placeholder="e.g. 28"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="form-input"
                  min="18"
                  max="65"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Blood Group *</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="form-input"
                  required
                >
                  <option value="">Select compatible type</option>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Contact phone *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Phone size={16} />
                  </span>
                  <input
                    type="tel"
                    placeholder="e.g. 555-0199"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="form-input pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">City Location *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <MapPin size={16} />
                  </span>
                  <input
                    type="text"
                    placeholder="e.g. Metro City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="form-input pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Last Donation Date (Optional)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Calendar size={16} />
                  </span>
                  <input
                    type="date"
                    value={lastDonation}
                    onChange={(e) => setLastDonation(e.target.value)}
                    className="form-input pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center gap-3 border-t border-slate-50">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1 text-xs font-bold uppercase tracking-wider py-3 shadow-md"
              >
                {loading ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                ) : (
                  <>
                    <Heart size={16} className="fill-current" /> Complete Registration
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/donors')}
                className="btn-secondary text-xs font-bold uppercase tracking-wider py-3"
              >
                Cancel
              </button>
            </div>

          </form>
        </motion.div>

        {/* Informational Panel */}
        <motion.div variants={itemVariants} className="md:col-span-1 space-y-4">
          
          <div className="glass-card rounded-2xl p-5 border border-slate-150 space-y-3">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck size={14} className="text-primary-600" />
              Safety Rules
            </h4>
            <ul className="space-y-2 text-[10px] text-slate-500 leading-relaxed list-disc list-inside">
              <li>Must weigh at least 110 lbs (50 kg).</li>
              <li>Must be in good general health at donation time.</li>
              <li>Must leave at least 56 days between whole blood donations.</li>
            </ul>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-slate-150 space-y-3">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Award size={14} className="text-primary-600" />
              Volunteer Recognition
            </h4>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Every donation grants credential tokens toward municipal health recognition benefits.
            </p>
          </div>

        </motion.div>

      </div>

    </motion.div>
  );
};
