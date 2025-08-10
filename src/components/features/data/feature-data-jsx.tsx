import React from 'react';
import {
  Heart,
  MessageCircle,
  BarChart3,
  Smartphone,
  Gift,
  Users,
  Target,
  Zap,
  TrendingUp,
  Bell,
  CreditCard
} from "lucide-react";

export type FeatureItem = {
  Icon: React.ElementType;
  name: string;
  description: string;
  href: string;
  cta: string;
  background: React.ReactNode;
  className: string;
};

export const primaryFeatures: FeatureItem[] = [
  {
    Icon: Heart,
    name: "Digital Loyalty Programs",
    description: "Replace paper punch cards with beautiful digital loyalty systems. Automated tracking, custom rewards, and customer insights.",
    href: "/features/loyalty",
    cta: "See Demo",
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-pink-50 to-rose-100 dark:from-pink-950/20 dark:to-rose-900/20">
        <img 
          src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop" 
          alt="Digital loyalty card"
          className="absolute -right-20 -top-20 opacity-60 rounded-lg"
        />
      </div>
    ),
    className: "lg:row-start-1 lg:row-end-3 lg:col-start-1 lg:col-end-2",
  },
  {
    Icon: MessageCircle,
    name: "Customer Engagement",
    description: "Personalized messaging, push notifications, and automated campaigns to keep customers coming back.",
    href: "/features/engagement",
    cta: "Learn More",
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/20 dark:to-indigo-900/20">
        <img 
          src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop" 
          alt="Customer messaging"
          className="absolute -right-20 -top-20 opacity-60 rounded-lg"
        />
      </div>
    ),
    className: "lg:col-start-2 lg:col-end-4 lg:row-start-1 lg:row-end-2",
  },
  {
    Icon: Target,
    name: "Campaign Management",
    description: "Create, schedule, and track promotional campaigns with our intuitive drag-and-drop builder.",
    href: "/features/campaigns",
    cta: "Try Builder",
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/20 dark:to-emerald-900/20">
        <img 
          src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop" 
          alt="Campaign dashboard"
          className="absolute -right-20 -top-20 opacity-60 rounded-lg"
        />
      </div>
    ),
    className: "lg:col-start-2 lg:col-end-3 lg:row-start-2 lg:row-end-4",
  },
  {
    Icon: BarChart3,
    name: "Analytics & Insights",
    description: "Real-time dashboards showing customer behavior, revenue attribution, and business growth metrics.",
    href: "/features/analytics",
    cta: "View Dashboard",
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-950/20 dark:to-violet-900/20">
        <img 
          src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop" 
          alt="Analytics dashboard"
          className="absolute -right-20 -top-20 opacity-60 rounded-lg"
        />
      </div>
    ),
    className: "lg:col-start-3 lg:col-end-4 lg:row-start-2 lg:row-end-3",
  },
  {
    Icon: Smartphone,
    name: "Mobile Customer App",
    description: "Beautiful mobile experience for customers with QR scanning, digital wallets, and reward tracking.",
    href: "/features/mobile",
    cta: "See App",
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-950/20 dark:to-amber-900/20">
        <img 
          src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop" 
          alt="Mobile app interface"
          className="absolute -right-20 -top-20 opacity-60 rounded-lg"
        />
      </div>
    ),
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4",
  },
  {
    Icon: Zap,
    name: "Automation Tools",
    description: "Set up automated workflows for customer re-engagement, birthday rewards, and promotional triggers.",
    href: "/features/automation",
    cta: "Explore",
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-orange-100 dark:from-yellow-950/20 dark:to-orange-900/20">
        <img 
          src="https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=400&h=300&fit=crop" 
          alt="Automation workflow"
          className="absolute -right-20 -top-20 opacity-60 rounded-lg"
        />
      </div>
    ),
    className: "lg:col-start-3 lg:col-end-4 lg:row-start-3 lg:row-end-4",
  },
];

export const secondaryFeatures: FeatureItem[] = [
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