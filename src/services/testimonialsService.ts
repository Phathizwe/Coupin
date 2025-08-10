import { collection, getDocs, query, orderBy, limit, doc, getDoc, where, addDoc, updateDoc, deleteDoc, DocumentData } from 'firebase/firestore';
import { db } from '../config/firebase';

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

class TestimonialsService {
  private readonly COLLECTION_NAME = 'testimonials';
  
  /**
   * Get all testimonials with optional filtering
   * @param options Filter and pagination options
   * @returns Promise with testimonials array
   */
  async getTestimonials(options: {
    featured?: boolean;
    category?: string;
    limit?: number;
    orderByField?: string;
    orderDirection?: 'asc' | 'desc';
  } = {}): Promise<Testimonial[]> {
    try {
      const {
        featured,
        category,
        limit: queryLimit = 100,
        orderByField = 'createdAt',
        orderDirection = 'desc'
      } = options;
      
      let testimonialsQuery = collection(db, this.COLLECTION_NAME);
      let constraints = [];
      
      // Add filters if provided
      if (featured !== undefined) {
        constraints.push(where('featured', '==', featured));
      }
      
      if (category) {
        constraints.push(where('category', '==', category));
      }
      
      // Add ordering and limit
      constraints.push(orderBy(orderByField, orderDirection));
      constraints.push(limit(queryLimit));
      
      // Execute query
      const querySnapshot = await getDocs(query(testimonialsQuery, ...constraints));
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date()
        } as Testimonial;
      });
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      throw error;
    }
  }
  
  /**
   * Get featured testimonials
   * @param limitCount Maximum number of testimonials to return
   * @returns Promise with featured testimonials array
   */
  async getFeaturedTestimonials(limitCount: number = 3): Promise<Testimonial[]> {
    return this.getTestimonials({
      featured: true,
      limit: limitCount,
      orderByField: 'createdAt',
      orderDirection: 'desc'
    });
  }
  
  /**
   * Get a single testimonial by ID
   * @param id Testimonial ID
   * @returns Promise with testimonial data
   */
  async getTestimonialById(id: string): Promise<Testimonial | null> {
    try {
      const testimonialDoc = await getDoc(doc(db, this.COLLECTION_NAME, id));
      
      if (!testimonialDoc.exists()) {
        return null;
      }
      
      const data = testimonialDoc.data();
      return {
        id: testimonialDoc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date()
      } as Testimonial;
    } catch (error) {
      console.error(`Error fetching testimonial with ID ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Get testimonials by category
   * @param category Category name
   * @param limitCount Maximum number of testimonials to return
   * @returns Promise with categorized testimonials array
   */
  async getTestimonialsByCategory(category: string, limitCount: number = 10): Promise<Testimonial[]> {
    return this.getTestimonials({
      category,
      limit: limitCount,
      orderByField: 'createdAt',
      orderDirection: 'desc'
    });
  }
  
  /**
   * Add a new testimonial
   * @param testimonial Testimonial data
   * @returns Promise with the new testimonial ID
   */
  async addTestimonial(testimonial: Omit<Testimonial, 'id'>): Promise<string> {
    try {
      const testimonialWithTimestamp = {
        ...testimonial,
        createdAt: new Date()
      };
      
      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), testimonialWithTimestamp);
      return docRef.id;
    } catch (error) {
      console.error('Error adding testimonial:', error);
      throw error;
    }
  }
  
  /**
   * Update an existing testimonial
   * @param id Testimonial ID
   * @param testimonial Updated testimonial data
   */
  async updateTestimonial(id: string, testimonial: Partial<Testimonial>): Promise<void> {
    try {
      const testimonialRef = doc(db, this.COLLECTION_NAME, id);
      await updateDoc(testimonialRef, testimonial);
    } catch (error) {
      console.error(`Error updating testimonial with ID ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Delete a testimonial
   * @param id Testimonial ID
   */
  async deleteTestimonial(id: string): Promise<void> {
    try {
      const testimonialRef = doc(db, this.COLLECTION_NAME, id);
      await deleteDoc(testimonialRef);
    } catch (error) {
      console.error(`Error deleting testimonial with ID ${id}:`, error);
      throw error;
    }
  }
}

export const testimonialsService = new TestimonialsService();
export default testimonialsService;