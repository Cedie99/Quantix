import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import type { Variants } from 'framer-motion';
import {
  Zap, Bot, Scale, BarChart2, Bell, Globe, ArrowRight, TrendingUp,
} from 'lucide-react';

// ─── Animation variants ────────────────────────────────────────────────────────

const EASE_OUT: [number, number, number, number] = [0.25, 0.4, 0.25, 1];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
};

const stagger = (delay = 0.08) => ({
  hidden: {},
  visible: { transition: { staggerChildren: delay } },
});

// ─── Data ──────────────────────────────────────────────────────────────────────

const STATS = [
  { value: '200+', label: 'Trading pairs' },
  { value: '8',    label: 'Live indicators' },
  { value: '<1s',  label: 'Signal latency' },
  { value: '100%', label: 'Free forever' },
];

const STEPS = [
  {
    num: '01',
    title: 'Indicators vote',
    desc: '8 weighted indicators independently analyze price action and each cast a directional vote.',
  },
  {
    num: '02',
    title: 'Score calculated',
    desc: 'Votes are summed and normalized to a score from −100 (strong sell) to +100 (strong buy).',
  },
  {
    num: '03',
    title: 'AI confirms',
    desc: 'Claude AI cross-checks Fear & Greed, BTC dominance, and funding rates before issuing a verdict.',
  },
];

const FEATURES = [
  {
    icon: Zap,
    title: 'Multi-indicator Engine',
    desc: 'RSI, MACD, EMA (9/21/50/200), Bollinger Bands, Stochastic, Volume, Support/Resistance, and Momentum run through a weighted voting system.',
    accent: 'from-blue-500 to-violet-500',
    wide: true,
  },
  {
    icon: Bot,
    title: 'Claude AI Layer',
    desc: 'On strong signals, Claude AI reviews market context—Fear & Greed, BTC dominance, funding rates—before confirming or cautioning.',
    accent: 'from-violet-500 to-purple-600',
    wide: false,
  },
  {
    icon: BarChart2,
    title: 'Professional Charts',
    desc: 'Candlestick + EMA overlays, Bollinger Bands, live volume, RSI, MACD, and Stochastic sub-charts.',
    accent: 'from-sky-500 to-blue-600',
    wide: false,
  },
  {
    icon: Scale,
    title: 'ATR Risk Calculator',
    desc: 'Live volatility-based position sizing. Enter budget and risk %—get entry, stop-loss, TP1/TP2 instantly.',
    accent: 'from-emerald-500 to-teal-600',
    wide: false,
  },
  {
    icon: Bell,
    title: 'Real-time Alerts',
    desc: 'Browser notifications on STRONG_BUY and STRONG_SELL. Alert history saved and synced to your account.',
    accent: 'from-amber-500 to-orange-600',
    wide: false,
  },
  {
    icon: Globe,
    title: 'Market Pulse',
    desc: 'Live Fear & Greed Index, BTC/ETH dominance, total market cap, and today\'s top movers in the sidebar.',
    accent: 'from-rose-500 to-pink-600',
    wide: true,
  },
];

const HERO_ROWS = [
  { coin: 'BTC/USDT', price: '94,230.00', change: '+2.41%', score: 78,  signal: 'STRONG BUY', up: true },
  { coin: 'ETH/USDT', price: '3,142.50',  change: '+1.18%', score: 34,  signal: 'BUY',        up: true },
  { coin: 'SOL/USDT', price: '187.42',    change: '-0.73%', score: -14, signal: 'NEUTRAL',    up: false },
];

const MINI_CANDLES = [
  { x: 4,   y: 34, h: 10, up: false }, { x: 18,  y: 30, h: 8,  up: false },
  { x: 32,  y: 22, h: 12, up: true  }, { x: 46,  y: 18, h: 10, up: true  },
  { x: 60,  y: 20, h: 8,  up: false }, { x: 74,  y: 14, h: 12, up: true  },
  { x: 88,  y: 10, h: 14, up: true  }, { x: 102, y: 12, h: 8,  up: false },
  { x: 116, y: 8,  h: 12, up: true  }, { x: 130, y: 10, h: 8,  up: false },
  { x: 144, y: 6,  h: 12, up: true  }, { x: 158, y: 4,  h: 14, up: true  },
];

// ─── Shared helpers ────────────────────────────────────────────────────────────

const GRID_STYLE: React.CSSProperties = {
  backgroundImage:
    'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
  backgroundSize: '60px 60px',
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase mb-4"
      style={{ color: 'rgba(139,92,246,0.9)' }}>
      {children}
    </span>
  );
}

function GradientHeading({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <h2
      className={`font-bold tracking-tighter bg-clip-text text-transparent leading-none ${className}`}
      style={{ backgroundImage: 'linear-gradient(to bottom, #ffffff 30%, rgba(255,255,255,0.45))' }}
    >
      {children}
    </h2>
  );
}

// ─── Section wrapper with inView animation ────────────────────────────────────

function Section({ children, className = '', id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.section
      ref={ref}
      id={id}
      variants={stagger()}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      className={className}
    >
      {children}
    </motion.section>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export function LandingPage() {
  return (
    <div className="min-h-screen antialiased overflow-x-hidden" style={{ background: '#030711', color: '#EDF4FF' }}>

      {/* ── Ambient background (fixed) ──────────────────────────────────────── */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Grid */}
        <div className="absolute inset-0 opacity-100" style={GRID_STYLE} />
        {/* Radial mask so grid fades at edges */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 70% 60% at 50% 0%, transparent 0%, #030711 70%)',
          }}
        />
        {/* Aurora blob 1 — blue */}
        <motion.div
          animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0] }}
          transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute"
          style={{
            top: '5%', left: '15%',
            width: 600, height: 600,
            background: 'radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 65%)',
            filter: 'blur(60px)',
          }}
        />
        {/* Aurora blob 2 — violet */}
        <motion.div
          animate={{ x: [0, -50, 30, 0], y: [0, 40, -30, 0] }}
          transition={{ duration: 35, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute"
          style={{
            top: '15%', right: '10%',
            width: 500, height: 500,
            background: 'radial-gradient(circle, rgba(139,92,246,0.14) 0%, transparent 65%)',
            filter: 'blur(80px)',
          }}
        />
        {/* Aurora blob 3 — subtle teal at bottom */}
        <motion.div
          animate={{ x: [0, 30, -40, 0], y: [0, -20, 40, 0] }}
          transition={{ duration: 40, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute"
          style={{
            bottom: '20%', left: '35%',
            width: 400, height: 400,
            background: 'radial-gradient(circle, rgba(20,184,166,0.1) 0%, transparent 65%)',
            filter: 'blur(80px)',
          }}
        />
      </div>

      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl"
        style={{ background: 'rgba(3,7,17,0.7)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-sm select-none"
              style={{ background: 'linear-gradient(135deg, #3B82F6, #7C3AED)', boxShadow: '0 0 20px rgba(99,102,241,0.5)' }}
            >
              Q
            </div>
            <span className="font-semibold tracking-tight text-white">Quantix</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
            <a href="#how-it-works" className="hover:text-white transition-colors duration-200">How it works</a>
            <a href="#features"     className="hover:text-white transition-colors duration-200">Features</a>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="px-4 py-1.5 text-sm transition-colors duration-200 hover:text-white"
              style={{ color: 'rgba(255,255,255,0.45)' }}
            >
              Sign in
            </Link>
            <Link to="/signup">
              <motion.div
                whileHover={{ scale: 1.04, boxShadow: '0 0 30px rgba(99,102,241,0.5)' }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)', boxShadow: '0 0 20px rgba(99,102,241,0.3)' }}
              >
                Get started
              </motion.div>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-14 text-center overflow-hidden">
        <motion.div
          variants={stagger(0.1)}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-4xl mx-auto w-full"
        >
          {/* Badge */}
          <motion.div variants={fadeUp} className="flex justify-center mb-8 mt-8">
            <span
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{
                background: 'rgba(34,197,94,0.08)',
                border: '1px solid rgba(34,197,94,0.2)',
                color: '#4ade80',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live signal analytics — free forever
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            className="mb-7 font-bold tracking-tighter leading-[0.92] bg-clip-text text-transparent text-6xl sm:text-7xl md:text-8xl"
            style={{ backgroundImage: 'linear-gradient(to bottom, #ffffff 20%, rgba(255,255,255,0.4))' }}
          >
            8 indicators.<br />One signal.<br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, #60a5fa, #a78bfa, #34d399)' }}
            >
              Instant clarity.
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mx-auto mb-10 max-w-lg text-base leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.45)' }}
          >
            RSI, MACD, EMAs, Bollinger Bands, Stochastic, Volume, Support/Resistance, and Momentum
            fused into a single weighted score — then confirmed by Claude AI.
          </motion.p>

          {/* CTA buttons */}
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
            <Link to="/signup">
              <motion.div
                whileHover={{ scale: 1.04, boxShadow: '0 0 40px rgba(99,102,241,0.55)' }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.18 }}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)', boxShadow: '0 0 24px rgba(99,102,241,0.35)' }}
              >
                Start for free <ArrowRight size={14} />
              </motion.div>
            </Link>
            <Link to="/login">
              <motion.div
                whileHover={{ background: 'rgba(255,255,255,0.07)' }}
                transition={{ duration: 0.2 }}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-medium"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.55)',
                }}
              >
                Sign in
              </motion.div>
            </Link>
          </motion.div>

          {/* Preview card */}
          <motion.div
            variants={fadeUp}
            className="mx-auto max-w-2xl rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
            }}
          >
            {/* Card header */}
            <div
              className="flex items-center justify-between px-5 py-3"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
              <span className="text-xs font-medium tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Live signal overview
              </span>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LIVE
              </span>
            </div>

            {/* Score highlight row */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                background: 'rgba(34,197,94,0.04)',
                borderLeft: '2px solid rgba(34,197,94,0.5)',
              }}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold font-mono tabular-nums" style={{ color: '#ffffff' }}>+78</span>
                <span
                  className="px-2.5 py-1 rounded-md text-xs font-bold text-emerald-400"
                  style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}
                >
                  STRONG BUY
                </span>
              </div>
              <div className="text-right">
                <div className="font-mono text-sm font-semibold text-white">$94,230.00</div>
                <div className="font-mono text-xs text-emerald-400 mt-0.5">BTC/USDT · +2.41%</div>
              </div>
            </div>

            {/* Signal rows */}
            {HERO_ROWS.map((row, i) => (
              <div
                key={row.coin}
                className="flex items-center gap-3 px-5 py-3"
                style={{ borderBottom: i < HERO_ROWS.length - 1 ? '1px solid rgba(255,255,255,0.04)' : undefined }}
              >
                <span className="w-20 shrink-0 font-mono text-xs font-bold" style={{ color: 'rgba(255,255,255,0.8)' }}>{row.coin}</span>
                <span className={`w-14 shrink-0 text-right font-mono text-xs ${row.up ? 'text-emerald-400' : 'text-red-400'}`}>{row.change}</span>
                <span className="flex-1 text-right font-mono text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>${row.price}</span>
                <div className="relative h-1 w-20 shrink-0 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                  <div
                    className="absolute top-0 h-full rounded-full"
                    style={{
                      left: row.score >= 0 ? '50%' : `${50 + row.score * 0.5}%`,
                      width: `${Math.abs(row.score) * 0.5}%`,
                      background: row.score > 25 ? '#22c55e' : row.score < -25 ? '#ef4444' : '#f59e0b',
                    }}
                  />
                </div>
                <span
                  className="shrink-0 min-w-20 text-center px-2 py-0.5 rounded text-xs font-semibold"
                  style={{
                    background: row.score > 25
                      ? 'rgba(34,197,94,0.1)'
                      : row.score < -25
                      ? 'rgba(239,68,68,0.1)'
                      : 'rgba(234,179,8,0.1)',
                    color: row.score > 25 ? '#4ade80' : row.score < -25 ? '#f87171' : '#fbbf24',
                  }}
                >
                  {row.signal}
                </span>
              </div>
            ))}

            {/* Footer */}
            <div
              className="flex items-center gap-2 px-5 py-2.5"
              style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}
            >
              <Bot size={11} style={{ color: 'rgba(255,255,255,0.2)' }} />
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>Claude AI:</span>
              <span className="text-xs font-semibold font-mono text-emerald-400">CONFIRM_BUY</span>
              <span className="ml-auto text-xs font-mono" style={{ color: 'rgba(255,255,255,0.15)' }}>FnG: 45 · BTC Dom: 52%</span>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Stats ───────────────────────────────────────────────────────────── */}
      <Section className="py-20 px-6">
        <div className="max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((s) => (
            <motion.div key={s.label} variants={fadeUp} className="flex flex-col items-center gap-2 text-center">
              <span
                className="text-5xl font-bold tracking-tighter bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(to bottom, #ffffff, rgba(255,255,255,0.5))' }}
              >
                {s.value}
              </span>
              <div className="w-8 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(99,102,241,0.7), transparent)' }} />
              <span className="text-xs uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>{s.label}</span>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ── How it works ────────────────────────────────────────────────────── */}
      <Section id="how-it-works" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <SectionLabel>Signal Engine</SectionLabel>
            <GradientHeading className="text-4xl sm:text-5xl mb-4">How the engine works</GradientHeading>
            <p className="text-sm max-w-md mx-auto leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Each indicator votes. Votes are weighted and summed. AI validates.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-4">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                variants={fadeUp}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="relative rounded-2xl p-6"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                {/* Connector line (desktop) */}
                {i < 2 && (
                  <div
                    className="hidden md:block absolute top-8 -right-2 w-4 h-px"
                    style={{ background: 'rgba(255,255,255,0.1)', zIndex: 10 }}
                  />
                )}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-5 text-sm font-bold"
                  style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.2), rgba(124,58,237,0.2))', color: '#7c3aed', border: '1px solid rgba(124,58,237,0.2)' }}
                >
                  {step.num}
                </div>
                <h3 className="text-base font-semibold mb-2 text-white">{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Features bento ──────────────────────────────────────────────────── */}
      <Section id="features" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <SectionLabel>Features</SectionLabel>
            <GradientHeading className="text-4xl sm:text-5xl mb-4">Everything in one view</GradientHeading>
            <p className="text-sm max-w-sm mx-auto" style={{ color: 'rgba(255,255,255,0.4)' }}>
              No plugins. No paywalls. One focused analysis tool.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {FEATURES.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={feat.title}
                  variants={fadeUp}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className={`group relative rounded-2xl p-6 flex flex-col gap-4 ${feat.wide ? 'lg:col-span-2' : ''}`}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    backdropFilter: 'blur(12px)',
                  }}
                >
                  {/* Subtle top-edge glow on hover */}
                  <div
                    className="absolute inset-x-0 top-0 h-px rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: `linear-gradient(to right, transparent, rgba(99,102,241,0.5), transparent)` }}
                  />

                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background: `linear-gradient(135deg, rgba(59,130,246,0.15), rgba(124,58,237,0.15))`,
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <Icon size={16} style={{ color: '#7c3aed' }} />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold mb-1.5 text-white">{feat.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>{feat.desc}</p>
                  </div>

                  {/* Feature-specific previews */}
                  {i === 0 && (
                    <div className="mt-auto pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="flex items-center gap-3">
                        <span className="text-4xl font-bold font-mono tabular-nums text-white">+78</span>
                        <div className="flex-1 space-y-1.5">
                          <span
                            className="text-xs font-bold px-2 py-0.5 rounded"
                            style={{ background: 'rgba(34,197,94,0.1)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.15)' }}
                          >
                            STRONG BUY
                          </span>
                          <div className="relative h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                            <div className="absolute top-0 left-1/2 h-full w-[39%] rounded-full" style={{ background: '#22c55e' }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {i === 1 && (
                    <div className="mt-auto pt-4 space-y-1.5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      {['CONFIRM_BUY', 'CAUTION', 'CONFIRM_SELL'].map((v) => (
                        <div key={v}
                          className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium"
                          style={{
                            background: v === 'CONFIRM_BUY' ? 'rgba(34,197,94,0.07)' : v === 'CONFIRM_SELL' ? 'rgba(239,68,68,0.07)' : 'rgba(234,179,8,0.07)',
                            color: v === 'CONFIRM_BUY' ? '#4ade80' : v === 'CONFIRM_SELL' ? '#f87171' : '#fbbf24',
                          }}
                        >
                          {v}
                        </div>
                      ))}
                    </div>
                  )}

                  {i === 2 && (
                    <div className="mt-auto pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <svg viewBox="0 0 180 52" className="w-full h-10">
                        {MINI_CANDLES.map((c, ci) => (
                          <g key={ci}>
                            <line x1={c.x + 5} y1={c.y - 4} x2={c.x + 5} y2={c.y + c.h + 4}
                              stroke={c.up ? 'rgba(34,197,94,0.5)' : 'rgba(239,68,68,0.5)'} strokeWidth="1" />
                            <rect x={c.x} y={c.y} width={10} height={Math.max(c.h, 2)}
                              fill={c.up ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'}
                              stroke={c.up ? '#22c55e' : '#ef4444'} strokeWidth="0.75" rx="1" />
                          </g>
                        ))}
                      </svg>
                    </div>
                  )}

                  {i === 3 && (
                    <div className="mt-auto pt-4 font-mono text-xs space-y-1" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      {[
                        { l: 'Entry',     v: '$94,230', c: 'rgba(255,255,255,0.6)' },
                        { l: 'Stop Loss', v: '$92,100', c: '#f87171' },
                        { l: 'TP1 (2:1)', v: '$98,490', c: '#4ade80' },
                        { l: 'TP2 (3:1)', v: '$100,620', c: '#4ade80' },
                      ].map((r) => (
                        <div key={r.l} className="flex justify-between">
                          <span style={{ color: 'rgba(255,255,255,0.25)' }}>{r.l}</span>
                          <span style={{ color: r.c }}>{r.v}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {i === 4 && (
                    <div className="mt-auto pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="rounded-xl p-3" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)' }}>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                          <span className="text-xs font-semibold text-emerald-400">BTC/USDT</span>
                          <span className="text-xs ml-auto" style={{ color: 'rgba(255,255,255,0.25)' }}>just now</span>
                        </div>
                        <p className="text-xs font-medium text-white">STRONG BUY signal detected</p>
                        <p className="text-xs mt-0.5 font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>Score: +78 · AI: CONFIRM_BUY</p>
                      </div>
                    </div>
                  )}

                  {i === 5 && (
                    <div className="mt-auto grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      {[
                        { l: 'Fear & Greed', v: '45' },
                        { l: 'BTC Dom', v: '52.1%' },
                        { l: 'ETH Dom', v: '17.4%' },
                        { l: 'Mkt Cap', v: '$3.1T' },
                      ].map((m) => (
                        <div key={m.l}>
                          <div className="text-[10px] uppercase tracking-widest mb-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>{m.l}</div>
                          <div className="text-lg font-bold font-mono text-white">{m.v}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </Section>

      {/* ── CTA ─────────────────────────────────────────────────────────────── */}
      <Section className="py-32 px-6 text-center relative overflow-hidden">
        <motion.div variants={fadeUp} className="relative z-10 max-w-xl mx-auto">
          <GradientHeading className="text-5xl sm:text-6xl md:text-7xl mb-6">
            Trade with<br />more clarity.
          </GradientHeading>
          <p className="mb-10 text-sm max-w-xs mx-auto leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Free account. Watchlist, settings, and alerts saved and synced automatically.
          </p>
          <Link to="/signup">
            <motion.div
              whileHover={{ scale: 1.05, boxShadow: '0 0 50px rgba(99,102,241,0.6)' }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.18 }}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)', boxShadow: '0 0 30px rgba(99,102,241,0.4)' }}
            >
              Create free account <ArrowRight size={14} />
            </motion.div>
          </Link>
          <p className="mt-5 text-xs uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.2)' }}>
            No credit card required
          </p>
        </motion.div>
      </Section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="py-8 px-6" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded flex items-center justify-center text-white font-bold text-xs select-none"
              style={{ background: 'linear-gradient(135deg, #3B82F6, #7C3AED)' }}
            >
              Q
            </div>
            <span className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>Quantix</span>
          </div>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.18)' }}>
            © {new Date().getFullYear()} Quantix · Signal analysis only · Not financial advice
          </p>
        </div>
      </footer>

    </div>
  );
}
