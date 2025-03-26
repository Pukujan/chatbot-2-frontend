import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ChatPage from './pages/ChatPage';
import Login from './pages/Login';
import Signup from './pages/Signup'; // Import the Signup component
import { Provider } from 'react-redux';
import store from './redux/store';

function App() {
  const { currentUser } = useAuth();

  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route
            path="/"
            element={currentUser ? <ChatPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/login"
            element={!currentUser ? <Login /> : <Navigate to="/" />}
          />
          <Route
            path="/signup"
            element={!currentUser ? <Signup /> : <Navigate to="/" />}
          />
          {/* Add more routes as needed */}
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;