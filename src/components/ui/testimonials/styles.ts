/**
 * CSS styles for the circular testimonials component
 */
export const circularTestimonialsStyles = `
.testimonial-container {
  width: 100%;
  max-width: 56rem;
  padding: 2rem;
}

.testimonial-grid {
  display: grid;
  gap: 5rem;
}

.image-container {
  position: relative;
  width: 100%;
  height: 24rem;
  perspective: 1000px;
}

.testimonial-image {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 1.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.testimonial-content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.name {
  font-weight: bold;
  margin-bottom: 0.25rem;
}

.designation {
  margin-bottom: 2rem;
}

.quote {
  line-height: 1.75;
}

.arrow-buttons {
  display: flex;
  gap: 1.5rem;
  padding-top: 3rem;
}

.arrow-button {
  width: 2.7rem;
  height: 2.7rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.3s;
  border: none;
}

.word {
  display: inline-block;
}

@media (min-width: 768px) {
  .testimonial-grid {
    grid-template-columns: 1fr 1fr;
  }
  
  .arrow-buttons {
    padding-top: 0;
  }
}
`;