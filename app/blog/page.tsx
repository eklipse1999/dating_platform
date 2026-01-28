'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowRight, User, Tag, Search, BookOpen } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const featuredPost = {
  title: '7 Biblical Principles for Finding Your Life Partner',
  excerpt: 'Discover timeless wisdom from Scripture that can guide your journey to finding a God-honoring relationship. These principles have helped thousands of couples build strong foundations.',
  author: 'Pastor James Wilson',
  date: 'January 15, 2026',
  readTime: '8 min read',
  category: 'Faith & Dating',
  image: '/images/img15.jpg',
  slug: 'biblical-principles-life-partner',
};

const blogPosts = [
  {
    title: 'The Importance of Shared Faith in Marriage',
    excerpt: 'Why finding someone who shares your faith is crucial for a lasting, fulfilling marriage.',
    author: 'Dr. Sarah Mitchell',
    date: 'January 10, 2026',
    readTime: '5 min read',
    category: 'Relationships',
    image: '/images/img82.jpg',
    slug: 'shared-faith-marriage',
  },
  {
    title: 'Online Dating Safety Tips for Christians',
    excerpt: 'Essential safety guidelines for navigating the online dating world while protecting your heart.',
    author: 'Grace Thompson',
    date: 'January 5, 2026',
    readTime: '6 min read',
    category: 'Safety',
    image: '/images/img72.jpg',
    slug: 'online-dating-safety',
  },
  {
    title: 'How to Build Trust in a New Relationship',
    excerpt: 'Practical steps for establishing and nurturing trust from the very beginning of your relationship.',
    author: 'David Okonkwo',
    date: 'December 28, 2025',
    readTime: '7 min read',
    category: 'Relationships',
    image: '/images/img59.jpg',
    slug: 'build-trust-relationship',
  },
  {
    title: 'Navigating Long-Distance Christian Dating',
    excerpt: 'Tips and encouragement for couples maintaining faith-centered relationships across distances.',
    author: 'Rebecca & James Chen',
    date: 'December 20, 2025',
    readTime: '6 min read',
    category: 'Long Distance',
    image: '/images/img145.jpg',
    slug: 'long-distance-dating',
  },
  {
    title: 'Preparing Your Heart for Marriage',
    excerpt: 'Spiritual and emotional preparations you can make before meeting your future spouse.',
    author: 'Pastor Michael Brown',
    date: 'December 15, 2025',
    readTime: '9 min read',
    category: 'Faith & Dating',
    image: '/images/img121.jpg',
    slug: 'preparing-heart-marriage',
  },
  {
    title: 'Red Flags vs Green Flags in Christian Dating',
    excerpt: 'Learn to identify healthy relationship signs and warning signs to watch out for.',
    author: 'Dr. Ruth Anderson',
    date: 'December 10, 2025',
    readTime: '7 min read',
    category: 'Advice',
    image: '/images/img97.jpg',
    slug: 'red-flags-green-flags',
  },
];

const categories = [
  'All Posts',
  'Faith & Dating',
  'Relationships',
  'Safety',
  'Long Distance',
  'Advice',
  'Success Stories',
];

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <BookOpen className="w-4 h-4" />
              Committed Blog
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-accent mb-6 font-serif text-balance">
              Insights for <span className="text-secondary">Faith-Based</span> Dating
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Expert advice, inspiring stories, and practical tips for Christian singles 
              navigating the journey to meaningful relationships.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-xl mx-auto mb-8"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search articles..."
                className="pl-12 h-12 rounded-xl"
              />
            </div>
          </motion.div>

          {/* Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-2"
          >
            {categories.map((category, index) => (
              <button
                key={category}
                type="button"
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  index === 0
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {category}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card rounded-3xl border border-border overflow-hidden"
          >
            <div className="grid lg:grid-cols-2">
              <div className="relative h-64 lg:h-auto">
                <Image
                  src={featuredPost.image || "/placeholder.svg"}
                  alt={featuredPost.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-secondary text-secondary-foreground text-sm font-medium rounded-full">
                    Featured
                  </span>
                </div>
              </div>
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <div className="flex items-center gap-4 mb-4">
                  <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                    {featuredPost.category}
                  </span>
                </div>
                <h2 className="text-2xl lg:text-3xl font-bold text-accent mb-4 font-serif">
                  {featuredPost.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {featuredPost.excerpt}
                </p>
                <div className="flex items-center gap-4 mb-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {featuredPost.author}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {featuredPost.date}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {featuredPost.readTime}
                  </div>
                </div>
                <Link href={`/blog/${featuredPost.slug}`}>
                  <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground w-fit">
                    Read Article
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-accent font-serif">
              Latest Articles
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.map((post, index) => (
              <motion.article
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-2xl border border-border overflow-hidden hover:border-primary/30 transition-all duration-300 group"
              >
                <div className="relative h-48">
                  <Image
                    src={post.image || "/placeholder.svg"}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-background/90 text-foreground text-xs font-medium rounded-full">
                      {post.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-accent mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{post.author}</span>
                    <div className="flex items-center gap-3">
                      <span>{post.date}</span>
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          {/* Load More */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Button variant="outline" size="lg" className="bg-transparent">
              Load More Articles
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card rounded-3xl border border-border p-8 md:p-12 text-center"
          >
            <BookOpen className="w-12 h-12 text-primary mx-auto mb-6" />
            <h2 className="text-2xl md:text-3xl font-bold text-accent mb-4 font-serif">
              Get Faith & Dating Tips
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Subscribe to our newsletter for weekly insights, advice, and inspiration 
              for your faith-based dating journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                className="h-12"
              />
              <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground h-12 px-6">
                Subscribe
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
