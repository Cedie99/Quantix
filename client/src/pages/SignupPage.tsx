import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/useAuthStore';
import { ArrowRight, Mail, Lock, Check } from 'lucide-react';

const FEATURES = [
  'Live signal scores from 8 weighted indicators',
  'Claude AI confirmation on strong signals',
  'ATR-based risk & position sizing',
  'Real-time price alerts & history',
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.07, ease: [0.25, 0.4, 0.25, 1] },
  }),
};

function getStrength(pwd: string): { score: number; label: string; color: string; text: string } {
  if (!pwd)           return { score: 0, label: '',           color: '',              text: '' };
  if (pwd.length < 8) return { score: 1, label: 'Too short',  color: 'bg-red-500',    text: 'text-red-400' };
  if (pwd.length < 10) return { score: 2, label: 'Weak',      color: 'bg-orange-500', text: 'text-orange-400' };
  if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd))
                      return  { score: 4, label: 'Strong',    color: 'bg-emerald-500',text: 'text-emerald-400' };
  return               { score: 3, label: 'Fair',             color: 'bg-amber-400',  text: 'text-amber-400' };
}

export function SignupPage() {
  const navigate = useNavigate();
  const { register, isLoading } = useAuthStore();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [error, setError]       = useState('');
  const [focused, setFocused]   = useState<string | null>(null);

  const strength = getStrength(password);
  const matches  = confirm.length > 0 && password === confirm;
  const mismatch = confirm.length > 0 && password !== confirm;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 8)  { setError('Password must be at least 8 characters'); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }
    try {
      await register(email, password);
      navigate('/app', { replace: true });
    } catch (err) {
      setError((err as Error).message || 'Registration failed');
    }
  }

  const inputStyle = (name: string, override?: Partial<React.CSSProperties>): React.CSSProperties => ({
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: `1px solid ${
      override?.borderColor ??
      (focused === name ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.08)')
    }`,
    boxShadow: focused === name && !override?.borderColor ? '0 0 0 3px rgba(124,58,237,0.12)' : 'none',
    color: '#ffffff',
    borderRadius: 10,
    padding: '11px 14px 11px 38px',
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    ...override,
  });

  return (
    <div
      className="relative flex min-h-screen overflow-hidden antialiased"
      style={{ background: '#070b1a' }}
    >
      {/* Grid background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Aurora blobs */}
      <motion.div
        animate={{ x: [0, 30, -20, 0], y: [0, -30, 20, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute"
        style={{
          top: '5%', right: '5%',
          width: 500, height: 500,
          background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 65%)',
          filter: 'blur(80px)',
        }}
      />
      <motion.div
        animate={{ x: [0, -30, 40, 0], y: [0, 40, -20, 0] }}
        transition={{ duration: 32, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute"
        style={{
          bottom: '5%', left: '5%',
          width: 450, height: 450,
          background: 'radial-gradient(circle, rgba(59,130,246,0.14) 0%, transparent 65%)',
          filter: 'blur(80px)',
        }}
      />

      {/* ── Left branding panel (lg+) ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
        className="hidden lg:flex flex-col justify-between p-14 shrink-0 relative z-10"
        style={{ width: 420, borderRight: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div>
          <Link to="/" className="flex items-center gap-2.5 mb-16">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-base select-none"
              style={{ background: 'linear-gradient(135deg, #3B82F6, #7C3AED)', boxShadow: '0 0 20px rgba(99,102,241,0.5)' }}
            >
              Q
            </div>
            <span className="font-bold text-lg tracking-tight" style={{ color: '#ffffff' }}>Quantix</span>
          </Link>

          <h2
            className="text-3xl font-bold tracking-tighter mb-4 leading-tight bg-clip-text text-transparent"
            style={{ backgroundImage: 'linear-gradient(to bottom, #ffffff, rgba(255,255,255,0.5))' }}
          >
            Start trading smarter,<br />for free.
          </h2>
          <p className="text-sm mb-10 leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Join traders using live signals to simplify their decision-making.
          </p>

          <ul className="space-y-4">
            {FEATURES.map((f, i) => (
              <motion.li
                key={f}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="flex items-start gap-3 text-sm"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                <span
                  className="mt-0.5 w-4 h-4 shrink-0 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.3)' }}
                >
                  <Check size={9} strokeWidth={3} style={{ color: '#a78bfa' }} />
                </span>
                {f}
              </motion.li>
            ))}
          </ul>
        </div>

        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Free forever · No credit card required</p>
      </motion.div>

      {/* ── Form panel ───────────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 relative z-10">

        {/* Mobile logo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:hidden mb-10 flex flex-col items-center gap-3"
        >
          <Link to="/" className="flex flex-col items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-xl select-none"
              style={{ background: 'linear-gradient(135deg, #3B82F6, #7C3AED)', boxShadow: '0 0 24px rgba(99,102,241,0.5)' }}
            >
              Q
            </div>
            <span className="text-xl font-bold tracking-tight" style={{ color: '#ffffff' }}>Quantix</span>
          </Link>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
          className="relative w-full max-w-sm rounded-2xl p-8 overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 32px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}
        >
          {/* Top shimmer line */}
          <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-violet-500/60 to-transparent" />

          <h1 className="mb-1 text-2xl font-bold tracking-tight" style={{ color: '#ffffff' }}>Create your account</h1>
          <p className="mb-8 text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>Start trading smarter, for free</p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}
            >
              <span className="w-1.5 h-1.5 shrink-0 rounded-full bg-red-400" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="mb-2 block text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>Email</label>
              <div className="relative">
                <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'rgba(255,255,255,0.25)' }} />
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  required autoComplete="email" placeholder="you@example.com"
                  style={inputStyle('email')}
                  onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                  className="placeholder:text-white/20"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>Password</label>
              <div className="relative">
                <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'rgba(255,255,255,0.25)' }} />
                <input
                  type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  required autoComplete="new-password" placeholder="Min. 8 characters"
                  style={inputStyle('password')}
                  onFocus={() => setFocused('password')} onBlur={() => setFocused(null)}
                  className="placeholder:text-white/20"
                />
              </div>
              {/* Strength indicator */}
              {password.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-2.5 space-y-1.5"
                >
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-0.5 flex-1 rounded-full transition-all duration-300 ${strength.score >= i ? strength.color : ''}`}
                        style={strength.score < i ? { background: 'rgba(148,163,184,0.2)' } : undefined}
                      />
                    ))}
                  </div>
                  <p className={`text-xs ${strength.text}`}>{strength.label}</p>
                </motion.div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="mb-2 block text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>Confirm password</label>
              <div className="relative">
                <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'rgba(255,255,255,0.25)' }} />
                <input
                  type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
                  required autoComplete="new-password" placeholder="••••••••"
                  style={inputStyle('confirm', {
                    borderColor: mismatch
                      ? 'rgba(239,68,68,0.4)'
                      : matches
                      ? 'rgba(34,197,94,0.4)'
                      : undefined,
                  })}
                  onFocus={() => setFocused('confirm')} onBlur={() => setFocused(null)}
                  className="placeholder:text-white/20"
                />
              </div>
              {matches && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1.5 text-xs text-emerald-400 flex items-center gap-1"
                >
                  <Check size={10} strokeWidth={3} /> Passwords match
                </motion.p>
              )}
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={!isLoading ? { scale: 1.02, boxShadow: '0 0 30px rgba(99,102,241,0.5)' } : undefined}
              whileTap={!isLoading ? { scale: 0.98 } : undefined}
              transition={{ duration: 0.15 }}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
              style={{
                background: 'linear-gradient(135deg, #a78bfa, #7C3AED)',
                boxShadow: '0 0 20px rgba(99,102,241,0.3)',
              }}
            >
              {isLoading ? 'Creating account…' : <><span>Create account</span><ArrowRight size={14} /></>}
            </motion.button>
          </form>

          <p className="mt-7 text-center text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold transition-colors duration-200"
              style={{ color: '#a78bfa' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#c4b5fd'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#a78bfa'; }}
            >
              Sign in
            </Link>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center"
        >
          <Link
            to="/"
            className="text-xs transition-colors duration-200 hover:text-white"
            style={{ color: 'rgba(255,255,255,0.3)' }}
          >
            ← Back to home
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

