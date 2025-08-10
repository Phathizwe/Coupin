import React from 'react';
import TestimonialCard from './testimonial-card';
import { Testimonial } from '../../services/testimonialsService';

interface TestimonialGridProps {
  testimonials: Testimonial[];
  columns?: number;
}

export const TestimonialGrid: React.FC<TestimonialGridProps> = ({ 
  testimonials,
  columns = 3
}) => {
  const gridClassName = `grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-${Math.min(columns, 4)}`;
  
  return (
    <div className={gridClassName}>
      {testimonials.map((testimonial, index) => (
        <TestimonialCard 
          key={testimonial.id} 
          testimonial={testimonial} 
          index={index}
        />
      ))}
    </div>
  );
};

export default TestimonialGrid;