import React, { useEffect, useState } from 'react';
import { FaThumbsUp, FaComment, FaEllipsisV } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

interface PublishedDream {
  id: number;
  title: string;
  generatedNarrative: string;
  publishedAt: string;
  userFullName: string;
}

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  dreamId: number;
  userId: string;
  user: {
    fullName: string;
  };
}

interface DreamCardProps {
  dream: PublishedDream;
}

const DreamCard: React.FC<DreamCardProps> = ({ dream }) => {
  const navigate = useNavigate();
  const [likeCount, setLikeCount] = useState<number>(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const currentUserId = localStorage.getItem('userId'); // Ensure you store this when logging in

  // Fetch like count and comments on mount or when dream.id changes
  useEffect(() => {
    // Fetch like count
    api.get(`/engagement/votes/${dream.id}`)
      .then((res) => setLikeCount(res.data.likeCount))
      .catch((err) => console.error(err));

    // Fetch comments
    api.get(`/engagement/comments/${dream.id}`)
      .then((res) => setComments(res.data))
      .catch((err) => console.error(err));
  }, [dream.id]);

  const toggleLike = () => {
    api.post('/engagement/votes', { dreamId: dream.id })
      .then(() => api.get(`/engagement/votes/${dream.id}`))
      .then((res) => setLikeCount(res.data.likeCount))
      .catch((err) => console.error(err));
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    api.post('/engagement/comments', { dreamId: dream.id, content: newComment })
      .then(() => {
        return api.get(`/engagement/comments/${dream.id}`);
      })
      .then((res) => {
        setComments(res.data);
        setNewComment('');
      })
      .catch((err) => console.error(err));
  };

  const openFullComments = () => {
    navigate(`/dream/${dream.id}/comments`);
  };

  // Stub functions for editing/deleting comments for the current user's comment
  const handleEditComment = (commentId: number) => {
    alert(`Edit comment ${commentId}`);
  };

  const handleDeleteComment = (commentId: number) => {
    api.delete(`/engagement/comments/${commentId}`)
      .then(() => {
        setComments(comments.filter(c => c.id !== commentId));
      })
      .catch((err) => console.error(err));
  };

  // Truncate text to 20 characters
  const truncate = (text: string, limit = 20) =>
    text.length > limit ? text.substring(0, limit) + '...' : text;

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      {/* Card Header */}
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0"></div>
        <div className="ml-3">
          <h4 className="text-lg font-bold text-gray-800">{dream.userFullName}</h4>
          <span className="text-sm text-gray-500">
            {new Date(dream.publishedAt).toLocaleDateString()}
          </span>
        </div>
      </div>
      {/* Card Body */}
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{dream.title}</h3>
        <p className="text-gray-700">{dream.generatedNarrative}</p>
      </div>
      {/* Inline Comments Section */}
      <div className="mb-4">
        {comments.length > 0 ? (
          <>
            {/* Show the latest comment (truncated) */}
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-bold">{comments[comments.length - 1].user.fullName}:</span> {truncate(comments[comments.length - 1].content)}
              {comments[comments.length - 1].userId === currentUserId && (
                <span className="ml-2 inline-block hover:text-blue-600 cursor-pointer">
                  <FaEllipsisV
                    onClick={() => {
                      const action = window.prompt("Type 'edit' to edit or 'delete' to delete your comment:");
                      if (action === 'edit') handleEditComment(comments[comments.length - 1].id);
                      else if (action === 'delete') handleDeleteComment(comments[comments.length - 1].id);
                    }}
                  />
                </span>
              )}
            </p>
            {comments.length > 1 && (
              <p className="text-xs text-blue-600 cursor-pointer" onClick={openFullComments}>
                View {comments.length - 1} more comment{comments.length - 1 > 1 ? 's' : ''}
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-gray-500">No comments yet.</p>
        )}
      </div>
      {/* Add New Comment Field */}
      <div className="flex items-center border-t pt-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 px-4 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        <button
          onClick={handleAddComment}
          className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 transition"
        >
          Send
        </button>
      </div>
      {/* Card Footer: Like and Comments Buttons */}
      <div className="flex justify-between items-center border-t mt-4 pt-2">
        <button
          onClick={toggleLike}
          className="flex items-center text-blue-600 hover:text-blue-800 space-x-1"
        >
          <FaThumbsUp className="w-5 h-5" />
          <span>{likeCount}</span>
          <span className="ml-1 text-sm">Like</span>
        </button>
        <button
          onClick={openFullComments}
          className="flex items-center text-blue-600 hover:text-blue-800 space-x-1"
        >
          <FaComment className="w-5 h-5" />
          <span className="ml-1 text-sm">Comments</span>
        </button>
      </div>
    </div>
  );
};

export default DreamCard;