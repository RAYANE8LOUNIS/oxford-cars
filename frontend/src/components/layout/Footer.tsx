'use client';

import Link from 'next/link';
import { Phone, Mail, MapPin, Instagram, Facebook } from 'lucide-react';
import OxfordLogo from '@/components/ui/OxfordLogo';

export default function Footer() {
  return (
    <footer className="bg-oxford-black border-t border-gold/10">
      {/* Top section */}
      <div className="max-w-8xl mx-auto px-6 lg:px-12 py-16 lg:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <OxfordLogo size="md" />
            <p className="mt-6 text-ivory/50 text-sm leading-relaxed max-w-xs">
              Premium car rental inspired by British heritage and timeless prestige.
              Your journey to distinction begins here.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="#" className="w-9 h-9 rounded-full border border-gold/20 flex items-center justify-center text-gold/60 hover:text-gold hover:border-gold/50 transition-colors">
                <Instagram size={15} />
              </a>
              <a href="#" className="w-9 h-9 rounded-full border border-gold/20 flex items-center justify-center text-gold/60 hover:text-gold hover:border-gold/50 transition-colors">
                <Facebook size={15} />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-ivory text-xs tracking-widest uppercase mb-6 font-medium">Navigation</h3>
            <ul className="space-y-3">
              {[['/', 'Accueil'], ['/fleet', 'Notre Flotte'], ['/about', 'À Propos'], ['/contact', 'Contact'], ['/booking', 'Réserver']].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="text-ivory/50 hover:text-gold text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Fleet */}
          <div>
            <h3 className="text-ivory text-xs tracking-widest uppercase mb-6 font-medium">Our Fleet</h3>
            <ul className="space-y-3">
              {[['suv', 'SUV & Crossover'], ['sedan', 'Berline'], ['compact', 'Compacte'], ['luxury', 'Premium']].map(([cat, label]) => (
                <li key={cat}>
                  <Link href={`/fleet?category=${cat}`} className="text-ivory/50 hover:text-gold text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-ivory text-xs tracking-widest uppercase mb-6 font-medium">Contact</h3>
            <ul className="space-y-4">
              <li>
                <a href="tel:+213770123771" className="flex items-start gap-3 text-ivory/50 hover:text-gold transition-colors group">
                  <Phone size={15} className="mt-0.5 text-gold/50 group-hover:text-gold flex-shrink-0" />
                  <span className="text-sm">+213 770 12 37 71</span>
                </a>
              </li>
              <li>
                <a href="https://wa.me/213770123771" className="flex items-start gap-3 text-ivory/50 hover:text-gold transition-colors group">
                  <svg className="w-4 h-4 mt-0.5 text-gold/50 group-hover:text-gold flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  <span className="text-sm">WhatsApp</span>
                </a>
              </li>
              <li>
                <a href="mailto:contact@oxfordcars.dz" className="flex items-start gap-3 text-ivory/50 hover:text-gold transition-colors group">
                  <Mail size={15} className="mt-0.5 text-gold/50 group-hover:text-gold flex-shrink-0" />
                  <span className="text-sm">contact@oxfordcars.dz</span>
                </a>
              </li>
              <li>
                <div className="flex items-start gap-3 text-ivory/50">
                  <MapPin size={15} className="mt-0.5 text-gold/50 flex-shrink-0" />
                  <span className="text-sm">Boulevard Amyoud, Tizi Ouzou</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Gold divider */}
      <div className="max-w-8xl mx-auto px-6 lg:px-12">
        <div className="h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      </div>

      {/* Bottom */}
      <div className="max-w-8xl mx-auto px-6 lg:px-12 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-ivory/30 text-xs tracking-widest">
            © {new Date().getFullYear()} Oxford Cars. Tous droits réservés.
          </p>
          <p className="text-ivory/20 text-xs tracking-wider italic" style={{ fontFamily: 'var(--font-cormorant)' }}>
            British Heritage • Timeless Prestige
          </p>
        </div>
      </div>
    </footer>
  );
}
