import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChats, createChat, deleteChat, setCurrentChat, updateChatName } from '../redux/chatSlice';

const Sidebar = () => {
  const dispatch = useDispatch();
  const { chats, currentChatId, status, error } = useSelector((state) => state.chat);
  const [editingChatId, setEditingChatId] = useState(null);
  const [newChatName, setNewChatName] = useState('');

  useEffect(() => {
    dispatch(fetchChats());
  }, [dispatch]);

  const handleCreateChat = async () => {
    await dispatch(createChat());
  };

  const handleSelectChat = (chatId) => {
    dispatch(setCurrentChat(chatId));
    setEditingChatId(null);
  };

  const handleDeleteChat = async (chatId) => {
    if (window.confirm('Are you sure you want to delete this chat?')) {
      await dispatch(deleteChat(chatId));
    }
  };

  const handleStartEditing = (chatId, currentName, e) => {
    e?.stopPropagation();
    setEditingChatId(chatId);
    setNewChatName(currentName);
  };

  const handleSaveName = async (chatId) => {
    if (newChatName.trim()) {
      await dispatch(updateChatName({ chatId, chatName: newChatName }));
      setEditingChatId(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-4">
        <button
          onClick={handleCreateChat}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded mb-4 w-full"
          disabled={status === 'loading'}
        >
          {status === 'loading' ? 'Loading...' : 'New Chat'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <h2 className="font-bold mb-2">Chats</h2>

        {status === 'loading' && <p className="text-gray-500">Loading chats...</p>}


        <ul className="space-y-1">
          {chats?.map((chat) => (
            <li
              key={chat.chatId}
              onClick={() => handleSelectChat(chat.chatId)}
              className={`p-2 rounded cursor-pointer flex justify-between items-center ${currentChatId === chat.chatId ? 'bg-blue-200' : 'hover:bg-gray-200'
                }`}
            >
              {editingChatId === chat.chatId ? (
                <input
                  type="text"
                  value={newChatName}
                  onChange={(e) => setNewChatName(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onBlur={() => handleSaveName(chat.chatId)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSaveName(chat.chatId)}
                  className="flex-1 bg-transparent border-b border-gray-400 focus:outline-none"
                  autoFocus
                />
              ) : (
                <span
                  className="truncate flex-1"
                  onDoubleClick={(e) => handleStartEditing(chat.chatId, chat.chatName, e)}
                >
                  {chat.chatName}
                </span>
              )}
              <div className="flex space-x-2 ml-2">
                {editingChatId === chat.chatId ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSaveName(chat.chatId);
                    }}
                    className="text-green-500 hover:text-green-700"
                  >
                    ✓
                  </button>
                ) : (
                  <button
                    onClick={(e) => handleStartEditing(chat.chatId, chat.chatName, e)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✏️
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteChat(chat.chatId);
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  🗑️
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;