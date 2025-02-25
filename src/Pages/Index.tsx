import React from "react";
import { motion } from "framer-motion";
import HeroSection from "../Components/Landing/HeroSection";
import Carousel from "../Components/Landing/Carousel";
import ProjectDetails from "../Components/Landing/ProjectDetails";
import Footer from "../Components/Landing/Footer";

const pageVariants = {
  initial: { opacity: 0, x: "-100vw" },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: "100vw" },
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.8,
};

const Index: React.FC = () => {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="flex flex-col min-h-screen"
    >
      <HeroSection />
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <Carousel />
        </div>
      </section>
      <section className="py-16">
        <div className="container mx-auto px-4">
          <ProjectDetails />
        </div>
      </section>
      <Footer />
    </motion.div>
  );
};

export default Index;
