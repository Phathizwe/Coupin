import React from 'react';
import { motion } from 'framer-motion';

const AboutContent: React.FC = () => {
  return (
    <div className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <h1 className="text-4xl font-bold mb-6">About TYCA</h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            TYCA is a modern digital platform designed to help small businesses build stronger 
            customer relationships, increase loyalty, and grow their business with powerful yet 
            easy-to-use tools.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto mb-16">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-bold">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed">
              We believe that small businesses deserve powerful tools that are both affordable and 
              easy to use. Our mission is to empower small business owners with technology that 
              helps them compete effectively in today's digital marketplace.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-bold">Our Vision</h2>
            <p className="text-gray-600 leading-relaxed">
              We envision a world where small businesses thrive by building meaningful connections 
              with their customers. Through our platform, we aim to make customer relationship 
              management accessible to businesses of all sizes.
            </p>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <h2 className="text-2xl font-bold mb-4">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Simplicity</h3>
              <p className="text-gray-600">We believe in making complex technology simple and accessible.</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Innovation</h3>
              <p className="text-gray-600">We continuously improve our platform with new features and capabilities.</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Customer Focus</h3>
              <p className="text-gray-600">We put our customers' needs at the center of everything we do.</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-2xl font-bold text-center mb-8">Our Team</h2>
          <p className="text-gray-600 text-center mb-12">
            TYCA is built by a passionate team of developers, designers, and business experts who are 
            committed to helping small businesses succeed in the digital age.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutContent;