import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, Timestamp, query, orderBy } from 'firebase/firestore';
import { db } from '@/config/firebase';

export interface TimelineEntry {
  id?: string;
  year: string;
  title: string;
  description?: string;
  createdAt?: Timestamp;
}

class TimelineService {
  private collectionName = 'timeline';

  /**
   * Get all timeline entries ordered by year
   */
  async getTimelineEntries(): Promise<TimelineEntry[]> {
    try {
      const timelineQuery = query(
        collection(db, this.collectionName), 
        orderBy('year', 'desc')
      );
      
      const snapshot = await getDocs(timelineQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as TimelineEntry));
    } catch (error) {
      console.error('Error fetching timeline entries:', error);
      return [];
    }
  }

  /**
   * Add a new timeline entry
   */
  async addTimelineEntry(entry: Omit<TimelineEntry, 'id'>): Promise<string | null> {
    try {
      const entryWithTimestamp = {
        ...entry,
        createdAt: Timestamp.now()
      };
      
      const docRef = await addDoc(collection(db, this.collectionName), entryWithTimestamp);
      return docRef.id;
    } catch (error) {
      console.error('Error adding timeline entry:', error);
      return null;
    }
  }

  /**
   * Update an existing timeline entry
   */
  async updateTimelineEntry(id: string, entry: Partial<TimelineEntry>): Promise<boolean> {
    try {
      await updateDoc(doc(db, this.collectionName, id), entry);
      return true;
    } catch (error) {
      console.error('Error updating timeline entry:', error);
      return false;
    }
  }

  /**
   * Delete a timeline entry
   */
  async deleteTimelineEntry(id: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, this.collectionName, id));
      return true;
    } catch (error) {
      console.error('Error deleting timeline entry:', error);
      return false;
    }
  }
}

export const timelineService = new TimelineService();