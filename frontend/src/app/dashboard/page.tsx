'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CalendarDays, Car, Clock, CheckCircle, XCircle, LogOut, User, Phone, Mail, Edit2, Save } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { reservationsApi, authApi, formatPrice } from '@/lib/api';
import { Reservation } from '@/types';
import toast from 'react-hot-toast';

const STATUS_MAP: Record<string, { label: string; class: string }> = {
  pending: { label: 'Pending', class: 'status-pending' },
  confirmed: { label: 'Confirmed', class: 'status-confirmed' },
  active: { label: 'Active', class: 'status-active' },
  completed: { label: 'Completed', class: 'status-completed' },
  cancelled: { label: 'Cancelled', class: 'status-cancelled' },
  rejected: { label: 'Rejected', class: 'status-rejected' },
};

type Tab = 'reservations' | 'profile';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout, updateUser } = useAuthStore();
  const [tab, setTab] = useState<Tab>('reservations');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({ first_name: '', last_name: '', phone: '', city: '', wilaya: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/auth/login'); return; }
    setProfileForm({
      first_name: user!.first_name,
      last_name: user!.last_name,
      phone: user!.phone || '',
      city: user!.city || '',
      wilaya: user!.wilaya || '',
    });
    reservationsApi.getMy()
      .then((res) => setReservations(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const handleCancelReservation = async (id: string) => {
    if (!confirm('Cancel this reservation?')) return;
    try {
      await reservationsApi.cancel(id);
      setReservations((prev) => prev.map((r) => r.id === id ? { ...r, status: 'cancelled' } : r));
      toast.success('Reservation cancelled.');
    } catch {
      toast.error('Failed to cancel reservation.');
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await authApi.updateProfile(profileForm);
      updateUser(res.data);
      setEditing(false);
      toast.success('Profile updated.');
    } catch {
      toast.error('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated || !user) return null;

  const completedCount = reservations.filter(r => r.status === 'completed').length;
  const loyaltyTier = completedCount >= 10 ? { label: '🥇 Gold', color: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10' }
    : completedCount >= 5 ? { label: '🥈 Silver', color: 'text-slate-300 border-slate-300/30 bg-slate-300/10' }
    : completedCount >= 3 ? { label: '🥉 Bronze', color: 'text-amber-600 border-amber-600/30 bg-amber-600/10' }
    : { label: '⭐ Nouveau Client', color: 'text-gold/70 border-gold/20 bg-gold/5' };

  const stats = [
    { label: 'Réservations', value: reservations.length, icon: <Car size={20} /> },
    { label: 'En cours', value: reservations.filter(r => r.status === 'active').length, icon: <Clock size={20} /> },
    { label: 'Terminées', value: completedCount, icon: <CheckCircle size={20} /> },
    { label: 'Annulées', value: reservations.filter(r => r.status === 'cancelled').length, icon: <XCircle size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-oxford-black pt-20">
      {/* Header */}
      <div className="bg-oxford-charcoal border-b border-gold/10 py-10 lg:py-14">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <p className="text-gold/60 text-xs tracking-ultra uppercase mb-2" style={{ letterSpacing: '0.3em' }}>Mon Espace Client</p>
              <h1 className="text-ivory font-light" style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2.5rem' }}>
                Bienvenue, {user.first_name}
              </h1>
              <span className={`mt-2 inline-flex px-3 py-1 text-xs border rounded-sm font-medium ${loyaltyTier.color}`}>
                {loyaltyTier.label}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/fleet" className="btn-gold px-6 py-3 rounded-sm text-xs tracking-widest">
                Réserver un Véhicule
              </Link>
              <button
                onClick={() => { logout(); router.push('/'); }}
                className="flex items-center gap-2 text-ivory/40 hover:text-ivory transition-colors text-sm"
              >
                <LogOut size={15} /> Sign Out
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {stats.map((s) => (
              <div key={s.label} className="p-4 bg-oxford-black border border-gold/10 flex items-center gap-4">
                <div className="w-10 h-10 bg-gold/10 flex items-center justify-center text-gold/70">
                  {s.icon}
                </div>
                <div>
                  <p className="text-ivory text-xl font-light" style={{ fontFamily: 'var(--font-cormorant)' }}>{s.value}</p>
                  <p className="text-ivory/40 text-xs">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
        <div className="flex gap-8 border-b border-gold/10 mb-8">
          {([['reservations', 'Mes Réservations'], ['profile', 'Mon Profil']] as [Tab, string][]).map(([t, label]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-4 text-xs tracking-widest uppercase transition-all duration-200 border-b-2 -mb-px ${
                tab === t ? 'border-gold text-gold' : 'border-transparent text-ivory/40 hover:text-ivory'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Reservations */}
        {tab === 'reservations' && (
          <div>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-28 shimmer rounded-sm" />)}
              </div>
            ) : reservations.length === 0 ? (
              <div className="text-center py-20">
                <Car size={48} className="text-gold/20 mx-auto mb-4" />
                <p className="text-ivory/50 text-lg mb-2" style={{ fontFamily: 'var(--font-cormorant)' }}>Aucune réservation</p>
                <p className="text-ivory/30 text-sm mb-6">Votre historique de locations apparaîtra ici.</p>
                <Link href="/fleet" className="btn-gold px-8 py-3 rounded-sm text-xs tracking-widest">
                  Voir la Flotte
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {reservations.map((res, i) => (
                  <motion.div
                    key={res.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-6 bg-oxford-charcoal border border-gold/10 hover:border-gold/25 transition-all duration-300"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-2.5 py-1 text-xs rounded-sm font-medium ${STATUS_MAP[res.status]?.class}`}>
                            {STATUS_MAP[res.status]?.label}
                          </span>
                          <span className="text-ivory/30 text-xs tracking-wider font-mono">{res.reservation_number}</span>
                        </div>
                        <h3 className="text-ivory font-medium mb-1">{res.vehicle_name || 'Vehicle'}</h3>
                        <div className="flex flex-wrap gap-4 text-ivory/50 text-xs">
                          <span className="flex items-center gap-1.5">
                            <CalendarDays size={12} /> {new Date(res.pickup_date).toLocaleDateString('en-GB')} → {new Date(res.return_date).toLocaleDateString('en-GB')}
                          </span>
                          <span>{res.total_days} day{res.total_days !== 1 ? 's' : ''}</span>
                          <span>{res.pickup_location}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-ivory/40 text-xs mb-1">Total</p>
                          <p className="text-gold text-lg font-light" style={{ fontFamily: 'var(--font-cormorant)' }}>
                            {formatPrice(res.total_amount)}
                          </p>
                        </div>
                        {['pending', 'confirmed'].includes(res.status) && (
                          <button
                            onClick={() => handleCancelReservation(res.id)}
                            className="text-xs text-red-400/60 hover:text-red-400 transition-colors border border-red-500/20 hover:border-red-400/40 px-3 py-2 rounded-sm"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile */}
        {tab === 'profile' && (
          <div className="max-w-xl">
            <div className="p-8 bg-oxford-charcoal border border-gold/10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-ivory font-medium tracking-wide">Personal Information</h2>
                {!editing ? (
                  <button onClick={() => setEditing(true)} className="flex items-center gap-2 text-gold text-xs tracking-wider hover:text-gold-light transition-colors">
                    <Edit2 size={13} /> Edit
                  </button>
                ) : (
                  <button onClick={handleSaveProfile} disabled={saving} className="flex items-center gap-2 text-gold text-xs tracking-wider disabled:opacity-50">
                    <Save size={13} /> {saving ? 'Saving...' : 'Save'}
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-ivory/40 text-xs tracking-wider block mb-2">First Name</label>
                    {editing ? (
                      <input className="luxury-input px-4 py-2.5 rounded-sm w-full text-sm"
                        value={profileForm.first_name} onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })} />
                    ) : (
                      <p className="text-ivory text-sm">{user.first_name}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-ivory/40 text-xs tracking-wider block mb-2">Last Name</label>
                    {editing ? (
                      <input className="luxury-input px-4 py-2.5 rounded-sm w-full text-sm"
                        value={profileForm.last_name} onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })} />
                    ) : (
                      <p className="text-ivory text-sm">{user.last_name}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-ivory/40 text-xs tracking-wider block mb-2">Email Address</label>
                  <p className="text-ivory/60 text-sm flex items-center gap-2">
                    <Mail size={13} className="text-gold/50" /> {user.email}
                  </p>
                </div>

                <div>
                  <label className="text-ivory/40 text-xs tracking-wider block mb-2">Phone Number</label>
                  {editing ? (
                    <input className="luxury-input px-4 py-2.5 rounded-sm w-full text-sm"
                      value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} />
                  ) : (
                    <p className="text-ivory text-sm flex items-center gap-2">
                      <Phone size={13} className="text-gold/50" /> {user.phone || '—'}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-ivory/40 text-xs tracking-wider block mb-2">City</label>
                    {editing ? (
                      <input className="luxury-input px-4 py-2.5 rounded-sm w-full text-sm"
                        value={profileForm.city} onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })} />
                    ) : (
                      <p className="text-ivory text-sm">{user.city || '—'}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-ivory/40 text-xs tracking-wider block mb-2">Wilaya</label>
                    {editing ? (
                      <input className="luxury-input px-4 py-2.5 rounded-sm w-full text-sm"
                        value={profileForm.wilaya} onChange={(e) => setProfileForm({ ...profileForm, wilaya: e.target.value })} />
                    ) : (
                      <p className="text-ivory text-sm">{user.wilaya || '—'}</p>
                    )}
                  </div>
                </div>

                {editing && (
                  <div className="flex gap-3 pt-2">
                    <button onClick={handleSaveProfile} disabled={saving} className="btn-gold px-6 py-2.5 rounded-sm text-xs tracking-widest disabled:opacity-50">
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button onClick={() => setEditing(false)} className="btn-outline-gold px-6 py-2.5 rounded-sm text-xs tracking-widest">
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 p-6 bg-oxford-charcoal border border-gold/10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center">
                  <span className="text-gold text-xs font-semibold">{user.first_name[0]}{user.last_name[0]}</span>
                </div>
                <div>
                  <p className="text-ivory text-sm font-medium">{user.first_name} {user.last_name}</p>
                  <p className="text-ivory/40 text-xs capitalize">{user.role} account</p>
                </div>
              </div>
              <p className="text-ivory/30 text-xs mt-3">Member since {new Date(user.created_at).toLocaleDateString('en-GB', { year: 'numeric', month: 'long' })}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
