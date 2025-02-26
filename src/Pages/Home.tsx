import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../api';
import DreamCard from '../Components/Home/DreamCard';

interface PublishedDream {
  id: number;
  title: string;
  generatedNarrative: string;
  publishedAt: string;
  userFullName: string;
}

const Home: React.FC = () => {
  const [publishedDreams, setPublishedDreams] = useState<PublishedDream[]>([]);

  useEffect(() => {
    api.get('/gallery')
      .then((res) => setPublishedDreams(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <motion.div
      className="container mx-auto p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h1 className="text-4xl font-bold text-center mb-8">Published Dreams</h1>
      {publishedDreams.length === 0 ? (
        <div className="text-center text-gray-600 py-12">
          There are no published dreams at the moment. Please check back later!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publishedDreams.map((dream) => (
            <DreamCard key={dream.id} dream={dream} />
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default Home;