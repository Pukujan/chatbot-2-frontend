import React from "react";
import ChatWindow from "../components/ChatWindow";
import Sidebar from "../components/Sidebar";

const ChatPage = () => {
  return (
    <div className="flex h-screen w-full bg-white flex-col">
      {/* Header with logo */}
      <header className="bg-white border-b border-gray-200 p-4">
        <h1 className="font-bold text-3xl">Chatbot</h1>
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