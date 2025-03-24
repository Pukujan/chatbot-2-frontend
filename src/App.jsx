import { Provider } from 'react-redux';
import { store } from './redux/store';
import ChatPage from './pages/ChatPage';

function App() {
  return (
    <Provider store={store}>
      <ChatPage />
    </Provider>
  );
}

export default App;