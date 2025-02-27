import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { FaTimes, FaEllipsisV, FaPaperPlane, FaSpinner } from "react-icons/fa";
import api from "../../api";

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  userId: string;
  user: {
    fullName: string;
  };
}

interface PublishedDream {
  id: number;
  title: string;
  generatedNarrative: string;
  publishedAt: string;
  userFullName: string;
}

interface CommentsModalProps {
  dream: PublishedDream;
  onClose: () => void;
}

const CommentsModal: React.FC<CommentsModalProps> = ({ dream, onClose }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);
  const commentInputRef = useRef<HTMLInputElement>(null);
  const currentUserId = localStorage.getItem("userId");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  useEffect(() => {
    if (commentInputRef.current) {
      setTimeout(() => commentInputRef.current?.focus(), 300);
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    api
      .get(`/engagement/comments/${dream.id}`)
      .then((res) => {
        const sortedComments = res.data.sort(
          (a: Comment, b: Comment) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setComments(sortedComments);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, [dream.id]);

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    api
      .post("/engagement/comments", { dreamId: dream.id, content: newComment })
      .then(() => api.get(`/engagement/comments/${dream.id}`))
      .then((res) => {
        setComments(res.data);
        setNewComment("");
      })
      .catch((err) => console.error(err))
      .finally(() => setIsSubmitting(false));
  };

  const handleEditComment = (commentId: number, content: string) => {
    setEditingCommentId(commentId);
    setEditContent(content);
  };

  const saveEditedComment = (commentId: number) => {
    if (!editContent.trim()) return;

    api
      .put(`/engagement/comments/${commentId}`, { content: editContent })
      .then(() => {
        setComments(
          comments.map((c) =>
            c.id === commentId ? { ...c, content: editContent } : c
          )
        );
        setEditingCommentId(null);
      })
      .catch((err) => console.error(err));
  };

  const handleDeleteComment = (commentId: number) => {
    api
      .delete(`/engagement/comments/${commentId}`)
      .then(() => {
        setComments(comments.filter((c) => c.id !== commentId));
      })
      .catch((err) => console.error(err));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const commentActions = (comment: Comment) => (
    <div className="relative group">
      <button
        className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none"
        aria-label="Comment options"
        onClick={() => {
          const actionMenu = document.getElementById(
            `action-menu-${comment.id}`
          );
          if (actionMenu) {
            actionMenu.classList.toggle("hidden");
          }
        }}
      >
        <FaEllipsisV className="w-4 h-4" />
      </button>

      <div
        id={`action-menu-${comment.id}`}
        className="hidden absolute right-0 mt-1 bg-white rounded-md shadow-lg z-10 w-32 overflow-hidden border border-gray-200"
      >
        <button
          onClick={() => handleEditComment(comment.id, comment.content)}
          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          Edit
        </button>
        <button
          onClick={() => handleDeleteComment(comment.id)}
          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
        >
          Delete
        </button>
      </div>
    </div>
  );

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        ref={modalRef}
        className="bg-white w-full max-w-2xl max-h-[90vh] md:max-h-[80vh] rounded-xl shadow-2xl overflow-hidden relative"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 25 }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800">Comments</h3>
          <motion.button
            whileHover={{ rotate: 90 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none p-1"
            aria-label="Close dialog"
          >
            <FaTimes className="w-5 h-5" />
          </motion.button>
        </div>
        
        <div className="px-5 py-4 bg-gray-50 border-b border-gray-100">
          <h4 className="text-lg font-semibold text-gray-800">{dream.title}</h4>
          <p className="text-gray-600 mt-1 text-sm line-clamp-2">
            {dream.generatedNarrative}
          </p>
          <div className="flex items-center mt-2 text-xs text-gray-500">
            <span>By {dream.userFullName}</span>
            <span className="mx-2">•</span>
            <span>{formatDate(dream.publishedAt)}</span>
          </div>
        </div>

        <div className="px-5 py-4 bg-white border-t border-gray-100">
          <div className="flex items-center">
            <input
              ref={commentInputRef}
              type="text"
              placeholder="Write a comment..."
              className="flex-1 h-10 px-4 rounded-l-full border border-r-0 border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
            />
            <button
              disabled={isSubmitting || !newComment.trim()}
              onClick={handleAddComment}
              className={`h-10 px-4 rounded-r-full flex items-center justify-center focus:outline-none transition-colors ${
                isSubmitting || !newComment.trim()
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
            >
              {isSubmitting ? (
                <FaSpinner className="animate-spin w-4 h-4" />
              ) : (
                <FaPaperPlane className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <div
          className="overflow-y-auto p-5 flex-1"
          style={{ maxHeight: "calc(65vh - 180px)" }}
        >
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <FaSpinner className="animate-spin text-indigo-600 text-xl" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">No comments yet</p>
              <p className="text-gray-400 text-sm mt-1">
                Be the first to share your thoughts!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <motion.div
                  key={comment.id}
                  className="bg-white border border-gray-100 rounded-lg shadow-sm p-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-medium text-gray-800">
                        {comment.user.fullName}
                      </h5>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {formatDate(comment.createdAt)}
                      </p>
                    </div>
                    {comment.userId === currentUserId &&
                      commentActions(comment)}
                  </div>

                  {editingCommentId === comment.id ? (
                    <div className="mt-3">
                      <textarea
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={3}
                        autoFocus
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                          onClick={() => setEditingCommentId(null)}
                        >
                          Cancel
                        </button>
                        <button
                          className="px-3 py-1 text-xs bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                          onClick={() => saveEditedComment(comment.id)}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-2 text-gray-700 text-sm whitespace-pre-wrap break-words">
                      {comment.content}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CommentsModal;
