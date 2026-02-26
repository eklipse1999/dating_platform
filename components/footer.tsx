'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Heart, ArrowUpRight, Mail, Globe } from 'lucide-react';

const footerLinks = {
  product: [
    { label: 'Features', href: '/#features' },
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'Pricing', href: '/#pricing' },
    { label: 'Testimonials', href: '/#testimonials' },
  ],
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Careers', href: '/careers' },
    { label: 'Contact', href: '/contact' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
    { label: 'Safety', href: '/safety' },
  ],
  support: [
    { label: 'Help Center', href: '/help' },
    { label: 'Community Guidelines', href: '/guidelines' },
    { label: 'Report an Issue', href: '/report' },
    { label: 'FAQ', href: '/faq' },
  ],
};

function FooterLink({ href, label, delay }: { href: string; label: string; delay: number }) {
  return (
    <motion.li
      initial={{ opacity: 0, x: -8 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
    >
      <Link
        href={href}
        className="group flex items-center gap-1 text-sm text-accent-foreground/60 hover:text-accent-foreground transition-colors duration-200"
      >
        <span>{label}</span>
        <motion.span
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          initial={{ x: -4 }}
          whileHover={{ x: 0 }}
        >
          <ArrowUpRight className="w-3 h-3" />
        </motion.span>
      </Link>
    </motion.li>
  );
}

export function Footer() {
  return (
    <footer className="relative bg-accent text-accent-foreground overflow-hidden">
      {/* Top animated gradient border */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          backgroundImage: 'linear-gradient(90deg, transparent, hsl(var(--secondary)/0.5), hsl(var(--primary)/0.5), transparent)',
        }}
        animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
      />

      {/* Background orbs */}
      <motion.div
        className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-primary/5 blur-3xl pointer-events-none"
        animate={{ x: [0, 20, 0], y: [0, -10, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-0 right-0 w-80 h-80 rounded-full bg-secondary/5 blur-3xl pointer-events-none"
        animate={{ x: [0, -20, 0], y: [0, 10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">

          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="col-span-2 md:col-span-1"
          >
            <Link href="/" className="inline-block mb-5 group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative w-35 h-10"
              >
                <Image src="/images/commited_white.png" alt="Committed" fill />
              </motion.div>
            </Link>
            <p className="text-sm text-accent-foreground/60 leading-relaxed mb-5">
              Where Christian singles connect with purpose. Find love built on faith.
            </p>
            {/* Social-style pill links */}
            <div className="flex gap-2">
              <motion.a
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                href="mailto:hello@committed.com"
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent-foreground/10 hover:bg-accent-foreground/20 transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                href="/"
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent-foreground/10 hover:bg-accent-foreground/20 transition-colors"
              >
                <Globe className="w-3.5 h-3.5" />
              </motion.a>
            </div>
          </motion.div>

          {/* Link columns */}
          {[
            { title: 'Product', links: footerLinks.product, delay: 0.1 },
            { title: 'Company', links: footerLinks.company, delay: 0.15 },
            { title: 'Legal', links: footerLinks.legal, delay: 0.2 },
            { title: 'Support', links: footerLinks.support, delay: 0.25 },
          ].map(({ title, links, delay }) => (
            <div key={title}>
              <motion.h4
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay }}
                className="font-semibold text-sm mb-5 text-accent-foreground/90 uppercase tracking-wider"
              >
                {title}
              </motion.h4>
              <ul className="space-y-3">
                {links.map((link, i) => (
                  <FooterLink key={link.href} href={link.href} label={link.label} delay={delay + i * 0.05} />
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-14 pt-8 border-t border-accent-foreground/10 flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <p className="text-sm text-accent-foreground/50">
            &copy; {new Date().getFullYear()} Committed. All rights reserved.
          </p>
          <p className="text-sm text-accent-foreground/50 flex items-center gap-1.5">
            Made with
            <motion.span
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            >
              <Heart className="w-3.5 h-3.5 text-secondary fill-secondary" />
            </motion.span>
            for faith-based connections
          </p>
        </motion.div>
      </div>
    </footer>
  );
}