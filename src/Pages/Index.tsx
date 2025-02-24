import React from 'react';
import HeroSection from '../Components/Landing/HeroSection';
import Carousel from '../Components/Landing/Carousel';
import ProjectDetails from '../Components/Landing/ProjectDetails';
import Footer from '../Components/Landing/Footer';

const Index: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
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
    </div>
  );
};

export default Index;