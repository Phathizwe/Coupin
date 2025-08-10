import React from "react";
import { CircularTestimonials } from './circular-testimonials';

const testimonials = [
  {
    quote:
      "I was impressed by how quickly we saw results! The customer loyalty program helped us increase repeat business by 40% in just three months. The platform is intuitive and our customers love the digital coupons.",
    name: "Tamar Mendelson",
    designation: "Owner, Bright Bean Café",
    src:
      "https://images.unsplash.com/photo-1512316609839-ce289d3eba0a?q=80&w=1368&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    quote:
      "This platform exceeded all expectations! We've been able to track customer engagement in ways we never could before. The analytics dashboard gives us insights that have transformed our marketing approach completely.",
    name: "Joe Charlescraft",
    designation: "Marketing Director, Urban Outfitters",
    src:
      "https://images.unsplash.com/photo-1628749528992-f5702133b686?q=80&w=1368&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fA%3D%3D",
  },
  {
    quote:
      "The QR code feature has been a game-changer for our small business. We've seen a 25% increase in coupon redemptions since implementing it. The customer support team is also incredibly responsive and helpful.",
    name: "Martina Edelweist",
    designation: "CEO, Glow Cosmetics",
    src:
      "https://images.unsplash.com/photo-1524267213992-b76e8577d046?q=80&w=1368&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fA%3D%3D",
  },
];

export const CircularTestimonialsDemo = () => (
  <section>
    {/* Light testimonials section */}
    <div className="bg-[#f7f7fa] p-20 rounded-lg min-h-[300px] flex flex-wrap gap-6 items-center justify-center relative">
      <div
        className="items-center justify-center relative flex"
        style={{ maxWidth: "1456px" }}
      >
        <CircularTestimonials
          testimonials={testimonials}
          autoplay={true}
          colors={{
            name: "#0a0a0a",
            designation: "#454545",
            testimony: "#171717",
            arrowBackground: "#141414",
            arrowForeground: "#f1f1f7",
            arrowHoverBackground: "#00A6FB",
          }}
          fontSizes={{
            name: "28px",
            designation: "20px",
            quote: "20px",
          }}
        />
      </div>
    </div>
    {/* Dark testimonials section */}
    <div className="bg-[#060507] p-16 rounded-lg min-h-[300px] flex flex-wrap gap-6 items-center justify-center relative mt-8">
      <div
        className="items-center justify-center relative flex"
        style={{ maxWidth: "1024px" }}
      >
        <CircularTestimonials
          testimonials={testimonials}
          autoplay={true}
          colors={{
            name: "#f7f7ff",
            designation: "#e1e1e1",
            testimony: "#f1f1f7",
            arrowBackground: "#0582CA",
            arrowForeground: "#141414",
            arrowHoverBackground: "#f7f7ff",
          }}
          fontSizes={{
            name: "28px",
            designation: "20px",
            quote: "20px",
          }}
        />
      </div>
    </div>
  </section>
);

export default CircularTestimonialsDemo;