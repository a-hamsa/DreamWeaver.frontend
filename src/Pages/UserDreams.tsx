import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSpinner } from 'react-icons/fa';
import Swal from 'sweetalert2';
import api from '../api';
import DreamCard from '../Components/Home/DreamCard';
import Navbar from '../Components/Home/Navbar';

interface Dream {
  id: number;
  title: string;
  content: string;
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

const UserDreams: React.FC = () => {
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newDream, setNewDream] = useState({ title: '', content: '' });

  const userFullName = localStorage.getItem('userFullName') || 'Dream Explorer';

  useEffect(() => {
    setLoading(true);
    api.get('/dreams')
      .then((res) => {
        setDreams(res.data.map((dream: Dream) => ({ ...dream, userFullName })));
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load dreams. Please try again later.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [userFullName]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewDream({ ...newDream, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    api.post('/dreams', newDream)
      .then((res) => {
        setDreams([{ ...res.data, userFullName }, ...dreams]);
        setNewDream({ title: '', content: '' });
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to create dream. Please try again later.');
      });
  };

  const handlePublishToggle = (dreamId: number, isPublished: boolean) => {
    Swal.fire({
      title: isPublished ? 'Unpublish Dream' : 'Publish Dream',
      text: `Are you sure you want to ${isPublished ? 'unpublish' : 'publish'} this dream?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: `Yes, ${isPublished ? 'unpublish' : 'publish'}`,
      background: '#f8fafc',
      customClass: {
        container: 'sweet-alert-container',
        popup: 'sweet-alert-popup'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const url = `/gallery/${dreamId}/publish`;
        const method = isPublished ? 'delete' : 'post';
        api[method](url)
          .then(() => {
            setDreams(dreams.map(dream => 
              dream.id === dreamId ? { ...dream, publishedAt: isPublished ? null : new Date().toISOString() } : dream
            ));
            Swal.fire({
              title: 'Success!',
              text: `Dream ${isPublished ? 'unpublished' : 'published'} successfully.`,
              icon: 'success',
              timer: 1500,
              showConfirmButton: false,
              background: '#f8fafc',
              customClass: {
                container: 'sweet-alert-container',
                popup: 'sweet-alert-popup'
              }
            });
          })
          .catch((err) => {
            console.error(err);
            setError('Failed to update dream. Please try again later.');
            Swal.fire({
              title: 'Error',
              text: 'Failed to update dream. Please try again later.',
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar userFullName={userFullName} />
      
      <div className="container mx-auto px-4 py-8 flex flex-col items-center">

        <motion.div className="w-full sm:w-4/5 md:w-3/4 lg:w-2/3 xl:w-1/2 mb-8">
            <form onSubmit={handleSubmit} className="w-full mb-8">
                <div className="bg-white shadow-md rounded-lg p-6">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Post a New Dream</h2>
                    <div className="mb-4">
                    <input
                        type="text"
                        name="title"
                        value={newDream.title}
                        onChange={handleInputChange}
                        placeholder="Dream Title"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                    />
                    </div>
                    <div className="mb-4">
                    <textarea
                        name="content"
                        value={newDream.content}
                        onChange={handleInputChange}
                        placeholder="Dream Content"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        rows={4}
                        required
                    />
                    </div>
                    <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition"
                    >
                    Post Dream
                    </button>
                </div>
            </form>
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
        ) : dreams.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white border border-gray-200 rounded-2xl shadow-lg p-10 text-center max-w-lg mx-auto"
          >
            <h3 className="text-2xl font-semibold text-gray-700 mb-3">No Dreams Yet</h3>
            <p className="text-gray-600">
              You haven't posted any dreams yet. Start sharing your dreams!
            </p>
          </motion.div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="w-full flex flex-col items-center"
          >
            {dreams.map((dream) => (
              <motion.div 
                key={dream.id} 
                variants={item}
                className="w-full sm:w-4/5 md:w-3/4 lg:w-2/3 xl:w-1/2 mb-8"
              >
                <DreamCard dream={dream} publishButton={
                  <button
                    onClick={() => handlePublishToggle(dream.id, !!dream.publishedAt)}
                    className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
                  >
                    {dream.publishedAt ? 'Unpublish' : 'Publish'}
                  </button>
                } disableEngagement />
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

export default UserDreams;