import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface TestimonialCTAProps {
  title?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
}

export const TestimonialCTA: React.FC<TestimonialCTAProps> = ({
  title = "Ready to transform your business?",
  description = "Join thousands of businesses that have already boosted their customer engagement and revenue with our platform.",
  buttonText = "Get Started Today",
  buttonLink = "/register?type=business"
}) => {
  return (
    <div className="bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-800 dark:to-primary-900">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">{title}</span>
          </h2>
          <p className="mt-4 text-lg text-primary-100 max-w-3xl">
            {description}
          </p>
        </motion.div>
        <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
          <motion.div 
            className="inline-flex rounded-md shadow"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to={buttonLink}
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
            >
              {buttonText}
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCTA;