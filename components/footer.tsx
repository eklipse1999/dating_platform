'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart } from 'lucide-react';

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

export function Footer() {
  return (
    <footer className="bg-accent text-accent-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="relative w-35 h-10">
                <Image
                  src="/images/commited_white.png"
                  alt="Committed"
                  fill
                />
              </div>
            </Link>
            <p className="text-sm text-accent-foreground/70 leading-relaxed">
              Where Christian singles connect with purpose. Find love built on faith.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-accent-foreground/70 hover:text-accent-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-accent-foreground/70 hover:text-accent-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-accent-foreground/70 hover:text-accent-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-accent-foreground/70 hover:text-accent-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-accent-foreground/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-accent-foreground/70">
            &copy; {new Date().getFullYear()} Committed. All rights reserved.
          </p>
          <p className="text-sm text-accent-foreground/70">
            Made with <Heart className="w-4 h-4 inline text-secondary" /> for faith-based connections
          </p>
        </div>
      </div>
    </footer>
  );
}
