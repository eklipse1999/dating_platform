'use client';

import { motion } from 'framer-motion';
import { Star, Quote, Heart } from 'lucide-react';
import { useState } from 'react';

const testimonials = [
  { name: 'Sarah & Michael', location: 'Texas, USA', avatar: '💑', quote: 'We found each other on Committed and got married last year. The faith-based approach made all the difference in building a genuine connection.', rating: 5 },
  { name: 'Grace O.', location: 'Lagos, Nigeria', avatar: '👩🏾', quote: 'The 3-week safety period gave me confidence that this platform truly cares about its members. I met my fiancé here!', rating: 5 },
  { name: 'David K.', location: 'London, UK', avatar: '👨🏻', quote: 'After years of trying other apps, Committed finally helped me find someone who shares my values and faith. Highly recommend!', rating: 5 },
  { name: 'Rebecca & James', location: 'Sydney, Australia', avatar: '💏', quote: 'The global network feature allowed us to connect despite being continents apart. Now we are planning our wedding!', rating: 5 },
];

// Duplicate for infinite marquee
const allTestimonials = [...testimonials, ...testimonials];

function TestimonialCard({ testimonial, index }: { testimonial: typeof testimonials[0]; index: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay: index * 0.12, ease: [0.21, 0.47, 0.32, 0.98] }}
      whileHover={{ y: -6, scale: 1.02 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="relative p-8 bg-card rounded-2xl border border-border hover:border-secondary/40 transition-all duration-500 shadow-md hover:shadow-xl hover:shadow-secondary/10 cursor-default group"
    >
      {/* Quote icon */}
      <motion.div
        animate={hovered ? { rotate: 10, scale: 1.2, opacity: 0.4 } : { rotate: 0, scale: 1, opacity: 0.15 }}
        transition={{ duration: 0.3 }}
        className="absolute top-6 right-6 text-secondary"
      >
        <Quote className="w-9 h-9" />
      </motion.div>

      {/* Stars */}
      <div className="flex items-center gap-1 mb-5">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: index * 0.1 + i * 0.06, type: 'spring' }}
          >
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          </motion.div>
        ))}
      </div>

      {/* Quote text */}
      <p className="text-foreground leading-relaxed mb-6 text-base italic relative z-10">
        &ldquo;{testimonial.quote}&rdquo;
      </p>

      {/* Author */}
      <div className="flex items-center gap-4">
        <motion.div
          whileHover={{ scale: 1.15, rotate: [0, -5, 5, 0] }}
          transition={{ duration: 0.4 }}
          className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 border border-border flex items-center justify-center text-2xl shadow-md"
        >
          {testimonial.avatar}
        </motion.div>
        <div>
          <div className="font-semibold text-foreground group-hover:text-secondary transition-colors duration-300">
            {testimonial.name}
          </div>
          <div className="text-sm text-muted-foreground">{testimonial.location}</div>
        </div>
        <motion.div
          className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
        </motion.div>
      </div>

      {/* Animated bottom border */}
      <motion.div
        className="absolute bottom-0 left-6 right-6 h-0.5 bg-gradient-to-r from-primary/0 via-secondary to-primary/0 rounded-full"
        initial={{ scaleX: 0 }}
        animate={hovered ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ duration: 0.4 }}
      />
    </motion.div>
  );
}

export function TestimonialsSection() {
  return (
    <section className="relative py-20 md:py-32 bg-background overflow-hidden">
      {/* Background radial */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
        style={{
          background: 'radial-gradient(ellipse at 50% 80%, hsl(var(--secondary)/0.05) 0%, transparent 70%)',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 text-rose-500 text-sm font-medium mb-4"
          >
            <Heart className="w-3.5 h-3.5 fill-current" />
            Real stories
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 font-serif"
          >
            Love Stories
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Real couples who found their faith-based match on Committed.
          </motion.p>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {testimonials.map((t, i) => (
            <TestimonialCard key={t.name} testimonial={t} index={i} />
          ))}
        </div>

        {/* Bottom CTA pill */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground text-sm">
            Join <motion.span className="font-bold text-foreground" animate={{ color: ['hsl(var(--foreground))', 'hsl(var(--secondary))', 'hsl(var(--foreground))'] }} transition={{ duration: 3, repeat: Infinity }}>50,000+</motion.span> members already finding love
          </p>
        </motion.div>
      </div>
    </section>
  );
}