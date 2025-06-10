import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Player from './pages/Player';

function App() {
  return (
    <div style={{ padding: '1rem' }}>
      <nav style={{ marginBottom: '1rem' }}>
        <Link to="/" style={{ marginRight: '1rem' }}>🏠 Home</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/player/*" element={<Player />} />
      </Routes>
    </div>
  );
}

export default App;
