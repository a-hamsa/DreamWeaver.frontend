import React, { useState, useEffect } from 'react';
import api from '../../api';

const AdminComments: React.FC = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<any>(null);

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
    api.delete(`/admin/comments/${id}`)
      .then(() => {
        fetchComments();
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to delete comment. Please try again later.');
      });
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

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Manage Comments</h2>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <ul>
          {comments.map((comment: any) => (
            <li key={comment.id} className="flex justify-between items-center mb-2">
              <span>{comment.content}</span>
              <div>
                <button onClick={() => setEditingComment(comment)} className="px-2 py-1 bg-yellow-500 text-white rounded mr-2">Edit</button>
                <button onClick={() => deleteComment(comment.id)} className="px-2 py-1 bg-red-500 text-white rounded">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {editingComment && (
        <div className="mt-4">
          <h3 className="text-xl font-bold mb-2">Edit Comment</h3>
          <form onSubmit={(e) => { e.preventDefault(); updateComment(editingComment); }}>
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700">Content</label>
              <textarea
                value={editingComment.content}
                onChange={(e) => setEditingComment({ ...editingComment, content: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">Save</button>
            <button onClick={() => setEditingComment(null)} className="ml-2 px-4 py-2 bg-gray-500 text-white rounded">Cancel</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminComments;
