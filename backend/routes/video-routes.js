const express = require('express');
const router = express.Router();
const { getRecommendedVideos, renameVideo } = require('../controllers/video-controller');

router.route('/videos')
  .get(getRecommendedVideos);

router.route('/videos/rename')
  .put(renameVideo);

module.exports = router;
