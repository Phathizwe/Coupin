// src/scripts/seedTestimonials.js
const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  getDocs, 
  serverTimestamp 
} = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB_px307ityLaMaEG-TqT-Ssz3CT-AhJ6Y",
  authDomain: "coupin-f35d2.firebaseapp.com",
  projectId: "coupin-f35d2",
  storageBucket: "coupin-f35d2.appspot.com",
  messagingSenderId: "757183919417",
  appId: "1:757183919417:web:6c0146510173250129a4e8",
  measurementId: "G-R0XYKGNZ9C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sample testimonial data
const testimonials = [
  {
    quote: "I was impressed by how quickly we saw results! The customer loyalty program helped us increase repeat business by 40% in just three months. The platform is intuitive and our customers love the digital coupons.",
    name: "Tamar Mendelson",
    designation: "Owner, Bright Bean Café",
    src: "https://images.unsplash.com/photo-1512316609839-ce289d3eba0a?q=80&w=1368&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    company: "Bright Bean Café",
    rating: 5,
    featured: true,
    category: "Food & Beverage"
  },
  {
    quote: "This platform exceeded all expectations! We've been able to track customer engagement in ways we never could before. The analytics dashboard gives us insights that have transformed our marketing approach completely.",
    name: "Joe Charlescraft",
    designation: "Marketing Director, Urban Outfitters",
    src: "https://images.unsplash.com/photo-1628749528992-f5702133b686?q=80&w=1368&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fA%3D%3D",
    company: "Urban Outfitters",
    rating: 5,
    featured: true,
    category: "Retail"
  },
  {
    quote: "The QR code feature has been a game-changer for our small business. We've seen a 25% increase in coupon redemptions since implementing it. The customer support team is also incredibly responsive and helpful.",
    name: "Martina Edelweist",
    designation: "CEO, Glow Cosmetics",
    src: "https://images.unsplash.com/photo-1524267213992-b76e8577d046?q=80&w=1368&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fA%3D%3D",
    company: "Glow Cosmetics",
    rating: 5,
    featured: true,
    category: "Beauty & Wellness"
  },
  {
    quote: "As a small boutique owner, I needed an affordable way to build customer loyalty. This platform provided exactly what I needed without breaking the bank. The digital coupon system is seamless.",
    name: "Sarah Johnson",
    designation: "Owner, Threadworks Boutique",
    src: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1376&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    company: "Threadworks Boutique",
    rating: 4,
    featured: false,
    category: "Retail"
  },
  {
    quote: "The analytics provided by this platform have been invaluable for our business decisions. We can now see exactly which promotions are working and which aren't, allowing us to optimize our marketing budget.",
    name: "Michael Chen",
    designation: "Operations Manager, Green Leaf Restaurant",
    src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    company: "Green Leaf Restaurant",
    rating: 5,
    featured: false,
    category: "Food & Beverage"
  },
  {
    quote: "We've tried several loyalty platforms before, but this one has the best user experience by far. Our staff picked it up quickly, and our customers find it easy to use. The mobile integration is excellent.",
    name: "Lisa Rodriguez",
    designation: "Customer Experience Director, Wellness Spa",
    src: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1361&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    company: "Wellness Spa",
    rating: 5,
    featured: false,
    category: "Beauty & Wellness"
  },
  {
    quote: "The customer segmentation tools have revolutionized our marketing approach. We can now target specific customer groups with tailored offers, resulting in a 35% increase in redemption rates.",
    name: "David Thompson",
    designation: "Marketing Manager, City Books",
    src: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    company: "City Books",
    rating: 4,
    featured: false,
    category: "Retail"
  },
  {
    quote: "Implementing this loyalty program has helped us compete with larger chains. Our regular customers love earning points, and we've seen a significant increase in repeat business since launching.",
    name: "Emma Wilson",
    designation: "Owner, Corner Bakery",
    src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1376&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    company: "Corner Bakery",
    rating: 5,
    featured: false,
    category: "Food & Beverage"
  },
  {
    quote: "The QR code integration with our POS system works flawlessly. Tracking redemptions used to be a manual nightmare, but now it's completely automated. This has saved us countless hours of work.",
    name: "Robert Garcia",
    designation: "IT Director, Metro Fitness",
    src: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=1370&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    company: "Metro Fitness",
    rating: 5,
    featured: false,
    category: "Fitness & Health"
  },
  {
    quote: "We've seen a 20% increase in new customer acquisition since implementing the referral program feature. The platform makes it easy for our existing customers to recommend us to friends.",
    name: "Jennifer Lee",
    designation: "Owner, Bloom Florist",
    src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    company: "Bloom Florist",
    rating: 4,
    featured: false,
    category: "Retail"
  },
  {
    quote: "The email marketing integration has streamlined our promotional campaigns. We can now send targeted offers based on customer behavior, which has resulted in much higher conversion rates.",
    name: "Thomas Wright",
    designation: "Digital Marketing Lead, Urban Gear",
    src: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    company: "Urban Gear",
    rating: 5,
    featured: false,
    category: "Retail"
  },
  {
    quote: "As a service-based business, we needed a loyalty program that wasn't just about product purchases. This platform allows us to reward clients for appointments, referrals, and more.",
    name: "Sophia Martinez",
    designation: "Owner, Serene Salon",
    src: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    company: "Serene Salon",
    rating: 4,
    featured: false,
    category: "Beauty & Wellness"
  }
];

/**
 * Seed testimonials data into Firestore
 */
async function seedTestimonials() {
  try {
    // Check if testimonials already exist
    const testimonialsRef = collection(db, 'testimonials');
    const snapshot = await getDocs(query(testimonialsRef));
    
    if (!snapshot.empty) {
      console.log(`Found ${snapshot.size} existing testimonials. Skipping seed.`);
      return;
    }
    
    // Add testimonials to Firestore
    const promises = testimonials.map(testimonial => {
      return addDoc(testimonialsRef, {
        ...testimonial,
        createdAt: serverTimestamp()
      });
    });
    
    await Promise.all(promises);
    console.log(`Successfully added ${testimonials.length} testimonials to Firestore.`);
  } catch (error) {
    console.error('Error seeding testimonials:', error);
  }
}

// Execute the seed function
seedTestimonials()
  .then(() => {
    console.log('Testimonials seeding completed.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Testimonials seeding failed:', error);
    process.exit(1);
  });