'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, User, LogOut, LayoutDashboard, Shield } from 'lucide-react';
import OxfordLogo from '@/components/ui/OxfordLogo';
import { useAuthStore } from '@/lib/store';

const navLinks = [
  { href: '/', label: 'Accueil' },
  { href: '/fleet', label: 'Flotte' },
  { href: '/about', label: 'À Propos' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  const isTransparent = !scrolled && !mobileOpen && ['/'].includes(pathname);

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isTransparent
            ? 'bg-transparent'
            : 'bg-oxford-black/95 backdrop-blur-xl border-b border-gold/10'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="max-w-8xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <OxfordLogo size="sm" />

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-10">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative text-xs tracking-widest uppercase font-medium transition-colors duration-300 group ${
                    pathname === link.href ? 'text-gold' : 'text-ivory/70 hover:text-ivory'
                  }`}
                >
                  {link.label}
                  <span className={`absolute -bottom-1 left-0 h-px bg-gold transition-all duration-300 ${
                    pathname === link.href ? 'w-full' : 'w-0 group-hover:w-full'
                  }`} />
                </Link>
              ))}
            </div>

            {/* Right side */}
            <div className="hidden lg:flex items-center gap-4">
              {isAuthenticated && user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 text-ivory/70 hover:text-ivory transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center">
                      <span className="text-gold text-xs font-semibold">
                        {user.first_name[0]}{user.last_name[0]}
                      </span>
                    </div>
                    <span className="text-xs tracking-wider">{user.first_name}</span>
                    <ChevronDown size={14} />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-3 w-52 bg-charcoal border border-gold/20 rounded-sm shadow-2xl overflow-hidden"
                      >
                        <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-ivory/80 hover:text-gold hover:bg-gold/5 transition-colors text-sm">
                          <LayoutDashboard size={15} /> Mon Espace
                        </Link>
                        {['admin', 'super_admin'].includes(user.role) && (
                          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 text-ivory/80 hover:text-gold hover:bg-gold/5 transition-colors text-sm">
                            <Shield size={15} /> Admin
                          </Link>
                        )}
                        <div className="border-t border-gold/10" />
                        <button
                          onClick={logout}
                          className="w-full flex items-center gap-3 px-4 py-3 text-ivory/60 hover:text-red-400 hover:bg-red-500/5 transition-colors text-sm"
                        >
                          <LogOut size={15} /> Déconnexion
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <Link href="/auth/login" className="text-xs tracking-widest text-ivory/70 hover:text-ivory uppercase transition-colors">
                    Connexion
                  </Link>
                  <Link href="/booking" className="btn-gold px-6 py-2.5 rounded-sm text-xs tracking-widest">
                    Réserver
                  </Link>
                </>
              )}
            </div>

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden text-ivory/70 hover:text-gold transition-colors p-1"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'tween', duration: 0.35 }}
            className="fixed inset-0 z-40 bg-oxford-black lg:hidden"
          >
            <div className="flex flex-col h-full pt-24 px-8">
              <div className="flex flex-col gap-6">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link
                      href={link.href}
                      className={`text-3xl font-display font-light tracking-wide ${
                        pathname === link.href ? 'text-gold' : 'text-ivory/80 hover:text-gold'
                      } transition-colors`}
                      style={{ fontFamily: 'var(--font-cormorant)' }}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </div>

              <div className="mt-auto pb-12 flex flex-col gap-4">
                {isAuthenticated ? (
                  <>
                    <Link href="/dashboard" className="btn-outline-gold py-3 px-6 rounded-sm text-center">
                      My Dashboard
                    </Link>
                    <button onClick={logout} className="text-ivory/50 text-sm tracking-wider text-center">
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login" className="btn-outline-gold py-3 px-6 rounded-sm text-center">
                      Sign In
                    </Link>
                    <Link href="/booking" className="btn-gold py-3 px-6 rounded-sm text-center">
                      Reserve Now
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
