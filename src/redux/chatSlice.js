import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Backend API URL
const API_URL = "http://localhost:3000";

// Async action to send message & get AI response
export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async ({ chatId, message }, thunkAPI) => {
    try {
      const response = await axios.post(`${API_URL}/chat/${chatId}/message`, {
        sender: "User",
        message,
      });
      return { message, response: response.data.message };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    chatId: null,
    messages: [],
    loading: false,
    error: null,
  },
  reducers: {
    setChatId: (state, action) => {
      state.chatId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.messages.push({ sender: "User", text: action.payload.message });
        state.messages.push({ sender: "AI", text: action.payload.response });
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setChatId } = chatSlice.actions;
export default chatSlice.reducer;
