'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah & Michael',
    location: 'Texas, USA',
    avatar: '💑',
    quote: 'We found each other on Committed and got married last year. The faith-based approach made all the difference in building a genuine connection.',
    rating: 5,
  },
  {
    name: 'Grace O.',
    location: 'Lagos, Nigeria',
    avatar: '👩🏾',
    quote: 'The 3-week safety period gave me confidence that this platform truly cares about its members. I met my fiancé here!',
    rating: 5,
  },
  {
    name: 'David K.',
    location: 'London, UK',
    avatar: '👨🏻',
    quote: 'After years of trying other apps, Committed finally helped me find someone who shares my values and faith. Highly recommend!',
    rating: 5,
  },
  {
    name: 'Rebecca & James',
    location: 'Sydney, Australia',
    avatar: '💏',
    quote: 'The global network feature allowed us to connect despite being continents apart. Now we are planning our wedding!',
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-20 md:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-muted-foreground mb-4 font-serif">
            Love Stories
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real couples who found their faith-based match on Committed.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative p-8 bg-card rounded-2xl border border-border hover:border-primary/30 transition-all duration-300"
            >
              <Quote className="absolute top-6 right-6 w-8 h-8 text-primary/20" />
              
              {/* Rating */}
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-foreground leading-relaxed mb-6 text-lg">
                &ldquo;{testimonial.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-2xl">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-muted-foreground">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.location}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
