import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import TestimonialsHero from '../components/ui/testimonials-hero';
import CircularTestimonials from '../components/ui/circular-testimonials';
import TestimonialGrid from '../components/ui/testimonial-grid';
import TestimonialFilter from '../components/ui/testimonial-filter';
import TestimonialStats from '../components/ui/testimonial-stats';
import TestimonialCTA from '../components/ui/testimonial-cta';
import { useTestimonials } from '../hooks/useTestimonials';
import { Testimonial } from '../services/testimonialsService';

const TestimonialsPage: React.FC = () => {
  const { 
    testimonials, 
    featuredTestimonials, 
    categories, 
    loading, 
    error,
    activeCategory,
    setActiveCategory
  } = useTestimonials();

  // Stats data
  const stats = [
    { value: "97%", label: "Customer Satisfaction", description: "Based on post-purchase surveys" },
    { value: "2,500+", label: "Businesses Served", description: "Across various industries" },
    { value: "15M+", label: "Coupons Redeemed", description: "Driving customer loyalty" },
    { value: "30%", label: "Average Revenue Increase", description: "For businesses using our platform" }
  ];

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Prepare testimonials for the circular component
  const circularTestimonialsData = featuredTestimonials.length > 0 
    ? featuredTestimonials 
    : testimonials.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <TestimonialsHero />
      
      {/* Featured Testimonials Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Featured Testimonials</h2>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
              Hear from our satisfied customers about their experience
            </p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-8">
              <p>{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
              >
                Try Again
              </button>
            </div>
          ) : circularTestimonialsData.length > 0 ? (
            <div className="flex justify-center">
              <CircularTestimonials 
                testimonials={circularTestimonialsData as any}
                autoplay={true}
                colors={{
                  name: "#111827",
                  designation: "#4B5563",
                  testimony: "#1F2937",
                  arrowBackground: "#111827",
                  arrowForeground: "#F9FAFB",
                  arrowHoverBackground: "#4F46E5"
                }}
              />
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No featured testimonials available.</p>
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <TestimonialStats stats={stats} />

      {/* All Testimonials Section */}
      <section className="py-16 md:py-24 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">All Testimonials</h2>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
              Filter by category to find relevant customer stories
            </p>
          </motion.div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <TestimonialFilter 
              categories={categories}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />
          )}

          {/* Testimonials Grid */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-8">
              <p>{error}</p>
            </div>
          ) : testimonials.length > 0 ? (
            <TestimonialGrid testimonials={testimonials} columns={3} />
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No testimonials available for this category.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <TestimonialCTA />
    </div>
  );
};

export default TestimonialsPage;