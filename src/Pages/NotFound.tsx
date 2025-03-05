import React from 'react';
import { motion } from 'framer-motion';
import { FaHome, FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4"
    >
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="text-center max-w-xl w-full"
      >
        <motion.div 
          variants={itemVariants}
          className="mb-8"
        >
          <h1 className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-4">
            404
          </h1>
          <p className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">
            Oops! Page Not Found
          </p>
          <p className="text-gray-600 mb-8">
            The page you're looking for seems to have wandered off into the digital wilderness.
          </p>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/home')}
            className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all"
          >
            <FaHome className="mr-2" /> 
            Go to Home
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {/* Implement search functionality */}}
            className="flex items-center justify-center px-6 py-3 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-all"
          >
            <FaSearch className="mr-2" /> 
            Search
          </motion.button>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className="mt-12 text-gray-500 italic"
        >
          Sometimes getting lost leads to the most interesting discoveries.
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default NotFound;