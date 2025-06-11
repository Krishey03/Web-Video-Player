const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const ffprobeStatic = require('ffprobe-static');

ffmpeg.setFfprobePath(ffprobeStatic.path);
ffmpeg.setFfmpegPath(ffmpegPath);

const VIDEO_DIR = process.env.VIDEO_DIR;
const THUMBNAIL_DIR = path.join(VIDEO_DIR, 'thumbnails'); // your thumbnail folder inside video folder
const videoExtensions = ['.mp4', '.mkv', '.avi', '.mov'];

// Ensure thumbnail dir exists
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
            url: `/videos/${path.relative(VIDEO_DIR, fullPath).replace(/\\/g, '/')}`
          });
        }
      }
    });
  }

  walkDirectory(VIDEO_DIR);
  return videos;
}

// Generate thumbnail if it doesn't exist
function generateThumbnail(videoRelativePath) {
  return new Promise((resolve, reject) => {
    const videoFullPath = path.join(VIDEO_DIR, videoRelativePath);
    const thumbnailName = videoRelativePath.replace(/\//g, '_') + '.png'; // safe filename
    const thumbnailFullPath = path.join(THUMBNAIL_DIR, thumbnailName);

    if (fs.existsSync(thumbnailFullPath)) {
      // Thumbnail already exists
      resolve(`/videos/thumbnails/${thumbnailName}`);
    } else {
      // Generate thumbnail at 5 seconds
      ffmpeg(videoFullPath)
        .screenshots({
          timestamps: ['5'],
          filename: thumbnailName,
          folder: THUMBNAIL_DIR,
          size: '320x240'
        })
        .on('end', () => {
          resolve(`/videos/thumbnails/${thumbnailName}`);
        })
        .on('error', (err) => {
          console.error('Thumbnail generation error:', err);
          // fallback: resolve with no thumbnail
          resolve(null);
        });
    }
  });
}

function getVideoDuration(videoFullPath) {
  return new Promise((resolve, _) => {
    ffmpeg.ffprobe(videoFullPath, (err, metadata) => {
      if (err) {
        console.error(`Error getting duration: ${videoFullPath}`, err);
        resolve(0);
      } else {
        resolve(metadata.format.duration || 0);
      }
    });
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

    const resultVideos = searchQuery ? allVideos : allVideos.sort(() => 0.5 - Math.random()).slice(0, 12); // Limit to 12 results
    if (resultVideos.length === 0) {
      return res.status(404).json({ error: 'No videos found' });
    }

    // Generate thumbnails for all videos concurrently
    const videosWithThumbnails = await Promise.all(
      resultVideos.map(async (video) => {
        const thumbnailUrl = await generateThumbnail(video.relativePath);
        return { ...video, thumbnailUrl };
      })
    );

    const videosWithMetadata = await Promise.all(
      resultVideos.map(async (video) => {
        const videoFullPath = path.join(VIDEO_DIR, video.relativePath);
        const [thumbnailUrl, duration] = await Promise.all([
          generateThumbnail(video.relativePath),
          getVideoDuration(videoFullPath)
        ]);
        return { ...video, thumbnailUrl, duration };
      })
    );

    res.json({ videos: videosWithMetadata });
  } catch (err) {
    console.error('Error fetching videos:', err);
    res.status(500).json({ error: 'Failed to load videos' });
  }
};


