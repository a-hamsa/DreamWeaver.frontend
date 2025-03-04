import React, { useState, useEffect } from 'react';
import api from '../../api';

const AdminComments: React.FC = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [commentsPerPage] = useState(10);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = () => {
    setLoading(true);
    api.get('/admin/comments')
      .then((res) => {
        setComments(res.data);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load comments. Please try again later.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const deleteComment = (id: number) => {
    if (window.confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
      api.delete(`/admin/comments/${id}`)
        .then(() => {
          fetchComments();
        })
        .catch((err) => {
          console.error(err);
          setError('Failed to delete comment. Please try again later.');
        });
    }
  };

  const updateComment = (comment: any) => {
    api.put(`/admin/comments/${comment.id}`, comment)
      .then(() => {
        fetchComments();
        setEditingComment(null);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to update comment. Please try again later.');
      });
  };

  // Filtering comments based on search term
  const filteredComments = comments.filter((comment: any) => 
    comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comment.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const indexOfLastComment = currentPage * commentsPerPage;
  const indexOfFirstComment = indexOfLastComment - commentsPerPage;
  const currentComments = filteredComments.slice(indexOfFirstComment, indexOfLastComment);
  const totalPages = Math.ceil(filteredComments.length / commentsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Manage Comments</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search comments..."
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
                  <th className="py-3 px-4 text-left">Content</th>
                  <th className="py-3 px-4 text-left">User</th>
                  <th className="py-3 px-4 text-left">Dream</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentComments.map((comment: any) => (
                  <tr key={comment.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      {comment.content.length > 50 
                        ? `${comment.content.substring(0, 50)}...` 
                        : comment.content}
                    </td>
                    <td className="py-3 px-4">{comment.user?.fullName || 'Anonymous'}</td>
                    <td className="py-3 px-4">{comment.dream?.title || 'N/A'}</td>
                    <td className="py-3 px-4 text-center">
                      <button 
                        onClick={() => setEditingComment(comment)} 
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                      </button>
                      <button 
                        onClick={() => deleteComment(comment.id)} 
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

      {/* Edit Comment Modal */}
      {editingComment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Edit Comment</h3>
              <button onClick={() => setEditingComment(null)} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); updateComment(editingComment); }}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Comment Content</label>
                <textarea
                  value={editingComment.content}
                  onChange={(e) => setEditingComment({ ...editingComment, content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => setEditingComment(null)} 
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

export default AdminComments;