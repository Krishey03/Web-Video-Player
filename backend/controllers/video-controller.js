const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
require('dotenv').config(); // <-- Load .env here

ffmpeg.setFfmpegPath(ffmpegPath);

const VIDEO_DIR = process.env.VIDEO_DIR;
const THUMBNAIL_DIR = path.join(VIDEO_DIR, 'thumbnails');
const videoExtensions = ['.mp4', '.mkv', '.avi', '.mov'];

if (!fs.existsSync(THUMBNAIL_DIR)) {
  fs.mkdirSync(THUMBNAIL_DIR);
}

function getAllVideos() {
  let videos = [];

  function walkDirectory(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        walkDirectory(fullPath);
      } else {
        if (videoExtensions.includes(path.extname(file).toLowerCase())) {
          videos.push({
            filename: file,
            title: path.basename(file, path.extname(file)),
            relativePath: path.relative(VIDEO_DIR, fullPath).split(path.sep).join('/'),
            url: `/videos/${path.relative(VIDEO_DIR, fullPath).split(path.sep).join('/')}`
          });
        }
      }
    });
  }

  walkDirectory(VIDEO_DIR);
  return videos;
}

function generateThumbnail(videoRelativePath) {
  return new Promise((resolve, reject) => {
    const videoFullPath = path.join(VIDEO_DIR, videoRelativePath);
    const thumbnailName = videoRelativePath.replace(/\//g, '_') + '.png';
    const thumbnailFullPath = path.join(THUMBNAIL_DIR, thumbnailName);

    if (fs.existsSync(thumbnailFullPath)) {
      resolve(`/videos/thumbnails/${thumbnailName}`);
    } else {
      ffmpeg(videoFullPath)
        .screenshots({
          timestamps: ['5'],
          filename: thumbnailName,
          folder: THUMBNAIL_DIR,
          size: '320x240'
        })
        .on('end', () => resolve(`/videos/thumbnails/${thumbnailName}`))
        .on('error', (err) => {
          console.error('Thumbnail generation error:', err);
          resolve(null);
        });
    }
  });
}

exports.getRecommendedVideos = async (req, res) => {
  try {
    const searchQuery = req.query.search?.toLowerCase().trim() || '';
    let allVideos = getAllVideos();

    if (searchQuery) {
      allVideos = allVideos.filter(video =>
        video.title.toLowerCase().includes(searchQuery)
      );
    }

    const resultVideos = searchQuery ? allVideos : allVideos.sort(() => 0.5 - Math.random()).slice(0, 10);

    const videosWithThumbnails = await Promise.all(
      resultVideos.map(async (video) => {
        const thumbnailUrl = await generateThumbnail(video.relativePath);
        return { ...video, thumbnailUrl };
      })
    );

    res.json({ videos: videosWithThumbnails });
  } catch (err) {
    console.error('Error fetching videos:', err);
    res.status(500).json({ error: 'Failed to load videos' });
  }
};
