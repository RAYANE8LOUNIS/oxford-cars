'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { vehiclesApi } from '@/lib/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['suv', 'sedan', 'compact', 'luxury', 'crossover'];
const TRANSMISSIONS = ['automatic', 'manual'];
const FUELS = ['petrol', 'diesel', 'hybrid', 'electric'];
const COMMON_FEATURES = [
  'Apple CarPlay', 'Android Auto', 'Heated Seats', 'Panoramic Sunroof',
  'Rear Camera', 'LED Headlights', 'Cruise Control', 'Bluetooth',
  'Climate Control', 'Park Assist', 'Lane Assist', 'Keyless Entry',
];

export default function EditVehiclePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: '', brand: '', model: '', year: new Date().getFullYear(),
    category: 'suv', transmission: 'automatic', fuel_type: 'petrol',
    seats: 5, doors: 4, color: '', license_plate: '',
    daily_price: '', weekly_price: '', monthly_price: '', deposit_amount: '',
    description: '', is_featured: false, features: [] as string[],
  });

  useEffect(() => {
    vehiclesApi.getOne(id).then(res => {
      const v = res.data;
      setForm({
        name: v.name || '',
        brand: v.brand || '',
        model: v.model || '',
        year: v.year || new Date().getFullYear(),
        category: v.category || 'suv',
        transmission: v.transmission || 'automatic',
        fuel_type: v.fuel_type || 'petrol',
        seats: v.seats || 5,
        doors: v.doors || 4,
        color: v.color || '',
        license_plate: v.license_plate || '',
        daily_price: v.daily_price || '',
        weekly_price: v.weekly_price || '',
        monthly_price: v.monthly_price || '',
        deposit_amount: v.deposit_amount || '',
        description: v.description || '',
        is_featured: v.is_featured || false,
        features: v.features || [],
      });
      setExistingImages(v.images || []);
      setLoading(false);
    }).catch(() => { toast.error('Vehicle not found'); router.push('/admin'); });
  }, [id]);

  const toggleFeature = (f: string) => setForm(p => ({
    ...p, features: p.features.includes(f) ? p.features.filter(x => x !== f) : [...p.features, f]
  }));

  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'features') {
          (v as string[]).forEach(f => fd.append('features', f));
        } else {
          fd.append(k, String(v));
        }
      });
      existingImages.forEach(url => fd.append('existing_images', url));
      newImages.forEach(img => fd.append('images', img));
      await vehiclesApi.update(id, fd);
      toast.success('Vehicle updated.');
      router.push('/admin');
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to update vehicle');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-oxford-black pt-20 flex items-center justify-center">
      <p className="text-ivory/40">Loading...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-oxford-black pt-20 pb-12">
      <div className="max-w-3xl mx-auto px-6 lg:px-12 py-8">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-ivory/40 hover:text-gold transition-colors text-sm mb-8">
          <ArrowLeft size={15} /> Back to Admin
        </button>

        <h1 className="text-ivory font-light mb-8" style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2rem' }}>
          Edit Vehicle
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="p-6 bg-oxford-charcoal border border-gold/10">
            <h2 className="text-ivory/60 text-xs tracking-widest uppercase mb-5">Informations de base</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-ivory/40 text-xs tracking-wider block mb-2">Nom du véhicule *</label>
                <input className="luxury-input px-4 py-3 rounded-sm w-full" value={form.name}
                  onChange={e => set('name', e.target.value)} required />
              </div>
              <div>
                <label className="text-ivory/40 text-xs tracking-wider block mb-2">Marque *</label>
                <input className="luxury-input px-4 py-3 rounded-sm w-full" value={form.brand}
                  onChange={e => set('brand', e.target.value)} required />
              </div>
              <div>
                <label className="text-ivory/40 text-xs tracking-wider block mb-2">Modèle *</label>
                <input className="luxury-input px-4 py-3 rounded-sm w-full" value={form.model}
                  onChange={e => set('model', e.target.value)} required />
              </div>
              <div>
                <label className="text-ivory/40 text-xs tracking-wider block mb-2">Année *</label>
                <input type="number" className="luxury-input px-4 py-3 rounded-sm w-full" value={form.year}
                  onChange={e => set('year', parseInt(e.target.value))} min={2000} max={2030} required />
              </div>
              <div>
                <label className="text-ivory/40 text-xs tracking-wider block mb-2">Couleur</label>
                <input className="luxury-input px-4 py-3 rounded-sm w-full" value={form.color}
                  onChange={e => set('color', e.target.value)} />
              </div>
              <div>
                <label className="text-ivory/40 text-xs tracking-wider block mb-2">Immatriculation</label>
                <input className="luxury-input px-4 py-3 rounded-sm w-full" value={form.license_plate}
                  onChange={e => set('license_plate', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Specs */}
          <div className="p-6 bg-oxford-charcoal border border-gold/10">
            <h2 className="text-ivory/60 text-xs tracking-widest uppercase mb-5">Spécifications</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-ivory/40 text-xs tracking-wider block mb-2">Catégorie</label>
                <select className="luxury-input px-4 py-3 rounded-sm w-full" value={form.category} onChange={e => set('category', e.target.value)}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="text-ivory/40 text-xs tracking-wider block mb-2">Transmission</label>
                <select className="luxury-input px-4 py-3 rounded-sm w-full" value={form.transmission} onChange={e => set('transmission', e.target.value)}>
                  {TRANSMISSIONS.map(t => <option key={t} value={t}>{t === 'automatic' ? 'Automatique' : 'Manuelle'}</option>)}
                </select>
              </div>
              <div>
                <label className="text-ivory/40 text-xs tracking-wider block mb-2">Carburant</label>
                <select className="luxury-input px-4 py-3 rounded-sm w-full" value={form.fuel_type} onChange={e => set('fuel_type', e.target.value)}>
                  {FUELS.map(f => <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="text-ivory/40 text-xs tracking-wider block mb-2">Places</label>
                <input type="number" className="luxury-input px-4 py-3 rounded-sm w-full" value={form.seats}
                  onChange={e => set('seats', parseInt(e.target.value))} min={2} max={9} />
              </div>
              <div>
                <label className="text-ivory/40 text-xs tracking-wider block mb-2">Portes</label>
                <input type="number" className="luxury-input px-4 py-3 rounded-sm w-full" value={form.doors}
                  onChange={e => set('doors', parseInt(e.target.value))} min={2} max={5} />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="p-6 bg-oxford-charcoal border border-gold/10">
            <h2 className="text-ivory/60 text-xs tracking-widest uppercase mb-5">Tarifs (DZD)</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="text-ivory/40 text-xs tracking-wider block mb-2">Prix/jour *</label>
                <input type="number" className="luxury-input px-4 py-3 rounded-sm w-full" value={form.daily_price}
                  onChange={e => set('daily_price', e.target.value)} required />
              </div>
              <div>
                <label className="text-ivory/40 text-xs tracking-wider block mb-2">Prix/semaine</label>
                <input type="number" className="luxury-input px-4 py-3 rounded-sm w-full" value={form.weekly_price}
                  onChange={e => set('weekly_price', e.target.value)} />
              </div>
              <div>
                <label className="text-ivory/40 text-xs tracking-wider block mb-2">Prix/mois</label>
                <input type="number" className="luxury-input px-4 py-3 rounded-sm w-full" value={form.monthly_price}
                  onChange={e => set('monthly_price', e.target.value)} />
              </div>
              <div>
                <label className="text-ivory/40 text-xs tracking-wider block mb-2">Caution</label>
                <input type="number" className="luxury-input px-4 py-3 rounded-sm w-full" value={form.deposit_amount}
                  onChange={e => set('deposit_amount', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="p-6 bg-oxford-charcoal border border-gold/10">
            <h2 className="text-ivory/60 text-xs tracking-widest uppercase mb-5">Équipements</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {COMMON_FEATURES.map(f => (
                <button key={f} type="button" onClick={() => toggleFeature(f)}
                  className={`px-3 py-1.5 text-xs rounded-sm border transition-all ${form.features.includes(f) ? 'bg-gold/20 border-gold/50 text-gold' : 'border-gold/10 text-ivory/50 hover:border-gold/25'}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="p-6 bg-oxford-charcoal border border-gold/10">
            <h2 className="text-ivory/60 text-xs tracking-widest uppercase mb-5">Description</h2>
            <textarea className="luxury-input px-4 py-3 rounded-sm w-full text-sm resize-none" rows={4}
              value={form.description} onChange={e => set('description', e.target.value)} />
          </div>

          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div className="p-6 bg-oxford-charcoal border border-gold/10">
              <h2 className="text-ivory/60 text-xs tracking-widest uppercase mb-5">Photos actuelles</h2>
              <div className="flex gap-3 flex-wrap">
                {existingImages.map((url, i) => (
                  <div key={i} className="relative w-28 h-20 rounded-sm overflow-hidden border border-gold/20 group">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button type="button"
                      onClick={() => setExistingImages(prev => prev.filter((_, j) => j !== i))}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                      <X size={18} className="text-red-400" />
                    </button>
                    {i === 0 && <span className="absolute bottom-1 left-1 text-xs bg-gold/80 text-oxford-black px-1.5 py-0.5 rounded-sm">Principal</span>}
                  </div>
                ))}
              </div>
              <p className="text-ivory/30 text-xs mt-3">Survolez une photo et cliquez sur ✕ pour la supprimer</p>
            </div>
          )}

          {/* New Images */}
          <div className="p-6 bg-oxford-charcoal border border-gold/10">
            <h2 className="text-ivory/60 text-xs tracking-widest uppercase mb-5">Ajouter des photos</h2>
            <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-gold/20 hover:border-gold/40 transition-colors cursor-pointer rounded-sm">
              <Upload size={20} className="text-gold/40 mb-2" />
              <span className="text-ivory/40 text-sm">Cliquer pour uploader</span>
              <input type="file" multiple accept="image/*" className="hidden"
                onChange={e => setNewImages(Array.from(e.target.files || []))} />
            </label>
            {newImages.length > 0 && (
              <div className="flex gap-3 mt-4 flex-wrap">
                {newImages.map((img, i) => (
                  <div key={i} className="relative w-20 h-14 rounded-sm overflow-hidden border border-gold/20">
                    <img src={URL.createObjectURL(img)} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setNewImages(prev => prev.filter((_, j) => j !== i))}
                      className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/70 flex items-center justify-center">
                      <X size={10} className="text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Featured */}
          <div className="p-6 bg-oxford-charcoal border border-gold/10">
            <label className="flex items-center gap-3 cursor-pointer">
              <div className={`w-10 h-5 rounded-full border transition-all duration-300 relative ${form.is_featured ? 'bg-gold border-gold' : 'bg-transparent border-gold/20'}`}
                onClick={() => set('is_featured', !form.is_featured)}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-300 ${form.is_featured ? 'left-5' : 'left-0.5'}`} />
              </div>
              <span className="text-ivory/70 text-sm">Véhicule mis en avant</span>
            </label>
          </div>

          <div className="flex gap-4">
            <button type="submit" disabled={saving} className="btn-gold flex-1 py-4 rounded-sm text-xs tracking-widest disabled:opacity-50">
              {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
            <button type="button" onClick={() => router.back()} className="btn-outline-gold px-8 py-4 rounded-sm text-xs tracking-widest">
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
