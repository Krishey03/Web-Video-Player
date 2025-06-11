
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const VIDEO_DIR = process.env.VIDEO_DIR;

const videoRoutes = require('./routes/video-routes');

const app = express();
const PORT = 5000;

app.use(cors());

// Serve all nested static files
app.use('/videos', express.static(VIDEO_DIR));

// API routes
app.use('/api', videoRoutes);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
