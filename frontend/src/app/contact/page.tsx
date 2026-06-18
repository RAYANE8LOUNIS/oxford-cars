'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { contactApi } from '@/lib/api';
import toast from 'react-hot-toast';

const contactInfo = [
  {
    icon: <Phone size={18} />,
    label: 'Phone',
    value: '+213 770 12 37 71',
    href: 'tel:+213770123771',
  },
  {
    icon: (
      <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
      </svg>
    ),
    label: 'WhatsApp',
    value: '+213 770 12 37 71',
    href: 'https://wa.me/213770123771',
  },
  {
    icon: <Mail size={18} />,
    label: 'Email',
    value: 'contact@oxfordcars.dz',
    href: 'mailto:contact@oxfordcars.dz',
  },
  {
    icon: <MapPin size={18} />,
    label: 'Location',
    value: 'Boulevard Amyoud, Tizi Ouzou, Algérie',
    href: null,
  },
];

const hours = [
  { days: 'Samedi – Jeudi', hours: '08h00 – 20h00' },
  { days: 'Vendredi', hours: '09h00 – 18h00' },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await contactApi.send(form);
      toast.success('Message sent successfully. We\'ll be in touch shortly.');
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-oxford-black pt-20">
      {/* Hero */}
      <div className="relative py-20 lg:py-28 bg-oxford-charcoal border-b border-gold/10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(201,169,110,0.07),transparent)]" />
        <div className="max-w-8xl mx-auto px-6 lg:px-12 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="text-gold/60 text-xs tracking-ultra uppercase mb-4" style={{ letterSpacing: '0.3em' }}>Get in Touch</p>
            <h1 className="text-ivory font-light" style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(2.5rem, 5vw, 4.5rem)' }}>
              Contact Oxford Cars
            </h1>
            <div className="flex items-center justify-center gap-3 mt-4">
              <div className="h-px w-12 bg-gold/40" />
              <div className="w-1.5 h-1.5 rounded-full bg-gold" />
              <div className="h-px w-12 bg-gold/40" />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-8xl mx-auto px-6 lg:px-12 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
          {/* Info column */}
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <p className="text-gold/60 text-xs tracking-ultra uppercase mb-3" style={{ letterSpacing: '0.3em' }}>Reach Us</p>
              <h2 className="text-ivory font-light mb-8" style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2.5rem' }}>
                We&apos;re Here to Help
              </h2>

              {/* Contact items */}
              <div className="space-y-5 mb-10">
                {contactInfo.map((item) => {
                  const content = (
                    <div className="flex items-center gap-4 text-ivory/60 hover:text-gold transition-colors group">
                      <div className="w-12 h-12 border border-gold/20 flex items-center justify-center text-gold/60 group-hover:border-gold/50 group-hover:text-gold transition-all flex-shrink-0">
                        {item.icon}
                      </div>
                      <div>
                        <p className="text-ivory/30 text-xs tracking-wider mb-0.5">{item.label}</p>
                        <p className="text-sm">{item.value}</p>
                      </div>
                    </div>
                  );
                  return item.href ? (
                    <a key={item.label} href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
                      {content}
                    </a>
                  ) : (
                    <div key={item.label}>{content}</div>
                  );
                })}
              </div>

              {/* Business hours */}
              <div className="p-6 bg-oxford-charcoal border border-gold/10">
                <div className="flex items-center gap-3 mb-5">
                  <Clock size={16} className="text-gold/60" />
                  <h3 className="text-ivory text-xs tracking-widest uppercase">Business Hours</h3>
                </div>
                <div className="space-y-3">
                  {hours.map((h) => (
                    <div key={h.days} className="flex justify-between items-center">
                      <span className="text-ivory/50 text-sm">{h.days}</span>
                      <span className="text-gold text-sm">{h.hours}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }}>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-ivory/40 text-xs tracking-wider block mb-2">Full Name *</label>
                    <input
                      type="text"
                      className="luxury-input px-4 py-3.5 rounded-sm w-full"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-ivory/40 text-xs tracking-wider block mb-2">Phone Number</label>
                    <input
                      type="tel"
                      className="luxury-input px-4 py-3.5 rounded-sm w-full"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-ivory/40 text-xs tracking-wider block mb-2">Email Address *</label>
                  <input
                    type="email"
                    className="luxury-input px-4 py-3.5 rounded-sm w-full"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-ivory/40 text-xs tracking-wider block mb-2">Subject</label>
                  <select
                    className="luxury-input px-4 py-3.5 rounded-sm w-full"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  >
                    <option value="">Select a subject</option>
                    <option value="Reservation Enquiry">Reservation Enquiry</option>
                    <option value="Fleet Information">Fleet Information</option>
                    <option value="Pricing & Availability">Pricing & Availability</option>
                    <option value="Corporate Account">Corporate Account</option>
                    <option value="Feedback">Feedback</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-ivory/40 text-xs tracking-wider block mb-2">Message *</label>
                  <textarea
                    rows={6}
                    className="luxury-input px-4 py-3.5 rounded-sm w-full resize-none"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={sending}
                  className="btn-gold w-full py-4 rounded-sm text-xs tracking-widest disabled:opacity-50"
                >
                  {sending ? 'Sending Message...' : 'Send Message'}
                </button>
              </form>
            </motion.div>
          </div>
        </div>

        {/* Map */}
        <div className="mt-16 lg:mt-24">
          <div className="h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent mb-10" />
          <div className="h-80 lg:h-96 bg-oxford-charcoal border border-gold/10 overflow-hidden rounded-sm">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3196.5!2d4.0472!3d36.7169!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x128ed407e6e3b5d5%3A0x0!2sBoulevard%20Amyoud%2C%20Tizi%20Ouzou%2C%20Algeria!5e0!3m2!1sfr!2sdz!4v1"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Oxford Cars Location"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
