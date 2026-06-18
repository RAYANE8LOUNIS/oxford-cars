'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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

export default function NewVehiclePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [form, setForm] = useState({
    name: '', brand: '', model: '', year: new Date().getFullYear(),
    category: 'suv', transmission: 'automatic', fuel_type: 'petrol',
    seats: 5, doors: 4, color: '', license_plate: '',
    daily_price: '', weekly_price: '', monthly_price: '', deposit_amount: '',
    description: '', is_featured: false,
    features: [] as string[],
  });

  const toggleFeature = (f: string) => setForm(p => ({
    ...p, features: p.features.includes(f) ? p.features.filter(x => x !== f) : [...p.features, f]
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.daily_price) { toast.error('Name and daily price are required'); return; }
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
      images.forEach(img => fd.append('images', img));
      await vehiclesApi.create(fd);
      toast.success('Vehicle added to fleet.');
      router.push('/admin');
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to add vehicle');
    } finally {
      setSaving(false);
    }
  };

  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="min-h-screen bg-oxford-black pt-20 pb-12">
      <div className="max-w-3xl mx-auto px-6 lg:px-12 py-8">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-ivory/40 hover:text-gold transition-colors text-sm mb-8">
          <ArrowLeft size={15} /> Back to Admin
        </button>

        <h1 className="text-ivory font-light mb-8" style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2rem' }}>
          Add New Vehicle
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="p-6 bg-oxford-charcoal border border-gold/10">
            <h2 className="text-ivory/60 text-xs tracking-widest uppercase mb-5">Basic Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-ivory/40 text-xs tracking-wider block mb-2">Vehicle Name *</label>
                <input className="luxury-input px-4 py-3 rounded-sm w-full" value={form.name}
                  onChange={e => set('name', e.target.value)} placeholder="e.g. Nissan Qashqai 2025" required />
              </div>
              <div>
                <label className="text-ivory/40 text-xs tracking-wider block mb-2">Brand *</label>
                <input className="luxury-input px-4 py-3 rounded-sm w-full" value={form.brand}
                  onChange={e => set('brand', e.target.value)} placeholder="Nissan" required />
              </div>
              <div>
                <label className="text-ivory/40 text-xs tracking-wider block mb-2">Model *</label>
                <input className="luxury-input px-4 py-3 rounded-sm w-full" value={form.model}
                  onChange={e => set('model', e.target.value)} placeholder="Qashqai" required />
              </div>
              <div>
                <label className="text-ivory/40 text-xs tracking-wider block mb-2">Year *</label>
                <input type="number" className="luxury-input px-4 py-3 rounded-sm w-full" value={form.year}
                  onChange={e => set('year', parseInt(e.target.value))} min={2000} max={2030} required />
              </div>
              <div>
                <label className="text-ivory/40 text-xs tracking-wider block mb-2">Color</label>
                <input className="luxury-input px-4 py-3 rounded-sm w-full" value={form.color}
                  onChange={e => set('color', e.target.value)} placeholder="Pearl White" />
              </div>
              <div>
                <label className="text-ivory/40 text-xs tracking-wider block mb-2">License Plate</label>
                <input className="luxury-input px-4 py-3 rounded-sm w-full" value={form.license_plate}
                  onChange={e => set('license_plate', e.target.value)} placeholder="123-456-16" />
              </div>
            </div>
          </div>

          {/* Specs */}
          <div className="p-6 bg-oxford-charcoal border border-gold/10">
            <h2 className="text-ivory/60 text-xs tracking-widest uppercase mb-5">Specifications</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-ivory/40 text-xs tracking-wider block mb-2">Category</label>
                <select className="luxury-input px-4 py-3 rounded-sm w-full" value={form.category} onChange={e => set('category', e.target.value)}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="text-ivory/40 text-xs tracking-wider block mb-2">Transmission</label>
                <select className="luxury-input px-4 py-3 rounded-sm w-full" value={form.transmission} onChange={e => set('transmission', e.target.value)}>
                  {TRANSMISSIONS.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="text-ivory/40 text-xs tracking-wider block mb-2">Fuel Type</label>
                <select className="luxury-input px-4 py-3 rounded-sm w-full" value={form.fuel_type} onChange={e => set('fuel_type', e.target.value)}>
                  {FUELS.map(f => <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="text-ivory/40 text-xs tracking-wider block mb-2">Seats</label>
                <input type="number" className="luxury-input px-4 py-3 rounded-sm w-full" value={form.seats}
                  onChange={e => set('seats', parseInt(e.target.value))} min={2} max={9} />
              </div>
              <div>
                <label className="text-ivory/40 text-xs tracking-wider block mb-2">Doors</label>
                <input type="number" className="luxury-input px-4 py-3 rounded-sm w-full" value={form.doors}
                  onChange={e => set('doors', parseInt(e.target.value))} min={2} max={5} />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="p-6 bg-oxford-charcoal border border-gold/10">
            <h2 className="text-ivory/60 text-xs tracking-widest uppercase mb-5">Pricing (DZD)</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="text-ivory/40 text-xs tracking-wider block mb-2">Daily Price *</label>
                <input type="number" className="luxury-input px-4 py-3 rounded-sm w-full" value={form.daily_price}
                  onChange={e => set('daily_price', e.target.value)} placeholder="5000" required />
              </div>
              <div>
                <label className="text-ivory/40 text-xs tracking-wider block mb-2">Weekly Price</label>
                <input type="number" className="luxury-input px-4 py-3 rounded-sm w-full" value={form.weekly_price}
                  onChange={e => set('weekly_price', e.target.value)} placeholder="30000" />
              </div>
              <div>
                <label className="text-ivory/40 text-xs tracking-wider block mb-2">Monthly Price</label>
                <input type="number" className="luxury-input px-4 py-3 rounded-sm w-full" value={form.monthly_price}
                  onChange={e => set('monthly_price', e.target.value)} placeholder="100000" />
              </div>
              <div>
                <label className="text-ivory/40 text-xs tracking-wider block mb-2">Deposit</label>
                <input type="number" className="luxury-input px-4 py-3 rounded-sm w-full" value={form.deposit_amount}
                  onChange={e => set('deposit_amount', e.target.value)} placeholder="50000" />
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="p-6 bg-oxford-charcoal border border-gold/10">
            <h2 className="text-ivory/60 text-xs tracking-widest uppercase mb-5">Features</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {COMMON_FEATURES.map(f => (
                <button key={f} type="button" onClick={() => toggleFeature(f)}
                  className={`px-3 py-1.5 text-xs rounded-sm border transition-all ${form.features.includes(f) ? 'bg-gold/20 border-gold/50 text-gold' : 'border-gold/10 text-ivory/50 hover:border-gold/25'}`}>
                  {f}
                </button>
              ))}
            </div>
            <textarea className="luxury-input px-4 py-3 rounded-sm w-full text-sm resize-none" rows={2}
              placeholder="Add custom features, comma-separated..."
              onBlur={e => {
                const custom = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                setForm(p => ({ ...p, features: Array.from(new Set([...p.features, ...custom])) }));
                e.target.value = '';
              }} />
          </div>

          {/* Description */}
          <div className="p-6 bg-oxford-charcoal border border-gold/10">
            <h2 className="text-ivory/60 text-xs tracking-widest uppercase mb-5">Description</h2>
            <textarea className="luxury-input px-4 py-3 rounded-sm w-full text-sm resize-none" rows={4}
              placeholder="Vehicle description..."
              value={form.description} onChange={e => set('description', e.target.value)} />
          </div>

          {/* Images */}
          <div className="p-6 bg-oxford-charcoal border border-gold/10">
            <h2 className="text-ivory/60 text-xs tracking-widest uppercase mb-5">Photos</h2>
            <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gold/20 hover:border-gold/40 transition-colors cursor-pointer rounded-sm">
              <Upload size={24} className="text-gold/40 mb-2" />
              <span className="text-ivory/40 text-sm">Click to upload photos</span>
              <input type="file" multiple accept="image/*" className="hidden"
                onChange={e => setImages(Array.from(e.target.files || []))} />
            </label>
            {images.length > 0 && (
              <div className="flex gap-3 mt-4 flex-wrap">
                {images.map((img, i) => (
                  <div key={i} className="relative w-20 h-14 rounded-sm overflow-hidden border border-gold/20">
                    <img src={URL.createObjectURL(img)} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setImages(prev => prev.filter((_, j) => j !== i))}
                      className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/70 flex items-center justify-center">
                      <X size={10} className="text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Options */}
          <div className="p-6 bg-oxford-charcoal border border-gold/10">
            <label className="flex items-center gap-3 cursor-pointer">
              <div className={`w-10 h-5 rounded-full border transition-all duration-300 relative ${form.is_featured ? 'bg-gold border-gold' : 'bg-transparent border-gold/20'}`}
                onClick={() => set('is_featured', !form.is_featured)}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-300 ${form.is_featured ? 'left-5' : 'left-0.5'}`} />
              </div>
              <span className="text-ivory/70 text-sm">Mark as Featured Vehicle</span>
            </label>
          </div>

          <div className="flex gap-4">
            <button type="submit" disabled={saving} className="btn-gold flex-1 py-4 rounded-sm text-xs tracking-widest disabled:opacity-50">
              {saving ? 'Adding Vehicle...' : 'Add to Fleet'}
            </button>
            <button type="button" onClick={() => router.back()} className="btn-outline-gold px-8 py-4 rounded-sm text-xs tracking-widest">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
