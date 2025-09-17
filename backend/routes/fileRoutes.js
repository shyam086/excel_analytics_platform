const express = require('express');
const { uploadExcel, getUserFiles, getParsedFileData } = require('../controllers/fileController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const router = express.Router();

router.post('/upload', protect, upload.single('excel'), uploadExcel);
router.get('/my-files', protect, getUserFiles);
router.get('/file/:id', protect, getParsedFileData);

module.exports = router;
