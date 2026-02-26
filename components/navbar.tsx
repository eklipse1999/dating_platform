'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/lib/app-context';
import { ThemeToggle } from '@/components/theme-toggle';
import { usePathname } from 'next/navigation';

const navLinks = [
  { label: 'Features', href: '/#features' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Pricing', href: '/#pricing' },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState('');
  const { isAuthenticated, logout } = useApp();
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const navOpacity = useTransform(scrollY, [0, 80], [0.85, 0.98]);
  const navBlur = useTransform(scrollY, [0, 80], [8, 20]);
  const scrollProgress = useTransform(scrollY, [0, 3000], [0, 1]);

  useEffect(() => {
    const unsub = scrollY.on('change', v => setScrolled(v > 20));
    return unsub;
  }, [scrollY]);

  // Close mobile menu on route change
  useEffect(() => { setIsOpen(false); }, [pathname]);

  return (
    <>
      <motion.nav
        style={{ backdropFilter: `blur(${navBlur}px)` }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-background/95 shadow-lg shadow-black/5 border-b border-border/80'
            : 'bg-background/80 border-b border-border/30'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="relative w-35 h-15"
              >
                <Image src="/images/commited1.png" alt="Committed" fill className="object-contain dark:hidden" />
                <Image src="/images/commited_white.png" alt="Committed" fill className="object-contain hidden dark:block" />
              </motion.div>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setActiveLink(link.href)}
                    className="relative px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 group rounded-lg hover:bg-muted/50"
                  >
                    {link.label}
                    <motion.span
                      className="absolute bottom-0.5 left-4 right-4 h-0.5 bg-secondary rounded-full origin-left"
                      initial={{ scaleX: 0 }}
                      whileHover={{ scaleX: 1 }}
                      transition={{ duration: 0.25 }}
                    />
                  </Link>
                </motion.div>
              ))}
              {isAuthenticated && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.24 }}>
                  <Link href="/profiles" className="relative px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 rounded-lg hover:bg-muted/50 group">
                    Browse Profiles
                    <motion.span className="absolute bottom-0.5 left-4 right-4 h-0.5 bg-secondary rounded-full origin-left" initial={{ scaleX: 0 }} whileHover={{ scaleX: 1 }} transition={{ duration: 0.25 }} />
                  </Link>
                </motion.div>
              )}
            </div>

            {/* Desktop CTAs */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="hidden md:flex items-center gap-3"
            >
              <ThemeToggle />
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard">
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <Button variant="ghost" className="text-foreground">Dashboard</Button>
                    </motion.div>
                  </Link>
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Button variant="outline" onClick={logout}>Log Out</Button>
                  </motion.div>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <Button variant="ghost" className="text-foreground">Log In</Button>
                    </motion.div>
                  </Link>
                  <Link href="/signup">
                    <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                      <Button className="relative bg-secondary hover:bg-secondary/90 text-secondary-foreground overflow-hidden shadow-md shadow-secondary/20">
                        <motion.span
                          className="absolute inset-0 bg-white/10"
                          initial={{ x: '-100%' }}
                          whileHover={{ x: '100%' }}
                          transition={{ duration: 0.35 }}
                        />
                        <span className="relative">Join Free</span>
                      </Button>
                    </motion.div>
                  </Link>
                </>
              )}
            </motion.div>

            {/* Mobile toggle */}
            <div className="md:hidden flex items-center gap-2">
              <ThemeToggle />
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle menu"
              >
                <AnimatePresence mode="wait">
                  {isOpen ? (
                    <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <X className="w-6 h-6" />
                    </motion.div>
                  ) : (
                    <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <Menu className="w-6 h-6" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Animated scroll progress bar */}
        <motion.div
          className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-primary via-secondary to-primary"
          style={{ scaleX: scrollProgress, transformOrigin: 'left' }}
        />
      </motion.nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
              onClick={() => setIsOpen(false)}
            />
            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-16 left-3 right-3 z-50 md:hidden bg-card border border-border rounded-2xl shadow-2xl shadow-black/10 overflow-hidden"
            >
              <div className="p-4 space-y-1">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.25 }}
                  >
                    <Link
                      href={link.href}
                      className="flex items-center px-4 py-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200 text-sm font-medium"
                      onClick={() => setIsOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                {isAuthenticated && (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.18, duration: 0.25 }}>
                    <Link href="/profiles" className="flex items-center px-4 py-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200 text-sm font-medium" onClick={() => setIsOpen(false)}>
                      Browse Profiles
                    </Link>
                  </motion.div>
                )}

                <div className="pt-3 border-t border-border space-y-2">
                  {isAuthenticated ? (
                    <>
                      <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full bg-transparent">Dashboard</Button>
                      </Link>
                      <Button variant="ghost" className="w-full" onClick={() => { logout(); setIsOpen(false); }}>
                        Log Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full bg-transparent">Log In</Button>
                      </Link>
                      <Link href="/signup" onClick={() => setIsOpen(false)}>
                        <Button className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                          Join Free
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}