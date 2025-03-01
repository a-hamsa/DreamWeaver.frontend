import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaEye, FaEyeSlash, FaHome } from 'react-icons/fa';
import api from '../api';
import Swal from 'sweetalert2';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      Swal.fire({
        icon: 'info',
        title: 'Already Logged In',
        text: 'You are already logged in. Redirecting to Home...',
        timer: 2000,
        showConfirmButton: false,
      }).then(() => {
        navigate('/home', { replace: true });
      });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const response = await api.post('/Auth/login', {
        username,
        password,
      });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userFullName', response.data.user.fullName);
      localStorage.setItem('isAdmin', response.data.user.isAdmin);
      console.log(response);
      Swal.fire({
        icon: 'success',
        title: 'Login Successful!',
        text: 'Welcome back!',
        timer: 1500,
        showConfirmButton: false,
      }).then(() => {
        navigate('/home');
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <motion.div
      className="flex items-center justify-center min-h-screen bg-gray-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl relative">
        {/* Home button inside card at top left */}
        <div className="absolute top-4 left-4">
          <RouterLink to="/">
            <FaHome className="w-6 h-6 text-blue-600 hover:text-blue-800 cursor-pointer" />
          </RouterLink>
        </div>
        <h2 className="text-3xl font-bold text-center text-blue-600 pt-6">Login</h2>
        {error && <div className="text-red-500 text-center">{error}</div>}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-700">Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <div className="relative">
            <label className="block text-gray-700">Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 pr-12"
            />
            <div
              className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
              onClick={() => setShowPassword(prev => !prev)}
            >
              {showPassword ? (
                <FaEyeSlash className="w-5 h-5 mt-7 text-gray-600" />
              ) : (
                <FaEye className="w-5 h-5 mt-7 text-gray-600" />
              )}
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-3 font-bold text-white bg-blue-600 rounded-full shadow hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>
        <div className="text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <RouterLink to="/register" className="text-blue-600 hover:underline">
              Register
            </RouterLink>
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default Login;