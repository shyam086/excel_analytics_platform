
const express = require('express');
const router = express.Router();

const {
  getAllUsers,
  promoteToAdmin,
  getAllFiles
} = require('../controllers/adminController');

const { protect } = require('../middleware/authMiddleware');
router.get('/users', protect, getAllUsers);
router.put('/promote/:id', protect, promoteToAdmin);


router.get('/files', protect, getAllFiles);
 
module.exports = router;
