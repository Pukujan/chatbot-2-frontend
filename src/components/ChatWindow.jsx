import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { sendMessage, setChatId } from "../redux/chatSlice";
import Message from "./Message";
import axios from "axios";

const API_URL = "http://localhost:3000";

const ChatWindow = () => {
  const dispatch = useDispatch();
  const { chatId, messages, loading } = useSelector((state) => state.chat);
  const [input, setInput] = useState("");

  useEffect(() => {
    // Create a new chat if there isn't one
    const createChat = async () => {
      try {
        const response = await axios.post(`${API_URL}/chat`);
        dispatch(setChatId(response.data.chatId));
      } catch (error) {
        console.error("Error creating chat:", error);
      }
    };

    if (!chatId) createChat();
  }, [chatId, dispatch]);

  const handleSendMessage = () => {
    if (input.trim()) {
      dispatch(sendMessage({ chatId, message: input }));
      setInput(""); // Clear input field
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-box">
        {messages.map((msg, index) => (
          <Message key={index} sender={msg.sender} text={msg.text} />
        ))}
        {loading && <p>Loading...</p>}
      </div>
      <div className="input-box">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatWindow;
