import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import CarouselSlide from './CarouselSlide';
import NavigationDots from './NavigationDots';
import { slides } from './carouselData';
import './carousel.css';

const HeroCarousel: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const totalSlides = slides.length;
  
  // Function to go to next slide
  const nextSlide = useCallback(() => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setCurrentSlide((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
      setTimeout(() => setIsTransitioning(false), 500); // Match this with CSS transition time
    }
  }, [isTransitioning, totalSlides]);
  
  // Function to go to previous slide
  const prevSlide = useCallback(() => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
      setTimeout(() => setIsTransitioning(false), 500); // Match this with CSS transition time
    }
  }, [isTransitioning, totalSlides]);
  
  // Function to go to a specific slide
  const goToSlide = (index: number) => {
    if (!isTransitioning && index !== currentSlide) {
      setIsTransitioning(true);
      setCurrentSlide(index);
      setTimeout(() => setIsTransitioning(false), 500); // Match this with CSS transition time
    }
  };
  
  // Auto-play functionality
  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        nextSlide();
      }, 6000); // 6 seconds per slide
      
      return () => clearInterval(interval);
    }
  }, [isPaused, nextSlide]);
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === 'ArrowRight') {
        nextSlide();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);
  
  return (
    <div 
      className="hero-carousel-container"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="hero-carousel">
        {slides.map((slide, index) => (
          <CarouselSlide
            key={index}
            slide={slide}
            isActive={index === currentSlide}
          />
        ))}
      </div>
      
      {/* Navigation arrows */}
      <button 
        className="carousel-arrow carousel-arrow-left" 
        onClick={prevSlide}
        aria-label="Previous slide"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      <button 
        className="carousel-arrow carousel-arrow-right" 
        onClick={nextSlide}
        aria-label="Next slide"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
      
      {/* Navigation dots */}
      <NavigationDots 
        totalSlides={totalSlides} 
        currentSlide={currentSlide} 
        goToSlide={goToSlide} 
      />
    </div>
  );
};

export default HeroCarousel;