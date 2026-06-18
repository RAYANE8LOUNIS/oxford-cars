'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown, Star, Phone, MapPin, Instagram } from 'lucide-react';
import SectionHeader from '@/components/ui/SectionHeader';
import VehicleCard from '@/components/ui/VehicleCard';
import { vehiclesApi, contactApi, formatPrice } from '@/lib/api';
import { Vehicle } from '@/types';
import toast from 'react-hot-toast';

const stats = [
  { value: '9+', label: 'Véhicules Disponibles' },
  { value: '3+', label: "Années d'Excellence" },
  { value: '500+', label: 'Clients Satisfaits' },
  { value: '24/7', label: 'Support Premium' },
];

const testimonials = [
  {
    name: 'Karim Benali',
    location: 'Algiers',
    rating: 5,
    text: 'Exceptional service and a pristine vehicle. Oxford Cars truly delivers a premium experience that is rare to find in Algeria.',
    initials: 'KB',
  },
  {
    name: 'Sarah Meziane',
    location: 'Oran',
    rating: 5,
    text: 'The Peugeot 3008 was immaculate. The booking process was seamless and the team was incredibly professional.',
    initials: 'SM',
  },
  {
    name: 'Amir Hadjadj',
    location: 'Constantine',
    rating: 5,
    text: 'I rented the Skoda Kodiaq for a family trip. Comfortable, clean, and perfectly maintained. Will definitely return.',
    initials: 'AH',
  },
];

const features = [
  {
    icon: '🛡️',
    title: 'Flotte Assurée',
    description: 'Chaque véhicule est couvert par une assurance complète pour votre tranquillité d\'esprit.',
  },
  {
    icon: '🔑',
    title: 'Livraison Flexible',
    description: 'Récupération et retour à travers l\'Algérie selon vos convenances.',
  },
  {
    icon: '⭐',
    title: 'Service Conciergerie',
    description: 'Une équipe dédiée à votre service, disponible à toute heure.',
  },
  {
    icon: '🚗',
    title: 'Flotte Premium',
    description: 'Des véhicules méticuleusement entretenus représentant l\'excellence automobile.',
  },
];

export default function HomePage() {
  const [featuredVehicles, setFeaturedVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    vehiclesApi.getAll({ featured: 'true' })
      .then((res) => setFeaturedVehicles(res.data.slice(0, 3)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await contactApi.send(contactForm);
      toast.success('Message sent. We will contact you shortly.');
      setContactForm({ name: '', email: '', message: '' });
    } catch {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="page-transition">
      {/* ── Hero ── */}
      <section className="relative h-screen min-h-[700px] flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-oxford-black">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(201,169,110,0.08),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(28,28,28,0.8),transparent_50%)]" />
          {/* Decorative grid */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(rgba(201,169,110,1) 1px, transparent 1px), linear-gradient(90deg, rgba(201,169,110,1) 1px, transparent 1px)',
              backgroundSize: '80px 80px',
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-8xl mx-auto px-6 lg:px-12 w-full">
          <div className="max-w-3xl">
            {/* Overline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex items-center gap-4 mb-8"
            >
              <div className="h-px w-12 bg-gold/50" />
              <span className="text-gold/70 text-xs tracking-ultra uppercase" style={{ letterSpacing: '0.3em' }}>
                British Heritage • Timeless Prestige
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="heading-display font-light text-ivory leading-[1.1] mb-6"
              style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(3rem, 7vw, 6rem)' }}
            >
              British Heritage.<br />
              <span className="text-gold-gradient italic">Timeless Prestige.</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="text-ivory/60 text-lg lg:text-xl leading-relaxed mb-10 max-w-xl font-light"
            >
              Experience premium mobility with Oxford Cars.
              The finest vehicles, delivered with distinction.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.0 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link href="/booking" className="btn-gold px-10 py-4 rounded-sm text-xs tracking-widest inline-flex items-center justify-center gap-3">
                Reserve Now <ArrowRight size={14} />
              </Link>
              <Link href="/fleet" className="btn-outline-gold px-10 py-4 rounded-sm text-xs tracking-widest inline-flex items-center justify-center gap-3">
                Explore Fleet
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          onClick={() => document.getElementById('stats')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <span className="text-ivory/30 text-xs tracking-widest uppercase">Scroll</span>
          <ChevronDown size={16} className="text-gold/50" />
        </motion.div>

        {/* Right decorative element */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-40 bg-gradient-to-b from-transparent via-gold/20 to-transparent hidden lg:block" />
      </section>

      {/* ── Stats ── */}
      <section id="stats" className="py-16 lg:py-20 bg-oxford-charcoal border-y border-gold/10">
        <div className="max-w-8xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 lg:divide-x lg:divide-gold/10">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="flex flex-col items-center text-center px-8"
              >
                <span
                  className="text-gold font-light mb-2"
                  style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}
                >
                  {stat.value}
                </span>
                <div className="w-6 h-px bg-gold/30 mb-3" />
                <span className="text-ivory/50 text-xs tracking-widest uppercase">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Fleet ── */}
      <section className="py-20 lg:py-32 bg-oxford-black">
        <div className="max-w-8xl mx-auto px-6 lg:px-12">
          <SectionHeader
            overline="Notre Collection"
            title="Featured Fleet"
            subtitle="Des véhicules triés sur le volet, représentant le summum de l'excellence automobile."
          />

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-96 shimmer rounded-sm" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredVehicles.map((v, i) => (
                <VehicleCard key={v.id} vehicle={v} index={i} />
              ))}
            </div>
          )}

          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Link href="/fleet" className="btn-outline-gold px-10 py-3.5 rounded-sm text-xs tracking-widest inline-flex items-center gap-3">
              View Complete Fleet <ArrowRight size={14} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Why Oxford Cars ── */}
      <section className="py-20 lg:py-32 bg-ivory">
        <div className="max-w-8xl mx-auto px-6 lg:px-12">
          <SectionHeader
            overline="L'Expérience Oxford"
            title="Pourquoi Oxford Cars ?"
            subtitle="Nous ne louons pas des voitures — nous créons des expériences uniques."
            light
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="p-8 bg-white border border-ivory-deeper hover:border-gold/40 transition-all duration-300 group"
              >
                <div className="text-4xl mb-5">{f.icon}</div>
                <h3 className="text-oxford-black font-semibold text-base mb-3 group-hover:text-gold-dark transition-colors">
                  {f.title}
                </h3>
                <div className="w-8 h-px bg-gold/40 mb-4" />
                <p className="text-oxford-black/60 text-sm leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20 lg:py-32 bg-oxford-charcoal">
        <div className="max-w-8xl mx-auto px-6 lg:px-12">
          <SectionHeader
            overline="Client Testimonials"
            title="Words of Distinction"
            subtitle="What our valued clients say about the Oxford Cars experience."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="p-8 bg-oxford-black border border-gold/10 hover:border-gold/30 transition-all duration-300"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-5">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={13} className="text-gold fill-gold" />
                  ))}
                </div>

                <p className="text-ivory/70 text-sm leading-relaxed mb-6 italic" style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.05rem' }}>
                  &ldquo;{t.text}&rdquo;
                </p>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center">
                    <span className="text-gold text-xs font-semibold">{t.initials}</span>
                  </div>
                  <div>
                    <p className="text-ivory text-sm font-medium">{t.name}</p>
                    <p className="text-ivory/40 text-xs">{t.location}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-oxford-black">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,169,110,0.12),transparent_70%)]" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-gold/70 text-xs tracking-ultra uppercase mb-6" style={{ letterSpacing: '0.3em' }}>
              Begin Your Journey
            </p>
            <h2
              className="heading-display text-ivory font-light leading-tight mb-6"
              style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(2.5rem, 5vw, 4.5rem)' }}
            >
              Ready to{' '}
              <span className="text-gold-gradient italic">Drive Distinction?</span>
            </h2>
            <p className="text-ivory/50 text-lg mb-10 font-light max-w-xl mx-auto">
              Reserve your premium vehicle today and experience the Oxford Cars difference.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/booking" className="btn-gold px-12 py-4 rounded-sm text-xs tracking-widest inline-flex items-center justify-center gap-3">
                Reserve Now <ArrowRight size={14} />
              </Link>
              <a href="https://wa.me/213770123771" target="_blank" rel="noopener noreferrer"
                className="btn-outline-gold px-12 py-4 rounded-sm text-xs tracking-widest inline-flex items-center justify-center gap-3">
                WhatsApp Us
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Contact & Map ── */}
      <section className="py-20 lg:py-32 bg-oxford-charcoal">
        <div className="max-w-8xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Contact form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <SectionHeader overline="Get in Touch" title="Contact Us" align="left" />

              <div className="flex flex-col gap-5 mb-8">
                <a href="tel:+213770123771" className="flex items-center gap-4 text-ivory/60 hover:text-gold transition-colors group">
                  <div className="w-10 h-10 border border-gold/20 flex items-center justify-center group-hover:border-gold/50 transition-colors">
                    <Phone size={16} className="text-gold/60" />
                  </div>
                  <span className="text-sm">+213 770 12 37 71</span>
                </a>
                <a href="mailto:contact@oxfordcars.dz" className="flex items-center gap-4 text-ivory/60 hover:text-gold transition-colors group">
                  <div className="w-10 h-10 border border-gold/20 flex items-center justify-center group-hover:border-gold/50 transition-colors">
                    <svg className="w-4 h-4 text-gold/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <span className="text-sm">contact@oxfordcars.dz</span>
                </a>
                <div className="flex items-center gap-4 text-ivory/60">
                  <div className="w-10 h-10 border border-gold/20 flex items-center justify-center">
                    <MapPin size={16} className="text-gold/60" />
                  </div>
                  <span className="text-sm">Boulevard Amyoud, Tizi Ouzou, Algérie</span>
                </div>
              </div>

              <form onSubmit={handleContact} className="flex flex-col gap-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  className="luxury-input px-4 py-3 rounded-sm w-full"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  required
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  className="luxury-input px-4 py-3 rounded-sm w-full"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  required
                />
                <textarea
                  placeholder="Your message..."
                  rows={4}
                  className="luxury-input px-4 py-3 rounded-sm w-full resize-none"
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  required
                />
                <button type="submit" disabled={sending} className="btn-gold py-3.5 px-8 rounded-sm text-xs tracking-widest disabled:opacity-50">
                  {sending ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </motion.div>

            {/* Map placeholder */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="flex flex-col gap-6"
            >
              <div className="flex-1 min-h-[400px] bg-oxford-black border border-gold/10 rounded-sm overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3196.5!2d4.0472!3d36.7169!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x128ed407e6e3b5d5%3A0x0!2sBoulevard%20Amyoud%2C%20Tizi%20Ouzou%2C%20Algeria!5e0!3m2!1sfr!2sdz!4v1"
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: '400px' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Oxford Cars Location"
                />
              </div>
              {/* Business hours */}
              <div className="p-6 bg-oxford-black border border-gold/10">
                <h4 className="text-ivory text-xs tracking-widest uppercase mb-4">Business Hours</h4>
                <div className="space-y-2">
                  {[
                    ['Samedi – Jeudi', '08h00 – 20h00'],
                    ['Vendredi', '09h00 – 18h00'],
                  ].map(([day, hours]) => (
                    <div key={day} className="flex justify-between text-sm">
                      <span className="text-ivory/50">{day}</span>
                      <span className="text-gold">{hours}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
