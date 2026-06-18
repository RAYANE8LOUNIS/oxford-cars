'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Users, Fuel, Settings2, Calendar, Star, ArrowRight, ArrowLeft, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { vehiclesApi, formatPrice } from '@/lib/api';
import { Vehicle } from '@/types';
import VehicleCard from '@/components/ui/VehicleCard';

const fuelLabels: Record<string, string> = {
  petrol: 'Petrol', diesel: 'Diesel', hybrid: 'Hybrid', electric: 'Electric',
};

export default function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [related, setRelated] = useState<Vehicle[]>([]);

  useEffect(() => {
    vehiclesApi.getOne(id)
      .then(async (res) => {
        setVehicle(res.data);
        // Fetch related
        try {
          const rel = await vehiclesApi.getAll({ category: res.data.category });
          setRelated(rel.data.filter((v: Vehicle) => v.id !== id).slice(0, 3));
        } catch { /* ignore */ }
      })
      .catch(() => router.push('/fleet'))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-oxford-black pt-20 flex items-center justify-center">
        <div className="w-12 h-12 border border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (!vehicle) return null;

  const images = vehicle.images?.length ? vehicle.images : [vehicle.thumbnail || ''];

  return (
    <div className="min-h-screen bg-oxford-black pt-20">
      {/* Back */}
      <div className="max-w-8xl mx-auto px-6 lg:px-12 pt-8">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-ivory/40 hover:text-gold transition-colors text-sm">
          <ArrowLeft size={15} /> Back to Fleet
        </button>
      </div>

      <div className="max-w-8xl mx-auto px-6 lg:px-12 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Gallery */}
          <div>
            <div className="relative h-80 lg:h-[480px] bg-oxford-charcoal rounded-sm overflow-hidden border border-gold/10 mb-3">
              {images[currentImage] ? (
                <Image
                  src={images[currentImage]}
                  alt={vehicle.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg viewBox="0 0 200 100" className="w-48 opacity-20" fill="none">
                    <rect x="10" y="30" width="180" height="50" rx="8" fill="currentColor" className="text-gold" />
                    <rect x="50" y="10" width="100" height="35" rx="6" fill="currentColor" className="text-gold" />
                    <circle cx="45" cy="82" r="15" fill="currentColor" className="text-gold/60" />
                    <circle cx="155" cy="82" r="15" fill="currentColor" className="text-gold/60" />
                  </svg>
                </div>
              )}

              {/* Nav arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImage((c) => (c - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-oxford-black/60 border border-gold/20 flex items-center justify-center hover:border-gold/50 transition-colors backdrop-blur-sm"
                  >
                    <ChevronLeft size={18} className="text-ivory" />
                  </button>
                  <button
                    onClick={() => setCurrentImage((c) => (c + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-oxford-black/60 border border-gold/20 flex items-center justify-center hover:border-gold/50 transition-colors backdrop-blur-sm"
                  >
                    <ChevronRight size={18} className="text-ivory" />
                  </button>
                </>
              )}

              {/* Availability badge */}
              <div className="absolute top-4 right-4">
                <span className={`flex items-center gap-2 px-3 py-1.5 text-xs backdrop-blur-sm border ${
                  vehicle.is_available
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-red-500/10 text-red-400 border-red-500/30'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${vehicle.is_available ? 'bg-emerald-400' : 'bg-red-400'}`} />
                  {vehicle.is_available ? 'Available' : 'Currently Reserved'}
                </span>
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImage(i)}
                    className={`relative w-20 h-14 flex-shrink-0 rounded-sm overflow-hidden border transition-all duration-200 ${
                      i === currentImage ? 'border-gold' : 'border-gold/10 opacity-50 hover:opacity-75'
                    }`}
                  >
                    <Image src={img} alt="" fill className="object-cover" sizes="80px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            {/* Category */}
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 text-xs tracking-widest uppercase border border-gold/30 text-gold">
                {vehicle.category}
              </span>
              <span className="text-ivory/30 text-xs">{vehicle.year}</span>
            </div>

            {/* Name */}
            <h1
              className="text-ivory font-light leading-tight mb-2"
              style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(2rem, 4vw, 3rem)' }}
            >
              {vehicle.name}
            </h1>
            <p className="text-ivory/40 text-sm mb-6">{vehicle.brand} • {vehicle.model} • {vehicle.year}</p>

            {/* Gold divider */}
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px flex-1 bg-gradient-to-r from-gold/30 to-transparent" />
              <div className="w-1 h-1 rounded-full bg-gold/50" />
            </div>

            {/* Specs grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { icon: <Users size={16} />, label: 'Seats', value: `${vehicle.seats} Passengers` },
                { icon: <Settings2 size={16} />, label: 'Transmission', value: vehicle.transmission.charAt(0).toUpperCase() + vehicle.transmission.slice(1) },
                { icon: <Fuel size={16} />, label: 'Fuel Type', value: fuelLabels[vehicle.fuel_type] },
                { icon: <Calendar size={16} />, label: 'Year', value: vehicle.year.toString() },
              ].map((spec) => (
                <div key={spec.label} className="flex items-center gap-3 p-3 bg-oxford-charcoal border border-gold/10 rounded-sm">
                  <span className="text-gold/60">{spec.icon}</span>
                  <div>
                    <p className="text-ivory/30 text-xs">{spec.label}</p>
                    <p className="text-ivory text-sm font-medium">{spec.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Description */}
            {vehicle.description && (
              <p className="text-ivory/50 text-sm leading-relaxed mb-6">{vehicle.description}</p>
            )}

            {/* Features */}
            {vehicle.features && vehicle.features.length > 0 && (
              <div className="mb-6">
                <h3 className="text-ivory/80 text-xs tracking-widest uppercase mb-3">Features & Equipment</h3>
                <div className="grid grid-cols-2 gap-2">
                  {vehicle.features.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-ivory/60 text-sm">
                      <Check size={13} className="text-gold/70 flex-shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pricing */}
            <div className="p-5 bg-oxford-charcoal border border-gold/15 rounded-sm mb-6">
              <h3 className="text-ivory/60 text-xs tracking-widest uppercase mb-4">Rental Rates</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-ivory/50 text-sm">Daily Rate</span>
                  <span className="text-gold text-2xl font-light" style={{ fontFamily: 'var(--font-cormorant)' }}>
                    {formatPrice(vehicle.daily_price)}
                  </span>
                </div>
                {vehicle.weekly_price && (
                  <div className="flex justify-between items-baseline border-t border-gold/10 pt-3">
                    <span className="text-ivory/50 text-sm">Weekly Rate</span>
                    <span className="text-ivory text-lg">{formatPrice(vehicle.weekly_price)}</span>
                  </div>
                )}
                {vehicle.deposit_amount > 0 && (
                  <div className="flex justify-between items-center border-t border-gold/10 pt-3">
                    <span className="text-ivory/40 text-xs">Security Deposit</span>
                    <span className="text-ivory/60 text-sm">{formatPrice(vehicle.deposit_amount)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* CTA */}
            {vehicle.is_available ? (
              <Link
                href={`/booking?vehicle=${vehicle.id}`}
                className="btn-gold w-full py-4 rounded-sm text-xs tracking-widest flex items-center justify-center gap-3"
              >
                Reserve This Vehicle <ArrowRight size={15} />
              </Link>
            ) : (
              <div className="w-full py-4 rounded-sm text-xs tracking-widest flex items-center justify-center gap-3 bg-oxford-charcoal border border-gold/10 text-ivory/30 cursor-not-allowed">
                Currently Unavailable
              </div>
            )}

            <a
              href="https://wa.me/213555000000"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline-gold w-full py-3.5 rounded-sm text-xs tracking-widest flex items-center justify-center gap-3 mt-3"
            >
              Enquire via WhatsApp
            </a>
          </motion.div>
        </div>

        {/* Reviews */}
        {vehicle.reviews && vehicle.reviews.length > 0 && (
          <div className="mt-16 lg:mt-24">
            <div className="h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent mb-12" />
            <h2 className="text-ivory font-light mb-8" style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2rem' }}>
              Client Reviews
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicle.reviews.map((review) => (
                <div key={review.id} className="p-6 bg-oxford-charcoal border border-gold/10">
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} size={12} className="text-gold fill-gold" />
                    ))}
                  </div>
                  {review.title && <p className="text-ivory text-sm font-medium mb-2">{review.title}</p>}
                  <p className="text-ivory/60 text-sm leading-relaxed italic">"{review.content}"</p>
                  <p className="text-ivory/30 text-xs mt-4">{review.first_name} {review.last_name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related vehicles */}
        {related.length > 0 && (
          <div className="mt-16 lg:mt-24">
            <div className="h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent mb-12" />
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-ivory font-light" style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2rem' }}>
                Similar Vehicles
              </h2>
              <Link href="/fleet" className="text-gold/60 hover:text-gold text-xs tracking-widest uppercase flex items-center gap-2 transition-colors">
                View All <ArrowRight size={13} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((v, i) => (
                <VehicleCard key={v.id} vehicle={v} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
