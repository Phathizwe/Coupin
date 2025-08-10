export interface SlideData {
  title: string;
  subtitle: string;
  background?: string;
  logo?: string;
  image?: string;
  imageAlt?: string;
  ctaText?: string;
  ctaLink?: string;
}

export const slides: SlideData[] = [
  // Primary Slide (Default/Main)
  {
    title: "Thank You Come Again",
    subtitle: "Value Coming Back",
    logo: "/images/tyca-logo-large.png", // Adjust path based on your actual logo location
    ctaText: "Get Started",
    ctaLink: "/register",
    background: "linear-gradient(135deg, #2C5530 0%, #6FA86F 100%)" // Using brand primary colors
  },
  // Slide 2: Feature highlight
  {
    title: "Boost Customer Retention by 40%",
    subtitle: "Our proven strategies keep your customers coming back for more",
    image: "/images/retention-graphic.jpg", // Replace with actual image
    imageAlt: "Customer retention graph showing 40% improvement",
    ctaText: "Learn More",
    ctaLink: "/about",
    background: "linear-gradient(135deg, #1F3E23 0%, #8FB78F 100%)"
  },
  // Slide 3: Success story
  {
    title: "Success Stories",
    subtitle: "\"TYCA helped us increase repeat business by 35% in just three months\" - Local Cafe Owner",
    image: "/images/testimonial-image.jpg", // Replace with actual image
    imageAlt: "Happy business owner using TYCA",
    ctaText: "Read More",
    ctaLink: "/testimonials",
    background: "linear-gradient(135deg, #447D4E 0%, #A8C69F 100%)"
  },
  // Slide 4: Special offer
  {
    title: "Special Launch Offer",
    subtitle: "Sign up today and get 3 months of premium features for free",
    image: "/images/special-offer.jpg", // Replace with actual image
    imageAlt: "Special offer promotion",
    ctaText: "Claim Offer",
    ctaLink: "/register?promo=launch",
    background: "linear-gradient(135deg, #FF8C42 0%, #FFD9B3 100%)" // Using secondary colors for variety
  },
  // Slide 5: Product showcase
  {
    title: "Easy-to-Use Dashboard",
    subtitle: "Manage customer relationships, coupons, and loyalty programs all in one place",
    image: "/images/dashboard-preview.jpg", // Replace with actual image
    imageAlt: "TYCA dashboard preview",
    ctaText: "See Features",
    ctaLink: "/features",
    background: "linear-gradient(135deg, #2B5E37 0%, #76AA78 100%)"
  }
];