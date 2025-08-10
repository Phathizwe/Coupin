import React from 'react';
import { motion } from 'framer-motion';
import { CircularTestimonialProps } from './types';

interface TestimonialContentProps {
  testimonial: CircularTestimonialProps;
  colorName: string;
  colorDesignation: string;
  colorTestimony: string;
  fontSizeName: string;
  fontSizeDesignation: string;
  fontSizeQuote: string;
}

// Framer Motion variants for quote
const quoteVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const TestimonialContent: React.FC<TestimonialContentProps> = ({
  testimonial,
  colorName,
  colorDesignation,
  colorTestimony,
  fontSizeName,
  fontSizeDesignation,
  fontSizeQuote
}) => {
  return (
    <motion.div
      variants={quoteVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <h3
        className="name"
        style={{ color: colorName, fontSize: fontSizeName }}
      >
        {testimonial.name}
      </h3>
      <p
        className="designation"
        style={{ color: colorDesignation, fontSize: fontSizeDesignation }}
      >
        {testimonial.designation}
      </p>
      <motion.p
        className="quote"
        style={{ color: colorTestimony, fontSize: fontSizeQuote }}
      >
        {testimonial.quote.split(" ").map((word, i) => (
          <motion.span
            key={i}
            initial={{
              filter: "blur(10px)",
              opacity: 0,
              y: 5,
            }}
            animate={{
              filter: "blur(0px)",
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.22,
              ease: "easeInOut",
              delay: 0.025 * i,
            }}
            style={{ display: "inline-block" }}
          >
            {word}&nbsp;
          </motion.span>
        ))}
      </motion.p>
    </motion.div>
  );
};