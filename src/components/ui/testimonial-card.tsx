import React from 'react';
import { motion } from 'framer-motion';
import { Testimonial } from '../../services/testimonialsService';

interface TestimonialCardProps {
  testimonial: Testimonial;
  index: number;
}

export const TestimonialCard: React.FC<TestimonialCardProps> = ({ testimonial, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col h-full"
    >
      <div className="flex-grow">
        <div className="flex items-center mb-4">
          {Array.from({ length: testimonial.rating || 5 }).map((_, i) => (
            <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        <p className="text-gray-700 dark:text-gray-300 mb-4 italic">"{testimonial.quote}"</p>
      </div>
      <div className="flex items-center mt-4">
        <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
          <img 
            src={testimonial.src} 
            alt={testimonial.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white">{testimonial.name}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">{testimonial.designation}</p>
          {testimonial.company && (
            <p className="text-xs text-gray-500 dark:text-gray-500">{testimonial.company}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TestimonialCard;