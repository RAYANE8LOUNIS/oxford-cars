'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, Info, AlertCircle, Star, Gift, Shield, Zap, User, UserPlus } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Link from 'next/link';
import { vehiclesApi, reservationsApi, formatPrice } from '@/lib/api';
import { Vehicle } from '@/types';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';

const LOCATIONS = [
  'Tizi Ouzou – Centre-ville',
  'Tizi Ouzou – Gare routière',
  'Alger – Centre',
  'Alger – Aéroport (Houari Boumediene)',
  'Béjaïa – Centre',
  'Boumerdès',
  'Autre (préciser dans les notes)',
];

type Step = 1 | 2 | 3;

interface BookingData {
  vehicle_id: string;
  pickup_date: Date | null;
  return_date: Date | null;
  pickup_location: string;
  return_location: string;
  notes: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
}

const loyaltyBenefits = [
  { icon: <Star size={16} />, text: 'Suivi de toutes vos réservations en temps réel' },
  { icon: <Gift size={16} />, text: 'Réductions exclusives après 3 locations' },
  { icon: <Zap size={16} />, text: 'Réservation express sans ressaisir vos infos' },
  { icon: <Shield size={16} />, text: 'Statut Client Fidèle & offres prioritaires' },
];

function BookingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  const [step, setStep] = useState<Step>(1);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<{ reservation_number: string; total_amount: number } | null>(null);
  const [guestMode, setGuestMode] = useState<'choose' | 'guest' | 'login'>('choose');

  const [data, setData] = useState<BookingData>({
    vehicle_id: searchParams.get('vehicle') || '',
    pickup_date: null,
    return_date: null,
    pickup_location: '',
    return_location: '',
    notes: '',
    guest_name: '',
    guest_email: '',
    guest_phone: '',
  });

  useEffect(() => {
    vehiclesApi.getAll({ available: 'true' })
      .then((res) => {
        setVehicles(res.data);
        const preselect = res.data.find((v: Vehicle) => v.id === (searchParams.get('vehicle') || ''));
        if (preselect) setSelectedVehicle(preselect);
      })
      .finally(() => setLoading(false));
  }, []);

  // If user is already logged in, skip choice
  useEffect(() => {
    if (isAuthenticated) setGuestMode('guest'); // will show their info directly
  }, [isAuthenticated]);

  const totalDays = data.pickup_date && data.return_date
    ? Math.ceil((data.return_date.getTime() - data.pickup_date.getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  const dailyRate = selectedVehicle
    ? (totalDays >= 7 && selectedVehicle.weekly_price ? selectedVehicle.weekly_price / 7 : selectedVehicle.daily_price)
    : 0;
  const subtotal = dailyRate * totalDays;
  const deposit = selectedVehicle?.deposit_amount || 0;

  const checkAvailability = async () => {
    if (!selectedVehicle || !data.pickup_date || !data.return_date) return;
    setChecking(true);
    try {
      const res = await reservationsApi.checkAvailability({
        vehicle_id: selectedVehicle.id,
        pickup_date: data.pickup_date.toISOString().split('T')[0],
        return_date: data.return_date.toISOString().split('T')[0],
      });
      setIsAvailable(res.data.available);
      if (res.data.available) {
        toast.success('Véhicule disponible pour ces dates !');
        setStep(2);
      } else {
        toast.error('Véhicule non disponible pour ces dates.');
      }
    } catch {
      toast.error('Erreur lors de la vérification.');
    } finally {
      setChecking(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedVehicle || !data.pickup_date || !data.return_date) return;
    if (!isAuthenticated && (!data.guest_name || !data.guest_phone)) {
      toast.error('Veuillez renseigner votre nom et numéro de téléphone.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        vehicle_id: selectedVehicle.id,
        pickup_date: data.pickup_date.toISOString().split('T')[0],
        return_date: data.return_date.toISOString().split('T')[0],
        pickup_location: data.pickup_location,
        return_location: data.return_location || data.pickup_location,
        notes: data.notes,
        guest_name: isAuthenticated ? `${user!.first_name} ${user!.last_name}` : data.guest_name,
        guest_email: isAuthenticated ? user!.email : data.guest_email,
        guest_phone: isAuthenticated ? user!.phone : data.guest_phone,
      };
      const res = await reservationsApi.create(payload);
      setConfirmation({ reservation_number: res.data.reservation_number, total_amount: res.data.total_amount });
      setStep(3);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Erreur lors de la réservation.');
    } finally {
      setSubmitting(false);
    }
  };

  const update = (field: keyof BookingData, value: any) => setData((p) => ({ ...p, [field]: value }));

  // ── Confirmation screen ──
  if (confirmation && step === 3) {
    return (
      <div className="min-h-screen bg-oxford-black pt-20 flex items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-lg w-full text-center">
          <div className="w-20 h-20 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-8">
            <Check size={36} className="text-gold" />
          </div>
          <p className="text-gold/70 text-xs tracking-ultra uppercase mb-4" style={{ letterSpacing: '0.3em' }}>Réservation Envoyée</p>
          <h2 className="text-ivory font-light mb-4" style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2.5rem' }}>
            Demande Reçue
          </h2>
          <div className="h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent mb-6" />
          <p className="text-ivory/60 text-sm mb-3 leading-relaxed">
            Votre demande a été soumise avec succès. Notre équipe vous contactera dans les <span className="text-gold">24h</span> pour confirmer votre réservation.
          </p>
          <p className="text-ivory/40 text-xs mb-8">📞 +213 770 12 37 71 — نتواصل معك قريباً</p>

          <div className="p-6 bg-oxford-charcoal border border-gold/20 rounded-sm mb-6">
            <p className="text-ivory/40 text-xs tracking-widest uppercase mb-2">Numéro de Réservation</p>
            <p className="text-gold text-2xl font-light tracking-widest" style={{ fontFamily: 'var(--font-cormorant)' }}>
              {confirmation.reservation_number}
            </p>
            <div className="h-px bg-gold/20 my-4" />
            <p className="text-ivory/40 text-xs tracking-widest uppercase mb-2">Montant Estimé</p>
            <p className="text-ivory text-xl">{formatPrice(confirmation.total_amount)}</p>
          </div>

          {/* Invite to create account */}
          {!isAuthenticated && (
            <div className="p-5 bg-gold/5 border border-gold/20 rounded-sm mb-6 text-left">
              <p className="text-gold text-sm font-medium mb-2 flex items-center gap-2">
                <Gift size={15} /> Créez un compte pour suivre votre réservation
              </p>
              <p className="text-ivory/50 text-xs leading-relaxed mb-3">
                Gardez un œil sur vos réservations, accédez à votre historique et bénéficiez d'avantages exclusifs en tant que client fidèle.
              </p>
              <Link href="/auth/register" className="btn-gold px-5 py-2.5 rounded-sm text-xs tracking-widest inline-block">
                Créer mon compte gratuitement
              </Link>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {isAuthenticated && (
              <button onClick={() => router.push('/dashboard')} className="btn-gold px-8 py-3.5 rounded-sm text-xs tracking-widest">
                Mes Réservations
              </button>
            )}
            <button onClick={() => router.push('/fleet')} className="btn-outline-gold px-8 py-3.5 rounded-sm text-xs tracking-widest">
              Retour à la Flotte
            </button>
            <a href="https://wa.me/213770123771" target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-sm text-xs tracking-widest border border-green-500/30 text-green-400 hover:bg-green-500/10 transition-all">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
              WhatsApp
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-oxford-black pt-20">
      {/* Header */}
      <div className="relative py-16 bg-oxford-charcoal border-b border-gold/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(201,169,110,0.07),transparent)]" />
        <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
          <p className="text-gold/60 text-xs tracking-ultra uppercase mb-3" style={{ letterSpacing: '0.3em' }}>Réservation en Ligne</p>
          <h1 className="text-ivory font-light" style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>
            Réserver Votre Véhicule
          </h1>
          <p className="text-ivory/40 text-sm mt-3">Sans inscription requise · Confirmation sous 24h</p>
        </div>
      </div>

      {/* Steps indicator */}
      <div className="max-w-5xl mx-auto px-6 lg:px-12 pt-8">
        <div className="flex items-center justify-center gap-4 mb-10">
          {[{ n: 1, label: 'Véhicule & Dates' }, { n: 2, label: 'Vos Coordonnées' }].map(({ n, label }) => (
            <div key={n} className="flex items-center gap-4">
              <div className={`flex items-center gap-3 ${step >= n ? 'text-gold' : 'text-ivory/30'}`}>
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-sm transition-all ${
                  step > n ? 'bg-gold border-gold text-oxford-black' : step === n ? 'border-gold text-gold' : 'border-ivory/20'
                }`}>
                  {step > n ? <Check size={14} /> : n}
                </div>
                <span className="text-xs tracking-widest uppercase hidden sm:block">{label}</span>
              </div>
              {n < 2 && <div className="w-12 h-px bg-gold/20" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-16">
          {/* Main form */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">

              {/* ── STEP 1 ── */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  {/* Vehicle selection */}
                  <div className="mb-8">
                    <h2 className="text-ivory text-sm tracking-widest uppercase mb-4">1. Choisir le Véhicule</h2>
                    {loading ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[1, 2, 3, 4].map(i => <div key={i} className="h-20 shimmer rounded-sm" />)}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                        {vehicles.map((v) => (
                          <button key={v.id} onClick={() => { setSelectedVehicle(v); update('vehicle_id', v.id); setIsAvailable(null); }}
                            className={`p-4 rounded-sm border text-left transition-all duration-200 ${
                              selectedVehicle?.id === v.id ? 'border-gold bg-gold/10' : 'border-gold/10 bg-oxford-charcoal hover:border-gold/30'
                            }`}>
                            <p className="text-ivory text-sm font-medium">{v.name}</p>
                            <div className="flex items-center justify-between mt-1">
                              <p className="text-gold text-xs">{formatPrice(v.daily_price)}/jour</p>
                              <p className="text-ivory/30 text-xs capitalize">{v.transmission}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Dates */}
                  <div className="mb-8">
                    <h2 className="text-ivory text-sm tracking-widest uppercase mb-4">2. Choisir les Dates</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-ivory/50 text-xs tracking-wider block mb-2">Date de départ</label>
                        <DatePicker selected={data.pickup_date}
                          onChange={(d) => { update('pickup_date', d); setIsAvailable(null); }}
                          minDate={new Date()} dateFormat="dd/MM/yyyy" placeholderText="Sélectionner"
                          className="luxury-input px-4 py-3 rounded-sm w-full text-sm cursor-pointer" />
                      </div>
                      <div>
                        <label className="text-ivory/50 text-xs tracking-wider block mb-2">Date de retour</label>
                        <DatePicker selected={data.return_date}
                          onChange={(d) => { update('return_date', d); setIsAvailable(null); }}
                          minDate={data.pickup_date ? new Date(data.pickup_date.getTime() + 86400000) : new Date()}
                          dateFormat="dd/MM/yyyy" placeholderText="Sélectionner"
                          className="luxury-input px-4 py-3 rounded-sm w-full text-sm cursor-pointer" />
                      </div>
                    </div>
                  </div>

                  {/* Locations */}
                  <div className="mb-8">
                    <h2 className="text-ivory text-sm tracking-widest uppercase mb-4">3. Lieu de Prise en Charge</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-ivory/50 text-xs tracking-wider block mb-2">Lieu de départ *</label>
                        <select className="luxury-input px-4 py-3 rounded-sm w-full text-sm" value={data.pickup_location}
                          onChange={(e) => update('pickup_location', e.target.value)}>
                          <option value="">Choisir un lieu</option>
                          {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-ivory/50 text-xs tracking-wider block mb-2">Lieu de retour</label>
                        <select className="luxury-input px-4 py-3 rounded-sm w-full text-sm" value={data.return_location}
                          onChange={(e) => update('return_location', e.target.value)}>
                          <option value="">Même lieu</option>
                          {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  {isAvailable === false && (
                    <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-sm mb-4">
                      <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                      <p className="text-red-400 text-sm">Ce véhicule n'est pas disponible pour ces dates.</p>
                    </div>
                  )}

                  <button onClick={checkAvailability}
                    disabled={!selectedVehicle || !data.pickup_date || !data.return_date || !data.pickup_location || checking}
                    className="btn-gold w-full py-4 rounded-sm text-xs tracking-widest flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed">
                    {checking ? 'Vérification...' : 'Vérifier la Disponibilité'} <ArrowRight size={14} />
                  </button>
                </motion.div>
              )}

              {/* ── STEP 2 ── */}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-sm mb-6 flex items-center gap-3">
                    <Check size={15} className="text-emerald-400" />
                    <p className="text-emerald-400 text-sm">Véhicule disponible pour vos dates !</p>
                  </div>

                  {/* If logged in */}
                  {isAuthenticated ? (
                    <div className="p-5 bg-oxford-charcoal border border-gold/20 rounded-sm mb-6 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center text-gold font-semibold">
                        {user!.first_name[0]}{user!.last_name[0]}
                      </div>
                      <div>
                        <p className="text-ivory font-medium">{user!.first_name} {user!.last_name}</p>
                        <p className="text-ivory/50 text-sm">{user!.email}</p>
                        {user!.phone && <p className="text-ivory/40 text-xs">{user!.phone}</p>}
                      </div>
                      <div className="ml-auto">
                        <span className="px-2.5 py-1 text-xs border border-gold/30 text-gold">Client Fidèle</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Guest or Login choice */}
                      {guestMode === 'choose' && (
                        <div className="mb-6">
                          <p className="text-ivory/60 text-sm mb-5 text-center">Comment souhaitez-vous continuer ?</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Guest */}
                            <button onClick={() => setGuestMode('guest')}
                              className="p-5 border border-gold/20 hover:border-gold/50 bg-oxford-charcoal text-left transition-all duration-200 group rounded-sm">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-gold/10 border border-gold/20 flex items-center justify-center group-hover:border-gold/50 transition-all">
                                  <User size={18} className="text-gold/70" />
                                </div>
                                <div>
                                  <p className="text-ivory font-medium text-sm">Continuer en invité</p>
                                  <p className="text-ivory/40 text-xs">Rapide & sans inscription</p>
                                </div>
                              </div>
                              <p className="text-ivory/40 text-xs leading-relaxed">
                                Réservez directement avec juste votre nom et téléphone.
                              </p>
                            </button>

                            {/* Account */}
                            <button onClick={() => router.push(`/auth/register?redirect=/booking?vehicle=${selectedVehicle?.id}`)}
                              className="p-5 border border-gold/40 hover:border-gold bg-gold/5 hover:bg-gold/10 text-left transition-all duration-200 group rounded-sm">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-gold/20 border border-gold/40 flex items-center justify-center group-hover:border-gold transition-all">
                                  <UserPlus size={18} className="text-gold" />
                                </div>
                                <div>
                                  <p className="text-gold font-medium text-sm">Créer un compte</p>
                                  <p className="text-ivory/50 text-xs">Client Fidèle Oxford Cars</p>
                                </div>
                              </div>
                              <div className="space-y-1">
                                {loyaltyBenefits.slice(0, 3).map((b, i) => (
                                  <p key={i} className="text-ivory/50 text-xs flex items-center gap-1.5">
                                    <span className="text-gold/60">{b.icon}</span> {b.text}
                                  </p>
                                ))}
                              </div>
                            </button>
                          </div>

                          <p className="text-center text-ivory/30 text-xs mt-4">
                            Déjà un compte ?{' '}
                            <Link href={`/auth/login?redirect=/booking?vehicle=${selectedVehicle?.id}`} className="text-gold hover:underline">
                              Se connecter
                            </Link>
                          </p>
                        </div>
                      )}

                      {/* Guest form */}
                      {guestMode === 'guest' && (
                        <div className="mb-6">
                          <div className="flex items-center justify-between mb-4">
                            <h2 className="text-ivory text-sm tracking-widest uppercase">Vos Coordonnées</h2>
                            <button onClick={() => setGuestMode('choose')} className="text-ivory/30 text-xs hover:text-ivory transition-colors">
                              ← Retour
                            </button>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <label className="text-ivory/40 text-xs tracking-wider block mb-2">Nom complet *</label>
                              <input type="text" className="luxury-input px-4 py-3 rounded-sm w-full text-sm"
                                placeholder="Votre nom et prénom"
                                value={data.guest_name} onChange={(e) => update('guest_name', e.target.value)} required />
                            </div>
                            <div>
                              <label className="text-ivory/40 text-xs tracking-wider block mb-2">Numéro de téléphone *</label>
                              <input type="tel" className="luxury-input px-4 py-3 rounded-sm w-full text-sm"
                                placeholder="+213 770 XX XX XX"
                                value={data.guest_phone} onChange={(e) => update('guest_phone', e.target.value)} required />
                            </div>
                            <div>
                              <label className="text-ivory/40 text-xs tracking-wider block mb-2">Email (optionnel)</label>
                              <input type="email" className="luxury-input px-4 py-3 rounded-sm w-full text-sm"
                                placeholder="votre@email.com"
                                value={data.guest_email} onChange={(e) => update('guest_email', e.target.value)} />
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Notes */}
                  {(isAuthenticated || guestMode === 'guest') && (
                    <>
                      <div className="mb-6">
                        <label className="text-ivory/40 text-xs tracking-wider block mb-2">Demandes particulières (optionnel)</label>
                        <textarea rows={3} className="luxury-input px-4 py-3 rounded-sm w-full text-sm resize-none"
                          placeholder="Heure de prise en charge, équipements souhaités..."
                          value={data.notes} onChange={(e) => update('notes', e.target.value)} />
                      </div>

                      <div className="p-4 bg-gold/5 border border-gold/15 rounded-sm mb-6 flex items-start gap-3">
                        <Info size={14} className="text-gold/60 mt-0.5 flex-shrink-0" />
                        <p className="text-ivory/50 text-xs leading-relaxed">
                          Notre équipe vous contactera au <span className="text-gold">+213 770 12 37 71</span> pour confirmer votre réservation. Pas de paiement en ligne — règlement à la prise en charge.
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <button onClick={() => setStep(1)} className="btn-outline-gold px-6 py-4 rounded-sm text-xs tracking-widest">
                          Retour
                        </button>
                        <button onClick={handleSubmit} disabled={submitting}
                          className="btn-gold flex-1 py-4 rounded-sm text-xs tracking-widest flex items-center justify-center gap-3 disabled:opacity-50">
                          {submitting ? 'Envoi en cours...' : 'Confirmer la Réservation'} <ArrowRight size={14} />
                        </button>
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Summary sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 p-6 bg-oxford-charcoal border border-gold/15 rounded-sm">
              <h3 className="text-ivory/60 text-xs tracking-widest uppercase mb-5">Récapitulatif</h3>

              {selectedVehicle ? (
                <div className="mb-5">
                  <p className="text-ivory font-medium text-sm">{selectedVehicle.name}</p>
                  <p className="text-ivory/40 text-xs mt-1">{selectedVehicle.year} • {selectedVehicle.transmission} • {selectedVehicle.seats} places</p>
                </div>
              ) : (
                <p className="text-ivory/30 text-sm mb-5">Aucun véhicule sélectionné</p>
              )}

              <div className="h-px bg-gold/15 mb-5" />
              <div className="space-y-3 text-sm mb-5">
                <div className="flex justify-between">
                  <span className="text-ivory/50">Départ</span>
                  <span className="text-ivory">{data.pickup_date ? data.pickup_date.toLocaleDateString('fr-DZ') : '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ivory/50">Retour</span>
                  <span className="text-ivory">{data.return_date ? data.return_date.toLocaleDateString('fr-DZ') : '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ivory/50">Durée</span>
                  <span className="text-ivory">{totalDays > 0 ? `${totalDays} jour${totalDays > 1 ? 's' : ''}` : '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ivory/50">Tarif/jour</span>
                  <span className="text-ivory">{selectedVehicle ? formatPrice(dailyRate) : '—'}</span>
                </div>
              </div>

              <div className="h-px bg-gold/15 mb-4" />
              {deposit > 0 && (
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-ivory/40">Caution</span>
                  <span className="text-ivory/60">{formatPrice(deposit)}</span>
                </div>
              )}
              <div className="flex justify-between mt-2">
                <span className="text-ivory text-sm font-medium">Total estimé</span>
                <span className="text-gold text-xl font-light" style={{ fontFamily: 'var(--font-cormorant)' }}>
                  {subtotal > 0 ? formatPrice(subtotal) : '—'}
                </span>
              </div>
              {deposit > 0 && <p className="text-ivory/25 text-xs mt-1">+ {formatPrice(deposit)} caution (remboursable)</p>}

              <div className="h-px bg-gold/15 my-5" />

              {/* WhatsApp shortcut */}
              <a href="https://wa.me/213770123771" target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 border border-green-500/25 text-green-400/80 hover:text-green-400 hover:border-green-500/50 rounded-sm text-xs tracking-wider transition-all">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                Réserver par WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-oxford-black" />}>
      <BookingContent />
    </Suspense>
  );
}
