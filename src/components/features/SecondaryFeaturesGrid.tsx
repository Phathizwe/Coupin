import React from "react";
import {
  Users,
  CreditCard,
  Bell,
  TrendingUp,
  Calendar,
  Gift
} from "lucide-react";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";

const secondaryFeatures = [
  {
    Icon: Users,
    name: "Customer Database",
    description: "Centralized customer profiles with purchase history, preferences, and engagement data.",
    href: "/features/database",
    cta: "Learn More",
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-cyan-100 dark:from-teal-950/20 dark:to-cyan-900/20">
        <img 
          src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop" 
          alt="Customer database"
          className="absolute -right-20 -top-20 opacity-60 rounded-lg"
        />
      </div>
    ),
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-2",
  },
  {
    Icon: CreditCard,
    name: "POS Integration",
    description: "Seamlessly connect with your existing point-of-sale system for automatic transaction tracking.",
    href: "/features/pos",
    cta: "View Integrations",
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-950/20 dark:to-gray-900/20">
        <img 
          src="https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=400&h=300&fit=crop" 
          alt="POS integration"
          className="absolute -right-20 -top-20 opacity-60 rounded-lg"
        />
      </div>
    ),
    className: "lg:col-start-2 lg:col-end-4 lg:row-start-1 lg:row-end-2",
  },
  {
    Icon: Bell,
    name: "Smart Notifications",
    description: "Intelligent push notifications based on customer behavior and preferences.",
    href: "/features/notifications",
    cta: "See Examples",
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-pink-100 dark:from-red-950/20 dark:to-pink-900/20">
        <img 
          src="https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop" 
          alt="Push notifications"
          className="absolute -right-20 -top-20 opacity-60 rounded-lg"
        />
      </div>
    ),
    className: "lg:col-start-1 lg:col-end-3 lg:row-start-2 lg:row-end-3",
  },
  {
    Icon: TrendingUp,
    name: "Growth Analytics",
    description: "Track business growth with revenue trends, customer acquisition, and retention metrics.",
    href: "/features/growth",
    cta: "View Metrics",
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-950/20 dark:to-green-900/20">
        <img 
          src="https://images.unsplash.com/photo-1590479773265-7464e5d48118?w=400&h=300&fit=crop" 
          alt="Growth analytics"
          className="absolute -right-20 -top-20 opacity-60 rounded-lg"
        />
      </div>
    ),
    className: "lg:col-start-3 lg:col-end-4 lg:row-start-2 lg:row-end-3",
  },
];

function SecondaryFeaturesGrid() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Advanced Business Tools
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Professional-grade features that scale with your business growth.
        </p>
      </div>
      <BentoGrid className="lg:grid-rows-2 max-w-6xl mx-auto">
        {secondaryFeatures.map((feature) => (
          <BentoCard key={feature.name} {...feature} />
        ))}
      </BentoGrid>
    </div>
  );
}

export { SecondaryFeaturesGrid };