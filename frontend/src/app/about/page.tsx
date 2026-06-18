'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import OxfordLogo from '@/components/ui/OxfordLogo';

const values = [
  { title: 'Prestige', description: 'Every vehicle in our fleet is handpicked for its refinement, condition, and character.' },
  { title: 'Integrity', description: 'Transparent pricing, honest service, and absolute commitment to your satisfaction.' },
  { title: 'Discretion', description: 'Your privacy and comfort are paramount in every interaction with Oxford Cars.' },
  { title: 'Excellence', description: 'From booking to return, we maintain standards that exceed expectation.' },
];

const milestones = [
  { year: '2021', title: 'Founded', description: 'Oxford Cars established with a vision to redefine premium mobility in Algeria.' },
  { year: '2022', title: 'Fleet Expansion', description: 'Doubled our fleet with the addition of premium SUVs and European models.' },
  { year: '2023', title: '500 Clients', description: 'Reached 500 satisfied clients across Algeria — a testament to our service excellence.' },
  { year: '2024', title: 'Innovation', description: 'Launched our online reservation platform, making premium mobility more accessible.' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-oxford-black pt-20">
      {/* Hero */}
      <section className="relative py-28 lg:py-36 overflow-hidden">
        <div className="absolute inset-0 bg-oxford-charcoal" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(201,169,110,0.1),transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(201,169,110,1) 1px, transparent 1px), linear-gradient(90deg, rgba(201,169,110,1) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />
        <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-12 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
            <div className="flex justify-center mb-10">
              <OxfordLogo size="xl" variant="icon" />
            </div>
            <p className="text-gold/60 text-xs tracking-ultra uppercase mb-6" style={{ letterSpacing: '0.3em' }}>
              Our Story
            </p>
            <h1
              className="text-ivory font-light leading-[1.1] mb-6"
              style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}
            >
              Inspired by Tradition.<br />
              <span className="text-gold-gradient italic">Driven by Distinction.</span>
            </h1>
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="h-px w-12 bg-gold/40" />
              <div className="w-1.5 h-1.5 rounded-full bg-gold" />
              <div className="h-px w-12 bg-gold/40" />
            </div>
            <p className="text-ivory/50 text-lg leading-relaxed max-w-2xl mx-auto font-light">
              Oxford Cars was born from a passion for automotive excellence and an appreciation for the timeless elegance of British heritage.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 lg:py-32 bg-oxford-black">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <p className="text-gold/60 text-xs tracking-ultra uppercase mb-5" style={{ letterSpacing: '0.3em' }}>
                The Oxford Heritage
              </p>
              <h2
                className="text-ivory font-light leading-tight mb-6"
                style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
              >
                Where British Elegance Meets Algerian Excellence
              </h2>
              <div className="h-px w-16 bg-gold/40 mb-6" />
              <div className="space-y-5 text-ivory/60 text-base leading-relaxed font-light">
                <p>
                  Named in tribute to the storied streets of Oxford and the timeless sophistication of British culture, Oxford Cars was founded with a singular ambition: to bring the art of premium mobility to Algeria.
                </p>
                <p>
                  We believe that transportation is not merely functional — it is an expression of character, taste, and aspiration. Every vehicle in our fleet has been selected not just for its performance, but for the experience it delivers.
                </p>
                <p>
                  From the understated power of a luxury SUV to the refined elegance of a premium sedan, each Oxford Cars vehicle embodies the same values that define the finest British institutions: quality without compromise, service without equal.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="grid grid-cols-2 gap-4"
            >
              {[
                { number: '9+', label: 'Premium Vehicles' },
                { number: '500+', label: 'Happy Clients' },
                { number: '3+', label: 'Years of Service' },
                { number: '24/7', label: 'Support' },
              ].map((stat, i) => (
                <div key={stat.label} className="p-8 bg-oxford-charcoal border border-gold/10 hover:border-gold/30 transition-all duration-300 text-center">
                  <span
                    className="text-gold block font-light mb-2"
                    style={{ fontFamily: 'var(--font-cormorant)', fontSize: '3rem' }}
                  >
                    {stat.number}
                  </span>
                  <span className="text-ivory/50 text-xs tracking-widest uppercase">{stat.label}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 lg:py-32 bg-ivory">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <p className="text-gold-dark text-xs tracking-ultra uppercase mb-4" style={{ letterSpacing: '0.3em' }}>
              Our Foundation
            </p>
            <h2
              className="text-oxford-black font-light"
              style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
            >
              Core Values
            </h2>
            <div className="flex items-center justify-center gap-3 mt-4">
              <div className="h-px w-12 bg-gold-dark/40" />
              <div className="w-1.5 h-1.5 rounded-full bg-gold-dark" />
              <div className="h-px w-12 bg-gold-dark/40" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="p-8 bg-white border border-ivory-deeper hover:border-gold/40 transition-all duration-300 group"
              >
                <div className="w-8 h-px bg-gold-dark mb-6 group-hover:w-12 transition-all duration-300" />
                <h3 className="text-oxford-black font-semibold text-xl mb-4" style={{ fontFamily: 'var(--font-cormorant)' }}>
                  {v.title}
                </h3>
                <p className="text-oxford-black/60 text-sm leading-relaxed">{v.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 lg:py-32 bg-oxford-black">
        <div className="max-w-4xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <p className="text-gold/60 text-xs tracking-ultra uppercase mb-4" style={{ letterSpacing: '0.3em' }}>
              Our Journey
            </p>
            <h2
              className="text-ivory font-light"
              style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
            >
              Milestones of Excellence
            </h2>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 -translate-x-px top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gold/30 to-transparent" />
            <div className="space-y-12">
              {milestones.map((m, i) => (
                <motion.div
                  key={m.year}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7 }}
                  className={`relative flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}
                >
                  {/* Center dot */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-6 w-3 h-3 rounded-full border-2 border-gold bg-oxford-black z-10" />

                  <div className={`w-5/12 p-6 bg-oxford-charcoal border border-gold/10 hover:border-gold/30 transition-all duration-300 ${i % 2 === 0 ? 'mr-auto' : 'ml-auto'}`}>
                    <span className="text-gold text-xs tracking-widest uppercase block mb-2">{m.year}</span>
                    <h3 className="text-ivory font-medium mb-2">{m.title}</h3>
                    <p className="text-ivory/50 text-sm leading-relaxed">{m.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28 bg-oxford-charcoal border-t border-gold/10">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-gold/60 text-xs tracking-ultra uppercase mb-5" style={{ letterSpacing: '0.3em' }}>
            Join the Oxford Experience
          </p>
          <h2 className="text-ivory font-light mb-6" style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>
            Drive Distinction Today
          </h2>
          <p className="text-ivory/50 mb-10 font-light leading-relaxed">
            Discover why discerning clients across Algeria choose Oxford Cars for their premium mobility needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/fleet" className="btn-gold px-10 py-4 rounded-sm text-xs tracking-widest inline-flex items-center justify-center gap-3">
              Explore Our Fleet <ArrowRight size={14} />
            </Link>
            <Link href="/contact" className="btn-outline-gold px-10 py-4 rounded-sm text-xs tracking-widest inline-flex items-center justify-center gap-3">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
