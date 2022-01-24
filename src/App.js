
import './App.css';
import { socket, SocketContext } from './context/socket';
import ChatScreen from './screens/Chat/ChatScreen/ChatScreen';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import VideoScreen from './screens/Video/VideoScreen/VideoScreen';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={
            <SocketContext.Provider value={socket}>
              <ChatScreen />
            </SocketContext.Provider>
          }>
          </Route>
          <Route path="/call/:idCall/:fromUserName/:fromId/:toUserName/:toId" element={
            <SocketContext.Provider value={socket}>
              <VideoScreen />
            </SocketContext.Provider>
          }>
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
