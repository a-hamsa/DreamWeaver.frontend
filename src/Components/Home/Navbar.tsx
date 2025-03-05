import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSignOutAlt, FaUser, FaTools } from 'react-icons/fa';
import Swal from 'sweetalert2';
import api from '../../api';

interface NavbarProps {
  userFullName: string;
}

const Navbar: React.FC<NavbarProps> = ({ userFullName }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isAdmin = localStorage.getItem('isAdmin');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    Swal.fire({
      title: 'Logout',
      text: 'Are you sure you want to logout?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, logout',
      background: '#f8fafc',
      customClass: {
        container: 'sweet-alert-container',
        popup: 'sweet-alert-popup'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        api.post('/auth/logout')
          .then(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            localStorage.removeItem('isAdmin');
            localStorage.removeItem('userFullName');
            Swal.fire({
              title: 'Logged Out!',
              text: 'You have been successfully logged out.',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false,
              background: '#f8fafc',
              customClass: {
                container: 'sweet-alert-container',
                popup: 'sweet-alert-popup'
              }
            }).then(() => {
              window.location.href = '/login';
            });
          })
          .catch((err) => {
            console.error(err);
            Swal.fire({
              title: 'Error',
              text: 'Failed to logout. Please try again.',
              icon: 'error',
              background: '#f8fafc',
              customClass: {
                container: 'sweet-alert-container',
                popup: 'sweet-alert-popup'
              }
            });
          });
      }
    });
  };

  return (
    <motion.nav 
      className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center"
          >
            <span className="text-2xl font-extrabold tracking-tight">DreamWeaver</span>
          </motion.div>
          
          <div className="relative" ref={dropdownRef}>
            <motion.div 
              className="flex items-center space-x-3 cursor-pointer bg-white bg-opacity-20 rounded-full px-3 py-2"
              whileHover={{ scale: 1.05 }}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white overflow-hidden">
                <FaUser className="w-4 h-4" />
              </div>
              <span className="font-medium hidden sm:block">{userFullName}</span>
            </motion.div>
            
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div 
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-10 overflow-hidden"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="py-2 text-sm text-gray-700">
                    <button 
                      onClick={() => window.location.href = '/user-dreams'}
                      className="flex items-center w-full px-4 py-3 hover:bg-gray-100 transition-colors"
                    >
                      <FaUser className="mr-2 text-indigo-500" />
                      <span>My Dreams</span>
                    </button>
                    {isAdmin === 'true' && (
                      <button 
                        onClick={() => window.location.href = '/admin'}
                        className="flex items-center w-full px-4 py-3 hover:bg-gray-100 transition-colors"
                      >
                        <FaTools className="mr-2 text-green-500" />
                        <span>Admin</span>
                      </button>
                    )}
                    <button 
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-3 hover:bg-gray-100 transition-colors"
                    >
                      <FaSignOutAlt className="mr-2 text-red-500" />
                      <span>Logout</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;