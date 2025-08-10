import React from "react";
import { Link } from "react-router-dom";
import { TycaFeaturesGrid } from "@/components/features/TycaFeaturesGrid";
import { SecondaryFeaturesGrid } from "@/components/features/SecondaryFeaturesGrid";
import { LoyaltyCardDemo } from "@/components/features/demos/LoyaltyCardDemo";
import { Button } from "@/components/ui/button";

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-white dark:bg-gray-800 border-b">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Powerful Features for Small Businesses
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            Everything you need to build stronger customer relationships, increase loyalty, and grow your business with modern digital tools.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Start Free Trial
            </Button>
            <Button variant="outline" size="lg">
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Main Features Grid */}
      <section className="py-16">
        <TycaFeaturesGrid />
      </section>

      {/* Interactive Demo Section */}
      <section className="bg-white dark:bg-gray-800 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            See It In Action
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <LoyaltyCardDemo />
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg overflow-hidden p-6 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-lg text-white">QR Code Scanning</h3>
                <p className="text-blue-100 mt-2">Customers can easily scan QR codes to redeem rewards and offers</p>
              </div>
              <div className="mt-4 bg-white/20 p-4 rounded-lg">
                <div className="w-32 h-32 bg-white mx-auto rounded-lg flex items-center justify-center">
                  <div className="w-24 h-24 bg-gray-800 grid grid-cols-4 grid-rows-4 gap-1 p-2">
                    {[...Array(16)].map((_, i) => (
                      <div key={i} className={`${Math.random() > 0.5 ? 'bg-white' : 'bg-transparent'}`}></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg overflow-hidden p-6">
              <h3 className="font-bold text-lg text-white">Customer Analytics</h3>
              <p className="text-green-100 mt-2">Track customer behavior and optimize your marketing efforts</p>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-white text-sm">New Customers</span>
                  <span className="text-white font-bold">+24%</span>
                </div>
                <div className="w-full bg-white/30 rounded-full h-2">
                  <div className="bg-white h-2 rounded-full" style={{ width: "75%" }}></div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white text-sm">Repeat Visits</span>
                  <span className="text-white font-bold">+18%</span>
                </div>
                <div className="w-full bg-white/30 rounded-full h-2">
                  <div className="bg-white h-2 rounded-full" style={{ width: "65%" }}></div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white text-sm">Redemption Rate</span>
                  <span className="text-white font-bold">+32%</span>
                </div>
                <div className="w-full bg-white/30 rounded-full h-2">
                  <div className="bg-white h-2 rounded-full" style={{ width: "85%" }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Secondary Features */}
      <section className="py-16">
        <SecondaryFeaturesGrid />
      </section>

      {/* Feature Comparison */}
      <section className="bg-white dark:bg-gray-800 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Compare Plans and Features
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <thead>
                <tr>
                  <th className="py-4 px-6 text-left text-gray-500 dark:text-gray-400 font-medium">Feature</th>
                  <th className="py-4 px-6 text-center text-gray-500 dark:text-gray-400 font-medium">Free</th>
                  <th className="py-4 px-6 text-center text-gray-500 dark:text-gray-400 font-medium">Basic</th>
                  <th className="py-4 px-6 text-center text-gray-500 dark:text-gray-400 font-medium">Premium</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="py-4 px-6 text-gray-800 dark:text-gray-200">Loyalty Programs</td>
                  <td className="py-4 px-6 text-center text-gray-800 dark:text-gray-200">1</td>
                  <td className="py-4 px-6 text-center text-gray-800 dark:text-gray-200">3</td>
                  <td className="py-4 px-6 text-center text-gray-800 dark:text-gray-200">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-gray-800 dark:text-gray-200">Customer Database</td>
                  <td className="py-4 px-6 text-center text-gray-800 dark:text-gray-200">100 customers</td>
                  <td className="py-4 px-6 text-center text-gray-800 dark:text-gray-200">1,000 customers</td>
                  <td className="py-4 px-6 text-center text-gray-800 dark:text-gray-200">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-gray-800 dark:text-gray-200">Campaign Management</td>
                  <td className="py-4 px-6 text-center text-gray-800 dark:text-gray-200">
                    <svg className="w-5 h-5 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </td>
                  <td className="py-4 px-6 text-center text-gray-800 dark:text-gray-200">Basic</td>
                  <td className="py-4 px-6 text-center text-gray-800 dark:text-gray-200">Advanced</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-gray-800 dark:text-gray-200">Analytics & Insights</td>
                  <td className="py-4 px-6 text-center text-gray-800 dark:text-gray-200">Basic</td>
                  <td className="py-4 px-6 text-center text-gray-800 dark:text-gray-200">Standard</td>
                  <td className="py-4 px-6 text-center text-gray-800 dark:text-gray-200">Advanced</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-gray-800 dark:text-gray-200">Mobile Customer App</td>
                  <td className="py-4 px-6 text-center text-gray-800 dark:text-gray-200">
                    <svg className="w-5 h-5 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </td>
                  <td className="py-4 px-6 text-center text-gray-800 dark:text-gray-200">
                    <svg className="w-5 h-5 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </td>
                  <td className="py-4 px-6 text-center text-gray-800 dark:text-gray-200">
                    <svg className="w-5 h-5 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-8 text-center">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              View Full Pricing
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-100 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">
            Trusted by Businesses Like Yours
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-xl">JC</span>
                </div>
                <div className="ml-4">
                  <h4 className="font-bold text-gray-900 dark:text-white">Jane Cooper</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Local Cafe Owner</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                "TYCA has transformed how we engage with our customers. Our loyalty program has increased repeat visits by 40% in just three months."
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-600 font-bold text-xl">MR</span>
                </div>
                <div className="ml-4">
                  <h4 className="font-bold text-gray-900 dark:text-white">Michael Robinson</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Boutique Retail Shop</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                "The customer insights we get from TYCA have helped us tailor our offerings. Our customers love the personalized experience."
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="text-purple-600 font-bold text-xl">AT</span>
                </div>
                <div className="ml-4">
                  <h4 className="font-bold text-gray-900 dark:text-white">Alicia Thompson</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Salon Owner</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                "Setting up automated campaigns has saved us so much time. Our clients receive timely reminders and we've seen a 25% reduction in no-shows."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of small businesses already using TYCA to grow their customer relationships.
          </p>
          <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
            Start Your Free Trial Today
          </Button>
        </div>
      </section>
    </div>
  );
}