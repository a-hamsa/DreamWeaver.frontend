import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSpinner, FaSearch, FaEdit, FaTrash } from 'react-icons/fa';
import api from '../../api';
import Swal from 'sweetalert2';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    setLoading(true);
    api.get('/admin/users')
      .then((res) => {
        setUsers(res.data);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load users. Please try again later.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const deleteUser = (id: string) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You won\'t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        api.delete(`/admin/users/${id}`)
          .then(() => {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'User has been deleted.'
            });
            fetchUsers();
          })
          .catch((err) => {
            console.error(err);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Failed to delete user. Please try again later.'
            });
          });
      }
    });
  };

  const updateUser = (user: any) => {
    const payload = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      isAdmin: user.isAdmin,
      lockoutEnabled: user.lockoutEnabled
    };

    Swal.fire({
      title: 'Confirm Update',
      text: 'Are you sure you want to update this user?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, update it!'
    }).then((result) => {
      if (result.isConfirmed) {
        api.put(`/admin/users/${user.id}`, payload)
          .then(() => {
            Swal.fire({
              icon: 'success',
              title: 'Updated!',
              text: 'User has been updated successfully.'
            });
            fetchUsers();
            setEditingUser(null);
          })
          .catch((err) => {
            console.error(err);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: err.response?.data?.message || 'Failed to update user. Please try again later.'
            });
          });
      }
    });
  };

  const filteredUsers = users.filter((user: any) => 
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-2xl shadow-lg p-6"
    >
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 inline-block mb-4 md:mb-0">
          Manage Users
        </h2>
        <div className="relative w-full md:w-auto">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 pl-10"
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin text-indigo-600 text-4xl" />
        </div>
      ) : error ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-50 border border-red-200 rounded-lg p-6 text-center text-red-600"
        >
          <p>{error}</p>
        </motion.div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin Status</th>
                  <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentUsers.map((user: any) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">{user.fullName}</td>
                    <td className="py-4 px-4">{user.email || 'N/A'}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.isAdmin === true ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {user.isAdmin === true ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex justify-center space-x-3">
                        <button 
                          onClick={() => setEditingUser(user)} 
                          className="text-indigo-600 hover:text-indigo-900 transition-colors"
                          title="Edit User"
                        >
                          <FaEdit className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => deleteUser(user.id)} 
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="Delete User"
                        >
                          <FaTrash className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-6 space-x-2">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentPage === 1 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-white text-indigo-600 hover:bg-indigo-50 border'
                }`}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                <button
                  key={number}
                  onClick={() => paginate(number)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    currentPage === number 
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' 
                      : 'bg-white text-indigo-600 hover:bg-indigo-50 border'
                  }`}
                >
                  {number}
                </button>
              ))}
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentPage === totalPages 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-white text-indigo-600 hover:bg-indigo-50 border'
                }`}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {editingUser && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                Edit User
              </h3>
              <button 
                onClick={() => setEditingUser(null)} 
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); updateUser(editingUser); }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editingUser.fullName}
                    onChange={(e) => setEditingUser({ ...editingUser, fullName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editingUser.email || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admin Status</label>
                  <select
                    value={editingUser.isAdmin ? 'true' : 'false'}
                    onChange={(e) => setEditingUser({ ...editingUser, isAdmin: e.target.value === 'true' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="true">Admin</option>
                    <option value="false">User</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3">
                  <button 
                    type="button" 
                    onClick={() => setEditingUser(null)} 
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AdminUsers;