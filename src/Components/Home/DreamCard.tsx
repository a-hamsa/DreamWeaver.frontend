import React, { useEffect, useState, useRef } from "react";
import { FaThumbsUp, FaRegThumbsUp, FaComment, FaEllipsisV, FaClock } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api";
import CommentsModal from "./CommentsModal";

interface PublishedDream {
  id: number;
  title: string;
  generatedNarrative: string;
  publishedAt: string | null;
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
  publishButton?: React.ReactNode;
  disableEngagement?: boolean;
}

const DreamCard: React.FC<DreamCardProps> = ({ dream, publishButton, disableEngagement = false }) => {
  const [likeCount, setLikeCount] = useState<number>(0);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const commentInputRef = useRef<HTMLInputElement>(null);
  const currentUserId = localStorage.getItem("userId");

  useEffect(() => {
    if (!disableEngagement) {
      api
        .get(`/engagement/votes/${dream.id}`)
        .then((res) => {
          setLikeCount(res.data.likeCount);
          setIsLiked(res.data.userLiked);
        })
        .catch((err) => console.error(err));

      api
        .get(`/engagement/comments/${dream.id}`)
        .then((res) => setComments(res.data))
        .catch((err) => console.error(err));
    }
  }, [dream.id, disableEngagement]);

  const toggleLike = () => {
    if (disableEngagement) return;
    api
      .post("/engagement/votes", { dreamId: dream.id })
      .then((res) => {
        setIsLiked(res.data.userLiked);
        setLikeCount(res.data.likeCount);
      })
      .catch((err) => console.error(err));
  };

  const handleSubmitComment = () => {
    if (disableEngagement || !newComment.trim()) return;
    setIsSubmitting(true);
    api
      .post("/engagement/comments", { dreamId: dream.id, content: newComment })
      .then(() => api.get(`/engagement/comments/${dream.id}`))
      .then((res) => {
        setComments(res.data);
        setNewComment("");
      })
      .catch((err) => console.error(err))
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Unpublished";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const truncate = (text: string, limit = 120) =>
    text.length > limit ? text.substring(0, limit) : text || "";

  return (
    <>
      <motion.div
        className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden border border-gray-100 mb-6"
        whileHover={{ y: -5 }}
        transition={{ duration: 0.2 }}
      >
        <div className="px-5 pt-5 pb-3 flex items-center border-b border-gray-50">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
            {dream.userFullName?.charAt(0)}
          </div>
          <div className="ml-3 flex-1">
            <h4 className="text-gray-800 font-semibold">{dream.userFullName}</h4>
            <div className="flex items-center text-xs text-gray-500 mt-0.5">
              <FaClock className="w-3 h-3 mr-1" />
              <span>{formatDate(dream.publishedAt)}</span>
            </div>
          </div>
        </div>

        <div className="px-5 py-4">
          <h3 className="text-xl font-semibold text-gray-800 mb-3">{dream.title}</h3>
          <div className="text-gray-600 leading-relaxed">
            {isExpanded ? (
              dream.generatedNarrative || ""
            ) : (
              <>
                {dream.generatedNarrative
                  ? dream.generatedNarrative.length > 120
                    ? truncate(dream.generatedNarrative)
                    : dream.generatedNarrative
                  : ""}
                {dream.generatedNarrative &&
                  dream.generatedNarrative.length > 120 && (
                    <button
                      onClick={() => setIsExpanded(true)}
                      className="text-indigo-600 ml-1 hover:text-indigo-800 font-medium text-sm"
                    >
                      Read more
                    </button>
                  )}
              </>
            )}
          </div>
        </div>

        <div className="px-5 py-2 border-t border-gray-50 flex justify-between text-sm text-gray-500">
          <div>{likeCount > 0 && `${likeCount} ${likeCount === 1 ? "like" : "likes"}`}</div>
          <div>
            {comments.length > 0 && `${comments.length} ${comments.length === 1 ? "comment" : "comments"}`}
          </div>
        </div>

        <div className="flex border-t border-gray-100">
          <motion.button
            whileHover={{ backgroundColor: disableEngagement ? "transparent" : "rgba(79, 70, 229, 0.05)" }}
            whileTap={{ scale: disableEngagement ? 1 : 0.95 }}
            onClick={toggleLike}
            className={`flex-1 py-3 flex items-center justify-center space-x-2 text-gray-700 ${disableEngagement ? "cursor-not-allowed opacity-50" : "hover:text-indigo-600 transition-colors"}`}
          >
            {isLiked ? (
              <FaThumbsUp className="w-5 h-5 text-indigo-600" />
            ) : (
              <FaRegThumbsUp className="w-5 h-5" />
            )}
            <span>Like</span>
          </motion.button>

          <motion.button
            whileHover={{ backgroundColor: disableEngagement ? "transparent" : "rgba(79, 70, 229, 0.05)" }}
            whileTap={{ scale: disableEngagement ? 1 : 0.95 }}
            onClick={() => !disableEngagement && setIsModalOpen(true)}
            className={`flex-1 py-3 flex items-center justify-center space-x-2 text-gray-700 ${disableEngagement ? "cursor-not-allowed opacity-50" : "hover:text-indigo-600 transition-colors"}`}
          >
            <FaComment className="w-5 h-5" />
            <span>Comment</span>
          </motion.button>

          {publishButton && (
            <motion.button
              whileHover={{ backgroundColor: "rgba(79, 70, 229, 0.05)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {}}
              className="flex-1 py-3 flex items-center justify-center space-x-2 text-gray-700 hover:text-indigo-600 transition-colors"
            >
              {publishButton}
            </motion.button>
          )}
        </div>

        <div className="bg-gray-50 px-5 py-3">
          {comments.length > 0 && (
            <div className="mb-3 space-y-2">
              <motion.div
                className="bg-white p-3 rounded-lg shadow-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex justify-between items-start">
                  <span className="font-medium text-gray-800 text-sm">
                    {comments[comments.length - 1].user.fullName}
                  </span>
                  {comments[comments.length - 1].userId === currentUserId && (
                    <button
                      className="text-gray-400 hover:text-gray-600 p-1"
                      onClick={() => {
                        const action = window.prompt(
                          "Type 'edit' to edit or 'delete' to delete your comment:"
                        );
                        if (action === "edit") {
                          alert(`Edit comment ${comments[comments.length - 1].id}`);
                        } else if (action === "delete") {
                          api
                            .delete(`/engagement/comments/${comments[comments.length - 1].id}`)
                            .then(() =>
                              setComments(
                                comments.filter(
                                  (c) => c.id !== comments[comments.length - 1].id
                                )
                              )
                            )
                            .catch((err) => console.error(err));
                        }
                      }}
                    >
                      <FaEllipsisV className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <p className="text-gray-600 text-sm mt-1">
                  {comments[comments.length - 1].content}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(
                    comments[comments.length - 1].createdAt
                  ).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </motion.div>

              {comments.length > 1 && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                >
                  View all {comments.length} comments
                </button>
              )}
            </div>
          )}

          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">
              {currentUserId ? localStorage.getItem("userInitial") || "U" : "G"}
            </div>
            <div className="flex-1 flex rounded-full bg-white overflow-hidden shadow-sm border border-gray-100">
              <input
                ref={commentInputRef}
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmitComment()}
                placeholder="Write a comment..."
                className="flex-1 px-4 py-2 text-sm focus:outline-none"
              />
              <motion.button
                whileTap={{ scale: 0.95 }}
                disabled={isSubmitting || !newComment.trim()}
                onClick={() => !disableEngagement && handleSubmitComment()}
                className= {`px-4 bg-indigo-100 text-indigo-600 font-medium text-sm hover:bg-indigo-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${disableEngagement ? "cursor-not-allowed opacity-50" : "hover:text-indigo-600 transition-colors"}`}
              >
                Send
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isModalOpen && (
          <CommentsModal dream={dream} onClose={() => setIsModalOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
};

export default DreamCard;