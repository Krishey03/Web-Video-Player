const express = require('express');
const router = express.Router();
const { getRecommendedVideos, renameVideo, deleteVideo } = require('../controllers/video-controller');

router.route('/videos')
  .get(getRecommendedVideos);

router.route('/videos/rename')
  .put(renameVideo);

router.route('/videos/delete')
  .delete(deleteVideo);

module.exports = router;
