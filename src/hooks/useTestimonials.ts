import { useState, useEffect, useMemo } from 'react';
import { testimonialsService, Testimonial } from '../services/testimonialsService';

interface UseTestimonialsOptions {
  featured?: boolean;
  category?: string;
  limit?: number;
}

export const useTestimonials = (options: UseTestimonialsOptions = {}) => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Fetch testimonials based on options
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // If a specific category is selected (not 'all'), include it in the query
        const queryOptions = {
          ...options,
          category: activeCategory !== 'all' ? activeCategory : undefined
        };
        
        const data = await testimonialsService.getTestimonials(queryOptions);
        setTestimonials(data);
        
        // Extract unique categories if we don't have them yet
        if (categories.length === 0) {
          const allTestimonials = await testimonialsService.getTestimonials();
          const uniqueCategories = Array.from(
            new Set(
              allTestimonials
                .map(t => t.category)
                .filter(Boolean) as string[]
            )
          );
          setCategories(uniqueCategories);
        }
      } catch (err) {
        console.error('Error fetching testimonials:', err);
        setError('Failed to load testimonials. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, [options.featured, options.limit, activeCategory]);

  // Filter testimonials for featured section
  const featuredTestimonials = useMemo(() => {
    return testimonials.filter(t => t.featured).slice(0, 3);
  }, [testimonials]);

  return {
    testimonials,
    featuredTestimonials,
    categories,
    loading,
    error,
    activeCategory,
    setActiveCategory
  };
};

export default useTestimonials;