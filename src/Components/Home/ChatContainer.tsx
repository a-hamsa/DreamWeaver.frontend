import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaComments, 
  FaTimes, 
  FaPaperPlane, 
  FaArrowLeft, 
  FaSpinner,
  FaTrash,
  FaSearch,
  FaUser
} from 'react-icons/fa';
import api from '../../api';
import Swal from 'sweetalert2';
import * as signalR from '@microsoft/signalr';

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
      className="fixed bottom-6 right-6 w-12 h-12 md:w-14 md:h-14 bg-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center focus:outline-none z-40"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      aria-label="Open chat"
    >
      <FaComments className="w-5 h-5 md:w-6 md:h-6" />
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
  const [previousChats, setPreviousChats] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchUsername, setSearchUsername] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<User | null>(null);
  const [searchError, setSearchError] = useState('');
  const [searchMode, setSearchMode] = useState(false);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const currentUserId = localStorage.getItem('userId');
  const hubConnectionRef = useRef<signalR.HubConnection | null>(null);

  // Initialize SignalR connection
  useEffect(() => {
    if (!currentUserId) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5162/chatHub', {
        accessTokenFactory: () => localStorage.getItem('token') || '',
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets
      })
      .withAutomaticReconnect()
      .build();

    connection.on('ReceiveMessage', (message: ChatMessage) => {
      if (!isChatOpen) {
        setUnreadCount(prev => prev + 1);
      }

      if (selectedUser && (message.senderId === selectedUser.id || message.receiverId === selectedUser.id)) {
        setMessages(prev => [...prev, message]);
      } else {
        if (!isChatOpen) {
          const sender = previousChats.find(u => u.id === message.senderId);
          if (sender && Notification.permission === 'granted') {
            new Notification(`New message from ${sender.fullName}`, {
              body: message.message.substring(0, 50) + (message.message.length > 50 ? '...' : '')
            });
          }
        }
      }
    });

    connection.on('MessageDeleted', (messageId: number) => {
      setMessages(prev => prev.filter(m => m.id !== messageId));
    });

    connection.start()
      .then(() => {
        console.log('SignalR Connected');
        // Join the user-specific group
        return connection.invoke('JoinUserSpecificGroup', currentUserId);
      })
      .catch(err => console.error('SignalR Connection Error: ', err));

    hubConnectionRef.current = connection;

    // Cleanup on unmount
    return () => {
      if (connection) {
        connection.stop();
      }
    };
  }, [currentUserId]);

  // Load previous chats
  useEffect(() => {
    if (isChatOpen && !selectedUser) {
      setIsLoading(true);
      api.get('/chat/previous-conversations')
        .then(res => {
          setPreviousChats(res.data);
        })
        .catch(err => console.error('Error fetching previous chats:', err))
        .finally(() => setIsLoading(false));
    }
  }, [isChatOpen]);

  // Load messages for selected user
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
    setSearchMode(false);
    setSearchUsername('');
    setSearchResult(null);
    setSearchError('');
    
    // Add user to previous chats if not already there
    if (!previousChats.some(chat => chat.id === user.id)) {
      setPreviousChats([...previousChats, user]);
    }
  };

  const backToUserList = () => {
    setSelectedUser(null);
  };

  const toggleSearchMode = () => {
    setSearchMode(!searchMode);
    setSearchUsername('');
    setSearchResult(null);
    setSearchError('');
  };

  const searchUser = () => {
    if (!searchUsername.trim()) {
      setSearchError('Please enter a username');
      return;
    }
    
    setIsSearching(true);
    setSearchError('');
    setSearchResult(null);
    
    api.get(`/chat/find-user?username=${searchUsername}`)
      .then(res => {
        if (res.data) {
          setSearchResult(res.data);
        } else {
          setSearchError('User not found');
        }
      })
      .catch(err => {
        console.error('Error searching user:', err);
        setSearchError('Error searching user');
      })
      .finally(() => setIsSearching(false));
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

  const confirmDeleteMessage = (messageId: number) => {
    Swal.fire({
      title: 'Delete Message',
      text: 'Are you sure you want to delete this message?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4F46E5',
      cancelButtonColor: '#6B7280', 
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      focusCancel: true
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMessage(messageId);
      }
    });
  };

  const deleteMessage = (messageId: number) => {
    api.delete(`/chat/${messageId}`)
      .then(() => {
        setMessages(messages.filter(m => m.id !== messageId));
        Swal.fire({
          title: 'Deleted!',
          text: 'Your message has been deleted.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      })
      .catch(err => {
        console.error('Error deleting message:', err);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to delete message.',
          icon: 'error',
          confirmButtonColor: '#4F46E5'
        });
      });
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

  // For browser notifications
  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <>
      <ChatButton onClick={toggleChat} unreadCount={unreadCount} />
      
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 w-full sm:w-96 h-full sm:h-96 bg-white rounded-none sm:rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col"
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
                        {dateMessages.map((msg) => {
                          const isSentByCurrentUser = msg.senderId === currentUserId;
                          
                          return (
                            <div 
                              key={msg.id} 
                              className={`flex ${isSentByCurrentUser ? 'justify-end' : 'justify-start'} w-full`}
                            >
                              <div className="relative group max-w-xs">
                                <div 
                                  className={`p-3 rounded-lg ${
                                    isSentByCurrentUser 
                                      ? 'bg-indigo-500 text-white ml-auto' 
                                      : 'bg-white text-gray-800 border border-gray-200'
                                  }`}
                                >
                                  <p className="text-sm break-words">{msg.message}</p>
                                  <p className={`text-xs mt-1 ${
                                    isSentByCurrentUser ? 'text-indigo-100' : 'text-gray-500'
                                  }`}>
                                    {formatTime(msg.sentAt)}
                                  </p>
                                </div>
                                
                                {isSentByCurrentUser && (
                                  <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                      className="p-1 bg-white rounded-full shadow-sm text-gray-600 hover:text-red-500 focus:outline-none"
                                      onClick={() => confirmDeleteMessage(msg.id)}
                                    >
                                      <FaTrash className="w-3 h-3" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
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
              <div className="flex-1 overflow-y-auto flex flex-col">
                {/* Search toggle and search bar */}
                <div className="p-3 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-600">
                      {searchMode ? "Find a user" : "Previous conversations"}
                    </h4>
                    <button
                      onClick={toggleSearchMode}
                      className="text-xs px-2 py-1 rounded bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors"
                    >
                      {searchMode ? "Show History" : "New Chat"}
                    </button>
                  </div>
                  
                  {searchMode && (
                    <div className="mt-2">
                      <div className="flex items-center">
                        <input
                          type="text"
                          placeholder="Enter username..."
                          className="flex-1 h-9 px-3 text-sm border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          value={searchUsername}
                          onChange={(e) => setSearchUsername(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && searchUser()}
                        />
                        <button
                          onClick={searchUser}
                          disabled={isSearching || !searchUsername.trim()}
                          className={`h-9 px-3 rounded-r flex items-center justify-center ${
                            isSearching || !searchUsername.trim()
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-indigo-600 text-white hover:bg-indigo-700'
                          }`}
                        >
                          {isSearching ? (
                            <FaSpinner className="w-4 h-4 animate-spin" />
                          ) : (
                            <FaSearch className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      
                      {searchError && (
                        <p className="text-xs text-red-500 mt-1">{searchError}</p>
                      )}
                      
                      {searchResult && (
                        <motion.button
                          className="w-full mt-3 px-4 py-3 flex items-center text-left hover:bg-gray-50 transition-colors border border-gray-200 rounded"
                          onClick={() => selectUser(searchResult)}
                          whileHover={{ x: 5 }}
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold mr-3">
                            <FaUser className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-800">{searchResult.fullName}</h4>
                            <p className="text-sm text-gray-500 truncate">@{searchResult.userName}</p>
                          </div>
                        </motion.button>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Previous chats list */}
                {!searchMode && (
                  <>
                    {isLoading ? (
                      <div className="flex justify-center items-center h-full">
                        <FaSpinner className="w-6 h-6 text-indigo-500 animate-spin" />
                      </div>
                    ) : previousChats.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400 p-4">
                        <p>No previous conversations</p>
                        <p className="text-sm mt-1">Click "New Chat" to start a conversation</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {previousChats.map(user => (
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
                              <p className="text-sm text-gray-500 truncate">@{user.userName}</p>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </>
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