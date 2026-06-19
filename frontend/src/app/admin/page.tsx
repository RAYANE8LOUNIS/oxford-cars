'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Car, CalendarCheck, Users, BarChart3, MessageSquare,
  Plus, Edit2, Trash2, Check, X, Eye, AlertCircle, TrendingUp, FileText
} from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { vehiclesApi, reservationsApi, adminApi, formatPrice } from '@/lib/api';
import { Vehicle, Reservation, Analytics } from '@/types';
import Image from 'next/image';
import toast from 'react-hot-toast';
import Link from 'next/link';

type AdminTab = 'dashboard' | 'vehicles' | 'reservations' | 'customers' | 'messages';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending', confirmed: 'Confirmed', active: 'Active',
  completed: 'Completed', cancelled: 'Cancelled', rejected: 'Rejected',
};

export default function AdminPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [tab, setTab] = useState<AdminTab>('dashboard');
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (!isAuthenticated || !user) { router.push('/auth/login'); return; }
    if (!['admin', 'super_admin'].includes(user.role)) { router.push('/dashboard'); return; }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (!isAuthenticated || !user || !['admin', 'super_admin'].includes(user.role)) return;
    setLoading(true);
    const loaders: Record<AdminTab, () => Promise<void>> = {
      dashboard: async () => {
        const res = await adminApi.getAnalytics();
        setAnalytics(res.data);
      },
      vehicles: async () => {
        const res = await vehiclesApi.getAll();
        setVehicles(res.data);
      },
      reservations: async () => {
        const params: Record<string, string> = statusFilter ? { status: statusFilter } : {};
        const res = await reservationsApi.getAll(params);
        setReservations(res.data.reservations);
      },
      customers: async () => {
        const res = await adminApi.getCustomers();
        setCustomers(res.data.customers);
      },
      messages: async () => {
        const res = await adminApi.getMessages();
        setMessages(res.data);
      },
    };
    loaders[tab]().catch(console.error).finally(() => setLoading(false));
  }, [tab, statusFilter, isAuthenticated, user]);

  const handleUpdateReservationStatus = async (id: string, status: string) => {
    try {
      await reservationsApi.updateStatus(id, status);
      setReservations(prev => prev.map(r => r.id === id ? { ...r, status: status as any } : r));
      toast.success(`Reservation ${status}.`);
    } catch {
      toast.error('Failed to update status.');
    }
  };

  const handleDeleteVehicle = async (id: string) => {
    if (!confirm('Delete this vehicle permanently?')) return;
    try {
      await vehiclesApi.delete(id);
      setVehicles(prev => prev.filter(v => v.id !== id));
      toast.success('Vehicle deleted.');
    } catch {
      toast.error('Failed to delete vehicle.');
    }
  };

  const handleToggleAvailability = async (vehicle: Vehicle) => {
    const fd = new FormData();
    Object.entries(vehicle).forEach(([k, v]) => {
      if (k !== 'images' && k !== 'features' && v !== null && v !== undefined) {
        fd.append(k, String(v));
      }
    });
    fd.set('is_available', String(!vehicle.is_available));
    if (vehicle.features) vehicle.features.forEach(f => fd.append('features', f));
    if (vehicle.images) vehicle.images.forEach(img => fd.append('existing_images', img));
    try {
      await vehiclesApi.update(vehicle.id, fd);
      setVehicles(prev => prev.map(v => v.id === vehicle.id ? { ...v, is_available: !v.is_available } : v));
      toast.success('Availability updated.');
    } catch {
      toast.error('Failed to update.');
    }
  };

  if (!isAuthenticated || !user || !['admin', 'super_admin'].includes(user.role)) return null;

  const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
    { id: 'vehicles', label: 'Fleet', icon: <Car size={16} /> },
    { id: 'reservations', label: 'Reservations', icon: <CalendarCheck size={16} /> },
    { id: 'customers', label: 'Customers', icon: <Users size={16} /> },
    { id: 'messages', label: 'Messages', icon: <MessageSquare size={16} /> },
  ];

  const contractsLink = (
    <Link href="/admin/contracts"
      className="flex items-center gap-3 px-4 py-3 text-sm text-ivory/60 hover:text-gold hover:bg-gold/5 transition-all rounded-sm border border-gold/20 mt-2">
      <FileText size={16} />
      <span>Générer un Contrat</span>
    </Link>
  );

  return (
    <div className="min-h-screen bg-oxford-black pt-20">
      {/* Admin header */}
      <div className="bg-oxford-charcoal border-b border-gold/10 py-6">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 flex items-center justify-between">
          <div>
            <p className="text-gold/60 text-xs tracking-ultra uppercase mb-1" style={{ letterSpacing: '0.3em' }}>Admin Panel</p>
            <h1 className="text-ivory font-light" style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.8rem' }}>
              Oxford Cars Management
            </h1>
          </div>
          <div className="text-right">
            <p className="text-ivory/50 text-sm">{user.first_name} {user.last_name}</p>
            <p className="text-gold/50 text-xs capitalize">{user.role.replace('_', ' ')}</p>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-6">
        {/* Tabs */}
        <div className="flex gap-2 flex-wrap mb-8">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-2.5 text-xs tracking-wider rounded-sm border transition-all ${
                tab === t.id
                  ? 'bg-gold/15 border-gold/50 text-gold'
                  : 'border-gold/10 text-ivory/50 hover:border-gold/25 hover:text-ivory'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
          <Link href="/admin/contracts"
            className="flex items-center gap-2 px-5 py-2.5 text-xs tracking-wider rounded-sm border border-gold/30 text-gold/70 hover:text-gold hover:border-gold/60 transition-all">
            <FileText size={16} /> Contrats
          </Link>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border border-gold/30 border-t-gold rounded-full animate-spin" />
          </div>
        )}

        {/* ─── DASHBOARD ─── */}
        {tab === 'dashboard' && analytics && !loading && (
          <div>
            {/* KPI cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Bookings', value: analytics.bookings.total, sub: `${analytics.bookings.pending} pending`, color: 'text-gold' },
                { label: 'Total Revenue', value: formatPrice(parseFloat(analytics.revenue.total)), sub: `${formatPrice(parseFloat(analytics.revenue.this_month))} this month`, color: 'text-emerald-400' },
                { label: 'Fleet', value: `${analytics.fleet.available}/${analytics.fleet.total}`, sub: 'available', color: 'text-blue-400' },
                { label: 'Clients', value: analytics.customers.total, sub: 'registered', color: 'text-purple-400' },
              ].map((kpi, i) => (
                <motion.div key={kpi.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                  className="p-6 bg-oxford-charcoal border border-gold/10">
                  <p className="text-ivory/40 text-xs tracking-widest uppercase mb-3">{kpi.label}</p>
                  <p className={`text-3xl font-light mb-1 ${kpi.color}`} style={{ fontFamily: 'var(--font-cormorant)' }}>{kpi.value}</p>
                  <p className="text-ivory/30 text-xs">{kpi.sub}</p>
                </motion.div>
              ))}
            </div>

            {/* Booking status breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2 p-6 bg-oxford-charcoal border border-gold/10">
                <h3 className="text-ivory/60 text-xs tracking-widest uppercase mb-5">Booking Status Breakdown</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Confirmed', value: analytics.bookings.confirmed, color: 'bg-emerald-500' },
                    { label: 'Pending', value: analytics.bookings.pending, color: 'bg-amber-500' },
                    { label: 'Completed', value: analytics.bookings.completed, color: 'bg-purple-500' },
                  ].map((item) => {
                    const total = parseInt(analytics.bookings.total) || 1;
                    const pct = Math.round((parseInt(item.value) / total) * 100);
                    return (
                      <div key={item.label}>
                        <div className="flex justify-between mb-1">
                          <span className="text-ivory/60 text-sm">{item.label}</span>
                          <span className="text-ivory/60 text-sm">{item.value} ({pct}%)</span>
                        </div>
                        <div className="h-1.5 bg-oxford-black rounded-full overflow-hidden">
                          <div className={`h-full ${item.color} rounded-full transition-all duration-1000`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top vehicles */}
              <div className="p-6 bg-oxford-charcoal border border-gold/10">
                <h3 className="text-ivory/60 text-xs tracking-widest uppercase mb-5">Top Vehicles</h3>
                <div className="space-y-3">
                  {analytics.topVehicles.slice(0, 4).map((v, i) => (
                    <div key={v.name} className="flex items-center gap-3">
                      <span className="text-gold/40 text-xs w-4">#{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-ivory text-sm truncate">{v.name}</p>
                        <p className="text-ivory/40 text-xs">{v.rental_count} rentals</p>
                      </div>
                      <span className="text-gold text-xs">{formatPrice(parseFloat(v.revenue))}</span>
                    </div>
                  ))}
                  {analytics.topVehicles.length === 0 && (
                    <p className="text-ivory/30 text-sm">No rental data yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── VEHICLES ─── */}
        {tab === 'vehicles' && !loading && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-ivory font-medium tracking-wide">Fleet Management ({vehicles.length} vehicles)</h2>
              <Link href="/admin/vehicles/new" className="btn-gold px-5 py-2.5 rounded-sm text-xs tracking-widest flex items-center gap-2">
                <Plus size={14} /> Add Vehicle
              </Link>
            </div>

            <div className="space-y-3">
              {vehicles.map((v) => (
                <div key={v.id} className="p-5 bg-oxford-charcoal border border-gold/10 hover:border-gold/25 transition-all duration-200 flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Thumbnail */}
                  <div className="w-20 h-14 bg-oxford-black border border-gold/10 flex-shrink-0 relative overflow-hidden">
                    {v.thumbnail ? (
                      <Image src={v.thumbnail} alt={v.name} fill className="object-cover" sizes="80px" />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Car size={20} className="text-gold/20" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-ivory font-medium text-sm">{v.name}</h3>
                      <span className={`px-2 py-0.5 text-xs rounded-sm border ${v.is_available ? 'border-emerald-500/30 text-emerald-400' : 'border-red-500/30 text-red-400'}`}>
                        {v.is_available ? 'Available' : 'Reserved'}
                      </span>
                      {v.is_featured && <span className="px-2 py-0.5 text-xs border border-gold/30 text-gold">Featured</span>}
                    </div>
                    <p className="text-ivory/40 text-xs">
                      {v.category.toUpperCase()} • {v.transmission} • {v.fuel_type} • {v.seats} seats
                    </p>
                  </div>

                  <div className="text-right mr-4">
                    <p className="text-gold text-sm font-light" style={{ fontFamily: 'var(--font-cormorant)' }}>{formatPrice(v.daily_price)}/day</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button onClick={() => handleToggleAvailability(v)}
                      className={`px-3 py-1.5 text-xs border rounded-sm transition-all ${v.is_available ? 'border-red-500/30 text-red-400 hover:bg-red-500/10' : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'}`}>
                      {v.is_available ? 'Mark Reserved' : 'Mark Available'}
                    </button>
                    <Link href={`/admin/vehicles/${v.id}/edit`}
                      className="p-2 border border-gold/20 text-gold/60 hover:text-gold hover:border-gold/40 transition-all rounded-sm">
                      <Edit2 size={14} />
                    </Link>
                    <button onClick={() => handleDeleteVehicle(v.id)}
                      className="p-2 border border-red-500/20 text-red-400/60 hover:text-red-400 hover:border-red-400/40 transition-all rounded-sm">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── RESERVATIONS ─── */}
        {tab === 'reservations' && !loading && (
          <div>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <h2 className="text-ivory font-medium tracking-wide">Reservations ({reservations.length})</h2>
              <div className="flex gap-2 flex-wrap">
                {['', 'pending', 'confirmed', 'active', 'completed', 'cancelled'].map((s) => (
                  <button key={s || 'all'} onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 text-xs tracking-wider rounded-sm border transition-all capitalize ${statusFilter === s ? 'border-gold/50 text-gold bg-gold/10' : 'border-gold/10 text-ivory/50 hover:border-gold/25'}`}>
                    {s || 'All'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {reservations.map((res) => (
                <div key={res.id} className="p-5 bg-oxford-charcoal border border-gold/10 hover:border-gold/20 transition-all">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className={`px-2.5 py-1 text-xs rounded-sm font-medium status-${res.status}`}>{STATUS_LABELS[res.status]}</span>
                        <span className="text-ivory/30 text-xs font-mono">{res.reservation_number}</span>
                        <span className="text-ivory/30 text-xs">{new Date(res.created_at).toLocaleDateString('en-GB')}</span>
                      </div>
                      <p className="text-ivory font-medium text-sm mb-1">{res.vehicle_name}</p>
                      <div className="flex flex-wrap gap-4 text-ivory/40 text-xs">
                        <span>Client: {(res as any).first_name || res.guest_name} {(res as any).last_name || ''}</span>
                        <span>{new Date(res.pickup_date).toLocaleDateString('en-GB')} → {new Date(res.return_date).toLocaleDateString('en-GB')}</span>
                        <span>{res.total_days} days</span>
                        <span>{res.pickup_location}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <p className="text-gold text-lg font-light" style={{ fontFamily: 'var(--font-cormorant)' }}>
                        {formatPrice(res.total_amount)}
                      </p>

                      {res.status === 'pending' && (
                        <div className="flex gap-2">
                          <button onClick={() => handleUpdateReservationStatus(res.id, 'confirmed')}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 rounded-sm transition-all">
                            <Check size={12} /> Confirm
                          </button>
                          <button onClick={() => handleUpdateReservationStatus(res.id, 'rejected')}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-sm transition-all">
                            <X size={12} /> Reject
                          </button>
                        </div>
                      )}
                      {res.status === 'confirmed' && (
                        <div className="flex gap-2">
                          <button onClick={() => handleUpdateReservationStatus(res.id, 'active')}
                            className="px-3 py-1.5 text-xs border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 rounded-sm transition-all">
                            Mark Active
                          </button>
                          <button onClick={() => handleUpdateReservationStatus(res.id, 'cancelled')}
                            className="px-3 py-1.5 text-xs border border-red-500/20 text-red-400/70 hover:bg-red-500/10 rounded-sm transition-all">
                            Cancel
                          </button>
                        </div>
                      )}
                      {res.status === 'active' && (
                        <button onClick={() => handleUpdateReservationStatus(res.id, 'completed')}
                          className="px-3 py-1.5 text-xs border border-purple-500/30 text-purple-400 hover:bg-purple-500/10 rounded-sm transition-all">
                          Mark Completed
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {reservations.length === 0 && (
                <div className="text-center py-16">
                  <CalendarCheck size={40} className="text-gold/20 mx-auto mb-3" />
                  <p className="text-ivory/40">No reservations found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── CUSTOMERS ─── */}
        {tab === 'customers' && !loading && (
          <div>
            <h2 className="text-ivory font-medium tracking-wide mb-6">Customers ({customers.length})</h2>
            <div className="space-y-3">
              {customers.map((c) => (
                <div key={c.id} className="p-5 bg-oxford-charcoal border border-gold/10 flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-gold text-sm font-medium">
                      {c.first_name?.[0]}{c.last_name?.[0]}
                    </div>
                    <div>
                      <p className="text-ivory font-medium text-sm">{c.first_name} {c.last_name}</p>
                      <p className="text-ivory/40 text-xs">{c.email}</p>
                      {c.phone && <p className="text-ivory/30 text-xs">{c.phone}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-8 text-sm">
                    <div className="text-center">
                      <p className="text-gold font-light text-xl" style={{ fontFamily: 'var(--font-cormorant)' }}>{c.total_rentals}</p>
                      <p className="text-ivory/40 text-xs">Rentals</p>
                    </div>
                    <div className="text-center">
                      <p className="text-ivory font-medium">{formatPrice(parseFloat(c.total_spent || 0))}</p>
                      <p className="text-ivory/40 text-xs">Total Spent</p>
                    </div>
                    <p className="text-ivory/30 text-xs">Since {new Date(c.created_at).toLocaleDateString('en-GB')}</p>
                  </div>
                </div>
              ))}
              {customers.length === 0 && (
                <div className="text-center py-16">
                  <Users size={40} className="text-gold/20 mx-auto mb-3" />
                  <p className="text-ivory/40">No customers yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── MESSAGES ─── */}
        {tab === 'messages' && !loading && (
          <div>
            <h2 className="text-ivory font-medium tracking-wide mb-6">Contact Messages ({messages.length})</h2>
            <div className="space-y-3">
              {messages.map((m) => (
                <div key={m.id} className={`p-5 bg-oxford-charcoal border transition-all ${m.is_read ? 'border-gold/10' : 'border-gold/30'}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {!m.is_read && <span className="inline-block w-2 h-2 rounded-full bg-gold mr-2 mb-1" />}
                      <p className="text-ivory font-medium text-sm">{m.name}</p>
                      <div className="flex gap-4 text-ivory/40 text-xs mt-1 mb-3">
                        <a href={`mailto:${m.email}`} className="hover:text-gold transition-colors">{m.email}</a>
                        {m.phone && <span>{m.phone}</span>}
                        <span>{new Date(m.created_at).toLocaleDateString('en-GB')}</span>
                      </div>
                      {m.subject && <p className="text-gold/70 text-xs mb-2">{m.subject}</p>}
                      <p className="text-ivory/60 text-sm leading-relaxed">{m.message}</p>
                    </div>
                    {!m.is_read && (
                      <button
                        onClick={async () => {
                          await adminApi.markMessageRead(m.id);
                          setMessages(prev => prev.map(msg => msg.id === m.id ? { ...msg, is_read: true } : msg));
                        }}
                        className="text-xs text-gold/60 hover:text-gold border border-gold/20 hover:border-gold/40 px-3 py-1.5 rounded-sm transition-all flex-shrink-0"
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {messages.length === 0 && (
                <div className="text-center py-16">
                  <MessageSquare size={40} className="text-gold/20 mx-auto mb-3" />
                  <p className="text-ivory/40">No messages yet</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
