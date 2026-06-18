'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import OxfordLogo from '@/components/ui/OxfordLogo';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '', password: '', confirm: ''
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const res = await authApi.register({
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });
      login(res.data.user, res.data.token);
      toast.success('Account created. Welcome to Oxford Cars.');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-oxford-black flex items-center justify-center px-6 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,169,110,0.06),transparent_70%)]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <OxfordLogo size="lg" variant="icon" />
          </div>
          <p className="text-gold/60 text-xs tracking-ultra uppercase mb-3" style={{ letterSpacing: '0.3em' }}>
            Programme Fidélité
          </p>
          <h1 className="text-ivory font-light" style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2.5rem' }}>
            Rejoindre Oxford Cars
          </h1>
        </div>

        {/* Loyalty benefits banner */}
        <div className="p-5 bg-gold/5 border border-gold/20 rounded-sm mb-6">
          <p className="text-gold text-xs tracking-widest uppercase mb-4 text-center">Avantages Client Fidèle</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: '📋', text: 'Suivi de réservations en temps réel' },
              { icon: '🎁', text: 'Réductions après 3 locations' },
              { icon: '⚡', text: 'Réservation express sans ressaisie' },
              { icon: '⭐', text: 'Offres & tarifs prioritaires' },
            ].map((b, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-ivory/60">
                <span>{b.icon}</span> {b.text}
              </div>
            ))}
          </div>
        </div>

        <div className="p-8 bg-oxford-charcoal border border-gold/10">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-ivory/40 text-xs tracking-wider block mb-2">First Name</label>
                <input type="text" className="luxury-input px-4 py-3 rounded-sm w-full text-sm"
                  value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} required />
              </div>
              <div>
                <label className="text-ivory/40 text-xs tracking-wider block mb-2">Last Name</label>
                <input type="text" className="luxury-input px-4 py-3 rounded-sm w-full text-sm"
                  value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} required />
              </div>
            </div>
            <div>
              <label className="text-ivory/40 text-xs tracking-wider block mb-2">Email Address</label>
              <input type="email" className="luxury-input px-4 py-3 rounded-sm w-full text-sm"
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="text-ivory/40 text-xs tracking-wider block mb-2">Phone Number</label>
              <input type="tel" className="luxury-input px-4 py-3 rounded-sm w-full text-sm"
                placeholder="+213 ..."
                value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="text-ivory/40 text-xs tracking-wider block mb-2">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} className="luxury-input px-4 py-3 pr-12 rounded-sm w-full text-sm"
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-ivory/30 hover:text-ivory/60">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-ivory/40 text-xs tracking-wider block mb-2">Confirm Password</label>
              <input type="password" className="luxury-input px-4 py-3 rounded-sm w-full text-sm"
                value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} required />
            </div>

            <button type="submit" disabled={loading}
              className="btn-gold w-full py-4 rounded-sm text-xs tracking-widest disabled:opacity-50 mt-2">
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="h-px bg-gold/10 my-6" />
          <p className="text-center text-ivory/40 text-sm">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-gold hover:text-gold-light transition-colors">Sign In</Link>
          </p>
        </div>

        <p className="text-center text-ivory/20 text-xs mt-6">
          <Link href="/" className="hover:text-ivory/40 transition-colors">← Back to Oxford Cars</Link>
        </p>
      </motion.div>
    </div>
  );
}
