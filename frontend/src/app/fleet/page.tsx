'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import VehicleCard from '@/components/ui/VehicleCard';
import SectionHeader from '@/components/ui/SectionHeader';
import { vehiclesApi } from '@/lib/api';
import { Vehicle } from '@/types';
import { useSearchParams, useRouter } from 'next/navigation';

const categories = [
  { value: '', label: 'All Vehicles' },
  { value: 'suv', label: 'SUV' },
  { value: 'crossover', label: 'Crossover' },
  { value: 'sedan', label: 'Sedan' },
  { value: 'compact', label: 'Compact' },
];

const transmissions = [
  { value: '', label: 'All' },
  { value: 'automatic', label: 'Automatic' },
  { value: 'manual', label: 'Manual' },
];

function FleetContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [transmission, setTransmission] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (category) params.category = category;
      if (transmission) params.transmission = transmission;
      if (availableOnly) params.available = 'true';
      if (search) params.search = search;
      const res = await vehiclesApi.getAll(params);
      setVehicles(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [category, transmission, availableOnly, search]);

  useEffect(() => {
    const timeout = setTimeout(fetchVehicles, search ? 400 : 0);
    return () => clearTimeout(timeout);
  }, [fetchVehicles, search]);

  const clearFilters = () => {
    setCategory('');
    setTransmission('');
    setAvailableOnly(false);
    setSearch('');
  };

  const hasFilters = category || transmission || availableOnly || search;

  return (
    <div className="min-h-screen bg-oxford-black pt-20" suppressHydrationWarning>
      {/* Hero */}
      <div className="relative py-20 lg:py-28 bg-oxford-charcoal border-b border-gold/10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(201,169,110,0.07),transparent_60%)]" />
        <div className="max-w-8xl mx-auto px-6 lg:px-12 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="text-gold/60 text-xs tracking-ultra uppercase mb-4" style={{ letterSpacing: '0.3em' }}>
              Our Collection
            </p>
            <h1
              className="text-ivory font-light leading-tight mb-4"
              style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(2.5rem, 5vw, 4.5rem)' }}
            >
              The Oxford Fleet
            </h1>
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px w-12 bg-gold/40" />
              <span className="w-1.5 h-1.5 rounded-full bg-gold inline-block" />
              <div className="h-px w-12 bg-gold/40" />
            </div>
            <p className="text-ivory/50 text-lg max-w-xl font-light">
              Discover our curated selection of premium vehicles, each maintained to the highest standards of excellence.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Filters bar */}
      <div className="sticky top-20 z-30 bg-oxford-black/95 backdrop-blur-xl border-b border-gold/10">
        <div className="max-w-8xl mx-auto px-6 lg:px-12 py-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-ivory/30" />
              <input
                type="text"
                placeholder="Search vehicles..."
                className="luxury-input pl-10 pr-4 py-2.5 rounded-sm w-full text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Category pills */}
            <div className="flex gap-2 flex-wrap">
              {categories.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setCategory(c.value)}
                  className={`px-4 py-2 text-xs tracking-widest uppercase rounded-sm border transition-all duration-200 ${
                    category === c.value
                      ? 'bg-gold text-oxford-black border-gold'
                      : 'border-gold/20 text-ivory/60 hover:border-gold/40 hover:text-ivory'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* More filters toggle */}
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`flex items-center gap-2 text-xs tracking-wider px-4 py-2 border rounded-sm transition-all ${
                filtersOpen ? 'border-gold text-gold' : 'border-gold/20 text-ivory/60 hover:border-gold/40'
              }`}
            >
              <SlidersHorizontal size={14} />
              Filters
            </button>

            {hasFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1.5 text-xs text-red-400/70 hover:text-red-400 transition-colors">
                <X size={13} /> Clear
              </button>
            )}

            {/* Results count */}
            <span className="text-ivory/30 text-xs ml-auto hidden lg:block">
              {vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Expanded filters */}
          <AnimatePresence>
            {filtersOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 flex flex-wrap gap-6 items-center border-t border-gold/10 mt-4">
                  {/* Transmission */}
                  <div className="flex items-center gap-3">
                    <span className="text-ivory/40 text-xs tracking-widest uppercase">Transmission</span>
                    <div className="flex gap-2">
                      {transmissions.map((t) => (
                        <button
                          key={t.value}
                          onClick={() => setTransmission(t.value)}
                          className={`px-3 py-1.5 text-xs rounded-sm border transition-all ${
                            transmission === t.value
                              ? 'bg-gold/20 border-gold/50 text-gold'
                              : 'border-gold/10 text-ivory/50 hover:border-gold/30'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Available only */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div
                      className={`w-10 h-5 rounded-full border transition-all duration-300 relative ${
                        availableOnly ? 'bg-gold border-gold' : 'bg-transparent border-gold/20'
                      }`}
                      onClick={() => setAvailableOnly(!availableOnly)}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-300 ${
                        availableOnly ? 'left-5' : 'left-0.5'
                      }`} />
                    </div>
                    <span className="text-ivory/50 text-xs tracking-wider">Available Now Only</span>
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-8xl mx-auto px-6 lg:px-12 py-12 lg:py-16">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-96 shimmer rounded-sm" />
            ))}
          </div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-ivory/30 text-6xl mb-6" style={{ fontFamily: 'var(--font-cormorant)' }}>—</p>
            <p className="text-ivory/50 text-lg mb-2">No vehicles found</p>
            <p className="text-ivory/30 text-sm mb-6">Try adjusting your filters</p>
            <button onClick={clearFilters} className="btn-outline-gold px-6 py-2.5 rounded-sm text-xs tracking-widest">
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((v, i) => (
              <VehicleCard key={v.id} vehicle={v} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function FleetPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-oxford-black" />}>
      <FleetContent />
    </Suspense>
  );
}
