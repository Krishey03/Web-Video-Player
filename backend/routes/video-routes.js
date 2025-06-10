const express = require('express');
const router = express.Router();
const { getRecommendedVideos } = require('../controllers/video-controller');

router.get('/videos', getRecommendedVideos);

module.exports = router;
