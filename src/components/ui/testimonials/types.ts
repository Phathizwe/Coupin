export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  designation: string;
  src: string;
  company?: string;
  rating?: number;
  featured?: boolean;
  category?: string;
  createdAt: Date;
}

export interface TestimonialCardProps {
  testimonial: Testimonial;
  index: number;
}

export interface CircularTestimonialProps {
  quote: string;
  name: string;
  designation: string;
  src: string;
}

export interface Colors {
  name?: string;
  designation?: string;
  testimony?: string;
  arrowBackground?: string;
  arrowForeground?: string;
  arrowHoverBackground?: string;
}

export interface FontSizes {
  name?: string;
  designation?: string;
  quote?: string;
}

export interface CircularTestimonialsProps {
  testimonials: CircularTestimonialProps[];
  autoplay?: boolean;
  colors?: Colors;
  fontSizes?: FontSizes;
}