import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Import useAuth hook
import ChatWindow from "../components/ChatWindow";
import Sidebar from "../components/Sidebar";
import { useDispatch, useSelector } from "react-redux";
import { resetChatState } from "../redux/chatSlice";



const ChatPage = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const dispatch = useDispatch();
  const chatState = useSelector((state) => state.chat);

  useEffect(() => {
    console.log("Redux Chat State:", chatState);
  }, [chatState]);

  const handleLogout = async () => {
    try {
      await logout();
      dispatch(resetChatState());
      navigate("/login"); // Redirect to login after logout
    } catch (error) {
      console.error("Logout failed:", error.message);
    }
  };

  return (
    <div className="flex h-screen w-full bg-white flex-col">
      {/* Header with logo */}
      <header className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h1 className="font-bold text-3xl">Chatbot</h1>
          {currentUser ? (
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Sign in
            </button>
          )}
        </div>
      </header>

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - fixed width */}
        <div className="w-64 border-r border-gray-200 flex flex-col">
          <Sidebar />
        </div>

        {/* Main chat area */}
        <div className="flex-1 flex flex-col">
          <ChatWindow />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
