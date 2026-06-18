'use client';

import { motion } from 'framer-motion';

interface SectionHeaderProps {
  overline?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center' | 'right';
  light?: boolean;
}

export default function SectionHeader({
  overline,
  title,
  subtitle,
  align = 'center',
  light = false,
}: SectionHeaderProps) {
  const alignClass = { left: 'items-start text-left', center: 'items-center text-center', right: 'items-end text-right' }[align];

  return (
    <motion.div
      className={`flex flex-col ${alignClass} mb-12 lg:mb-16`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
    >
      {overline && (
        <p className={`text-xs tracking-ultra uppercase mb-4 ${light ? 'text-gold' : 'text-gold/70'}`}
           style={{ letterSpacing: '0.3em' }}>
          {overline}
        </p>
      )}
      <h2
        className={`heading-display font-light leading-tight ${light ? 'text-oxford-black' : 'text-ivory'}`}
        style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
      >
        {title}
      </h2>
      <div className={`flex items-center gap-3 mt-4 ${align === 'center' ? 'justify-center' : ''}`}>
        <div className="h-px bg-gradient-to-r from-transparent to-gold/50 w-8" />
        <div className="w-1.5 h-1.5 rounded-full bg-gold" />
        <div className="h-px bg-gradient-to-l from-transparent to-gold/50 w-8" />
      </div>
      {subtitle && (
        <p className={`mt-5 text-base lg:text-lg max-w-2xl leading-relaxed ${light ? 'text-oxford-black/60' : 'text-ivory/50'}`}>
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
