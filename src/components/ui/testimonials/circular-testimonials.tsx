import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { CircularTestimonialsProps } from './types';
import { getImageStyle } from './utils';
import { ArrowButton } from './arrows';
import { TestimonialContent } from './testimonial-content';
import { circularTestimonialsStyles } from './styles';

export const CircularTestimonials = ({
  testimonials,
  autoplay = true,
  colors = {},
  fontSizes = {},
}: CircularTestimonialsProps) => {
  // Color & font config
  const colorName = colors.name ?? "#000";
  const colorDesignation = colors.designation ?? "#6b7280";
  const colorTestimony = colors.testimony ?? "#4b5563";
  const colorArrowBg = colors.arrowBackground ?? "#141414";
  const colorArrowFg = colors.arrowForeground ?? "#f1f1f7";
  const colorArrowHoverBg = colors.arrowHoverBackground ?? "#00a6fb";
  const fontSizeName = fontSizes.name ?? "1.5rem";
  const fontSizeDesignation = fontSizes.designation ?? "0.925rem";
  const fontSizeQuote = fontSizes.quote ?? "1.125rem";

  // State
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoverPrev, setHoverPrev] = useState(false);
  const [hoverNext, setHoverNext] = useState(false);
  const [containerWidth, setContainerWidth] = useState(1200);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const autoplayIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const testimonialsLength = useMemo(() => testimonials.length, [testimonials]);
  const activeTestimonial = useMemo(
    () => testimonials[activeIndex],
    [activeIndex, testimonials]
  );

  // Responsive gap calculation
  useEffect(() => {
    function handleResize() {
      if (imageContainerRef.current) {
        setContainerWidth(imageContainerRef.current.offsetWidth);
      }
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Autoplay
  useEffect(() => {
    if (autoplay) {
      autoplayIntervalRef.current = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % testimonialsLength);
      }, 5000);
    }
    return () => {
      if (autoplayIntervalRef.current) clearInterval(autoplayIntervalRef.current);
    };
  }, [autoplay, testimonialsLength]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line
  }, [activeIndex, testimonialsLength]);

  // Navigation handlers
  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % testimonialsLength);
    if (autoplayIntervalRef.current) clearInterval(autoplayIntervalRef.current);
  }, [testimonialsLength]);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + testimonialsLength) % testimonialsLength);
    if (autoplayIntervalRef.current) clearInterval(autoplayIntervalRef.current);
  }, [testimonialsLength]);

  return (
    <div className="testimonial-container">
      <div className="testimonial-grid">
        {/* Images */}
        <div className="image-container" ref={imageContainerRef}>
          {testimonials.map((testimonial, index) => (
            <img
              key={testimonial.src}
              src={testimonial.src}
              alt={testimonial.name}
              className="testimonial-image"
              data-index={index}
              style={getImageStyle(index, activeIndex, testimonialsLength, containerWidth)}
            />
          ))}
        </div>
        {/* Content */}
        <div className="testimonial-content">
          <AnimatePresence mode="wait">
            <TestimonialContent
              key={activeIndex}
              testimonial={activeTestimonial}
              colorName={colorName}
              colorDesignation={colorDesignation}
              colorTestimony={colorTestimony}
              fontSizeName={fontSizeName}
              fontSizeDesignation={fontSizeDesignation}
              fontSizeQuote={fontSizeQuote}
            />
          </AnimatePresence>
          <div className="arrow-buttons">
            <ArrowButton
              direction="prev"
              onClick={handlePrev}
              backgroundColor={hoverPrev ? colorArrowHoverBg : colorArrowBg}
              foregroundColor={colorArrowFg}
              onMouseEnter={() => setHoverPrev(true)}
              onMouseLeave={() => setHoverPrev(false)}
            />
            <ArrowButton
              direction="next"
              onClick={handleNext}
              backgroundColor={hoverNext ? colorArrowHoverBg : colorArrowBg}
              foregroundColor={colorArrowFg}
              onMouseEnter={() => setHoverNext(true)}
              onMouseLeave={() => setHoverNext(false)}
            />
          </div>
        </div>
      </div>
      <style>{circularTestimonialsStyles}</style>
    </div>
  );
};

export default CircularTestimonials;