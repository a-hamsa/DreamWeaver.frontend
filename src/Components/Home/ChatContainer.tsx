import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaComments, 
  FaTimes, 
  FaPaperPlane, 
  FaArrowLeft, 
  FaSpinner,
  FaTrash 
} from 'react-icons/fa';
import api from '../../api';

interface User {
  id: string;
  fullName: string;
  userName: string;
  email: string;
}

interface ChatMessage {
  id: number;
  message: string;
  sentAt: string;
  senderId: string;
  senderFullName: string;
  receiverId: string;
  receiverFullName: string;
}

const ChatButton: React.FC<{ onClick: () => void, unreadCount?: number }> = ({ onClick, unreadCount = 0 }) => {
  return (
    <motion.button
      className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center focus:outline-none z-40"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      aria-label="Open chat"
    >
      <FaComments className="w-6 h-6" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </motion.button>
  );
};

const ChatContainer: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const currentUserId = localStorage.getItem('userId');

  useEffect(() => {
    if (isChatOpen && !selectedUser) {
      setIsLoading(true);
      api.get('/chat/chat-contacts')
        .then(res => {
          setUsers(res.data);
        })
        .catch(err => console.error('Error fetching users:', err))
        .finally(() => setIsLoading(false));
    }
  }, [isChatOpen]);

  useEffect(() => {
    if (selectedUser) {
      setIsLoading(true);
      api.get(`/chat/conversation/${selectedUser.id}`)
        .then(res => {
          setMessages(res.data);
          scrollToBottom();
        })
        .catch(err => console.error('Error fetching conversation:', err))
        .finally(() => setIsLoading(false));
    }
  }, [selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
    if (!isChatOpen) {
      setUnreadCount(0);
    }
  };

  const selectUser = (user: User) => {
    setSelectedUser(user);
  };

  const backToUserList = () => {
    setSelectedUser(null);
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedUser) return;

    setIsSending(true);
    api.post('/chat/send', {
      receiverId: selectedUser.id,
      message: newMessage
    })
      .then(res => {
        setMessages([...messages, res.data]);
        setNewMessage('');
      })
      .catch(err => console.error('Error sending message:', err))
      .finally(() => setIsSending(false));
  };

  const deleteMessage = (messageId: number) => {
    api.delete(`/chat/${messageId}`)
      .then(() => {
        setMessages(messages.filter(m => m.id !== messageId));
      })
      .catch(err => console.error('Error deleting message:', err));
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatDate(message.sentAt);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, ChatMessage[]>);

  return (
    <>
      <ChatButton onClick={toggleChat} unreadCount={unreadCount} />
      
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            className="fixed bottom-6 right-6 w-full sm:w-96 h-96 bg-white rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25 }}
          >
            <div className="px-4 py-3 bg-indigo-600 text-white flex items-center justify-between">
              {selectedUser ? (
                <>
                  <button 
                    onClick={backToUserList} 
                    className="p-1 rounded-full hover:bg-indigo-500 transition-colors"
                    aria-label="Back to contacts"
                  >
                    <FaArrowLeft className="w-4 h-4" />
                  </button>
                  <h3 className="font-semibold">{selectedUser.fullName}</h3>
                </>
              ) : (
                <h3 className="font-semibold">Messages</h3>
              )}
              <button 
                onClick={toggleChat} 
                className="p-1 rounded-full hover:bg-indigo-500 transition-colors"
                aria-label="Close chat"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>
            
            {selectedUser ? (
              <>
                <div 
                  ref={messageContainerRef}
                  className="flex-1 overflow-y-auto p-3 space-y-4 bg-gray-50"
                >
                  {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                      <FaSpinner className="w-6 h-6 text-indigo-500 animate-spin" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <p>No messages yet</p>
                      <p className="text-sm">Start the conversation!</p>
                    </div>
                  ) : (
                    Object.entries(groupedMessages).map(([date, dateMessages]) => (
                      <div key={date} className="space-y-2">
                        <div className="flex justify-center">
                          <span className="text-xs bg-gray-200 px-2 py-1 rounded-full text-gray-600">
                            {date}
                          </span>
                        </div>
                        {dateMessages.map((msg) => (
                          <div 
                            key={msg.id} 
                            className={`flex ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className="relative group">
                              <div 
                                className={`max-w-xs p-3 rounded-lg ${
                                  msg.senderId === currentUserId 
                                    ? 'bg-indigo-500 text-white' 
                                    : 'bg-white text-gray-800 border border-gray-200'
                                }`}
                              >
                                <p className="text-sm break-words">{msg.message}</p>
                                <p className={`text-xs mt-1 ${
                                  msg.senderId === currentUserId ? 'text-indigo-100' : 'text-gray-500'
                                }`}>
                                  {formatTime(msg.sentAt)}
                                </p>
                              </div>
                              
                              {msg.senderId === currentUserId && (
                                <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <div className="relative">
                                    <button className="p-1 bg-white rounded-full shadow-sm text-gray-600 hover:text-red-500 focus:outline-none"
                                      onClick={() => deleteMessage(msg.id)}
                                    >
                                      <FaTrash className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ))
                  )}
                </div>
                
                <div className="p-3 border-t border-gray-200 bg-white">
                  <div className="flex items-center">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      className="flex-1 h-10 px-4 border border-gray-300 rounded-l-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={isSending || !newMessage.trim()}
                      className={`h-10 px-4 rounded-r-full flex items-center justify-center ${
                        isSending || !newMessage.trim() 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      {isSending ? (
                        <FaSpinner className="w-4 h-4 animate-spin" />
                      ) : (
                        <FaPaperPlane className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <FaSpinner className="w-6 h-6 text-indigo-500 animate-spin" />
                  </div>
                ) : users.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <p>No contacts found</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {users.map(user => (
                      <motion.button
                        key={user.id}
                        className="w-full px-4 py-3 flex items-center text-left hover:bg-gray-50 transition-colors"
                        onClick={() => selectUser(user)}
                        whileHover={{ x: 5 }}
                      >
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold mr-3">
                          {user.fullName.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800">{user.fullName}</h4>
                          <p className="text-sm text-gray-500 truncate">{user.email}</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatContainer;