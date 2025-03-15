import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSpinner, FaChartLine, FaRegComment, FaThumbsUp, FaBook } from 'react-icons/fa';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import api from '../api';
import Navbar from '../Components/Home/Navbar';

interface AnalyticsData {
  totalDreamCount: number;
  publishedDreamCount: number;
  recentDreams: RecentDream[];
  dreamsByMonth: DreamsByMonth[];
  totalVoteCount: number;
  totalCommentCount: number;
}

interface RecentDream {
  dreamId: number;
  title: string;
  createdAt: string;
}

interface DreamsByMonth {
  year: number;
  month: number;
  count: number;
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

const Analytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const userFullName = localStorage.getItem('userFullName') || 'Dream Explorer';

  useEffect(() => {
    setLoading(true);
    api.get('/analytics')
      .then((res) => {
        setAnalyticsData(res.data);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load analytics data. Please try again later.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const getMonthName = (monthNumber: number) => {
    const date = new Date();
    date.setMonth(monthNumber - 1);
    return date.toLocaleString('en-US', { month: 'short' });
  };

  const prepareChartData = () => {
    if (!analyticsData) return [];
    
    return analyticsData.dreamsByMonth.map(item => ({
      name: `${getMonthName(item.month)} ${item.year}`,
      count: item.count
    })).sort((a, b) => a.name.localeCompare(b.name));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar userFullName={userFullName} />
      
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 inline-block mb-4">
            Dream Analytics
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Explore insights and statistics about your dream journal
          </p>
        </motion.div>
        
        {loading ? (
          <div className="flex justify-center items-center py-16">
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
        ) : analyticsData ? (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="w-full"
          >
            {/* Stats Overview */}
            <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3">
                    <FaBook className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700">Total Dreams</h3>
                </div>
                <p className="text-3xl font-bold text-indigo-600">{analyticsData.totalDreamCount}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {analyticsData.publishedDreamCount} published
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-3">
                    <FaThumbsUp className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700">Total Votes</h3>
                </div>
                <p className="text-3xl font-bold text-purple-600">{analyticsData.totalVoteCount}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {analyticsData.totalVoteCount > 0 
                    ? `~${(analyticsData.totalVoteCount / analyticsData.publishedDreamCount).toFixed(1)} per dream` 
                    : 'No votes yet'}
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 mr-3">
                    <FaRegComment className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700">Comments</h3>
                </div>
                <p className="text-3xl font-bold text-pink-600">{analyticsData.totalCommentCount}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {analyticsData.totalCommentCount > 0 
                    ? `~${(analyticsData.totalCommentCount / analyticsData.publishedDreamCount).toFixed(1)} per dream` 
                    : 'No comments yet'}
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                    <FaChartLine className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700">Publication Rate</h3>
                </div>
                <p className="text-3xl font-bold text-blue-600">
                  {analyticsData.totalDreamCount > 0
                    ? `${((analyticsData.publishedDreamCount / analyticsData.totalDreamCount) * 100).toFixed(0)}%`
                    : '0%'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {analyticsData.publishedDreamCount} of {analyticsData.totalDreamCount} dreams published
                </p>
              </div>
            </motion.div>

            {/* Dreams by Month Chart */}
            <motion.div variants={item} className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-8">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">Dreams by Month</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={prepareChartData()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" name="Dreams" radius={[4, 4, 0, 0]}>
                      {prepareChartData().map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={`#${Math.floor(Math.random() * 127 + 128).toString(16)}${Math.floor(Math.random() * 127 + 128).toString(16)}${Math.floor(Math.random() * 127 + 128).toString(16)}`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div variants={item} className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">Recent Dreams</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Title</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Created At</th>
                      <th className="py-3 px-4 text-right text-sm font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyticsData.recentDreams.map((dream) => (
                      <tr key={dream.dreamId} className="border-b hover:bg-gray-50 transition">
                        <td className="py-3 px-4 text-gray-700">{dream.title}</td>
                        <td className="py-3 px-4 text-gray-500">{formatDate(dream.createdAt)}</td>
                        <td className="py-3 px-4 text-right">
                          <button 
                            onClick={() => window.location.href = `/dream/${dream.dreamId}`}
                            className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-md hover:bg-indigo-200 transition text-sm"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </div>
      
      <footer className="mt-12 py-6 border-t border-gray-200 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} DreamWeaver. All dreams matter.</p>
      </footer>
    </div>
  );
};

export default Analytics;