import React from 'react';

interface NavigationDotsProps {
  totalSlides: number;
  currentSlide: number;
  goToSlide: (index: number) => void;
}

const NavigationDots: React.FC<NavigationDotsProps> = ({ 
  totalSlides, 
  currentSlide, 
  goToSlide 
}) => {
  return (
    <div className="carousel-dots">
      {Array.from({ length: totalSlides }).map((_, index) => (
        <button
          key={index}
          className={`carousel-dot ${index === currentSlide ? 'active' : ''}`}
          onClick={() => goToSlide(index)}
          aria-label={`Go to slide ${index + 1}`}
          aria-current={index === currentSlide ? 'true' : 'false'}
        />
      ))}
    </div>
  );
};

export default NavigationDots;