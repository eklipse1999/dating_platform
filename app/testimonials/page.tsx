'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, Quote, Heart, ArrowRight, Play } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';

const featuredStory = {
  couple: 'David & Grace',
  location: 'Lagos, Nigeria',
  image: '/images/img15.jpg',
  quote: 'We met on Committed during the pandemic. The faith-based approach and safety features gave us confidence to open our hearts. After months of meaningful conversations, we knew this was something special. We got married last summer, and we cannot thank Committed enough for bringing us together.',
  married: 'June 2024',
};

const testimonials = [
  {
    name: 'Sarah & Michael',
    location: 'Texas, USA',
    quote: 'We found each other on Committed and got married last year. The faith-based approach made all the difference in building a genuine connection.',
    rating: 5,
    date: 'Married December 2023',
  },
  {
    name: 'Rebecca & James',
    location: 'Sydney, Australia',
    quote: 'The global network feature allowed us to connect despite being continents apart. Now we are planning our wedding!',
    rating: 5,
    date: 'Engaged October 2024',
  },
  {
    name: 'Emmanuel O.',
    location: 'London, UK',
    quote: 'After years of trying other apps, Committed finally helped me find someone who shares my values and faith. Highly recommend!',
    rating: 5,
    date: 'Dating since March 2024',
  },
  {
    name: 'Priscilla K.',
    location: 'Nairobi, Kenya',
    quote: 'The 3-week safety period gave me confidence that this platform truly cares about its members. I met my fiancé here!',
    rating: 5,
    date: 'Engaged August 2024',
  },
  {
    name: 'Daniel & Faith',
    location: 'Toronto, Canada',
    quote: 'What sets Committed apart is the genuine community. Everyone is there for the right reasons - to find a life partner who shares their faith.',
    rating: 5,
    date: 'Married April 2024',
  },
  {
    name: 'Ruth M.',
    location: 'Johannesburg, SA',
    quote: 'I was skeptical about online dating, but the verification process and faith-focused approach made me feel safe. Found my husband within 6 months!',
    rating: 5,
    date: 'Married July 2024',
  },
];

const stats = [
  { value: '10,000+', label: 'Successful Matches' },
  { value: '3,500+', label: 'Weddings' },
  { value: '98%', label: 'Satisfaction Rate' },
  { value: '4.9/5', label: 'App Store Rating' },
];

export default function TestimonialsPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-secondary/10 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-6">
              <Heart className="w-4 h-4" />
              Success Stories
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-accent mb-6 font-serif text-balance">
              Real Love Stories from <span className="text-secondary">Committed</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Hear from couples who found their faith-based match on our platform. 
              These stories inspire us every day to keep building meaningful connections.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Story */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-accent mb-4 font-serif">
              Featured Love Story
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card rounded-3xl border border-border overflow-hidden"
          >
            <div className="grid lg:grid-cols-2">
              <div className="relative h-80 lg:h-auto">
                <Image
                  src={featuredStory.image || "/placeholder.svg"}
                  alt={featuredStory.couple}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent lg:bg-gradient-to-r" />
                <div className="absolute bottom-6 left-6 lg:hidden">
                  <h3 className="text-2xl font-bold text-white">{featuredStory.couple}</h3>
                  <p className="text-white/80">{featuredStory.location}</p>
                </div>
              </div>
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <Quote className="w-12 h-12 text-primary/20 mb-6" />
                <h3 className="text-2xl font-bold text-accent mb-2 hidden lg:block font-serif">
                  {featuredStory.couple}
                </h3>
                <p className="text-muted-foreground mb-4 hidden lg:block">
                  {featuredStory.location}
                </p>
                <p className="text-lg text-foreground leading-relaxed mb-6">
                  &ldquo;{featuredStory.quote}&rdquo;
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-gold text-gold" />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">{featuredStory.married}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* More Testimonials Grid */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-accent mb-4 font-serif">
              More Success Stories
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Every story is unique, but they all share one thing: faith-centered love.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card p-6 rounded-2xl border border-border hover:border-primary/30 transition-all duration-300"
              >
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                  ))}
                </div>
                <Quote className="w-8 h-8 text-primary/20 mb-4" />
                <p className="text-foreground leading-relaxed mb-6">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-accent">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.location}</div>
                  </div>
                  <span className="text-xs text-primary bg-primary/10 px-3 py-1 rounded-full">
                    {testimonial.date}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Share Your Story CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-8 md:p-12 text-center"
          >
            <Heart className="w-16 h-16 text-primary-foreground/80 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4 font-serif">
              Share Your Story
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
              Did you find love on Committed? We would love to hear your story and share it 
              with our community to inspire others.
            </p>
            <Link href="/contact">
              <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-8">
                Submit Your Story
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Start Your Journey CTA */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-accent mb-4 font-serif">
              Your Story Could Be Next
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of Christian singles who have found meaningful connections on Committed.
            </p>
            <Link href="/signup">
              <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-8">
                Start Your Journey
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
