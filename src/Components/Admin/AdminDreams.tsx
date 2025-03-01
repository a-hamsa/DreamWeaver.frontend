import React, { useState, useEffect } from 'react';
import api from '../../api';

const AdminDreams: React.FC = () => {
  const [dreams, setDreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingDream, setEditingDream] = useState<any>(null);

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
    api.delete(`/admin/dreams/${id}`)
      .then(() => {
        fetchDreams();
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to delete dream. Please try again later.');
      });
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

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Manage Dreams</h2>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <ul>
          {dreams.map((dream: any) => (
            <li key={dream.id} className="flex justify-between items-center mb-2">
              <span>{dream.title}</span>
              <div>
                <button onClick={() => setEditingDream(dream)} className="px-2 py-1 bg-yellow-500 text-white rounded mr-2">Edit</button>
                <button onClick={() => deleteDream(dream.id)} className="px-2 py-1 bg-red-500 text-white rounded">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {editingDream && (
        <div className="mt-4">
          <h3 className="text-xl font-bold mb-2">Edit Dream</h3>
          <form onSubmit={(e) => { e.preventDefault(); updateDream(editingDream); }}>
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={editingDream.title}
                onChange={(e) => setEditingDream({ ...editingDream, title: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700">Content</label>
              <textarea
                value={editingDream.content}
                onChange={(e) => setEditingDream({ ...editingDream, content: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700">Is Published</label>
              <select
                value={editingDream.isPublished ? 'Yes' : 'No'}
                onChange={(e) => setEditingDream({ ...editingDream, isPublished: e.target.value === 'Yes' })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">Save</button>
            <button onClick={() => setEditingDream(null)} className="ml-2 px-4 py-2 bg-gray-500 text-white rounded">Cancel</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminDreams;
