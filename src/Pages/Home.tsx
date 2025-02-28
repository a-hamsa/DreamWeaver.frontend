import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSpinner } from 'react-icons/fa';
import api from '../api';
import DreamCard from '../Components/Home/DreamCard';
import Navbar from '../Components/Home/Navbar';

interface PublishedDream {
  id: number;
  title: string;
  generatedNarrative: string;
  publishedAt: string | null;
  userFullName: string;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

const Home: React.FC = () => {
  const [publishedDreams, setPublishedDreams] = useState<PublishedDream[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const userFullName = localStorage.getItem('userFullName') || 'Dream Explorer';

  useEffect(() => {
    setLoading(true);
    api.get('/gallery')
      .then((res) => {
        setPublishedDreams(res.data);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load dreams. Please try again later.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar userFullName={userFullName} />
      
      <div className="container mx-auto px-4 py-8 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 w-full"
        >
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 inline-block mb-4">
            Explore Dreams
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Discover and engage with the dream narratives shared by our community
          </p>
        </motion.div>
        
        {loading ? (
          <div className="flex justify-center items-center py-16 w-full">
            <FaSpinner className="animate-spin text-indigo-600 text-4xl" />
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 border border-red-200 rounded-lg p-6 text-center text-red-600 max-w-lg mx-auto"
          >
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
            >
              Try Again
            </button>
          </motion.div>
        ) : publishedDreams.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white border border-gray-200 rounded-2xl shadow-lg p-10 text-center max-w-lg mx-auto"
          >
            <h3 className="text-2xl font-semibold text-gray-700 mb-3">No Dreams Yet</h3>
            <p className="text-gray-600">
              There are no published dreams at the moment. Be the first to share your dream!
            </p>
          </motion.div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="w-full flex flex-col items-center"
          >
            {publishedDreams.map((dream) => (
              <motion.div 
                key={dream.id} 
                variants={item}
                className="w-full sm:w-4/5 md:w-3/4 lg:w-2/3 xl:w-1/2 mb-8"
              >
                <DreamCard dream={dream} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
      
      <footer className="mt-12 py-6 border-t border-gray-200 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} DreamWeaver. All dreams matter.</p>
      </footer>
    </div>
  );
};

export default Home;