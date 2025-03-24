import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = 'https://chatbot-2-backend.onrender.com';

// Async thunks
export const fetchChats = createAsyncThunk('chat/fetchChats', async () => {
  const response = await axios.get(`${API_BASE_URL}/chats`);
  return response.data.chats;
});

export const createChat = createAsyncThunk('chat/createChat', async () => {
  const response = await axios.post(`${API_BASE_URL}/chat`);
  return response.data;
});

export const fetchMessages = createAsyncThunk('chat/fetchMessages', async (chatId) => {
  const response = await axios.get(`${API_BASE_URL}/chat/${chatId}`);
  return { chatId, messages: response.data.messages };
});

export const sendMessage = createAsyncThunk('chat/sendMessage', async ({ chatId, sender, message }) => {
  const response = await axios.post(`${API_BASE_URL}/chat/${chatId}/message`, { sender, message });
  return { chatId, message: response.data.message };
});

export const deleteChat = createAsyncThunk('chat/deleteChat', async (chatId) => {
  await axios.delete(`${API_BASE_URL}/chat/${chatId}`);
  return chatId;
});

export const updateChatName = createAsyncThunk(
  'chat/updateChatName',
  async ({ chatId, chatName }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/chat/${chatId}/name`, { chatName });
      return { chatId, chatName };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);



const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    chats: [],
    currentChatId: null,
    messages: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    setCurrentChat: (state, action) => {
      state.currentChatId = action.payload;
    },
    updateChatName: (state, action) => {
      const { chatId, chatName } = action.payload;
      const chat = state.chats.find(c => c.chatId === chatId);
      if (chat) chat.chatName = chatName;
    },
    addMessageOptimistically: (state, action) => {
      if (state.currentChatId === action.payload.chatId) {
        state.messages.push(action.payload.message);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChats.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchChats.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.chats = action.payload;
      })
      .addCase(fetchChats.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(createChat.fulfilled, (state, action) => {
        state.chats.push({
          chatId: action.payload.chatId,
          chatName: action.payload.chatName
        });
        state.currentChatId = action.payload.chatId;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        if (state.currentChatId === action.payload.chatId) {
          state.messages = action.payload.messages;
        }
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        if (state.currentChatId === action.payload.chatId) {
          state.messages.push({
            sender: 'AI',
            message: action.payload.message,
            timestamp: new Date().toISOString(),
          });
        }
      })
      .addCase(updateChatName.fulfilled, (state, action) => {
        const { chatId, chatName } = action.payload;
        const chat = state.chats.find(c => c.chatId === chatId);
        if (chat) {
          chat.chatName = chatName;
        }
      })
      .addCase(deleteChat.fulfilled, (state, action) => {
        state.chats = state.chats.filter(chat => chat.chatId !== action.payload);
        if (state.currentChatId === action.payload) {
          state.currentChatId = state.chats.length > 0 ? state.chats[0].chatId : null;
          state.messages = [];
        }
      });
  },
});

export const { 
  setCurrentChat,  
  addMessageOptimistically
} = chatSlice.actions;

export default chatSlice.reducer;