import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaEye, FaEyeSlash, FaHome } from 'react-icons/fa';
import Swal from 'sweetalert2';
import api from '../api';

const Register: React.FC = () => {
  const navigate = useNavigate();

  // Form state
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  // Password strength state (score 0-4)
  const [passwordScore, setPasswordScore] = useState(0);

  // Evaluate password strength based on criteria:
  // 1. Length >= 8
  // 2. Contains at least one digit
  // 3. Contains at least one uppercase letter
  // 4. Contains at least one non-alphanumeric character
  const evaluatePassword = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/\d/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    setPasswordScore(score);
  };

  useEffect(() => {
    evaluatePassword(password);
  }, [password]);

  const getStrengthLabel = () => {
    switch (passwordScore) {
      case 0:
      case 1:
        return 'Weak';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
        return 'Strong';
      default:
        return '';
    }
  };

  const getStrengthColor = () => {
    switch (passwordScore) {
      case 0:
      case 1:
        return 'bg-red-500';
      case 2:
        return 'bg-yellow-500';
      case 3:
        return 'bg-blue-500';
      case 4:
        return 'bg-green-500';
      default:
        return 'bg-gray-300';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Passwords do not match!' });
      return;
    }

    try {
      await api.post('/auth/register', {
        fullName,
        username,
        email,
        password,
      });
      Swal.fire({
        icon: 'success',
        title: 'Registration Successful!',
        text: 'Your account has been created. Please log in.',
        confirmButtonColor: '#3085d6',
      }).then(() => {
        navigate('/login');
      });
    } catch (err: any) {
      // Display API error messages
      const apiError = err.response?.data?.errors
        ? err.response.data.errors.map((e: any) => e.description).join('\n')
        : err.response?.data?.message || 'Registration failed';
      Swal.fire({ icon: 'error', title: 'Registration Failed!', text: apiError });
    }
  };

  return (
    <motion.div
      className="flex items-center justify-center min-h-screen bg-gray-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl relative">
        {/* Home button inside card */}
        <div className="absolute top-4 left-4">
          <RouterLink to="/">
            <FaHome className="w-6 h-6 text-blue-600 hover:text-blue-800 cursor-pointer" />
          </RouterLink>
        </div>
        <h2 className="text-3xl font-bold text-center text-blue-600 pt-6">Register</h2>
        {error && <div className="text-red-500 text-center">{error}</div>}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-700">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <div>
            <label className="block text-gray-700">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <div>
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <div className="relative">
            <label className="block text-gray-700">Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 mt-1 pr-12 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <div
              className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? (
                <FaEyeSlash className="w-5 h-5 mb-3 text-gray-600" />
              ) : (
                <FaEye className="w-5 h-5 mb-3 text-gray-600" />
              )}
            </div>
            <div className="mt-2">
              <div className="flex space-x-1">
                {[0, 1, 2, 3].map((bar) => (
                  <div
                    key={bar}
                    className={`h-2 flex-1 rounded ${bar < passwordScore ? getStrengthColor() : 'bg-gray-300'}`}
                  ></div>
                ))}
              </div>
              <p className="text-sm text-gray-700 mt-1">Strength: {getStrengthLabel()}</p>
            </div>
          </div>
          <div className="relative">
            <label className="block text-gray-700">Confirm Password</label>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-2 mt-1 pr-12 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <div
              className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
            >
              {showConfirmPassword ? (
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
            Register
          </button>
        </form>
        <div className="text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <RouterLink to="/login" className="text-blue-600 hover:underline">
              Login
            </RouterLink>
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default Register;