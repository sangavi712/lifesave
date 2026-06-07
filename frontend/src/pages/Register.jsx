import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Logo } from '../components/Logo';
import { User, Mail, Lock, ArrowRight, AlertCircle, ShieldAlert } from 'lucide-react';
import loginBg from '../assets/login_bg.png';

export const Register = () => {
  const { register } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Mouse Parallax Coordinates
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const x = (clientX - window.innerWidth / 2) / 45;
    const y = (clientY - window.innerHeight / 2) / 45;
    setCoords({ x, y });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    if (!name || !email || !password || !confirmPassword) {
      setLocalError('All fields must be completed.');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/');
    } catch (err) {
      console.error('[Register] Exception during registration:', err);
      setLocalError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Particles
  const [particles, setParticles] = useState([]);
  useEffect(() => {
    const pts = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 10}s`,
      duration: `${8 + Math.random() * 12}s`,
      drift: `${-120 + Math.random() * 240}px`,
      size: `${2 + Math.random() * 4}px`
    }));
    setParticles(pts);
  }, []);

  return (
    <div
      onMouseMove={handleMouseMove}
      className="w-screen h-screen overflow-hidden flex items-center justify-center bg-[#0D0D0D] font-sans selection:bg-[#FF2E63] selection:text-white relative"
    >
      <style>{`
        @keyframes floatCard {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(0.5deg); }
        }
        @keyframes pulseCardGlow {
          0%, 100% { 
            box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.9), 
                        0 0 20px rgba(139, 0, 0, 0.15), 
                        0 0 40px rgba(193, 18, 31, 0.08); 
          }
          50% { 
            box-shadow: 0 30px 70px -10px rgba(0, 0, 0, 0.95), 
                        0 0 35px rgba(255, 46, 99, 0.35), 
                        0 0 70px rgba(139, 0, 0, 0.25); 
          }
        }
        @keyframes driftUp {
          0% { transform: translateY(105vh) translateX(0) scale(1); opacity: 0; }
          10% { opacity: 0.7; }
          90% { opacity: 0.7; }
          100% { transform: translateY(-10vh) translateX(var(--drift)) scale(0.4); opacity: 0; }
        }
        @keyframes smoothGlowOrbit {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(40px, -30px) scale(1.1); }
          66% { transform: translate(-30px, 50px) scale(0.9); }
        }
        .cinematic-vignette {
          background: radial-gradient(circle, transparent 30%, rgba(13, 13, 13, 0.7) 70%, rgba(13, 13, 13, 0.95) 100%);
        }
        .luxury-glass {
          background: rgba(13, 13, 13, 0.55);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          border: 1px solid rgba(193, 18, 31, 0.25);
          animation: floatCard 8s ease-in-out infinite, pulseCardGlow 8s ease-in-out infinite;
        }
        .luxury-input {
          background: rgba(18, 18, 18, 0.65);
          border: 1px solid rgba(255, 255, 255, 0.08);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .luxury-input:focus {
          border-color: #FF2E63;
          box-shadow: 0 0 20px rgba(255, 46, 99, 0.35), inset 0 0 10px rgba(255, 46, 99, 0.1);
          background: rgba(10, 10, 10, 0.85);
          transform: scale(1.015);
        }
        .luxury-btn {
          background: linear-gradient(135deg, #C1121F 0%, #8B0000 50%, #4A0000 100%);
          box-shadow: 0 4px 25px rgba(193, 18, 31, 0.3);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .luxury-btn:hover:not(:disabled) {
          transform: translateY(-3px) scale(1.03);
          box-shadow: 0 10px 35px rgba(255, 46, 99, 0.55), 0 0 15px rgba(255, 46, 99, 0.3);
          background: linear-gradient(135deg, #FF2E63 0%, #C1121F 60%, #8B0000 100%);
        }
        .luxury-btn:active:not(:disabled) {
          transform: translateY(-1px) scale(0.98);
        }
      `}</style>

      {/* Background Layer */}
      <div
        className="absolute inset-0 z-0 scale-105 pointer-events-none transition-transform duration-1000 ease-out"
        style={{
          backgroundImage: `url(${loginBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transform: `translate3d(${coords.x * -1.2}px, ${coords.y * -1.2}px, 0) scale(1.06)`,
        }}
      />

      {/* Cinematic Vignette */}
      <div className="absolute inset-0 z-10 cinematic-vignette pointer-events-none" />
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#0D0D0D]/60 via-[#0D0D0D]/40 to-[#0D0D0D]/90 pointer-events-none" />

      {/* Glowing Lights */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full bg-[#8B0000]/15 blur-[130px] z-10 pointer-events-none mix-blend-screen"
        style={{
          left: '10%',
          top: '5%',
          animation: 'smoothGlowOrbit 25s ease-in-out infinite',
          transform: `translate3d(${coords.x * 0.8}px, ${coords.y * 0.8}px, 0)`,
        }}
      />
      <div
        className="absolute w-[500px] h-[500px] rounded-full bg-[#FF2E63]/12 blur-[150px] z-10 pointer-events-none mix-blend-screen"
        style={{
          right: '15%',
          bottom: '10%',
          animation: 'smoothGlowOrbit 30s ease-in-out infinite alternate',
          transform: `translate3d(${coords.x * -0.6}px, ${coords.y * -0.6}px, 0)`,
        }}
      />

      {/* Floating Sparkles */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-[#FF2E63]/80"
            style={{
              left: p.left,
              width: p.size,
              height: p.size,
              animation: `driftUp ${p.duration} linear infinite`,
              animationDelay: p.delay,
              '--drift': p.drift,
              bottom: '-20px',
              opacity: 0,
              boxShadow: '0 0 10px rgba(255, 46, 99, 0.8)',
            }}
          />
        ))}
      </div>

      {/* Main Container */}
      <div className="w-full max-w-xl px-4 z-20 flex flex-col items-center">
        
        {/* Luxury Glassmorphic Card */}
        <div className="w-full luxury-glass rounded-[28px] px-8 py-10 sm:px-12 sm:py-12 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-[200%] h-full bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-[2.5s] ease-in-out pointer-events-none" />

          {/* Header */}
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#C1121F]/20 to-[#8B0000]/40 border border-[#FF2E63]/30 text-white shadow-[0_0_20px_rgba(193,18,31,0.25)] mb-4 p-3 relative group-hover:scale-105 transition-transform duration-500">
              <Logo mode="icon" fillColor="#FF2E63" />
              <div className="absolute inset-0 rounded-2xl glow-pulse-red opacity-30 pointer-events-none" />
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-[0.22em] text-white font-cinzel select-none">
              LIFE<span className="text-[#FF2E63] font-black">SAVE</span>
            </h1>
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-[#FF2E63] to-transparent mt-2"></div>
            <p className="text-[10px] sm:text-[11px] font-bold text-slate-450 tracking-[0.3em] uppercase mt-2.5 select-none">
              Enlist Registry Command
            </p>
          </div>

          {/* Error Banner */}
          {localError && (
            <div className="flex items-start gap-3 rounded-2xl bg-[#C1121F]/15 border border-[#C1121F]/30 p-4 text-xs text-red-100 mb-6 animate-fade-in">
              <ShieldAlert size={18} className="shrink-0 text-[#FF2E63] mt-0.5 animate-pulse" />
              <div>
                <p className="font-bold tracking-wider uppercase text-[10px] text-[#FF2E63]">Validation Error</p>
                <p className="text-slate-300 mt-1 text-[11px] font-medium leading-relaxed">{localError}</p>
              </div>
            </div>
          )}

          {/* Secure Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 select-none">
                Full Legal Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="luxury-input w-full pl-11 pr-4 py-2.5 text-sm rounded-xl outline-none text-white placeholder-slate-650 font-semibold"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 select-none">
                Node Identity (Email)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  placeholder="physician@lifesave.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="luxury-input w-full pl-11 pr-4 py-2.5 text-sm rounded-xl outline-none text-white placeholder-slate-650 font-semibold"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 select-none">
                  PIN Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
                    <Lock size={16} />
                  </span>
                  <input
                    type="password"
                    placeholder="Min 6 chars"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="luxury-input w-full pl-11 pr-4 py-2.5 text-sm rounded-xl outline-none text-white placeholder-slate-650 font-semibold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 select-none">
                  Confirm PIN
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
                    <Lock size={16} />
                  </span>
                  <input
                    type="password"
                    placeholder="Confirm PIN"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="luxury-input w-full pl-11 pr-4 py-2.5 text-sm rounded-xl outline-none text-white placeholder-slate-650 font-semibold"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full luxury-btn py-3.5 flex items-center justify-center gap-2 mt-6 text-xs font-bold uppercase tracking-[0.2em] text-white rounded-xl disabled:opacity-50"
            >
              {loading ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
              ) : (
                <>
                  Enlist New Node <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* Redirect link */}
          <div className="flex flex-col items-center mt-6">
            <p className="text-xs text-slate-500 font-bold tracking-wide">
              Already registered?{' '}
              <Link to="/login" className="font-extrabold text-[#FF2E63] hover:text-[#C1121F] hover:underline transition-colors">
                Authorize Gateway
              </Link>
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-8 space-y-2 text-center select-none">
          <p className="text-[9px] font-bold text-slate-650 tracking-[0.25em] uppercase">
            LifeSave Registry Gateway Node
          </p>
          <p className="text-[10px] text-slate-500/80 font-medium max-w-sm mx-auto leading-normal">
            Portfolio Demo Project – For Educational Purposes Only. All data shown is fictional and for portfolio/demo purposes only. The system is not intended for real-world medical, clinical, or emergency use.
          </p>
        </div>
      </div>
    </div>
  );
};
