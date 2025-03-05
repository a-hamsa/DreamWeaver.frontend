import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSpinner } from 'react-icons/fa';
import AdminUsers from '../Components/Admin/AdminUsers';
import AdminDreams from '../Components/Admin/AdminDreams';
import AdminComments from '../Components/Admin/AdminComments';
import Navbar from '../Components/Home/Navbar';
import Swal from 'sweetalert2';

const Admin: React.FC = () => {
  const [view, setView] = useState<'users' | 'dreams' | 'comments'>('users');
  const navigate = useNavigate();
  const [isAdminAccess, setIsAdminAccess] = useState(false);
  const userFullName = localStorage.getItem('userFullName') || 'Admin';

  useEffect(() => {
    const adminStatus = localStorage.getItem('isAdmin');
    const isValidAdmin = adminStatus === 'true';

    if (!isValidAdmin) {
      Swal.fire({
        icon: 'warning',
        title: 'Access Denied',
        text: 'You do not have permission to access this page',
        confirmButtonColor: '#3085d6',
        didClose: () => {
          navigate('/home', { replace: true });
        }
      });
      setIsAdminAccess(false);
    } else {
      setIsAdminAccess(true);
    }
  }, [navigate]);

  const LoadingSpinner = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex justify-center items-center">
      <FaSpinner className="animate-spin text-indigo-600 text-4xl" />
    </div>
  );

  if (isAdminAccess === null) {
    return <LoadingSpinner />;
  }

  if (!isAdminAccess) {
    return null;
  }

  const renderView = () => {
    switch (view) {
      case 'users': return <AdminUsers />;
      case 'dreams': return <AdminDreams />;
      case 'comments': return <AdminComments />;
      default: return <AdminUsers />;
    }
  };

  const menuItems = [
    { 
      key: 'users', 
      label: 'Manage Users', 
      icon: (
        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
        </svg>
      )
    },
    { 
      key: 'dreams', 
      label: 'Manage Dreams', 
      icon: (
        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
        </svg>
      )
    },
    { 
      key: 'comments', 
      label: 'Manage Comments', 
      icon: (
        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
        </svg>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar userFullName={userFullName} />
      
      <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row">
        <motion.div 
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full md:w-64 mb-6 md:mb-0 md:mr-8"
        >
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 inline-block mb-2">
                Admin Panel
              </h1>
              <p className="text-gray-600 text-sm">Welcome, {userFullName}</p>
            </div>
            
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <motion.button 
                  key={item.key}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setView(item.key as any)} 
                  className={`w-full text-left p-3 rounded-lg flex items-center transition-all duration-200 ${
                    view === item.key 
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-indigo-600'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </motion.button>
              ))}
            </nav>
          </div>
        </motion.div>
        
        <motion.div 
          key={view}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="flex-1"
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