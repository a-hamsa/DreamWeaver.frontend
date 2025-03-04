import React, { useState, useEffect } from 'react';
import api from '../../api';

const AdminDreams: React.FC = () => {
  const [dreams, setDreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingDream, setEditingDream] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [dreamsPerPage] = useState(10);

  useEffect(() => {
    fetchDreams();
  }, []);

  const fetchDreams = () => {
    setLoading(true);
    api.get('/admin/dreams')
      .then((res) => {
        setDreams(res.data);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load dreams. Please try again later.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const deleteDream = (id: number) => {
    if (window.confirm('Are you sure you want to delete this dream? This action cannot be undone.')) {
      api.delete(`/admin/dreams/${id}`)
        .then(() => {
          fetchDreams();
        })
        .catch((err) => {
          console.error(err);
          setError('Failed to delete dream. Please try again later.');
        });
    }
  };

  const updateDream = (dream: any) => {
    api.put(`/admin/dreams/${dream.id}`, dream)
      .then(() => {
        fetchDreams();
        setEditingDream(null);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to update dream. Please try again later.');
      });
  };

  // Filtering dreams based on search term
  const filteredDreams = dreams.filter((dream: any) => 
    dream.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dream.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const indexOfLastDream = currentPage * dreamsPerPage;
  const indexOfFirstDream = indexOfLastDream - dreamsPerPage;
  const currentDreams = filteredDreams.slice(indexOfFirstDream, indexOfLastDream);
  const totalPages = Math.ceil(filteredDreams.length / dreamsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Manage Dreams</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search dreams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg className="w-5 h-5 absolute right-3 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left">Title</th>
                  <th className="py-3 px-4 text-left">Content Preview</th>
                  <th className="py-3 px-4 text-left">Published Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentDreams.map((dream: any) => (
                  <tr key={dream.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">{dream.title}</td>
                    <td className="py-3 px-4">{dream.content?.substring(0, 50)}...</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${dream.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {dream.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button 
                        onClick={() => setEditingDream(dream)} 
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                      </button>
                      <button 
                        onClick={() => deleteDream(dream.id)} 
                        className="text-red-600 hover:text-red-900"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <nav className="inline-flex">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-l-md border ${currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white text-blue-600 hover:bg-blue-50'}`}
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                  <button
                    key={number}
                    onClick={() => paginate(number)}
                    className={`px-3 py-1 border-t border-b ${currentPage === number ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 hover:bg-blue-50'}`}
                  >
                    {number}
                  </button>
                ))}
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-r-md border ${currentPage === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-white text-blue-600 hover:bg-blue-50'}`}
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </>
      )}

      {/* Edit Dream Modal */}
      {editingDream && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Edit Dream</h3>
              <button onClick={() => setEditingDream(null)} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); updateDream(editingDream); }}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={editingDream.title}
                  onChange={(e) => setEditingDream({ ...editingDream, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  value={editingDream.content}
                  onChange={(e) => setEditingDream({ ...editingDream, content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 h-32"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Published Status</label>
                <select
                  value={editingDream.isPublished ? 'Yes' : 'No'}
                  onChange={(e) => setEditingDream({ ...editingDream, isPublished: e.target.value === 'Yes' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Yes">Published</option>
                  <option value="No">Draft</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => setEditingDream(null)} 
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDreams;