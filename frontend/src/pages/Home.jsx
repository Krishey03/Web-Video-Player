import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function Home() {
  const [videos, setVideos] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/videos?search=${search}`);
        setVideos(res.data.videos);
      } catch (error) {
        console.error('Error fetching videos:', error);
      }
    };

    fetchVideos();
  }, [search]);

  return (
    <div style={{ maxWidth: '900px', margin: 'auto', padding: '1rem' }}>
      <h1>🎥 My Video Library</h1>
      <input
        type="text"
        placeholder="Search videos..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ padding: '0.5rem', width: '100%', marginBottom: '1rem', fontSize: '1rem' }}
      />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1rem',
        }}
      >
        {videos.map((video, idx) => (
          <div
            key={idx}
            style={{
              border: '1px solid #ddd',
              borderRadius: '6px',
              padding: '1rem',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
            }}
          >
            <h3>{video.title}</h3>
            {video.thumbnailUrl ? (
              <img
                src={`http://localhost:5000${video.thumbnailUrl}`}
                alt={video.title}
                style={{ width: '100%', height: 'auto', borderRadius: '4px', marginBottom: '0.5rem' }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '180px',
                  backgroundColor: '#eee',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#999',
                  marginBottom: '0.5rem',
                  borderRadius: '4px',
                  fontStyle: 'italic',
                }}
              >
                No thumbnail
              </div>
            )}
                {video.url ? (
                <Link to={`/player${video.url}`}>
                    <button>▶️ Play</button>
                </Link>
                ) : (
                <button disabled>Unavailable</button>
                )}

          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
