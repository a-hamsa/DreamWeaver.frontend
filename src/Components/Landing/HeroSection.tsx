import React from "react";
import { motion } from "framer-motion";
import { Link as ScrollLink } from "react-scroll";
import { Link as RouterLink } from "react-router-dom";

const HeroSection: React.FC = () => {
  return (
    <section className="relative text-white py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-gradientMove"></div>
      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.h1
          className="text-4xl md:text-6xl font-extrabold mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          DreamWeaver
        </motion.h1>
        <motion.p
          className="text-lg md:text-2xl max-w-3xl mx-auto mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          An AI-powered dream journal and collaborative story generator that
          lets you log your dreams, receive creative AI narratives, and share
          your published dreams with a vibrant community.
        </motion.p>
        <div className="flex justify-center space-x-4">
          <ScrollLink to="details" smooth={true} duration={800} offset={-50}>
            <motion.div
              className="inline-block bg-white text-blue-600 font-bold py-3 px-8 rounded-full shadow hover:bg-gray-100 transition cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Discover More
            </motion.div>
          </ScrollLink>
          <RouterLink to="/login">
            <motion.div
              className="inline-block bg-blue-500 text-white font-bold py-3 px-8 rounded-full shadow hover:bg-blue-600 transition cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started
            </motion.div>
          </RouterLink>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;