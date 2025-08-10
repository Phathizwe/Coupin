/**
 * Calculates the gap between testimonial images based on container width
 * @param width The width of the container
 * @returns The calculated gap size
 */
export function calculateGap(width: number): number {
  const minWidth = 1024;
  const maxWidth = 1456;
  const minGap = 60;
  const maxGap = 86;
  
  if (width <= minWidth) return minGap;
  if (width >= maxWidth)
    return Math.max(minGap, maxGap + 0.06018 * (width - maxWidth));
    
  return minGap + (maxGap - minGap) * ((width - minWidth) / (maxWidth - minWidth));
}

/**
 * Generates the style for a testimonial image based on its position
 * @param index The index of the image
 * @param activeIndex The index of the currently active testimonial
 * @param testimonialsLength The total number of testimonials
 * @param containerWidth The width of the container
 * @returns The CSS style object for the image
 */
export function getImageStyle(
  index: number, 
  activeIndex: number, 
  testimonialsLength: number, 
  containerWidth: number
): React.CSSProperties {
  const gap = calculateGap(containerWidth);
  const maxStickUp = gap * 0.8;
  const isActive = index === activeIndex;
  const isLeft = (activeIndex - 1 + testimonialsLength) % testimonialsLength === index;
  const isRight = (activeIndex + 1) % testimonialsLength === index;
  
  if (isActive) {
    return {
      zIndex: 3,
      opacity: 1,
      pointerEvents: "auto",
      transform: `translateX(0px) translateY(0px) scale(1) rotateY(0deg)`,
      transition: "all 0.8s cubic-bezier(.4,2,.3,1)",
    };
  }
  
  if (isLeft) {
    return {
      zIndex: 2,
      opacity: 1,
      pointerEvents: "auto",
      transform: `translateX(-${gap}px) translateY(-${maxStickUp}px) scale(0.85) rotateY(15deg)`,
      transition: "all 0.8s cubic-bezier(.4,2,.3,1)",
    };
  }
  
  if (isRight) {
    return {
      zIndex: 2,
      opacity: 1,
      pointerEvents: "auto",
      transform: `translateX(${gap}px) translateY(-${maxStickUp}px) scale(0.85) rotateY(-15deg)`,
      transition: "all 0.8s cubic-bezier(.4,2,.3,1)",
    };
  }
  
  // Hide all other images
  return {
    zIndex: 1,
    opacity: 0,
    pointerEvents: "none",
    transition: "all 0.8s cubic-bezier(.4,2,.3,1)",
  };
}