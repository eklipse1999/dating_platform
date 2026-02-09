'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Briefcase, MapPin, Clock, ArrowRight, Heart, Users, 
  Globe, Zap, Coffee, Plane, BookOpen, DollarSign 
} from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';

const benefits = [
  { icon: Heart, title: 'Health & Wellness', description: 'Comprehensive health, dental, and vision coverage' },
  { icon: Plane, title: 'Unlimited PTO', description: 'Take the time you need to recharge and refresh' },
  { icon: Globe, title: 'Remote First', description: 'Work from anywhere in the world' },
  { icon: BookOpen, title: 'Learning Budget', description: 'Annual budget for courses and conferences' },
  { icon: DollarSign, title: 'Competitive Pay', description: 'Top-of-market compensation packages' },
  { icon: Coffee, title: 'Team Events', description: 'Regular team retreats and social events' },
];

const jobs = [
  {
    title: 'Senior Full-Stack Engineer',
    department: 'Engineering',
    location: 'Remote (Global)',
    type: 'Full-time',
    description: 'Build and scale our matching algorithms and user experience.',
  },
  {
    title: 'Product Designer',
    department: 'Design',
    location: 'Remote (Global)',
    type: 'Full-time',
    description: 'Shape the future of faith-based dating through thoughtful design.',
  },
  {
    title: 'Community Manager',
    department: 'Community',
    location: 'Lagos, Nigeria',
    type: 'Full-time',
    description: 'Build and nurture our growing African community.',
  },
  {
    title: 'Data Scientist',
    department: 'Engineering',
    location: 'Remote (Global)',
    type: 'Full-time',
    description: 'Use data to improve matches and user satisfaction.',
  },
  {
    title: 'Customer Success Lead',
    department: 'Operations',
    location: 'London, UK',
    type: 'Full-time',
    description: 'Ensure our members have the best possible experience.',
  },
  {
    title: 'Marketing Manager',
    department: 'Marketing',
    location: 'Remote (Global)',
    type: 'Full-time',
    description: 'Drive growth and brand awareness globally.',
  },
];

const values = [
  { title: 'Faith First', description: 'We lead with our values in everything we do.' },
  { title: 'User Obsessed', description: 'Our members success is our success.' },
  { title: 'Move Fast', description: 'We ship quickly and iterate based on feedback.' },
  { title: 'Be Transparent', description: 'Open communication builds trust.' },
];

export default function CareersPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Briefcase className="w-4 h-4" />
                Join Our Team
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-muted-foreground mb-6 font-serif text-balance">
                Help Us Connect <span className="text-secondary">Hearts</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                Join a mission-driven team building the world's most trusted faith-based 
                dating platform. We're looking for passionate people who want to make 
                a real difference in people's lives.
              </p>
              <Link href="#open-positions">
                <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                  View Open Positions
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="grid grid-cols-2 gap-4"
            >
              <div className="space-y-4">
                <Image
                  src="/images/img121.jpg"
                  alt="Team member"
                  width={300}
                  height={400}
                  className="rounded-2xl shadow-lg"
                />
                <Image
                  src="/images/img97.jpg"
                  alt="Team swag"
                  width={300}
                  height={200}
                  className="rounded-2xl shadow-lg"
                />
              </div>
              <div className="space-y-4 pt-8">
                <Image
                  src="/images/img145.jpg"
                  alt="Team event"
                  width={300}
                  height={300}
                  className="rounded-2xl shadow-lg"
                />
                <Image
                  src="/images/img72.jpg"
                  alt="Office"
                  width={300}
                  height={200}
                  className="rounded-2xl shadow-lg"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-muted-foreground mb-4 font-serif">
              Our Values
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The principles that guide how we work and build together.
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
                className="bg-card p-6 rounded-xl border border-border text-center"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">{index + 1}</span>
                </div>
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-muted-foreground mb-4 font-serif">
              Why Join Committed?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We take care of our team so they can focus on taking care of our members.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card p-6 rounded-xl border border-border hover:border-primary/30 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <benefit.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section id="open-positions" className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-muted-foreground mb-4 font-serif">
              Open Positions
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find your next opportunity to make an impact.
            </p>
          </motion.div>

          <div className="space-y-4">
            {jobs.map((job, index) => (
              <motion.div
                key={job.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card p-6 rounded-xl border border-border hover:border-primary/30 transition-all duration-300 group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-muted-foreground group-hover:text-primary transition-colors">
                        {job.title}
                      </h3>
                      <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                        {job.department}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{job.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {job.type}
                      </span>
                    </div>
                  </div>
                  <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground shrink-0">
                    Apply Now
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-8 md:p-12 text-center"
          >
            <Users className="w-16 h-16 text-primary-foreground/80 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4 font-serif">
              Don't See Your Role?
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
              We're always looking for talented people who share our mission. Send us your 
              resume and tell us how you can contribute to Committed.
            </p>
            <Link href="/contact">
              <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-8">
                Get in Touch
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
