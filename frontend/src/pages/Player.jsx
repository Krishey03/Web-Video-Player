import { useLocation } from 'react-router-dom';

function Player() {
  const location = useLocation();
  const videoPath = location.pathname.replace('/player', '');

  return (
    <div>
      <h2>Now Playing</h2>
      <video
        src={`http://localhost:5000${videoPath}`}
        controls
        autoPlay
        width="100%"
        style={{ maxHeight: '80vh' }}
      />
    </div>
  );
}

export default Player;
