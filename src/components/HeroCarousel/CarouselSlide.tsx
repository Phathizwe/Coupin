import React from 'react';
import { Link } from 'react-router-dom';
import { SlideData } from './carouselData';

interface CarouselSlideProps {
  slide: SlideData;
  isActive: boolean;
}

const CarouselSlide: React.FC<CarouselSlideProps> = ({ slide, isActive }) => {
  return (
    <div className={`carousel-slide ${isActive ? 'active' : ''}`}>
      <div className="carousel-slide-content">
        <div className="carousel-slide-text">
          {slide.logo && (
            <div className="carousel-logo">
              <img src={slide.logo} alt="TYCA Logo" />
            </div>
          )}
          <h2 className="carousel-title">{slide.title}</h2>
          <p className="carousel-subtitle">{slide.subtitle}</p>
          
          {slide.ctaLink && (
            <Link 
              to={slide.ctaLink} 
              className="carousel-cta-button"
            >
              {slide.ctaText || 'Get Started'}
            </Link>
          )}
        </div>
        
        {slide.image && (
          <div className="carousel-slide-image">
            <img 
              src={slide.image} 
              alt={slide.imageAlt || slide.title} 
              loading="lazy" 
            />
          </div>
        )}
      </div>
      <div 
        className="carousel-slide-background" 
        style={{ 
          background: slide.background || 'linear-gradient(135deg, #2C5530 0%, #6FA86F 100%)'
        }}
      ></div>
    </div>
  );
};

export default CarouselSlide;