import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AdminUsers from '../Components/Admin/AdminUsers';
import AdminDreams from '../Components/Admin/AdminDreams';
import AdminComments from '../Components/Admin/AdminComments';
import Navbar from '../Components/Home/Navbar';
import Swal from 'sweetalert2';

const Admin: React.FC = () => {
  const [view, setView] = useState<'users' | 'dreams' | 'comments'>('users');
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem('isAdmin');
  const userFullName = localStorage.getItem('userFullName') || 'Admin';

  useEffect(() => {
    if (!isAdmin) {
      Swal.fire({
        icon: 'warning',
        title: 'Access Denied',
        text: 'You do not have permission to access this page',
        confirmButtonColor: '#3085d6',
      }).then(() => {
        navigate('/home', { replace: true });
      });
    }
  }, [isAdmin, navigate]);

  // Render the current view component
  const renderView = () => {
    switch (view) {
      case 'users': return <AdminUsers />;
      case 'dreams': return <AdminDreams />;
      case 'comments': return <AdminComments />;
      default: return <AdminUsers />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar userFullName={userFullName} />
      
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 min-h-screen p-4">
          <div className="mb-8">
            <h1 className="text-white text-xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-gray-400 text-sm">Welcome, {userFullName}</p>
          </div>
          
          <nav>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setView('users')} 
              className={`w-full text-left mb-2 p-3 rounded flex items-center ${view === 'users' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
              Manage Users
            </motion.button>
            
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setView('dreams')} 
              className={`w-full text-left mb-2 p-3 rounded flex items-center ${view === 'dreams' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
              </svg>
              Manage Dreams
            </motion.button>
            
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setView('comments')} 
              className={`w-full text-left mb-2 p-3 rounded flex items-center ${view === 'comments' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
              </svg>
              Manage Comments
            </motion.button>
          </nav>
        </div>
        
        {/* Main Content with Transition */}
        <motion.div 
          key={view}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="flex-1 p-8"
        >
          <AnimatePresence mode="wait">
            {renderView()}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default Admin;