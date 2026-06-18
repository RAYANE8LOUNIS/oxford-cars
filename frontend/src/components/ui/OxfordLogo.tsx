'use client';

import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon';
  className?: string;
}

const sizes = {
  sm: { crest: 32, text: 'text-sm' },
  md: { crest: 44, text: 'text-base' },
  lg: { crest: 60, text: 'text-lg' },
  xl: { crest: 80, text: 'text-xl' },
};

export default function OxfordLogo({ size = 'md', variant = 'full', className = '' }: LogoProps) {
  const { crest, text } = sizes[size];

  return (
    <Link href="/" className={`flex items-center gap-3 group ${className}`}>
      {/* Crest SVG */}
      <svg
        width={crest}
        height={crest * 1.2}
        viewBox="0 0 80 96"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0 transition-transform duration-500 group-hover:scale-105"
      >
        {/* Shield outline */}
        <path
          d="M40 4L72 16V52C72 70 57 84 40 92C23 84 8 70 8 52V16L40 4Z"
          fill="url(#shieldGrad)"
          stroke="url(#goldGrad)"
          strokeWidth="1.5"
        />
        {/* Inner shield border */}
        <path
          d="M40 10L66 20V52C66 67 53 79 40 86C27 79 14 67 14 52V20L40 10Z"
          fill="rgba(10,10,10,0.6)"
          stroke="url(#goldGrad)"
          strokeWidth="0.75"
          opacity="0.6"
        />
        {/* Crown */}
        <path
          d="M25 36V32L28 34L31 28L34 32L37 28L40 32L43 28L46 32L49 28L52 34L55 32V36H25Z"
          fill="url(#goldGrad)"
        />
        {/* Crown base */}
        <rect x="24" y="36" width="32" height="3" rx="1" fill="url(#goldGrad)" />
        {/* Letter O */}
        <text
          x="40"
          y="72"
          textAnchor="middle"
          fontFamily="Cormorant Garamond, Georgia, serif"
          fontWeight="400"
          fontSize="26"
          fill="url(#goldGrad)"
          letterSpacing="0"
        >
          O
        </text>

        <defs>
          <linearGradient id="shieldGrad" x1="40" y1="4" x2="40" y2="92" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1C1C1C" />
            <stop offset="100%" stopColor="#0A0A0A" />
          </linearGradient>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DFC28A" />
            <stop offset="50%" stopColor="#C9A96E" />
            <stop offset="100%" stopColor="#A6813E" />
          </linearGradient>
        </defs>
      </svg>

      {/* Text */}
      {variant === 'full' && (
        <div className="flex flex-col leading-none">
          <span
            className={`font-display font-light text-gold-gradient tracking-widest uppercase ${text}`}
            style={{ fontFamily: 'var(--font-cormorant)', letterSpacing: '0.2em' }}
          >
            Oxford Cars
          </span>
          <span
            className="text-gold/50 uppercase tracking-ultra mt-0.5"
            style={{ fontSize: '0.5rem', letterSpacing: '0.25em' }}
          >
            Drive Distinction
          </span>
        </div>
      )}
    </Link>
  );
}
