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

// In video-controller.js
exports.renameVideo = async (req, res) => {
  try {
    const { oldPath, newName } = req.body;
    
    // Remove '/videos' prefix if present (since VIDEO_DIR already includes it)
    const cleanOldPath = oldPath.startsWith('/videos/') 
      ? oldPath.substring('/videos'.length) 
      : oldPath;

    // Sanitize the new name
    const sanitizedNewName = newName.replace(/[^\w\s.-]/gi, '');
    if (!sanitizedNewName) {
      return res.status(400).json({ error: 'Invalid new name' });
    }

    const oldFullPath = path.join(VIDEO_DIR, cleanOldPath);
    const directory = path.dirname(oldFullPath);
    const extension = path.extname(oldFullPath);
    const newFullPath = path.join(directory, `${sanitizedNewName}${extension}`);

    console.log('Resolved paths:');
    console.log('VIDEO_DIR:', VIDEO_DIR);
    console.log('Old path:', oldFullPath);
    console.log('New path:', newFullPath);
    console.log('Directory exists:', fs.existsSync(directory));
    console.log('Old file exists:', fs.existsSync(oldFullPath));

    // Verify directory exists
    if (!fs.existsSync(directory)) {
      return res.status(404).json({ 
        error: 'Directory not found',
        directory: directory
      });
    }

    // Check if file exists
    if (!fs.existsSync(oldFullPath)) {
      return res.status(404).json({ 
        error: 'File not found',
        path: oldFullPath,
        relativePath: cleanOldPath
      });
    }

    // Check if new filename exists
    if (fs.existsSync(newFullPath)) {
      return res.status(409).json({ 
        error: 'File already exists',
        path: newFullPath
      });
    }

    // Perform rename
    fs.renameSync(oldFullPath, newFullPath);
    
    // Handle thumbnail rename
    try {
      const oldThumbnailName = cleanOldPath.replace(/\//g, '_') + '.png';
      const oldThumbnailPath = path.join(THUMBNAIL_DIR, oldThumbnailName);
      
      if (fs.existsSync(oldThumbnailPath)) {
        const newThumbnailName = path.relative(VIDEO_DIR, newFullPath).replace(/\//g, '_') + '.png';
        const newThumbnailPath = path.join(THUMBNAIL_DIR, newThumbnailName);
        fs.renameSync(oldThumbnailPath, newThumbnailPath);
      }
    } catch (thumbnailError) {
      console.error('Thumbnail rename failed:', thumbnailError);
    }

    const relativeNewPath = path.relative(VIDEO_DIR, newFullPath).replace(/\\/g, '/');
    
    res.json({ 
      success: true,
      newPath: relativeNewPath,
      newUrl: `/videos/${relativeNewPath}`
    });

  } catch (err) {
    console.error('Rename error:', err);
    res.status(500).json({ 
      error: 'Failed to rename video',
      details: err.message
    });
  }
};

// Add this to your video-controller.js
exports.deleteVideo = async (req, res) => {
  try {
    const { videoPath } = req.body;
    
    // Remove '/videos' prefix if present
    const cleanPath = videoPath.startsWith('/videos/') 
      ? videoPath.substring('/videos'.length) 
      : videoPath;

    const fullPath = path.join(VIDEO_DIR, cleanPath);

    // Verify file exists
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ 
        error: 'File not found',
        path: fullPath
      });
    }

    // Delete the video file
    fs.unlinkSync(fullPath);
    
    // Delete associated thumbnail if it exists
    try {
      const thumbnailName = cleanPath.replace(/\//g, '_') + '.png';
      const thumbnailPath = path.join(THUMBNAIL_DIR, thumbnailName);
      
      if (fs.existsSync(thumbnailPath)) {
        fs.unlinkSync(thumbnailPath);
      }
    } catch (thumbnailError) {
      console.error('Thumbnail deletion failed:', thumbnailError);
    }

    res.json({ 
      success: true,
      message: 'Video deleted successfully'
    });

  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ 
      error: 'Failed to delete video',
      details: err.message
    });
  }
};