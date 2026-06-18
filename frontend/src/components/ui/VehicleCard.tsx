'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Users, Fuel, Settings2, Calendar, ArrowRight } from 'lucide-react';
import { Vehicle } from '@/types';
import { formatPrice } from '@/lib/api';

interface VehicleCardProps {
  vehicle: Vehicle;
  index?: number;
}

const categoryLabels: Record<string, string> = {
  suv: 'SUV', sedan: 'Sedan', compact: 'Compact', luxury: 'Luxury', crossover: 'Crossover',
};

const fuelLabels: Record<string, string> = {
  petrol: 'Petrol', diesel: 'Diesel', hybrid: 'Hybrid', electric: 'Electric',
};

export default function VehicleCard({ vehicle, index = 0 }: VehicleCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="luxury-card group"
    >
      <Link href={`/fleet/${vehicle.id}`} className="block">
        <div className="relative bg-oxford-mid border border-gold/10 rounded-sm overflow-hidden hover:border-gold/30 transition-all duration-500">
          {/* Image */}
          <div className="relative h-52 overflow-hidden bg-oxford-charcoal">
            {vehicle.thumbnail ? (
              <Image
                src={vehicle.thumbnail}
                alt={vehicle.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <svg viewBox="0 0 200 100" className="w-40 opacity-20" fill="none">
                  <rect x="10" y="30" width="180" height="50" rx="8" fill="currentColor" className="text-gold" />
                  <rect x="50" y="10" width="100" height="35" rx="6" fill="currentColor" className="text-gold" />
                  <circle cx="45" cy="82" r="15" fill="currentColor" className="text-gold/60" />
                  <circle cx="155" cy="82" r="15" fill="currentColor" className="text-gold/60" />
                </svg>
              </div>
            )}
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-oxford-black/60 via-transparent to-transparent" />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex gap-2">
              <span className="px-2.5 py-1 text-xs tracking-widest uppercase bg-oxford-black/80 text-gold border border-gold/30 backdrop-blur-sm">
                {categoryLabels[vehicle.category]}
              </span>
              {vehicle.is_featured && (
                <span className="px-2.5 py-1 text-xs tracking-widest uppercase bg-gold text-oxford-black font-semibold">
                  Featured
                </span>
              )}
            </div>

            {/* Availability */}
            <div className="absolute top-3 right-3">
              <span className={`flex items-center gap-1.5 px-2.5 py-1 text-xs backdrop-blur-sm ${
                vehicle.is_available
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-red-500/10 text-red-400 border border-red-500/30'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${vehicle.is_available ? 'bg-emerald-400' : 'bg-red-400'}`} />
                {vehicle.is_available ? 'Available' : 'Reserved'}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-5">
            {/* Name */}
            <div className="mb-4">
              <h3 className="text-ivory font-medium text-lg leading-tight group-hover:text-gold transition-colors duration-300">
                {vehicle.name}
              </h3>
              <p className="text-ivory/40 text-xs mt-1 tracking-wider">{vehicle.year} • {vehicle.brand}</p>
            </div>

            {/* Specs */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="flex flex-col items-center gap-1.5 p-2.5 bg-oxford-black/40 rounded-sm">
                <Users size={14} className="text-gold/60" />
                <span className="text-ivory/60 text-xs">{vehicle.seats} seats</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 p-2.5 bg-oxford-black/40 rounded-sm">
                <Settings2 size={14} className="text-gold/60" />
                <span className="text-ivory/60 text-xs capitalize">{vehicle.transmission.slice(0, 4)}</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 p-2.5 bg-oxford-black/40 rounded-sm">
                <Fuel size={14} className="text-gold/60" />
                <span className="text-ivory/60 text-xs">{fuelLabels[vehicle.fuel_type]}</span>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent mb-4" />

            {/* Pricing */}
            <div className="flex items-end justify-between">
              <div>
                <p className="text-ivory/40 text-xs tracking-wider mb-1">Starting from</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-gold text-xl font-light" style={{ fontFamily: 'var(--font-cormorant)' }}>
                    {formatPrice(vehicle.daily_price)}
                  </span>
                  <span className="text-ivory/40 text-xs">/day</span>
                </div>
                {vehicle.weekly_price && (
                  <p className="text-ivory/30 text-xs mt-0.5">{formatPrice(vehicle.weekly_price)}/week</p>
                )}
              </div>

              <span className="flex items-center gap-1.5 text-gold/70 text-xs tracking-wider group-hover:text-gold group-hover:gap-2.5 transition-all duration-300">
                Details <ArrowRight size={13} />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
