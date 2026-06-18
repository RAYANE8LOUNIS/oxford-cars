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

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.login(form.email, form.password);
      login(res.data.user, res.data.token);
      toast.success(`Welcome back, ${res.data.user.first_name}.`);
      if (['admin', 'super_admin'].includes(res.data.user.role)) {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-oxford-black flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,169,110,0.06),transparent_70%)]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <div className="flex justify-center mb-8">
            <OxfordLogo size="lg" variant="icon" />
          </div>
          <p className="text-gold/60 text-xs tracking-ultra uppercase mb-3" style={{ letterSpacing: '0.3em' }}>
            Welcome Back
          </p>
          <h1 className="text-ivory font-light" style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2.5rem' }}>
            Sign In
          </h1>
        </div>

        <div className="p-8 bg-oxford-charcoal border border-gold/10">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-ivory/40 text-xs tracking-wider block mb-2">Email Address</label>
              <input
                type="email"
                className="luxury-input px-4 py-3.5 rounded-sm w-full"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="text-ivory/40 text-xs tracking-wider block mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  className="luxury-input px-4 py-3.5 pr-12 rounded-sm w-full"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-ivory/30 hover:text-ivory/70 transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full py-4 rounded-sm text-xs tracking-widest disabled:opacity-50 mt-2"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="h-px bg-gold/10 my-6" />

          <p className="text-center text-ivory/40 text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="text-gold hover:text-gold-light transition-colors">
              Create Account
            </Link>
          </p>
        </div>

        <p className="text-center text-ivory/20 text-xs mt-6">
          <Link href="/" className="hover:text-ivory/40 transition-colors">← Back to Oxford Cars</Link>
        </p>
      </motion.div>
    </div>
  );
}
