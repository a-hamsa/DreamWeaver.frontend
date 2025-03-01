import React, { useState, useEffect } from 'react';
import api from '../../api';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<any>(null);

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
    api.delete(`/admin/users/${id}`)
      .then(() => {
        fetchUsers();
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to delete user. Please try again later.');
      });
  };

  const updateUser = (user: any) => {
    api.put(`/admin/users/${user.id}`, user)
      .then(() => {
        fetchUsers();
        setEditingUser(null);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to update user. Please try again later.');
      });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Manage Users</h2>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <ul>
          {users.map((user: any) => (
            <li key={user.id} className="flex justify-between items-center mb-2">
              <span>{user.fullName}</span>
              <div>
                <button onClick={() => setEditingUser(user)} className="px-2 py-1 bg-yellow-500 text-white rounded mr-2">Edit</button>
                <button onClick={() => deleteUser(user.id)} className="px-2 py-1 bg-red-500 text-white rounded">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {editingUser && (
        <div className="mt-4">
          <h3 className="text-xl font-bold mb-2">Edit User</h3>
          <form onSubmit={(e) => { e.preventDefault(); updateUser(editingUser); }}>
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                value={editingUser.fullName}
                onChange={(e) => setEditingUser({ ...editingUser, fullName: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700">Is Admin</label>
              <select
                value={editingUser.isAdmin ? 'Yes' : 'No'}
                onChange={(e) => setEditingUser({ ...editingUser, isAdmin: e.target.value === 'Yes' })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">Save</button>
            <button onClick={() => setEditingUser(null)} className="ml-2 px-4 py-2 bg-gray-500 text-white rounded">Cancel</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
