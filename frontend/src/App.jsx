import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Player from './pages/Player';
import Hometest from './pages/home-test';

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/hometest" element={<Hometest />} />
        <Route path="/player/*" element={<Player />} />
      </Routes>
    </div>
  );
}

export default App;
