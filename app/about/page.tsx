'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, Users, Shield, Globe, Target, Eye, Award, ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';

const values = [
  {
    icon: Heart,
    title: 'Faith First',
    description: 'We believe that lasting relationships are built on a foundation of shared faith and values.',
  },
  {
    icon: Shield,
    title: 'Safety & Trust',
    description: 'Your safety is our priority. We verify profiles and implement strict security measures.',
  },
  {
    icon: Users,
    title: 'Community',
    description: 'Building a supportive community where singles can connect meaningfully.',
  },
  {
    icon: Globe,
    title: 'Global Reach',
    description: 'Connecting faith-based singles across borders, cultures, and denominations.',
  },
];

const team = [
  {
    name: 'Sarah Mitchell',
    role: 'CEO & Founder',
    image: '/images/img15.jpg',
    bio: 'Former marriage counselor with 15 years of experience in faith-based relationships.',
  },
  {
    name: 'David Okonkwo',
    role: 'CTO',
    image: '/images/img82.jpg',
    bio: 'Tech visionary passionate about using technology to bring people together.',
  },
  {
    name: 'Grace Thompson',
    role: 'Head of Community',
    image: '/images/img145.jpg',
    bio: 'Community builder dedicated to creating safe spaces for meaningful connections.',
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Heart className="w-4 h-4" />
                Our Story
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-muted-foreground mb-6 font-serif text-balance">
                Connecting Hearts Through <span className="text-secondary">Faith</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                Committed was founded with a simple yet powerful vision: to create a safe, 
                faith-centered platform where Christian singles can find meaningful, 
                lasting relationships built on shared values and genuine connection.
              </p>
              <div className="flex items-center gap-4">
                <Link href="/signup">
                  <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                    Join Our Community
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <Image
                src="/images/img82.jpg"
                alt="Committed Brand"
                width={600}
                height={400}
                className="rounded-2xl shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card p-8 rounded-2xl border border-border"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-muted-foreground mb-4 font-serif">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed">
                To provide a trusted platform where Christian singles can discover authentic 
                connections rooted in faith, leading to God-honoring relationships and marriages 
                that strengthen families and communities worldwide.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-card p-8 rounded-2xl border border-border"
            >
              <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center mb-6">
                <Eye className="w-7 h-7 text-secondary" />
              </div>
              <h2 className="text-2xl font-bold text-muted-foreground mb-4 font-serif">Our Vision</h2>
              <p className="text-muted-foreground leading-relaxed">
                To become the world's most trusted faith-based dating platform, where every 
                member feels safe, valued, and empowered to find a life partner who shares 
                their commitment to faith and family.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-muted-foreground mb-4 font-serif">
              Our Core Values
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we do at Committed.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card p-6 rounded-xl border border-border hover:border-primary/30 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <value.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section with Image */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Image
                src="/images/img59.jpg"
                alt="Committed Story"
                width={600}
                height={400}
                className="rounded-2xl shadow-xl"
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-muted-foreground mb-6 font-serif">
                Built by Faith, Driven by Purpose
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Committed was born out of a personal experience. Our founders, having witnessed 
                  the challenges Christian singles face in the modern dating landscape, set out to 
                  create something different.
                </p>
                <p>
                  In a world of endless swiping and superficial connections, we believed there had 
                  to be a better way — a platform where faith comes first, where safety is paramount, 
                  and where meaningful connections can flourish.
                </p>
                <p>
                  Since our launch, we have helped thousands of couples find love and build lasting 
                  relationships centered on shared faith and values. Every success story reminds us 
                  why we do what we do.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '50K+', label: 'Active Members' },
              { value: '10K+', label: 'Successful Matches' },
              { value: '30+', label: 'Countries' },
              { value: '4.9', label: 'App Rating' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Award className="w-16 h-16 text-primary-foreground/80 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4 font-serif">
              Ready to Find Your Match?
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of Christian singles who have found meaningful connections on Committed.
            </p>
            <Link href="/signup">
              <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-8">
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
