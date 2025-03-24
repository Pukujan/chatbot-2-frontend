import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMessages, sendMessage } from '../redux/chatSlice';

const ChatWindow = () => {
  const dispatch = useDispatch();
  const { currentChatId, messages, status } = useSelector((state) => state.chat);
  const [message, setMessage] = useState('');
  const [lastMessageTime, setLastMessageTime] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [localMessages, setLocalMessages] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastMessageTime;
      const remaining = Math.max(0, 10000 - elapsed);
      setTimeRemaining(remaining);

      if (remaining <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [lastMessageTime]);

  useEffect(() => {
    if (currentChatId) {
      dispatch(fetchMessages(currentChatId));
      setLocalMessages([]);
    }
  }, [currentChatId, dispatch]);

  useEffect(() => {
    // Only auto-scroll if user hasn't manually scrolled up
    const container = messagesContainerRef.current;
    if (container) {
      const isNearBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100;
      if (isNearBottom) {
        scrollToBottom();
      }
    }
  }, [messages, localMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    const canSend = timeRemaining <= 0 && !isSending;
    if (!message.trim() || !currentChatId || !canSend) {
      return;
    }

    setIsSending(true);
    const now = Date.now();
    setLastMessageTime(now);
    setTimeRemaining(10000);

    const userMessage = {
      sender: 'user',
      message: message,
      timestamp: new Date().toISOString(),
      isLocal: true,
      tempId: Date.now(),
    };
    setLocalMessages((prev) => [...prev, userMessage]);
    setMessage('');

    try {
      await dispatch(
        sendMessage({
          chatId: currentChatId,
          sender: 'user',
          message: message,
        })
      );

      setLocalMessages((prev) =>
        prev.map((msg) =>
          msg.tempId === userMessage.tempId ? { ...msg, sent: true } : msg
        )
      );
    } catch (error) {
      console.error('Error sending message:', error);
      setLocalMessages((prev) =>
        prev.map((msg) =>
          msg.tempId === userMessage.tempId ? { ...msg, failed: true } : msg
        )
      );
    } finally {
      setIsSending(false);
    }
  };

  const allMessages = [...messages, ...localMessages]
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    .map((msg) => {
      if (msg.sender !== 'user' && msg.message) {
        const { reasoning, parsedMessage } = parseChatbotResponse(msg.message);
        return { ...msg, message: parsedMessage, reasoning: reasoning };
      }
      return msg;
    });

  if (!currentChatId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500">Select a chat or create a new one</p>
          <p className="text-sm text-gray-400">No chat selected</p>
        </div>
      </div>
    );
  }

  const canSendMessage = timeRemaining <= 0 && !isSending;

  function parseChatbotResponse(response) {
    const reasoningRegex = /<reasoning>([\s\S]*?)<\/reasoning>/;
    const match = response.match(reasoningRegex);

    if (match) {
      const reasoning = match[1].trim();
      let parsedMessage = response.replace(reasoningRegex, '').trim();
      parsedMessage = formatChatbotMessage(parsedMessage);
      return { reasoning: reasoning, parsedMessage: parsedMessage };
    } else {
      let parsedMessage = formatChatbotMessage(response);
      return { reasoning: null, parsedMessage: parsedMessage };
    }
  }

  function formatChatbotMessage(message) {
    const boldRegex = /\*\*([^*]+)\*\*/g;
    const listRegex = /^- (.*)$/gm;

    let formattedMessage = message.replace(boldRegex, '<b>$1</b>');
    const lines = formattedMessage.split('\n');
    const listItems = lines.filter(line => line.match(listRegex));

    if (listItems.length > 0) {
      formattedMessage = `<ul>${lines.map(line => {
        if (line.match(listRegex)) {
          return line.replace(listRegex, '<li>$1</li>');
        }
        return line;
      }).join('')}</ul>`;
    }
    return formattedMessage;
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Messages container with scroll */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4"
      >
        <div className="space-y-4">
          {allMessages.map((msg, index) => (
            <div
              key={msg.id || msg.tempId || index}
              className={`flex ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-4 py-2 ${
                  msg.sender === 'user'
                    ? msg.failed
                      ? 'bg-red-100 text-red-800 border border-red-300'
                      : msg.isLocal
                        ? msg.sent
                          ? 'bg-blue-500 text-white'
                          : 'bg-blue-400 text-white'
                        : 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-800'
                } relative`}
              >
                {msg.reasoning && (
                  <div className="text-xs text-gray-500 mb-1 overflow-y-scroll max-h-20">
                    {msg.reasoning}
                  </div>
                )}
                <div className='text-sm' dangerouslySetInnerHTML={{ __html: msg.message }} />
                {msg.isLocal && !msg.sent && !msg.failed && (
                  <span className="absolute -top-2 -right-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                    Sending...
                  </span>
                )}
                {msg.failed && (
                  <span className="absolute -top-2 -right-2 bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full">
                    Failed
                  </span>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Fixed input at bottom */}
      <div className="p-4 border-t bg-white">
        <form onSubmit={handleSendMessage}>
          <div className="flex items-center">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 border rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!canSendMessage}
            />
            <button
              type="submit"
              className={`px-4 py-2 rounded-r-lg ${
                canSendMessage
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              disabled={!canSendMessage}
            >
              {isSending ? 'Sending...' : 'Send'}
            </button>
          </div>
          {timeRemaining > 0 && (
            <div className="text-xs text-gray-500 mt-1 flex items-center">
              <span className="mr-1">Wait time remaining:</span>
              <span className="font-medium">
                {Math.ceil(timeRemaining / 1000)}s
              </span>
              <div className="ml-2 w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-blue-600 h-1.5 rounded-full"
                  style={{ width: `${(timeRemaining / 10000) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;